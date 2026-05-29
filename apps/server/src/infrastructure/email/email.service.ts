import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { mailConfig } from '../../config/configuration';
import type { MailMessage } from './data/mail-message';
import {
  buildInvitationEmail,
  InvitationEmailParams,
} from './data/invitation-email';
import {
  buildPasswordResetEmail,
  PasswordResetEmailParams,
} from './data/password-reset-email';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter | null;
  private readonly fromAddress: string;

  constructor(
    @Inject(mailConfig.KEY)
    private readonly config: ConfigType<typeof mailConfig>,
  ) {
    this.fromAddress = config.fromAddress;
    this.transporter = config.host
      ? nodemailer.createTransport({
          host: config.host,
          port: config.port,
          secure: config.secure,
          auth: config.user
            ? { user: config.user, pass: config.pass }
            : undefined,
        })
      : null;
  }

  async sendInvitation(
    to: string,
    params: InvitationEmailParams,
  ): Promise<void> {
    const { subject, html } = buildInvitationEmail(params);
    await this.send({
      to,
      subject,
      html,
      fromName: params.foundationName,
      link: params.acceptUrl,
    });
  }

  async sendPasswordReset(
    to: string,
    params: PasswordResetEmailParams,
  ): Promise<void> {
    const { subject, html } = buildPasswordResetEmail(params);
    await this.send({
      to,
      subject,
      html,
      fromName: params.foundationName,
      link: params.resetUrl,
    });
  }

  private async send(message: MailMessage): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `[DEV EMAIL] no SMTP configured\n  To: ${message.to}\n  Subject: ${message.subject}` +
          (message.link ? `\n  Link: ${message.link}` : ''),
      );
      return;
    }
    await this.transporter.sendMail({
      from: message.fromName
        ? `"${message.fromName}" <${this.fromAddress}>`
        : this.fromAddress,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });
  }
}
