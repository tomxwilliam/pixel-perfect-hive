-- Create orders table for tracking checkout sessions
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  items JSONB NOT NULL DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT orders_customer_fk FOREIGN KEY (customer_id) REFERENCES profiles(id)
);

-- Create domain_registrations table
CREATE TABLE domain_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID,
  customer_id UUID NOT NULL,
  domain_name TEXT NOT NULL,
  tld TEXT NOT NULL,
  years INTEGER NOT NULL DEFAULT 1,
  id_protect BOOLEAN DEFAULT false,
  nameservers TEXT[] DEFAULT ARRAY['ns1.404codelab.com', 'ns2.404codelab.com'],
  enom_order_id TEXT,
  registration_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT domain_registrations_order_fk FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT domain_registrations_customer_fk FOREIGN KEY (customer_id) REFERENCES profiles(id)
);

-- Create hosting_accounts table
CREATE TABLE hosting_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID,
  customer_id UUID NOT NULL,
  hosting_package_id UUID NOT NULL,
  domain_name TEXT NOT NULL,
  whm_account_id TEXT,
  cpanel_username TEXT,
  cpanel_password TEXT,
  server_ip TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  suspended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT hosting_accounts_order_fk FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT hosting_accounts_customer_fk FOREIGN KEY (customer_id) REFERENCES profiles(id),
  CONSTRAINT hosting_accounts_package_fk FOREIGN KEY (hosting_package_id) REFERENCES hosting_packages(id)
);

-- Add stripe_price_id and whm_package_name to hosting_packages
ALTER TABLE hosting_packages 
ADD COLUMN stripe_price_id TEXT,
ADD COLUMN whm_package_name TEXT;

-- Create currency_rates table for USD to GBP conversion
CREATE TABLE currency_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate DECIMAL(10,6) NOT NULL,
  margin DECIMAL(5,4) DEFAULT 0.05, -- 5% margin
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_currency, to_currency)
);

-- Insert default currency conversion
INSERT INTO currency_rates (from_currency, to_currency, rate, margin) 
VALUES ('USD', 'GBP', 0.79, 0.05) ON CONFLICT DO NOTHING;

-- Add RLS policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosting_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_rates ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (customer_id = auth.uid());

-- Domain registrations policies  
CREATE POLICY "Admins can manage all domain registrations" ON domain_registrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Customers can view own domain registrations" ON domain_registrations
  FOR SELECT USING (customer_id = auth.uid());

-- Hosting accounts policies
CREATE POLICY "Admins can manage all hosting accounts" ON hosting_accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Customers can view own hosting accounts" ON hosting_accounts
  FOR SELECT USING (customer_id = auth.uid());

-- Currency rates policies (read-only for all)
CREATE POLICY "Anyone can view currency rates" ON currency_rates
  FOR SELECT USING (true);