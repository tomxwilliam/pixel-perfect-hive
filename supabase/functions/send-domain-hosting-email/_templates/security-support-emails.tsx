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

interface SecuritySupportEmailProps {
  customer_name: string
  domain_name?: string
  verification_url?: string
  reset_url?: string
  ticket_number?: string
  ticket_subject?: string
  ticket_url?: string
  suspension_reason?: string
  termination_date?: string
  company_name?: string
  support_email?: string
  support_phone?: string
}

export const AccountVerification = ({ customer_name, domain_name, verification_url, company_name, support_email }: SecuritySupportEmailProps) => (
  <Html>
    <Head />
    <Preview>Please verify your account - {company_name}</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={baseStyles.h1}>Welcome! Please Verify Your Account 🔐</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          Welcome to {company_name}! To complete your account setup and activate your services, please verify your email address.
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={verification_url} style={baseStyles.button}>
            Verify My Account
          </Button>
        </Section>
        <Text style={baseStyles.text}>
          <strong>Why verify?</strong><br />
          • Secures your account and services<br />
          • Enables important notifications<br />
          • Unlocks full account features<br />
          • Required for technical support
        </Text>
        <Text style={baseStyles.text}>
          If you didn't create this account, please ignore this email or contact our support team.
        </Text>
        <Text style={baseStyles.footer}>
          Need help? Contact us at {support_email}<br />
          {company_name}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const PasswordReset = ({ customer_name, reset_url, company_name, support_email }: SecuritySupportEmailProps) => (
  <Html>
    <Head />
    <Preview>Password reset request - {company_name}</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={baseStyles.h1}>Password Reset Request 🔑</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          We received a request to reset your password. Click the button below to create a new password:
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={reset_url} style={baseStyles.button}>
            Reset My Password
          </Button>
        </Section>
        <Text style={baseStyles.text}>
          This link will expire in 24 hours for security purposes.
        </Text>
        <Text style={baseStyles.text}>
          <strong>Important:</strong> If you didn't request this password reset, please ignore this email or contact our support team immediately.
        </Text>
        <Text style={baseStyles.footer}>
          Security concerns? Contact us at {support_email}<br />
          {company_name}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const HostingSuspension = ({ customer_name, domain_name, suspension_reason, company_name, support_email }: SecuritySupportEmailProps) => (
  <Html>
    <Head />
    <Preview>Account suspended - {domain_name} - Immediate action required</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={{ ...baseStyles.h1, color: '#d73027' }}>🚨 Account Suspended</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          Your hosting account for <strong>{domain_name}</strong> has been suspended.
        </Text>
        <Text style={baseStyles.text}>
          <strong>Reason for suspension:</strong> {suspension_reason}
        </Text>
        <Text style={baseStyles.text}>
          <strong>Immediate action required:</strong><br />
          • Review and resolve the issue mentioned above<br />
          • Contact our support team for assistance<br />
          • Provide necessary documentation if requested<br />
          • Follow security best practices
        </Text>
        <Text style={baseStyles.text}>
          Your website and email services are currently offline until this matter is resolved.
        </Text>
        <Text style={baseStyles.footer}>
          <strong>URGENT:</strong> Contact us immediately at {support_email}<br />
          {company_name} - Security Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const HostingTermination = ({ customer_name, domain_name, termination_date, company_name, support_email }: SecuritySupportEmailProps) => (
  <Html>
    <Head />
    <Preview>Account termination notice - {domain_name}</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={{ ...baseStyles.h1, color: '#d73027' }}>Final Notice: Account Termination</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          This is formal notice that your hosting account for <strong>{domain_name}</strong> will be permanently terminated on <strong>{termination_date}</strong>.
        </Text>
        <Text style={baseStyles.text}>
          <strong>What this means:</strong><br />
          • All website files will be permanently deleted<br />
          • Email accounts and messages will be removed<br />
          • Databases and backups will be destroyed<br />
          • This action cannot be undone
        </Text>
        <Text style={baseStyles.text}>
          <strong>To prevent termination:</strong> Contact our support team immediately to resolve any outstanding issues.
        </Text>
        <Text style={baseStyles.text}>
          <strong>To backup your data:</strong> Download all important files, emails, and databases before the termination date.
        </Text>
        <Text style={baseStyles.footer}>
          <strong>CRITICAL:</strong> Contact us immediately at {support_email}<br />
          {company_name} - Account Management
        </Text>
      </Container>
    </Body>
  </Html>
)

export const SupportTicketOpened = ({ customer_name, ticket_number, ticket_subject, ticket_url, company_name, support_email }: SecuritySupportEmailProps) => (
  <Html>
    <Head />
    <Preview>Support ticket #{ticket_number} opened - {ticket_subject}</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={baseStyles.h1}>Support Ticket Created 🎫</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          Your support ticket has been successfully created and assigned to our technical team.
        </Text>
        <Section style={baseStyles.codeBlock}>
          <Text style={{ margin: 0, fontWeight: 'bold' }}>Ticket Details:</Text>
          <Text style={{ margin: '8px 0 0 0' }}>
            Ticket Number: #{ticket_number}<br />
            Subject: {ticket_subject}<br />
            Status: Open<br />
            Priority: Normal
          </Text>
        </Section>
        <Text style={baseStyles.text}>
          We aim to respond to all support requests within 24 hours. You'll receive email updates when our team responds.
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={ticket_url} style={baseStyles.button}>
            View Ticket
          </Button>
        </Section>
        <Text style={baseStyles.footer}>
          Urgent issues? Call us at {support_email}<br />
          {company_name} - Support Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const SupportTicketUpdate = ({ customer_name, ticket_number, ticket_subject, ticket_url, company_name, support_email }: SecuritySupportEmailProps) => (
  <Html>
    <Head />
    <Preview>Support ticket #{ticket_number} updated - New response</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={baseStyles.h1}>Support Ticket Updated 📝</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          Our support team has responded to your ticket <strong>#{ticket_number}</strong>.
        </Text>
        <Text style={baseStyles.text}>
          <strong>Subject:</strong> {ticket_subject}
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={ticket_url} style={baseStyles.button}>
            View Response
          </Button>
        </Section>
        <Text style={baseStyles.text}>
          Please review our response and let us know if you need any clarification or additional assistance.
        </Text>
        <Text style={baseStyles.footer}>
          Reply directly to this ticket at {ticket_url}<br />
          {company_name} - Support Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const SupportTicketClosed = ({ customer_name, ticket_number, ticket_subject, company_name, support_email }: SecuritySupportEmailProps) => (
  <Html>
    <Head />
    <Preview>Support ticket #{ticket_number} closed - Issue resolved</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={baseStyles.h1}>Support Ticket Closed ✅</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          Your support ticket <strong>#{ticket_number}</strong> has been marked as resolved and closed.
        </Text>
        <Text style={baseStyles.text}>
          <strong>Subject:</strong> {ticket_subject}
        </Text>
        <Text style={baseStyles.text}>
          We hope our solution resolved your issue completely. Your feedback helps us improve our services.
        </Text>
        <Text style={baseStyles.text}>
          <strong>Need further assistance?</strong> Feel free to open a new support ticket or reply to this email if the issue persists.
        </Text>
        <Text style={baseStyles.footer}>
          Thank you for choosing {company_name}! Contact us anytime at {support_email}<br />
          {company_name} - Support Team
        </Text>
      </Container>
    </Body>
  </Html>
)