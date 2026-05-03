import React from "react";
import { sendEmail } from "@/lib/email";
import { RoleChangedEmail } from "@/emails/RoleChangedEmail";

export interface SendRoleChangedEmailArgs {
  to: string;
  teamName: string;
  newRole: string;
  oldRole?: string;
  changedByName?: string;
  teamUrl: string;
}

export async function sendRoleChangedEmail(args: SendRoleChangedEmailArgs): Promise<void> {
  await sendEmail({
    to: args.to,
    subject: `Your role in ${args.teamName} has changed`,
    react: (
      <RoleChangedEmail
        teamName={args.teamName}
        newRole={args.newRole}
        oldRole={args.oldRole}
        changedByName={args.changedByName}
        teamUrl={args.teamUrl}
      />
    ),
  });
}
