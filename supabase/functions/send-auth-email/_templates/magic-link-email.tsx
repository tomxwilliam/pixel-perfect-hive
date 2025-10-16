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

interface MagicLinkEmailProps {
  magicLinkUrl: string;
  token: string;
  userEmail: string;
}

export const MagicLinkEmail = ({
  magicLinkUrl,
  token,
  userEmail,
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Your magic link to sign in to 404 Code Lab</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Sign in to 404 Code Lab ✨</Heading>
        
        <Text style={text}>
          Hi! Here's your magic link to sign in to your account at <strong>{userEmail}</strong>.
        </Text>

        <Text style={text}>
          Click the button below to securely sign in:
        </Text>

        <Section style={buttonContainer}>
          <Link href={magicLinkUrl} style={button}>
            Sign In with Magic Link
          </Link>
        </Section>

        <Text style={text}>
          Or copy and paste this URL into your browser:
        </Text>
        <Text style={code}>{magicLinkUrl}</Text>

        <Text style={divider}>──────────────────</Text>

        <Text style={text}>
          Alternatively, you can use this one-time code:
        </Text>
        <Text style={tokenCode}>{token}</Text>

        <Text style={warningText}>
          ⚠️ This magic link and code will expire in 1 hour.
        </Text>

        <Text style={footerText}>
          If you didn't request this magic link, you can safely ignore this email.
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

export default MagicLinkEmail;

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
  backgroundColor: "#7c3aed",
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

const divider = {
  color: "#e5e7eb",
  fontSize: "16px",
  textAlign: "center" as const,
  margin: "24px 0",
};

const tokenCode = {
  display: "block",
  padding: "16px",
  margin: "16px 40px",
  backgroundColor: "#7c3aed",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  letterSpacing: "4px",
};

const warningText = {
  color: "#d97706",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "24px 0",
  padding: "12px 40px",
  backgroundColor: "#fef3c7",
  borderRadius: "5px",
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
