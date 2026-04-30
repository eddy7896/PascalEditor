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

interface PasswordResetEmailProps {
  resetUrl: string;
  name?: string;
}

export function PasswordResetEmail({
  resetUrl,
  name,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Pascal password</Preview>
      <Body style={{ fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          <Text style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
            Reset Your Password
          </Text>
          <Text style={{ fontSize: "16px", marginBottom: "12px" }}>
            Hi {name ? name : "there"},
          </Text>
          <Text style={{ fontSize: "16px", marginBottom: "12px" }}>
            We received a request to reset your Pascal password. Click the button below to reset it.
            This link expires in 1 hour.
          </Text>
          <div style={{ margin: "30px 0" }}>
            <Link
              href={resetUrl}
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
              Reset Password
            </Link>
          </div>
          <Text style={{ fontSize: "14px", color: "#666", marginTop: "30px" }}>
            Or copy and paste this link in your browser:
          </Text>
          <Text style={{ fontSize: "12px", color: "#999", wordBreak: "break-all" }}>
            {resetUrl}
          </Text>
          <Text style={{ fontSize: "14px", color: "#666", marginTop: "20px" }}>
            If you did not request this password reset, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
