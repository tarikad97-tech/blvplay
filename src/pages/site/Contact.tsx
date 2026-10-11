import { useState, type FormEvent, type ReactNode } from "react";
import { useMeta } from "../../lib/useMeta";

/**
 * Configure at build time:
 *   VITE_CONTACT_ENDPOINT  a form backend URL (e.g. a Formspree endpoint) that accepts a JSON POST
 *   VITE_CONTACT_EMAIL     the project's real contact address
 * With neither set the form says plainly that it cannot send yet. Nothing is faked.
 */
const ENDPOINT = (import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined) || "";
const EMAIL = (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) || "";

const SUBJECTS = ["اقتراح", "مشكلة تقنية", "الخصوصية وطلبات الحقوق", "الإبلاغ عن محتوى", "أخرى"];

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "ok" } | { kind: "error"; text: string };

export function Contact() {
  useMeta("اتصل بنا", "تواصل مع فريق BLV Play لإرسال اقتراح أو الإبلاغ عن مشكلة أو تقديم طلب يخص الخصوصية.");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const canSend = Boolean(ENDPOINT);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      subject: String(form.get("subject") ?? ""),
      message: String(form.get("message") ?? "").trim()
    };
    const next: Record<string, string> = {};
    if (data.name.length < 2) next.name = "اكتب اسمك.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) next.email = "اكتب بريداً إلكترونياً صحيحاً.";
    if (!data.subject) next.subject = "اختر موضوع الرسالة.";
    if (data.message.length < 10) next.message = "الرسالة قصيرة جداً (10 أحرف على الأقل).";
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus({ kind: "sending" });
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus({ kind: "ok" });
      (event.target as HTMLFormElement).reset();
    } catch {
      setStatus({ kind: "error", text: "تعذّر إرسال الرسالة. تحقق من اتصالك وحاول مرة أخرى." });
    }
  }

  return (
    <div className="container page prose">
      <h1>اتصل بنا</h1>
      <p>اقتراحات، مشاكل تقنية، أو طلبات تخص بياناتك وحقوقك: اختر الموضوع المناسب واكتب رسالتك.</p>
      {EMAIL && <p>البريد الإلكتروني: <a className="link" href={`mailto:${EMAIL}`} dir="ltr">{EMAIL}</a></p>}

      {!canSend && (
        <p className="alert" role="status">
          نموذج التواصل غير مفعّل بعد على هذه النسخة، لذلك لا يمكن إرسال رسائل منه.
          {EMAIL ? " يمكنك مراسلتنا على البريد أعلاه." : ""}
        </p>
      )}

      <form className="form" onSubmit={(e) => void submit(e)} noValidate>
        <Field label="الاسم" error={errors.name}><input name="name" autoComplete="name" disabled={!canSend} /></Field>
        <Field label="البريد الإلكتروني" error={errors.email}><input name="email" type="email" autoComplete="email" dir="ltr" disabled={!canSend} /></Field>
        <Field label="الموضوع" error={errors.subject}>
          <select name="subject" defaultValue="" disabled={!canSend}>
            <option value="" disabled>اختر…</option>
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="الرسالة" error={errors.message}><textarea name="message" rows={6} disabled={!canSend} /></Field>
        <button type="submit" className="btn btn--primary" disabled={!canSend || status.kind === "sending"}>
          {status.kind === "sending" ? "جاري الإرسال…" : "إرسال"}
        </button>
        <p role="status" className={status.kind === "error" ? "form__status is-error" : "form__status"}>
          {status.kind === "ok" && "تم إرسال رسالتك. شكراً لك."}
          {status.kind === "error" && status.text}
        </p>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <span className="field__error" role="alert">{error}</span>}
    </label>
  );
}
