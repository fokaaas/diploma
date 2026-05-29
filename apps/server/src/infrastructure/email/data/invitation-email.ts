export interface InvitationEmailParams {
  recipientName: string;
  foundationName: string;
  roleLabel: string;
  inviterName: string;
  email: string;
  acceptUrl: string;
}

export function buildInvitationEmail(params: InvitationEmailParams): {
  subject: string;
  html: string;
} {
  const subject = `Запрошення до фонду «${params.foundationName}»`;
  const html = `
  <div style="font-family:Inter,Arial,sans-serif;background:#f4f5f7;padding:24px;">
    <div style="max-width:580px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
      <div style="background:#4a5d3a;color:#f6f4ec;padding:20px 28px;font-weight:600;">
        ${params.foundationName}
      </div>
      <div style="padding:28px;">
        <h2 style="margin:0 0 14px;font-size:22px;color:#1c2014;">
          ${params.recipientName}, вас запрошено долучитися до фонду
        </h2>
        <p style="color:#5a5f48;line-height:1.6;">
          <strong>${params.inviterName}</strong> запрошує вас приєднатися до операційної
          платформи фонду <strong>«${params.foundationName}»</strong> у ролі
          <strong>${params.roleLabel}</strong>.
        </p>
        <p style="color:#5a5f48;line-height:1.6;">
          Щоб активувати обліковий запис (${params.email}), відкрийте посилання нижче та
          встановіть пароль. Посилання діятиме <strong>72 години</strong>.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${params.acceptUrl}"
             style="background:#4a5d3a;color:#f6f4ec;padding:12px 28px;border-radius:6px;
             text-decoration:none;display:inline-block;">Прийняти запрошення</a>
        </div>
        <p style="font-size:12px;color:#8a8f72;word-break:break-all;">${params.acceptUrl}</p>
      </div>
    </div>
  </div>`;
  return { subject, html };
}
