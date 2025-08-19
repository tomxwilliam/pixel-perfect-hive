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

interface BillingEmailProps {
  customer_name: string
  invoice_number?: string
  amount?: string
  due_date?: string
  payment_url?: string
  invoice_url?: string
  service_description?: string
  auto_renewal_date?: string
  company_name?: string
  support_email?: string
  billing_email?: string
}

export const InvoicePaymentReceipt = ({ customer_name, invoice_number, amount, service_description, invoice_url, company_name, support_email }: BillingEmailProps) => (
  <Html>
    <Head />
    <Preview>Payment receipt for invoice {invoice_number}</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={baseStyles.h1}>Payment Received - Thank You! 💳</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          Thank you! We've successfully received your payment.
        </Text>
        <Section style={baseStyles.codeBlock}>
          <Text style={{ margin: 0, fontWeight: 'bold' }}>Payment Details:</Text>
          <Text style={{ margin: '8px 0 0 0' }}>
            Invoice Number: {invoice_number}<br />
            Amount Paid: {amount}<br />
            Service: {service_description}<br />
            Payment Date: {new Date().toLocaleDateString()}
          </Text>
        </Section>
        <Text style={baseStyles.text}>
          Your services will continue uninterrupted. This email serves as your payment receipt for tax and accounting purposes.
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={invoice_url} style={baseStyles.button}>
            Download Invoice
          </Button>
        </Section>
        <Text style={baseStyles.footer}>
          Questions about your payment? Contact us at {support_email}<br />
          {company_name} - Thank you for your business
        </Text>
      </Container>
    </Body>
  </Html>
)

export const FailedPaymentRetry = ({ customer_name, invoice_number, amount, due_date, payment_url, service_description, company_name, support_email }: BillingEmailProps) => (
  <Html>
    <Head />
    <Preview>Payment failed for invoice {invoice_number} - Please retry</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={{ ...baseStyles.h1, color: '#d73027' }}>⚠️ Payment Failed - Action Required</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          We were unable to process your payment for invoice <strong>{invoice_number}</strong>.
        </Text>
        <Section style={baseStyles.codeBlock}>
          <Text style={{ margin: 0, fontWeight: 'bold' }}>Payment Details:</Text>
          <Text style={{ margin: '8px 0 0 0' }}>
            Invoice Number: {invoice_number}<br />
            Amount Due: {amount}<br />
            Service: {service_description}<br />
            Due Date: {due_date}
          </Text>
        </Section>
        <Text style={baseStyles.text}>
          <strong>Common reasons for payment failure:</strong><br />
          • Insufficient funds<br />
          • Expired credit card<br />
          • Incorrect billing information<br />
          • Bank security restrictions
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={payment_url} style={{ ...baseStyles.button, backgroundColor: '#d73027' }}>
            Retry Payment Now
          </Button>
        </Section>
        <Text style={baseStyles.text}>
          Please update your payment method and retry to avoid service interruption.
        </Text>
        <Text style={baseStyles.footer}>
          Payment issues? Contact us at {support_email}<br />
          {company_name}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const AutoRenewalConfirmation = ({ customer_name, service_description, amount, auto_renewal_date, invoice_url, company_name, support_email }: BillingEmailProps) => (
  <Html>
    <Head />
    <Preview>Auto-renewal confirmation for {service_description}</Preview>
    <Body style={baseStyles.main}>
      <Container style={baseStyles.container}>
        <Heading style={baseStyles.h1}>Auto-Renewal Successful ✅</Heading>
        <Text style={baseStyles.text}>Hi {customer_name},</Text>
        <Text style={baseStyles.text}>
          Great news! Your service has been automatically renewed.
        </Text>
        <Section style={baseStyles.codeBlock}>
          <Text style={{ margin: 0, fontWeight: 'bold' }}>Renewal Details:</Text>
          <Text style={{ margin: '8px 0 0 0' }}>
            Service: {service_description}<br />
            Amount: {amount}<br />
            Renewal Date: {auto_renewal_date}<br />
            Next Renewal: {new Date(new Date(auto_renewal_date).getTime() + 365*24*60*60*1000).toLocaleDateString()}
          </Text>
        </Section>
        <Text style={baseStyles.text}>
          Your services will continue without interruption for another term. Thank you for being a valued customer!
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={invoice_url} style={baseStyles.button}>
            View Invoice
          </Button>
        </Section>
        <Text style={baseStyles.footer}>
          Questions about auto-renewal? Contact us at {support_email}<br />
          {company_name}
        </Text>
      </Container>
    </Body>
  </Html>
)