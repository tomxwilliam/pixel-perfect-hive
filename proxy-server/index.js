// eNom Domain Search Proxy Server
// Deploy this to a VPS with a static IP (DigitalOcean, AWS EC2, etc.)
// 
// Setup instructions:
// 1. Install Node.js on your VPS
// 2. Copy this file to your server
// 3. Run: npm install express cors dotenv
// 4. Create .env file with ENOM_API_USER, ENOM_API_TOKEN, and PROXY_API_KEY
// 5. Run: node index.js
// 6. Whitelist your server's IP address in eNom
// 7. Update DOMAIN_PROXY_URL secret in Supabase with your server URL

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API key authentication middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.PROXY_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }
  
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Domain check endpoint
app.post('/check-domain', authenticateApiKey, async (req, res) => {
  const { domain, tld } = req.body;
  
  if (!domain || !tld) {
    return res.status(400).json({ error: 'Domain and TLD are required' });
  }
  
  const enomUser = process.env.ENOM_API_USER;
  const enomToken = process.env.ENOM_API_TOKEN;
  
  if (!enomUser || !enomToken) {
    return res.status(500).json({ error: 'eNom credentials not configured' });
  }
  
  try {
    const cleanDomain = domain.toLowerCase().trim();
    const cleanTld = tld.replace('.', '');
    
    // Build eNom API URL
    const url = new URL('https://reseller.enom.com/interface.asp');
    url.searchParams.set('command', 'Check');
    url.searchParams.set('uid', enomUser);
    url.searchParams.set('pw', enomToken);
    url.searchParams.set('responsetype', 'JSON');
    url.searchParams.set('domain', cleanDomain);
    url.searchParams.set('tld', cleanTld);
    
    console.log(`Checking domain: ${cleanDomain}.${cleanTld}`);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`eNom API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Parse eNom response
    let isAvailable = false;
    let hasError = false;
    let errorMessage = null;
    
    if (data['interface-response']) {
      const enomResponse = data['interface-response'];
      
      // Check for errors
      if (enomResponse.ErrCount && parseInt(enomResponse.ErrCount) > 0) {
        console.error(`eNom API error for ${cleanDomain}.${cleanTld}:`, enomResponse.errors);
        hasError = true;
        errorMessage = enomResponse.errors?.Err1 || 'Unknown error';
      } else if (enomResponse.RRPCode) {
        // RRP code handling
        if (enomResponse.RRPCode === '210') {
          isAvailable = true;
        } else if (enomResponse.RRPCode === '211') {
          isAvailable = false;
        }
      } else if (enomResponse.DomainAvailable === '1') {
        isAvailable = true;
      } else if (enomResponse.DomainAvailable === '0') {
        isAvailable = false;
      }
    } else if (data.RRPCode || data.DomainAvailable) {
      if (data.RRPCode === '210' || data.DomainAvailable === '1') {
        isAvailable = true;
      } else {
        isAvailable = false;
      }
    } else {
      hasError = true;
      errorMessage = 'Unexpected eNom response format';
    }
    
    console.log(`Domain ${cleanDomain}.${cleanTld} - Available: ${isAvailable}, Error: ${hasError}`);
    
    // Return result
    res.json({
      domain: `${cleanDomain}.${cleanTld}`,
      available: isAvailable,
      premium: data.IsPremium === '1' || false,
      error: hasError,
      errorMessage: errorMessage,
      rawResponse: data // Include raw response for debugging
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy server error', 
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`eNom Domain Proxy Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoint: POST http://localhost:${PORT}/check-domain`);
});
