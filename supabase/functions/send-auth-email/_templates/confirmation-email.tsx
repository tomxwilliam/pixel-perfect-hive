import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";

interface ConfirmationEmailProps {
  confirmationUrl: string;
  userEmail: string;
}

export const ConfirmationEmail = ({
  confirmationUrl,
  userEmail,
}: ConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Confirm your email address to get started</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to 404 Code Lab! 🚀</Heading>
        
        <Text style={text}>
          Thanks for signing up with <strong>{userEmail}</strong>. We're excited to have you on board!
        </Text>

        <Text style={text}>
          To complete your registration and start exploring our services, please confirm your email address by clicking the button below:
        </Text>

        <Section style={buttonContainer}>
          <Link href={confirmationUrl} style={button}>
            Confirm Email Address
          </Link>
        </Section>

        <Text style={text}>
          Or copy and paste this URL into your browser:
        </Text>
        <Text style={code}>{confirmationUrl}</Text>

        <Text style={footerText}>
          If you didn't create an account with 404 Code Lab, you can safely ignore this email.
        </Text>

        <Text style={footer}>
          <Link href="https://404codelab.com" style={link}>
            404 Code Lab
          </Link>{" "}
          - Professional Web & App Development
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ConfirmationEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
  padding: "0 40px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#5469d4",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const code = {
  display: "block",
  padding: "16px",
  width: "calc(100% - 80px)",
  margin: "16px 40px",
  backgroundColor: "#f4f4f4",
  borderRadius: "5px",
  border: "1px solid #eee",
  color: "#333",
  fontSize: "14px",
  wordBreak: "break-all" as const,
};

const footerText = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "32px 0 16px",
  padding: "0 40px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "22px",
  marginTop: "12px",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const link = {
  color: "#5469d4",
  textDecoration: "underline",
};
