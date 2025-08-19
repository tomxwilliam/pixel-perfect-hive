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

interface HostingEmailProps {
  customer_name: string
  domain_name?: string
  hosting_package?: string
  expiry_date?: string
  login_url?: string
  cpanel_url?: string
  ftp_hostname?: string
  ftp_username?: string
  usage_percentage?: number
  company_name?: string
  support_email?: string
  support_phone?: string
}

export const HostingAccountSetup = ({ customer_name, domain_name, hosting_package, login_url, cpanel_url, ftp_hostname, ftp_username, company_name, support_email }: HostingEmailProps) => (
  <Html>
    <Head />
    <Preview>Your hosting account is ready! Welcome to {company_name}</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={baseStyles.h1}>Welcome to {company_name}! 🎉</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          Congratulations! Your hosting account for <strong>{domain_name}</strong> is now active and ready to use.
        </Text>
        <Text style={baseStyles.text}>
          <strong>Hosting Package:</strong> {hosting_package}
        </Text>
        <Section style={baseStyles.codeBlock}>
          <Text style={{ margin: 0, fontWeight: 'bold' }}>Your Account Details:</Text>
          <Text style={{ margin: '8px 0 0 0' }}>
            Control Panel: <Link href={cpanel_url}>{cpanel_url}</Link><br />
            FTP Hostname: {ftp_hostname}<br />
            FTP Username: {ftp_username}<br />
            (FTP password was sent separately for security)
          </Text>
        </Section>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={login_url} style={baseStyles.button}>
            Access Control Panel
          </Button>
        </Section>
        <Text style={baseStyles.text}>
          <strong>Getting Started:</strong><br />
          • Upload your website files via FTP or File Manager<br />
          • Set up email accounts in cPanel<br />
          • Install applications like WordPress from Softaculous<br />
          • Configure SSL certificate (free Let's Encrypt available)
        </Text>
        <Text style={baseStyles.footer}>
          Need help getting started? Contact us at {support_email}<br />
          {company_name} - Your hosting journey starts here
        </Text>
      </Container>
    </Body>
  </Html>
)

export const HostingRenewalReminder30Days = ({ customer_name, domain_name, hosting_package, expiry_date, login_url, company_name, support_email }: HostingEmailProps) => (
  <Html>
    <Head />
    <Preview>Hosting renewal reminder - {domain_name} expires in 30 days</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={baseStyles.h1}>Hosting Renewal Reminder</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          Your hosting package <strong>{hosting_package}</strong> for <strong>{domain_name}</strong> is set to expire on <strong>{expiry_date}</strong>.
        </Text>
        <Text style={baseStyles.text}>
          Renew today to ensure your website remains online and all your data is protected.
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={login_url} style={baseStyles.button}>
            Renew Hosting Now
          </Button>
        </Section>
        <Text style={baseStyles.text}>
          <strong>Why renew early?</strong><br />
          • Avoid service interruption<br />
          • Keep your website and email running<br />
          • Maintain SEO rankings<br />
          • Protect your valuable data
        </Text>
        <Text style={baseStyles.footer}>
          Questions about renewal? Contact us at {support_email}<br />
          {company_name}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const HostingRenewalReminder7Days = ({ customer_name, domain_name, hosting_package, expiry_date, login_url, company_name, support_email }: HostingEmailProps) => (
  <Html>
    <Head />
    <Preview>URGENT: Hosting expires in 7 days - {domain_name}</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={{ ...baseStyles.h1, color: '#d73027' }}>⚠️ URGENT: Hosting Expiring Soon</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          <strong style={{ color: '#d73027' }}>Your hosting for {domain_name} expires in just 7 days on {expiry_date}!</strong>
        </Text>
        <Text style={baseStyles.text}>
          Please renew immediately to prevent your website from going offline and to avoid data loss.
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={login_url} style={{ ...baseStyles.button, backgroundColor: '#d73027' }}>
            RENEW NOW - Don't Wait!
          </Button>
        </Section>
        <Text style={baseStyles.text}>
          <strong>What happens if hosting expires:</strong><br />
          • Website goes offline immediately<br />
          • Email services stop working<br />
          • Risk of data loss<br />
          • Loss of search engine rankings
        </Text>
        <Text style={baseStyles.footer}>
          URGENT assistance needed? Contact us at {support_email}<br />
          {company_name}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const HostingExpiredNotice = ({ customer_name, domain_name, login_url, company_name, support_email }: HostingEmailProps) => (
  <Html>
    <Head />
    <Preview>Hosting expired - {domain_name} is offline</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={{ ...baseStyles.h1, color: '#d73027' }}>🚨 Hosting Expired</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          Your hosting account for <strong>{domain_name}</strong> has expired and your website is now offline.
        </Text>
        <Text style={baseStyles.text}>
          <strong>Your data is safe</strong> for a limited time, but immediate renewal is required to restore your website and email services.
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={login_url} style={{ ...baseStyles.button, backgroundColor: '#d73027' }}>
            Restore Hosting Now
          </Button>
        </Section>
        <Text style={baseStyles.text}>
          Time is critical - restore your hosting within the grace period to avoid permanent data loss.
        </Text>
        <Text style={baseStyles.footer}>
          Emergency support: Contact us immediately at {support_email}<br />
          {company_name}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const ResourceUsageAlert = ({ customer_name, domain_name, hosting_package, usage_percentage, login_url, company_name, support_email }: HostingEmailProps) => (
  <Html>
    <Head />
    <Preview>Resource usage alert for {domain_name} - {usage_percentage}% usage</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={{ ...baseStyles.h1, color: '#f39c12' }}>⚠️ Resource Usage Alert</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          Your hosting account for <strong>{domain_name}</strong> has reached <strong>{usage_percentage}%</strong> of its allocated resources.
        </Text>
        <Text style={baseStyles.text}>
          <strong>Current Package:</strong> {hosting_package}
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={login_url} style={{ ...baseStyles.button, backgroundColor: '#f39c12' }}>
            View Usage Details
          </Button>
        </Section>
        <Text style={baseStyles.text}>
          <strong>What you can do:</strong><br />
          • Review your website's resource usage<br />
          • Optimize images and scripts<br />
          • Consider upgrading to a higher package<br />
          • Remove unused files and applications
        </Text>
        <Text style={baseStyles.text}>
          If you reach 100% usage, your website may experience performance issues or temporary downtime.
        </Text>
        <Text style={baseStyles.footer}>
          Need help optimizing or upgrading? Contact us at {support_email}<br />
          {company_name}
        </Text>
      </Container>
    </Body>
  </Html>
)