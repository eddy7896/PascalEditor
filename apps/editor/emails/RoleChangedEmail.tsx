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

interface RoleChangedEmailProps {
  teamName: string;
  newRole: string;
  oldRole?: string;
  changedByName?: string;
  teamUrl: string;
}

export function RoleChangedEmail({
  teamName,
  newRole,
  oldRole,
  changedByName,
  teamUrl,
}: RoleChangedEmailProps) {
  const roleChangeDescription =
    oldRole
      ? `from ${oldRole} to ${newRole}`
      : `to ${newRole}`;

  const byClause = changedByName ? ` by ${changedByName}` : "";

  return (
    <Html>
      <Head />
      <Preview>Your role in {teamName} has changed</Preview>
      <Body style={{ fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          <Text style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
            Your Role Has Changed
          </Text>
          <Text style={{ fontSize: "16px", marginBottom: "12px" }}>
            Your role in <strong>{teamName}</strong> has been changed {roleChangeDescription}
            {byClause}.
          </Text>
          <Text style={{ fontSize: "16px", marginBottom: "12px" }}>
            Visit your team to see what you can do with your new role.
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
              View Team
            </Link>
          </div>
          <Text style={{ fontSize: "12px", color: "#999", marginTop: "30px" }}>
            If you did not expect this change, please contact your team administrator.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
