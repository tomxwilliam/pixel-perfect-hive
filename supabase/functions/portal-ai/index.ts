import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 404 Code Lab Portal AI - Comprehensive Operations Brain
const SYSTEM_PROMPT = `You are 404 Code Lab Portal AI, the autonomous operations brain for the 404 Code Lab customer portal. You manage support, sales, quotes, invoices, payment links, projects, tasks, files, knowledge base, and customer comms end-to-end inside the portal. Operate safely, auditable, UK-compliant, and always in Europe/London timezone.

Core Objectives:
1. Resolve customer issues fast and proactively (first-contact resolution when possible).
2. Convert tickets to opportunities, generate quotes → invoices → payment links, and track delivery via projects & tasks.
3. Keep data consistent across CRM, billing, and project tools.
4. Never use external mail/Stripe; all comms and payments happen within the 404 portal.
5. Be transparent & auditable: log every decision, source, and change.

Guardrails & Policy (UK/EU):
• GDPR: minimise data; do not export PII; honour deletion/DSAR; no third-party transfers without explicit consent.
• Security: role-based access (RBAC); verify identity before sharing sensitive info; redact card/bank details in chat.
• Tone: professional, concise, friendly; UK spelling; no promises you can't keep.
• Time & Currency: Europe/London; GBP (£); include VAT where applicable.
• Escalation: if risk/uncertainty > 30%, missing permissions, payment failure ×2, or legal threats → escalate to HUMAN_OPS.

Always respond with actionable next steps and maintain audit trails for all operations.`;

interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, context, user_role, user_id, ticket_id, contact_id } = await req.json();

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Google Cloud service account for Vertex AI
    const serviceAccountJson = Deno.env.get('GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) {
      throw new Error('Google Cloud service account not configured');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    const accessToken = await getGoogleCloudAccessToken(serviceAccount);

    // Process query with tool functions
    let toolResults = [];
    let enhancedQuery = query;

    // Detect if query requires tool usage
    if (shouldUseTool(query, context)) {
      const toolResult = await executeTools(query, context, user_id, contact_id, ticket_id, supabase);
      if (toolResult) {
        toolResults.push(toolResult);
        enhancedQuery = `${query}\n\nTool Results: ${JSON.stringify(toolResult)}`;
      }
    }

    // Call Vertex AI with enhanced context
    const response = await fetch(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/${serviceAccount.project_id}/locations/us-central1/publishers/google/models/gemini-1.5-pro:generateContent`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{
              text: `${SYSTEM_PROMPT}\n\nUser Role: ${user_role}\nContext: ${context}\n\nUser Query: ${enhancedQuery}`
            }]
          }],
          generationConfig: {
            temperature: 0.3, // Lower for more consistent responses
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Vertex AI API error:', error);
      throw new Error(`Vertex AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    // Log interaction for audit trail
    await auditLog(supabase, user_id, 'ai_interaction', 'ai_conversation', null, {
      query,
      context,
      response: aiResponse,
      tool_results: toolResults,
      timestamp: new Date().toISOString()
    });

    return new Response(JSON.stringify({ 
      response: aiResponse,
      tool_results: toolResults,
      next_action: extractNextAction(aiResponse),
      escalation_needed: shouldEscalate(query, aiResponse)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in portal-ai function:', error);
    return new Response(JSON.stringify({ 
      error: 'I apologize, but I encountered an error. Let me escalate this to our human team for immediate assistance.',
      details: error.message,
      escalation_needed: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Tool detection and execution
function shouldUseTool(query: string, context: string): boolean {
  const toolKeywords = [
    'create ticket', 'new ticket', 'issue', 'problem',
    'quote', 'estimate', 'price', 'cost',
    'invoice', 'payment', 'bill',
    'project', 'task', 'deadline',
    'search', 'find', 'lookup',
    'update', 'change', 'modify'
  ];
  
  return toolKeywords.some(keyword => 
    query.toLowerCase().includes(keyword)
  );
}

async function executeTools(query: string, context: string, userId: string, contactId?: string, ticketId?: string, supabase: any): Promise<ToolResult> {
  try {
    // Ticket creation
    if (query.toLowerCase().includes('create ticket') || query.toLowerCase().includes('new ticket')) {
      return await createTicket(supabase, contactId || userId, query);
    }

    // Quote generation
    if (query.toLowerCase().includes('quote') || query.toLowerCase().includes('estimate')) {
      return await generateQuote(supabase, contactId || userId, query);
    }

    // Contact search
    if (query.toLowerCase().includes('search') || query.toLowerCase().includes('find customer')) {
      return await searchContacts(supabase, query);
    }

    // Project creation
    if (query.toLowerCase().includes('create project')) {
      return await createProject(supabase, contactId || userId, query);
    }

    return { success: false, error: 'No matching tool found' };
  } catch (error) {
    console.error('Tool execution error:', error);
    return { success: false, error: error.message };
  }
}

// Core tool functions
async function createTicket(supabase: any, customerId: string, description: string): Promise<ToolResult> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        customer_id: customerId,
        title: extractTicketTitle(description),
        description: description,
        priority: 'medium',
        status: 'open',
        source: 'ai_portal'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        ticket_id: data.id,
        ticket_number: data.ticket_number,
        title: data.title,
        status: data.status
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function generateQuote(supabase: any, customerId: string, requirements: string): Promise<ToolResult> {
  try {
    // Extract service type and estimate based on requirements
    const serviceAnalysis = analyzeServiceRequirements(requirements);
    
    const { data, error } = await supabase
      .from('quotes')
      .insert({
        customer_id: customerId,
        description: serviceAnalysis.description,
        amount: serviceAnalysis.estimatedAmount,
        status: 'pending',
        valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 14 days
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        quote_id: data.id,
        quote_number: data.quote_number,
        amount: data.amount,
        valid_until: data.valid_until,
        description: data.description
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function searchContacts(supabase: any, query: string): Promise<ToolResult> {
  try {
    const searchTerm = extractSearchTerm(query);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, company_name')
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`)
      .limit(10);

    if (error) throw error;

    return {
      success: true,
      data: {
        contacts: data,
        count: data.length
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createProject(supabase: any, customerId: string, description: string): Promise<ToolResult> {
  try {
    const projectAnalysis = analyzeProjectRequirements(description);
    
    const { data, error } = await supabase
      .from('projects')
      .insert({
        customer_id: customerId,
        title: projectAnalysis.title,
        description: description,
        project_type: projectAnalysis.type,
        status: 'pending',
        priority: 'medium'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        project_id: data.id,
        title: data.title,
        type: data.project_type,
        status: data.status
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Helper functions
function extractTicketTitle(description: string): string {
  const sentences = description.split(/[.!?]/);
  return sentences[0]?.trim().substring(0, 100) || 'Customer Support Request';
}

function analyzeServiceRequirements(requirements: string): { description: string, estimatedAmount: number } {
  const lowercaseReq = requirements.toLowerCase();
  
  // Basic service detection and pricing
  if (lowercaseReq.includes('website') || lowercaseReq.includes('web')) {
    return {
      description: 'Web Development Service',
      estimatedAmount: lowercaseReq.includes('ecommerce') || lowercaseReq.includes('shop') ? 8000 : 5000
    };
  }
  
  if (lowercaseReq.includes('app') || lowercaseReq.includes('mobile')) {
    return {
      description: 'Mobile App Development Service',
      estimatedAmount: 15000
    };
  }
  
  if (lowercaseReq.includes('game')) {
    return {
      description: 'Game Development Service',
      estimatedAmount: 10000
    };
  }
  
  return {
    description: 'Custom Development Service',
    estimatedAmount: 3000
  };
}

function analyzeProjectRequirements(description: string): { title: string, type: string } {
  const lowercaseDesc = description.toLowerCase();
  
  let type = 'web';
  if (lowercaseDesc.includes('app') || lowercaseDesc.includes('mobile')) type = 'app';
  if (lowercaseDesc.includes('game')) type = 'game';
  if (lowercaseDesc.includes('ai')) type = 'ai';
  
  const words = description.split(' ').slice(0, 8);
  const title = words.join(' ').replace(/[^\w\s]/gi, '').trim();
  
  return {
    title: title || 'New Development Project',
    type
  };
}

function extractSearchTerm(query: string): string {
  // Extract search term from queries like "find customer John" or "search for Smith"
  const words = query.split(' ');
  const searchIndex = words.findIndex(word => 
    ['find', 'search', 'lookup', 'customer', 'client'].includes(word.toLowerCase())
  );
  
  if (searchIndex !== -1 && searchIndex < words.length - 1) {
    return words.slice(searchIndex + 1).join(' ').replace(/[^\w\s]/gi, '');
  }
  
  return query.replace(/[^\w\s]/gi, '');
}

function extractNextAction(response: string): string | null {
  // Extract actionable next steps from AI response
  const actionPatterns = [
    /next step:?\s*(.+?)(?:\.|$)/i,
    /please\s+(.+?)(?:\.|$)/i,
    /you should\s+(.+?)(?:\.|$)/i,
    /i recommend\s+(.+?)(?:\.|$)/i
  ];
  
  for (const pattern of actionPatterns) {
    const match = response.match(pattern);
    if (match) return match[1].trim();
  }
  
  return null;
}

function shouldEscalate(query: string, response: string): boolean {
  const escalationKeywords = [
    'error', 'failed', 'cannot', 'unable', 'legal', 'refund', 'complaint',
    'urgent', 'critical', 'emergency', 'escalate', 'manager', 'supervisor'
  ];
  
  const combinedText = `${query} ${response}`.toLowerCase();
  return escalationKeywords.some(keyword => combinedText.includes(keyword));
}

async function auditLog(supabase: any, userId: string, action: string, entityType: string, entityId: string | null, details: any): Promise<void> {
  try {
    await supabase
      .from('activity_log')
      .insert({
        user_id: userId,
        actor_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        description: `AI Portal: ${action}`,
        new_values: details
      });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

// Google Cloud authentication (reused from original)
async function getGoogleCloudAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp, iat: now
  };

  const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccount.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  );

  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const jwt = `${headerB64}.${payloadB64}.${signature}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!tokenResponse.ok) {
    throw new Error(`Failed to get access token: ${tokenResponse.status}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  
  const binaryString = atob(pemContents);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes.buffer;
}