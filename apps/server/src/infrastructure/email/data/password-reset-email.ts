export interface PasswordResetEmailParams {
  recipientName: string;
  foundationName: string;
  resetUrl: string;
}

export function buildPasswordResetEmail(params: PasswordResetEmailParams): {
  subject: string;
  html: string;
} {
  const subject = `Відновлення пароля · ${params.foundationName}`;
  const html = `
  <div style="font-family:Inter,Arial,sans-serif;background:#f4f5f7;padding:24px;">
    <div style="max-width:580px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
      <div style="background:#4a5d3a;color:#f6f4ec;padding:20px 28px;font-weight:600;">
        ${params.foundationName}
      </div>
      <div style="padding:28px;">
        <h2 style="margin:0 0 14px;font-size:22px;color:#1c2014;">Відновлення пароля</h2>
        <p style="color:#5a5f48;line-height:1.6;">
          ${params.recipientName}, ми отримали запит на відновлення пароля. Натисніть кнопку
          нижче, щоб встановити новий пароль. Посилання діятиме <strong>2 години</strong>.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${params.resetUrl}"
             style="background:#4a5d3a;color:#f6f4ec;padding:12px 28px;border-radius:6px;
             text-decoration:none;display:inline-block;">Встановити новий пароль</a>
        </div>
        <p style="font-size:12px;color:#8a8f72;word-break:break-all;">${params.resetUrl}</p>
        <p style="font-size:12px;color:#8a8f72;">
          Якщо ви не надсилали цей запит, просто проігноруйте лист.
        </p>
      </div>
    </div>
  </div>`;
  return { subject, html };
}
