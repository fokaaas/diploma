export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  /** Display name for the From header (e.g. the foundation name). */
  fromName?: string;
  /** Primary action URL — surfaced in the dev console fallback for easy testing. */
  link?: string;
}
