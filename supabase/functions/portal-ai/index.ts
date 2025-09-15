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
      console.error('Google Cloud service account not configured');
      return new Response(JSON.stringify({ 
        response: "I'm currently being set up. Please try again in a few moments, or I can escalate this to our human team.",
        escalation_needed: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (parseError) {
      console.error('Failed to parse service account JSON:', parseError);
      return new Response(JSON.stringify({ 
        response: "I'm experiencing a configuration issue. Let me escalate this to our human team.",
        escalation_needed: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    let accessToken;
    try {
      accessToken = await getGoogleCloudAccessToken(serviceAccount);
    } catch (tokenError) {
      console.error('Failed to get Google Cloud access token:', tokenError);
      return new Response(JSON.stringify({ 
        response: "I'm having trouble connecting to my AI service. Let me escalate this to our human team for immediate assistance.",
        escalation_needed: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
    let aiResponse = "Hello! I'm the 404 Code Lab Portal AI assistant. I can help with support tickets, quotes, projects, and general inquiries. How can I assist you today?";
    
    try {
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
              temperature: 0.3,
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
      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || aiResponse;
    } catch (aiError) {
      console.error('AI service error:', aiError);
      // Use fallback response, don't fail the entire request
      aiResponse = `I understand you're asking: "${query}". I'm currently experiencing some technical difficulties with my AI processing, but I can still help you with basic operations. Would you like me to escalate this to our human support team?`;
    }

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
    'update', 'change', 'modify',
    'hosting', 'domain', 'cpanel', 'server',
    'email', 'database', 'backup'
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

    // Hosting management
    if (query.toLowerCase().includes('hosting') || query.toLowerCase().includes('domain') || query.toLowerCase().includes('cpanel') || query.toLowerCase().includes('server')) {
      return await manageHosting(supabase, contactId || userId, query);
    }

    // Email management
    if (query.toLowerCase().includes('email') && (query.toLowerCase().includes('create') || query.toLowerCase().includes('setup'))) {
      return await manageEmailAccounts(supabase, contactId || userId, query);
    }

    // Database management
    if (query.toLowerCase().includes('database') && (query.toLowerCase().includes('create') || query.toLowerCase().includes('backup'))) {
      return await manageDatabases(supabase, contactId || userId, query);
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
          package_name: hostingDetails.package,
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

function analyzeHostingRequirements(query: string): { domain: string, package: string, billingCycle: string } {
  const lowercaseQuery = query.toLowerCase();
  
  // Extract domain if mentioned
  const domainMatch = query.match(/([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
  const domain = domainMatch ? domainMatch[1] : 'pending-domain.com';
  
  // Determine package based on requirements
  let package = 'basic';
  if (lowercaseQuery.includes('business') || lowercaseQuery.includes('premium')) {
    package = 'business';
  } else if (lowercaseQuery.includes('enterprise') || lowercaseQuery.includes('dedicated')) {
    package = 'enterprise';
  }
  
  // Determine billing cycle
  let billingCycle = 'monthly';
  if (lowercaseQuery.includes('yearly') || lowercaseQuery.includes('annual')) {
    billingCycle = 'yearly';
  }
  
  return { domain, package, billingCycle };
}

function analyzeEmailRequirements(query: string): { email: string, domain: string } {
  const emailMatch = query.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const domainMatch = query.match(/([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
  
  const email = emailMatch ? emailMatch[1] : 'info@domain.com';
  const domain = domainMatch ? domainMatch[1] : 'domain.com';
  
  return { email, domain };
}

function analyzeDatabaseRequirements(query: string): { type: string, description: string } {
  const lowercaseQuery = query.toLowerCase();
  
  let type = 'mysql'; // default
  if (lowercaseQuery.includes('postgresql') || lowercaseQuery.includes('postgres')) {
    type = 'postgresql';
  } else if (lowercaseQuery.includes('mongodb') || lowercaseQuery.includes('mongo')) {
    type = 'mongodb';
  }
  
  let description = 'Database setup request';
  if (lowercaseQuery.includes('backup')) {
    description = 'Database backup request';
  } else if (lowercaseQuery.includes('restore')) {
    description = 'Database restore request';
  } else if (lowercaseQuery.includes('migrate')) {
    description = 'Database migration request';
  }
  
  return { type, description };
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