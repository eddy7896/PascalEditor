import React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Link,
  Preview,
} from "@react-email/components";

interface VerificationEmailProps {
  verifyUrl: string;
  name?: string;
}

export function VerificationEmail({
  verifyUrl,
  name,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your Pascal email address</Preview>
      <Body style={{ fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          <Text style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
            Verify Your Email
          </Text>
          <Text style={{ fontSize: "16px", marginBottom: "12px" }}>
            Hi {name ? name : "there"},
          </Text>
          <Text style={{ fontSize: "16px", marginBottom: "12px" }}>
            Click below to verify your email address.
          </Text>
          <div style={{ margin: "30px 0" }}>
            <Link
              href={verifyUrl}
              style={{
                backgroundColor: "#000000",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "4px",
                textDecoration: "none",
                display: "inline-block",
                fontWeight: "bold",
              }}
            >
              Verify email
            </Link>
          </div>
          <Text style={{ fontSize: "14px", color: "#666", marginTop: "30px" }}>
            This link expires in 24 hours.
          </Text>
          <Text style={{ fontSize: "14px", color: "#666", marginTop: "20px" }}>
            If you did not create this account, ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
