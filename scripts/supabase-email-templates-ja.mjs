/**
 * Japanese Supabase Auth email templates for Infomii.
 * Applied via scripts/apply-supabase-email-templates-ja.mjs (Management API)
 * or pasted manually in Dashboard → Authentication → Email Templates.
 */

const FOOTER =
  "<p style=\"margin-top:24px;font-size:12px;color:#64748b;line-height:1.6;\">" +
  "このメールは Infomii（infomii.com）への登録・ログイン操作により送信されています。<br>" +
  "心当たりがない場合は、このメールを無視してください。" +
  "</p>";

function button(label, hrefVar) {
  return (
    `<p style="margin:24px 0;">` +
    `<a href="${hrefVar}" style="display:inline-block;padding:12px 20px;background:#0f766e;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">${label}</a>` +
    `</p>`
  );
}

function linkFallback(hrefVar) {
  return (
    `<p style="font-size:13px;color:#475569;line-height:1.6;word-break:break-all;">` +
    `ボタンが開けない場合は、次の URL をブラウザに貼り付けてください：<br>` +
    `<a href="${hrefVar}" style="color:#0f766e;">${hrefVar}</a>` +
    `</p>`
  );
}

/** Keys match Supabase Management API auth config (mailer_*). */
export const SUPABASE_EMAIL_TEMPLATES_JA = {
  mailer_subjects_confirmation: "【Infomii】メールアドレスの確認",
  mailer_templates_confirmation_content:
    `<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;line-height:1.7;max-width:560px;">` +
    `<h2 style="margin:0 0 12px;font-size:20px;">メールアドレスの確認</h2>` +
    `<p>Infomii へのご登録ありがとうございます。</p>` +
    `<p>下のボタンを押して、メールアドレスの確認を完了してください。確認後、メールアドレスとパスワードでログインできます。</p>` +
    button("メールアドレスを確認する", "{{ .ConfirmationURL }}") +
    linkFallback("{{ .ConfirmationURL }}") +
    FOOTER +
    `</div>`,

  mailer_subjects_recovery: "【Infomii】パスワード再設定",
  mailer_templates_recovery_content:
    `<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;line-height:1.7;max-width:560px;">` +
    `<h2 style="margin:0 0 12px;font-size:20px;">パスワード再設定</h2>` +
    `<p>Infomii アカウントのパスワード再設定のリクエストを受け付けました。</p>` +
    `<p>下のボタンから新しいパスワードを設定してください（リンクの有効期限は限られています）。</p>` +
    button("パスワードを再設定する", "{{ .ConfirmationURL }}") +
    linkFallback("{{ .ConfirmationURL }}") +
    `<p style="font-size:13px;color:#475569;">ご本人による操作でない場合は、このメールを無視してください。</p>` +
    FOOTER +
    `</div>`,

  mailer_subjects_magic_link: "【Infomii】ログインリンク",
  mailer_templates_magic_link_content:
    `<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;line-height:1.7;max-width:560px;">` +
    `<h2 style="margin:0 0 12px;font-size:20px;">ログインリンク</h2>` +
    `<p>Infomii へのログイン用リンクです。下のボタンを押してログインしてください。</p>` +
    button("ログインする", "{{ .ConfirmationURL }}") +
    linkFallback("{{ .ConfirmationURL }}") +
    FOOTER +
    `</div>`,

  mailer_subjects_invite: "【Infomii】アカウントへの招待",
  mailer_templates_invite_content:
    `<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;line-height:1.7;max-width:560px;">` +
    `<h2 style="margin:0 0 12px;font-size:20px;">Infomii への招待</h2>` +
    `<p>Infomii のアカウント作成に招待されました。</p>` +
    `<p>下のボタンから登録を完了してください。</p>` +
    button("招待を受け取る", "{{ .ConfirmationURL }}") +
    linkFallback("{{ .ConfirmationURL }}") +
    FOOTER +
    `</div>`,

  mailer_subjects_email_change: "【Infomii】新しいメールアドレスの確認",
  mailer_templates_email_change_content:
    `<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;line-height:1.7;max-width:560px;">` +
    `<h2 style="margin:0 0 12px;font-size:20px;">メールアドレス変更の確認</h2>` +
    `<p>メールアドレスを <strong>{{ .NewEmail }}</strong> に変更するリクエストを受け付けました。</p>` +
    `<p>下のボタンを押して変更を確定してください。</p>` +
    button("新しいメールアドレスを確認する", "{{ .ConfirmationURL }}") +
    linkFallback("{{ .ConfirmationURL }}") +
    `<p style="font-size:13px;color:#475569;">ご本人による操作でない場合は、このメールを無視してください。</p>` +
    FOOTER +
    `</div>`,

  mailer_subjects_reauthentication: "【Infomii】確認コード: {{ .Token }}",
  mailer_templates_reauthentication_content:
    `<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;line-height:1.7;max-width:560px;">` +
    `<h2 style="margin:0 0 12px;font-size:20px;">本人確認コード</h2>` +
    `<p>Infomii で本人確認が必要です。次の 6 桁コードを入力してください。</p>` +
    `<p style="font-size:28px;font-weight:700;letter-spacing:0.2em;margin:16px 0;">{{ .Token }}</p>` +
    `<p style="font-size:13px;color:#475569;">コードの有効期限は限られています。</p>` +
    FOOTER +
    `</div>`,
};
