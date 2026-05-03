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

interface TeamAddedEmailProps {
  teamName: string;
  role: string;
  teamUrl: string;
  inviterName?: string;
}

export function TeamAddedEmail({
  teamName,
  role,
  teamUrl,
  inviterName,
}: TeamAddedEmailProps) {
  const invitedByClause = inviterName ? ` (invited by ${inviterName})` : "";

  return (
    <Html>
      <Head />
      <Preview>You&apos;ve joined {teamName}</Preview>
      <Body style={{ fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          <Text style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
            Welcome to {teamName}
          </Text>
          <Text style={{ fontSize: "16px", marginBottom: "12px" }}>
            You&apos;ve joined <strong>{teamName}</strong> as <strong>{role}</strong>
            {invitedByClause}.
          </Text>
          <Text style={{ fontSize: "16px", marginBottom: "12px" }}>
            Start collaborating with your new team right away.
          </Text>
          <div style={{ margin: "30px 0" }}>
            <Link
              href={teamUrl}
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
              Open Team
            </Link>
          </div>
          <Text style={{ fontSize: "12px", color: "#999", marginTop: "30px" }}>
            If you did not expect this, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
