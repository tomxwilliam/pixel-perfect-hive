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

    console.log('Received query:', query);
    console.log('Context:', context);
    console.log('User role:', user_role);

    // Initialize Supabase clients
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get Google Cloud service account
    const serviceAccountJson = Deno.env.get('GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) {
      console.error('Google Cloud service account not configured');
      return new Response(
        JSON.stringify({ 
          error: 'AI service not configured',
          response: 'I apologize, but the AI service is not properly configured. Please contact support.',
          escalation_needed: true
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    // Check if we need to use tools
    const needsTools = shouldUseTool(query, context);
    let toolResults: any[] = [];
    
    if (needsTools && user_id) {
      console.log('Query requires tool execution');
      toolResults = await executeTools(query, context, user_role, user_id, supabaseAdmin);
    }

    // Prepare the prompt for Vertex AI
    const prompt = `${SYSTEM_PROMPT}\n\nContext: ${context}\n\nUser Query: ${query}${toolResults.length > 0 ? '\n\nTool Results: ' + JSON.stringify(toolResults) : ''}`;

    console.log('Calling Vertex AI...');
    
    try {
      // Get access token for Google Cloud
      const accessToken = await getGoogleCloudAccessToken(serviceAccount);
      
      // Call Vertex AI API
      const aiResponse = await fetch(
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
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          }),
        }
      );

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('Vertex AI API error:', aiResponse.status, errorText);
        throw new Error(`Vertex AI API error: ${aiResponse.status} ${errorText}`);
      }

      const aiData = await aiResponse.json();
      console.log('Vertex AI response received');
      
      const responseText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || 
                          'I apologize, but I was unable to generate a response. Please try again.';
      
      // Extract next action and check if escalation is needed
      const nextAction = extractNextAction(responseText);
      const escalationNeeded = shouldEscalate(query, responseText);

      // Log the AI interaction
      if (user_id) {
        await auditLog(
          supabaseAdmin,
          user_id,
          'ai_interaction',
          'ai_chat',
          null,
          `AI Query: ${query.substring(0, 100)}...`,
          null,
          { response: responseText.substring(0, 200), tools_used: toolResults.length > 0 }
        );
      }

      return new Response(
        JSON.stringify({ 
          response: responseText,
          tool_results: toolResults,
          next_action: nextAction,
          escalation_needed: escalationNeeded
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (error) {
      console.error('AI processing error:', error);
      return new Response(
        JSON.stringify({ 
          error: error.message,
          response: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
          escalation_needed: true
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error in portal-ai function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
        escalation_needed: true
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to get Google Cloud access token
async function getGoogleCloudAccessToken(serviceAccount: any): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: serviceAccount.private_key_id,
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccount.private_key),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsignedToken)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const jwt = `${unsignedToken}.${encodedSignature}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Tool detection and execution
function shouldUseTool(query: string, context: string): boolean {
  const toolKeywords = [
    'create ticket', 'new ticket', 'issue', 'problem',
    'quote', 'estimate', 'price', 'cost',
    'invoice', 'payment', 'bill',
    'project', 'task', 'deadline',
    'search', 'find', 'lookup',
    'update', 'change', 'modify',
    'hosting', 'domain', 'cpanel', 'server',
    'email', 'database', 'backup'
  ];
  
  return toolKeywords.some(keyword => 
    query.toLowerCase().includes(keyword)
  );
}

async function executeTools(query: string, context: string, user_role: string, user_id: string, supabase: any): Promise<any[]> {
  const results: any[] = [];
  
  try {
    // Ticket creation
    if (query.toLowerCase().includes('create ticket') || query.toLowerCase().includes('new ticket')) {
      const result = await createTicket(supabase, user_id, query);
      results.push(result);
    }

    // Quote generation
    if (query.toLowerCase().includes('quote') || query.toLowerCase().includes('estimate')) {
      const result = await generateQuote(supabase, user_id, query);
      results.push(result);
    }

    // Contact search
    if (query.toLowerCase().includes('search') || query.toLowerCase().includes('find customer')) {
      const result = await searchContacts(supabase, query);
      results.push(result);
    }

    // Project creation
    if (query.toLowerCase().includes('create project')) {
      const result = await createProject(supabase, user_id, query);
      results.push(result);
    }

    // Hosting management
    if (query.toLowerCase().includes('hosting') || query.toLowerCase().includes('domain') || query.toLowerCase().includes('cpanel') || query.toLowerCase().includes('server')) {
      const result = await manageHosting(supabase, user_id, query);
      results.push(result);
    }

    // Email management
    if (query.toLowerCase().includes('email') && (query.toLowerCase().includes('create') || query.toLowerCase().includes('setup'))) {
      const result = await manageEmailAccounts(supabase, user_id, query);
      results.push(result);
    }

    // Database management
    if (query.toLowerCase().includes('database') && (query.toLowerCase().includes('create') || query.toLowerCase().includes('backup'))) {
      const result = await manageDatabases(supabase, user_id, query);
      results.push(result);
    }

  } catch (error) {
    console.error('Tool execution error:', error);
    results.push({ success: false, error: error.message });
  }
  
  return results;
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

async function manageHosting(supabase: any, customerId: string, query: string): Promise<ToolResult> {
  try {
    const lowercaseQuery = query.toLowerCase();
    
    if (lowercaseQuery.includes('create') || lowercaseQuery.includes('setup')) {
      // Create hosting account
      const hostingDetails = analyzeHostingRequirements(query);
      
      const { data, error } = await supabase
        .from('hosting_accounts')
        .insert({
          customer_id: customerId,
          domain: hostingDetails.domain,
          package_name: hostingDetails.packageType,
          status: 'pending_setup',
          billing_cycle: hostingDetails.billingCycle,
          auto_renewal: true
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          hosting_id: data.id,
          domain: data.domain,
          package: data.package_name,
          status: data.status,
          message: 'Hosting account setup initiated. You will receive setup instructions shortly.'
        }
      };
    }
    
    if (lowercaseQuery.includes('status') || lowercaseQuery.includes('check')) {
      // Check hosting status
      const { data, error } = await supabase
        .from('hosting_accounts')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: {
          accounts: data,
          count: data.length,
          message: `Found ${data.length} hosting account(s)`
        }
      };
    }

    return {
      success: true,
      data: {
        message: 'I can help you with hosting account creation, status checks, domain management, and server monitoring. What would you like to do?'
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function manageEmailAccounts(supabase: any, customerId: string, query: string): Promise<ToolResult> {
  try {
    const emailDetails = analyzeEmailRequirements(query);
    
    // Log email request for manual setup
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        customer_id: customerId,
        title: 'Email Account Setup Request',
        description: `Email setup request: ${emailDetails.email} for domain ${emailDetails.domain}`,
        priority: 'medium',
        status: 'open',
        source: 'ai_portal',
        category: 'email_setup'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        ticket_id: data.id,
        email: emailDetails.email,
        domain: emailDetails.domain,
        message: 'Email account setup request created. Our team will configure your email account within 2 hours.'
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function manageDatabases(supabase: any, customerId: string, query: string): Promise<ToolResult> {
  try {
    const dbDetails = analyzeDatabaseRequirements(query);
    
    // Log database request for manual setup
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        customer_id: customerId,
        title: 'Database Management Request',
        description: `Database request: ${dbDetails.type} - ${dbDetails.description}`,
        priority: 'medium',
        status: 'open',
        source: 'ai_portal',
        category: 'database'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        ticket_id: data.id,
        database_type: dbDetails.type,
        message: 'Database management request created. Our team will handle your database needs within 4 hours.'
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
      description: 'Mobile App Development',
      estimatedAmount: 12000
    };
  }
  
  if (lowercaseReq.includes('game')) {
    return {
      description: 'Game Development',
      estimatedAmount: 15000
    };
  }
  
  if (lowercaseReq.includes('ai') || lowercaseReq.includes('machine learning')) {
    return {
      description: 'AI Integration Service',
      estimatedAmount: 10000
    };
  }
  
  return {
    description: 'Custom Development Service',
    estimatedAmount: 5000
  };
}

function analyzeProjectRequirements(description: string): { title: string, type: string } {
  const lowercaseDesc = description.toLowerCase();
  
  let type = 'web';
  if (lowercaseDesc.includes('app') || lowercaseDesc.includes('mobile')) {
    type = 'app';
  } else if (lowercaseDesc.includes('game')) {
    type = 'game';
  } else if (lowercaseDesc.includes('ai')) {
    type = 'ai';
  }
  
  const title = description.split(/[.!?]/)[0]?.trim().substring(0, 100) || 'New Project';
  
  return { title, type };
}

function extractSearchTerm(query: string): string {
  const lowercaseQuery = query.toLowerCase();
  const searchWords = lowercaseQuery.split(' ').filter(word => 
    word.length > 3 && 
    !['search', 'find', 'lookup', 'customer', 'contact', 'for'].includes(word)
  );
  return searchWords[0] || '';
}

function analyzeHostingRequirements(query: string): { domain: string, packageType: string, billingCycle: string } {
  const lowercaseQuery = query.toLowerCase();
  
  // Extract domain if mentioned
  const domainMatch = query.match(/([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
  const domain = domainMatch ? domainMatch[0] : 'domain-to-be-configured.com';
  
  // Determine package type
  let packageType = 'shared';
  if (lowercaseQuery.includes('vps') || lowercaseQuery.includes('virtual')) {
    packageType = 'vps';
  } else if (lowercaseQuery.includes('dedicated')) {
    packageType = 'dedicated';
  }
  
  // Determine billing cycle
  let billingCycle = 'monthly';
  if (lowercaseQuery.includes('annual') || lowercaseQuery.includes('yearly')) {
    billingCycle = 'annual';
  }
  
  return { domain, packageType, billingCycle };
}

function analyzeEmailRequirements(query: string): { email: string, domain: string } {
  const emailMatch = query.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const email = emailMatch ? emailMatch[0] : 'email@domain.com';
  
  const domainMatch = query.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const domain = domainMatch ? domainMatch[1] : 'domain.com';
  
  return { email, domain };
}

function analyzeDatabaseRequirements(query: string): { type: string, description: string } {
  const lowercaseQuery = query.toLowerCase();
  
  let type = 'MySQL';
  if (lowercaseQuery.includes('postgres') || lowercaseQuery.includes('postgresql')) {
    type = 'PostgreSQL';
  } else if (lowercaseQuery.includes('mongo')) {
    type = 'MongoDB';
  }
  
  const description = query.split(/[.!?]/)[0]?.trim() || 'Database management request';
  
  return { type, description };
}

function extractNextAction(response: string): string | undefined {
  const lowercaseResponse = response.toLowerCase();
  
  if (lowercaseResponse.includes('ticket') && lowercaseResponse.includes('created')) {
    return 'view_ticket';
  }
  if (lowercaseResponse.includes('quote') && lowercaseResponse.includes('generated')) {
    return 'view_quote';
  }
  if (lowercaseResponse.includes('project') && lowercaseResponse.includes('created')) {
    return 'view_project';
  }
  
  return undefined;
}

function shouldEscalate(query: string, response: string): boolean {
  const escalationKeywords = [
    'urgent', 'critical', 'emergency', 'asap', 
    'legal', 'lawyer', 'refund', 'cancel', 
    'complaint', 'dispute', 'breach', 'violation'
  ];
  
  const combinedText = (query + ' ' + response).toLowerCase();
  
  return escalationKeywords.some(keyword => combinedText.includes(keyword));
}

async function auditLog(
  supabase: any, 
  userId: string, 
  action: string, 
  entityType: string, 
  entityId: string | null, 
  description: string,
  oldValues: any = null,
  newValues: any = null
) {
  try {
    await supabase
      .from('activity_log')
      .insert({
        user_id: userId,
        actor_id: userId,
        action: action,
        entity_type: entityType,
        entity_id: entityId,
        description: description,
        old_values: oldValues,
        new_values: newValues
      });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}
