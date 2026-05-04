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

interface TeamInviteEmailProps {
  inviteUrl: string;
  teamName: string;
  inviterName?: string;
  role: string;
}

export function TeamInviteEmail({
  inviteUrl,
  teamName,
  inviterName,
  role,
}: TeamInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join a Pascal team</Preview>
      <Body style={{ fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          <Text style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
            You're Invited to Join a Team
          </Text>
          <Text style={{ fontSize: "16px", marginBottom: "12px" }}>
            {inviterName ? inviterName : "Someone"} has invited you to join the{" "}
            <strong>{teamName}</strong> team as a <strong>{role}</strong>.
          </Text>
          <Text style={{ fontSize: "16px", marginBottom: "12px" }}>
            Accept the invitation to get started collaborating.
          </Text>
          <div style={{ margin: "30px 0" }}>
            <Link
              href={inviteUrl}
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
              Accept Invitation
            </Link>
          </div>
          <Text style={{ fontSize: "14px", color: "#666", marginTop: "30px" }}>
            Or copy and paste this link in your browser:
          </Text>
          <Text style={{ fontSize: "12px", color: "#999", wordBreak: "break-all" }}>
            {inviteUrl}
          </Text>
          <Text style={{ fontSize: "14px", color: "#666", marginTop: "20px" }}>
            This invitation expires in 48 hours.
          </Text>
          <Text style={{ fontSize: "12px", color: "#999", marginTop: "30px" }}>
            If you did not expect this invitation, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
