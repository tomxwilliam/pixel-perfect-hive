import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, context, type } = await req.json();

    // Get Google Cloud service account JSON from secrets
    const serviceAccountJson = Deno.env.get('GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) {
      throw new Error('Google Cloud service account not configured');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    let systemPrompt = "";
    
    if (context === "project") {
      systemPrompt = `You are a helpful project planning assistant for 404 Code Lab, a UK-based hosting and digital services company. 
      
      Help users with:
      - Project planning and requirements gathering
      - Technical advice for web development, app development, and game development
      - Budget and timeline estimates
      - Feature suggestions and best practices
      - Technology stack recommendations
      
      Keep responses concise, practical, and focused on actionable advice. If asked about pricing, mention that final quotes depend on specific requirements and they should contact hello@404codelab.com for detailed estimates.
      
      Company specialties:
      - Web Development (e-commerce, business sites, web apps)
      - Mobile App Development (iOS, Android, cross-platform)
      - Game Development (indie games, casual games, mobile games)
      - AI Integration (chatbots, automation, analytics)
      - Hosting & Domain Management`;
    } else {
      systemPrompt = `You are a helpful customer service assistant for 404 Code Lab, a UK-based hosting and digital services company.
      
      Help users with:
      - Information about services offered
      - General pricing guidance (mention specific quotes require consultation)
      - Process and timeline questions
      - Technical capabilities and expertise
      - How to get started with projects
      
      Keep responses friendly, professional, and informative. Always encourage users to contact hello@404codelab.com for detailed discussions or quotes.
      
      Services offered:
      - Web Development (£2,000-£20,000+ depending on complexity)
      - Mobile App Development (£5,000-£50,000+ depending on features)  
      - Game Development (£3,000-£30,000+ depending on scope)
      - AI Integration (£1,000-£10,000+ depending on complexity)
      - Hosting & Domain Management (£100-£500+ annually)
      - Maintenance & Support packages available
      
      Location: Scotland, UK
      Contact: hello@404codelab.com`;
    }

    // Get access token for Google Cloud
    const accessToken = await getGoogleCloudAccessToken(serviceAccount);
    
    // Call Vertex AI Gemini API
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
              text: `${systemPrompt}\n\nUser Query: ${query}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 1024,
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

    return new Response(JSON.stringify({ 
      response: aiResponse,
      suggestion: context === "project" ? null : null // Could add form suggestions later
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: 'I apologize, but I encountered an error. Please try again or contact hello@404codelab.com for assistance.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getGoogleCloudAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600; // 1 hour

  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp,
    iat: now
  };

  // Create JWT token
  const headerB64 = btoa(JSON.stringify(header))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  const payloadB64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  // Import the private key
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccount.private_key),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );

  // Sign the JWT
  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  );

  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const jwt = `${headerB64}.${payloadB64}.${signature}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Token exchange failed:', errorText);
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