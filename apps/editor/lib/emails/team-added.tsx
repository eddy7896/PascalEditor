import React from "react";
import { sendEmail } from "@/lib/email";
import { TeamAddedEmail } from "@/emails/TeamAddedEmail";

export interface SendTeamAddedEmailArgs {
  to: string;
  teamName: string;
  role: string;
  teamUrl: string;
  inviterName?: string;
}

export async function sendTeamAddedEmail(args: SendTeamAddedEmailArgs): Promise<void> {
  await sendEmail({
    to: args.to,
    subject: `You've joined ${args.teamName}`,
    react: (
      <TeamAddedEmail
        teamName={args.teamName}
        role={args.role}
        teamUrl={args.teamUrl}
        inviterName={args.inviterName}
      />
    ),
  });
}
