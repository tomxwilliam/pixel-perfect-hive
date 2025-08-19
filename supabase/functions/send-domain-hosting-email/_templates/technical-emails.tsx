import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
  Section,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

const baseStyles = {
  main: { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' },
  container: { paddingLeft: '12px', paddingRight: '12px', margin: '0 auto', maxWidth: '600px' },
  h1: { color: '#333', fontSize: '24px', fontWeight: 'bold', margin: '40px 0 20px 0' },
  text: { color: '#333', fontSize: '14px', lineHeight: '1.5', margin: '16px 0' },
  button: { backgroundColor: '#007cba', color: '#ffffff', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none', display: 'inline-block' },
  footer: { color: '#666', fontSize: '12px', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' },
  codeBlock: { backgroundColor: '#f4f4f4', padding: '16px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', margin: '16px 0' }
}

interface TechnicalEmailProps {
  customer_name: string
  domain_name?: string
  nameserver1?: string
  nameserver2?: string
  mx_record?: string
  smtp_server?: string
  imap_server?: string
  pop_server?: string
  smtp_port?: string
  imap_port?: string
  pop_port?: string
  company_name?: string
  support_email?: string
  login_url?: string
}

export const NameserverUpdate = ({ customer_name, domain_name, nameserver1, nameserver2, company_name, support_email }: TechnicalEmailProps) => (
  <Html>
    <Head />
    <Preview>Nameserver update confirmed for {domain_name}</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={baseStyles.h1}>Nameserver Update Confirmed ✅</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          The nameserver update for <strong>{domain_name}</strong> has been successfully processed.
        </Text>
        <Section style={baseStyles.codeBlock}>
          <Text style={{ margin: 0, fontWeight: 'bold' }}>New Nameservers:</Text>
          <Text style={{ margin: '8px 0 0 0' }}>
            Primary: {nameserver1}<br />
            Secondary: {nameserver2}
          </Text>
        </Section>
        <Text style={baseStyles.text}>
          <strong>Important:</strong> DNS propagation can take 24-48 hours worldwide. During this time, visitors may see either the old or new website depending on their location.
        </Text>
        <Text style={baseStyles.text}>
          <strong>What this means:</strong><br />
          • Your domain now points to the new hosting location<br />
          • Email routing may be affected during propagation<br />
          • Website changes will gradually appear worldwide
        </Text>
        <Text style={baseStyles.footer}>
          Questions about DNS changes? Contact us at {support_email}<br />
          {company_name}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const EmailHostingSetup = ({ customer_name, domain_name, mx_record, smtp_server, imap_server, pop_server, smtp_port, imap_port, pop_port, company_name, support_email }: TechnicalEmailProps) => (
  <Html>
    <Head />
    <Preview>Email hosting setup details for {domain_name}</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={baseStyles.h1}>Email Hosting Setup Complete 📧</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          Your email hosting for <strong>{domain_name}</strong> is now active! Here are your email settings:
        </Text>
        <Section style={baseStyles.codeBlock}>
          <Text style={{ margin: 0, fontWeight: 'bold' }}>Incoming Mail Settings:</Text>
          <Text style={{ margin: '8px 0 0 0' }}>
            IMAP Server: {imap_server}<br />
            IMAP Port: {imap_port} (SSL/TLS)<br />
            POP3 Server: {pop_server}<br />
            POP3 Port: {pop_port} (SSL/TLS)
          </Text>
        </Section>
        <Section style={baseStyles.codeBlock}>
          <Text style={{ margin: 0, fontWeight: 'bold' }}>Outgoing Mail Settings:</Text>
          <Text style={{ margin: '8px 0 0 0' }}>
            SMTP Server: {smtp_server}<br />
            SMTP Port: {smtp_port} (SSL/TLS)<br />
            Authentication: Required<br />
            Username: Your full email address<br />
            Password: Your email password
          </Text>
        </Section>
        <Section style={baseStyles.codeBlock}>
          <Text style={{ margin: 0, fontWeight: 'bold' }}>MX Record:</Text>
          <Text style={{ margin: '8px 0 0 0' }}>
            {mx_record}
          </Text>
        </Section>
        <Text style={baseStyles.text}>
          <strong>Security Settings:</strong><br />
          • Always use SSL/TLS encryption<br />
          • Enable two-factor authentication when available<br />
          • Use strong, unique passwords for each email account
        </Text>
        <Text style={baseStyles.footer}>
          Need help setting up your email client? Contact us at {support_email}<br />
          {company_name}
        </Text>
      </Container>
    </Body>
  </Html>
)