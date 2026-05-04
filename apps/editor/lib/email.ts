import { Resend } from "resend";
import React from "react";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: opts.subject,
      react: opts.react,
    });

    if (result.error) {
      throw new Error(`Email send failed: ${result.error.message}`);
    }
  } catch (error) {
    throw new Error(
      `Email send failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
