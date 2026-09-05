export const BILLING_SETTINGS = {
  renewalReminderDays: Math.max(1, Math.min(30, Number(process.env.RENEWAL_REMINDER_DAYS || 3) || 3)),
} as const;
