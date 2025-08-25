import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

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