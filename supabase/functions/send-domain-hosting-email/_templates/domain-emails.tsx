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
  footer: { color: '#666', fontSize: '12px', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }
}

interface DomainEmailProps {
  customer_name: string
  domain_name: string
  expiry_date?: string
  login_url?: string
  company_name?: string
  support_email?: string
  support_phone?: string
}

export const DomainRegistrationConfirmation = ({ customer_name, domain_name, login_url, company_name, support_email }: DomainEmailProps) => (
  <Html>
    <Head />
    <Preview>Domain registration confirmed for {domain_name}</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={baseStyles.h1}>Domain Registration Confirmed! 🎉</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          Great news! Your domain <strong>{domain_name}</strong> has been successfully registered and is now active.
        </Text>
        <Text style={baseStyles.text}>
          Your domain is now pointing to our nameservers and should be fully propagated within 24-48 hours.
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={login_url} style={baseStyles.button}>
            Manage Your Domain
          </Button>
        </Section>
        <Text style={baseStyles.text}>
          <strong>What's next?</strong><br />
          • Set up hosting for your website<br />
          • Configure email hosting<br />
          • Update DNS settings if needed
        </Text>
        <Text style={baseStyles.footer}>
          Need help? Contact us at {support_email}<br />
          {company_name} - Your trusted hosting partner
        </Text>
      </Container>
    </Body>
  </Html>
)

export const DomainTransferInitiated = ({ customer_name, domain_name, company_name, support_email }: DomainEmailProps) => (
  <Html>
    <Head />
    <Preview>Domain transfer initiated for {domain_name}</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={baseStyles.h1}>Domain Transfer Initiated</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          Your domain transfer request for <strong>{domain_name}</strong> has been initiated.
        </Text>
        <Text style={baseStyles.text}>
          The transfer process typically takes 5-7 days to complete. We'll keep you updated on the progress.
        </Text>
        <Text style={baseStyles.text}>
          <strong>Important:</strong> Please ensure you've unlocked your domain at your current registrar and have the authorization code ready if requested.
        </Text>
        <Text style={baseStyles.footer}>
          Questions? Contact us at {support_email}<br />
          {company_name}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const DomainTransferCompleted = ({ customer_name, domain_name, login_url, company_name, support_email }: DomainEmailProps) => (
  <Html>
    <Head />
    <Preview>Domain transfer completed for {domain_name}</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={baseStyles.h1}>Domain Transfer Completed! ✅</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          Excellent! Your domain <strong>{domain_name}</strong> has been successfully transferred to {company_name}.
        </Text>
        <Text style={baseStyles.text}>
          Your domain is now fully under our management and you can access all domain settings through your control panel.
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={login_url} style={baseStyles.button}>
            Access Control Panel
          </Button>
        </Section>
        <Text style={baseStyles.footer}>
          Welcome to {company_name}! Contact us at {support_email}<br />
          {company_name}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const DomainRenewalReminder30Days = ({ customer_name, domain_name, expiry_date, login_url, company_name, support_email }: DomainEmailProps) => (
  <Html>
    <Head />
    <Preview>Domain renewal reminder - {domain_name} expires in 30 days</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={baseStyles.h1}>Domain Renewal Reminder</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          Your domain <strong>{domain_name}</strong> is set to expire on <strong>{expiry_date}</strong> (in 30 days).
        </Text>
        <Text style={baseStyles.text}>
          To ensure your website remains online and your email continues working, please renew your domain before the expiry date.
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={login_url} style={baseStyles.button}>
            Renew Domain Now
          </Button>
        </Section>
        <Text style={baseStyles.text}>
          <strong>Don't let your domain expire!</strong> After expiration, your website and email will stop working, and the domain may become available for others to register.
        </Text>
        <Text style={baseStyles.footer}>
          Need assistance? Contact us at {support_email}<br />
          {company_name}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const DomainRenewalReminder7Days = ({ customer_name, domain_name, expiry_date, login_url, company_name, support_email }: DomainEmailProps) => (
  <Html>
    <Head />
    <Preview>URGENT: Domain renewal reminder - {domain_name} expires in 7 days</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={{ ...baseStyles.h1, color: '#d73027' }}>⚠️ URGENT: Domain Expiring Soon</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          <strong style={{ color: '#d73027' }}>Your domain {domain_name} expires in just 7 days on {expiry_date}!</strong>
        </Text>
        <Text style={baseStyles.text}>
          This is your final reminder. Please renew immediately to avoid service interruption.
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={login_url} style={{ ...baseStyles.button, backgroundColor: '#d73027' }}>
            RENEW NOW - Don't Wait!
          </Button>
        </Section>
        <Text style={baseStyles.text}>
          <strong>What happens if you don't renew:</strong><br />
          • Your website will go offline<br />
          • Email services will stop working<br />
          • Domain may become available to others
        </Text>
        <Text style={baseStyles.footer}>
          URGENT assistance needed? Contact us at {support_email}<br />
          {company_name}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const DomainExpiredNotice = ({ customer_name, domain_name, login_url, company_name, support_email }: DomainEmailProps) => (
  <Html>
    <Head />
    <Preview>Domain expired - {domain_name} requires immediate attention</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={{ ...baseStyles.h1, color: '#d73027' }}>🚨 Domain Expired</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          Your domain <strong>{domain_name}</strong> has expired and your services are now offline.
        </Text>
        <Text style={baseStyles.text}>
          <strong>Immediate action required:</strong> Renew your domain within the grace period to restore services and avoid additional fees.
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={login_url} style={{ ...baseStyles.button, backgroundColor: '#d73027' }}>
            Restore Domain Now
          </Button>
        </Section>
        <Text style={baseStyles.text}>
          You have a limited grace period to renew before the domain enters redemption, which incurs additional fees.
        </Text>
        <Text style={baseStyles.footer}>
          Emergency support: Contact us immediately at {support_email}<br />
          {company_name}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const DomainRedemptionNotice = ({ customer_name, domain_name, login_url, company_name, support_email }: DomainEmailProps) => (
  <Html>
    <Head />
    <Preview>Domain in redemption period - {domain_name} final chance</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={{ ...baseStyles.h1, color: '#d73027' }}>⚠️ Final Notice: Domain in Redemption</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          Your domain <strong>{domain_name}</strong> is now in the redemption period. This is your final opportunity to restore it before it's released to the public.
        </Text>
        <Text style={baseStyles.text}>
          <strong>Additional fees apply during redemption.</strong> The cost to restore your domain is significantly higher than standard renewal.
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={login_url} style={{ ...baseStyles.button, backgroundColor: '#d73027' }}>
            Restore Domain (Redemption Fee Required)
          </Button>
        </Section>
        <Text style={baseStyles.text}>
          If not restored soon, your domain will be deleted and become available for public registration.
        </Text>
        <Text style={baseStyles.footer}>
          Critical support needed: Contact us at {support_email}<br />
          {company_name}
        </Text>
      </Container>
    </Body>
  </Html>
)