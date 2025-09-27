import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      throw new Error('No file provided')
    }

    console.log('Processing file:', file.name, 'Size:', file.size)

    // Read file content
    const arrayBuffer = await file.arrayBuffer()
    const text = new TextDecoder().decode(arrayBuffer)
    
    let csvData: string
    
    // Handle RTF format - extract CSV data from RTF
    if (text.includes('\\rtf1')) {
      console.log('Detected RTF format, extracting CSV data...')
      const lines = text.split(/\\|\n/)
      const csvLines: string[] = []
      
      for (const line of lines) {
        const cleanLine = line.replace(/\s+/g, ' ').trim()
        
        if (cleanLine && (cleanLine.includes(',') || cleanLine.includes('TLD'))) {
          // Clean up RTF formatting
          let processedLine = cleanLine
            .replace(/\\[a-z]+\d*/g, '') // Remove RTF commands
            .replace(/[{}]/g, '') // Remove braces
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim()
          
          // Convert special characters
          processedLine = processedLine
            .replace(/\\'a3/g, '£') // Convert RTF pound symbol
            .replace(/\\\\/g, '\\') // Convert escaped backslashes
          
          if (processedLine && processedLine.includes('.') && processedLine.includes(',')) {
            csvLines.push(processedLine)
          }
        }
      }
      csvData = csvLines.join('\n')
    } else {
      csvData = text
    }
    
    console.log('CSV data length:', csvData.length)
    
    const lines = csvData.split('\n').filter(line => line.trim())
    if (lines.length === 0) {
      throw new Error('No valid CSV data found')
    }
    
    console.log('Total lines to process:', lines.length)
    
    // Process the pricing data
    const data: any[] = []
    let processedCount = 0
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.startsWith('TLD,') || line.includes('Register Price')) {
        continue
      }
      
      const values = line.split(',').map(v => v.trim().replace(/£/g, ''))
      if (values.length >= 4) {
        const tld = values[0]
        const registerPrice = values[1] === 'N/A' ? null : parseFloat(values[1])
        const renewPrice = values[2] === 'N/A' ? null : parseFloat(values[2])
        const transferPrice = values[3] === 'N/A' ? null : parseFloat(values[3])
        
        if (tld && tld.startsWith('.')) {
          data.push({
            tld: tld,
            reg_1y_gbp: registerPrice,
            renew_1y_gbp: renewPrice,
            transfer_1y_gbp: transferPrice
          })
          processedCount++
        }
      }
    }

    console.log('Processed TLD count:', processedCount)

    if (data.length === 0) {
      throw new Error('No valid TLD data found in CSV')
    }

    // Get current exchange rate for GBP to USD conversion
    const { data: exchangeRates } = await supabase
      .from('exchange_rates')
      .select('rate')
      .eq('from_currency', 'GBP')
      .eq('to_currency', 'USD')
      .order('created_at', { ascending: false })
      .limit(1)

    const gbpToUsdRate = exchangeRates?.[0]?.rate || 1.3514 // Fallback rate

    console.log('Using GBP to USD rate:', gbpToUsdRate)

    // Prepare data for upsert with proper structure
    const upsertData = data.map((row: any) => {
      const baseData = {
        tld: row.tld,
        category: 'gTLD',
        source: 'csv_import',
        updated_at: new Date().toISOString(),
        
        // GBP prices
        reg_1y_gbp: row.reg_1y_gbp,
        reg_2y_gbp: row.reg_1y_gbp ? row.reg_1y_gbp * 2 : null,
        reg_5y_gbp: row.reg_1y_gbp ? row.reg_1y_gbp * 5 : null,
        reg_10y_gbp: row.reg_1y_gbp ? row.reg_1y_gbp * 10 : null,
        renew_1y_gbp: row.renew_1y_gbp,
        transfer_1y_gbp: row.transfer_1y_gbp,
        
        // USD prices (converted from GBP)
        reg_1y_usd: row.reg_1y_gbp ? Math.round(row.reg_1y_gbp * gbpToUsdRate * 100) / 100 : null,
        reg_2y_usd: row.reg_1y_gbp ? Math.round((row.reg_1y_gbp * 2) * gbpToUsdRate * 100) / 100 : null,
        reg_5y_usd: row.reg_1y_gbp ? Math.round((row.reg_1y_gbp * 5) * gbpToUsdRate * 100) / 100 : null,
        reg_10y_usd: row.reg_1y_gbp ? Math.round((row.reg_1y_gbp * 10) * gbpToUsdRate * 100) / 100 : null,
        renew_1y_usd: row.renew_1y_gbp ? Math.round(row.renew_1y_gbp * gbpToUsdRate * 100) / 100 : null,
        transfer_1y_usd: row.transfer_1y_gbp ? Math.round(row.transfer_1y_gbp * gbpToUsdRate * 100) / 100 : null,
      }

      console.log(`Processing TLD: ${row.tld}, GBP: ${row.reg_1y_gbp}, USD: ${baseData.reg_1y_usd}`)
      return baseData
    })

    console.log('Starting batch upsert of', upsertData.length, 'records...')

    // Batch upsert in chunks to avoid timeouts
    const BATCH_SIZE = 50
    let totalInserted = 0
    let totalUpdated = 0

    for (let i = 0; i < upsertData.length; i += BATCH_SIZE) {
      const batch = upsertData.slice(i, i + BATCH_SIZE)
      console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(upsertData.length/BATCH_SIZE)} (${batch.length} records)`)
      
      const { data: upsertResult, error: upsertError } = await supabase
        .from('domain_tld_pricing')
        .upsert(batch, { 
          onConflict: 'tld',
          count: 'planned-affected'
        })

      if (upsertError) {
        console.error('Batch upsert error:', upsertError)
        throw new Error(`Database upsert failed: ${upsertError.message}`)
      }

      totalInserted += batch.length
      console.log(`Batch completed successfully. Total processed: ${i + batch.length}/${upsertData.length}`)
    }

    console.log('Import completed successfully!')
    console.log(`Total TLDs processed: ${totalInserted}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: totalInserted,
        message: `Successfully imported ${totalInserted} domain pricing records`
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Import error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Import failed',
        details: error.toString()
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})