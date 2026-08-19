const form = document.getElementById("course-interest-form");
const success = document.getElementById("interest-success");
const submitButton = document.getElementById("submit-interest");
const formError = document.getElementById("form-error");
const notificationWarning = document.getElementById("interest-notification-warning");
const configuredBase = document.querySelector('meta[name="api-base-url"]')?.content?.replace(/\/$/, "") || "/api";
const apiBase = ["127.0.0.1", "localhost"].includes(location.hostname) ? "/api" : configuredBase;

const fields = {
  name: { input: document.getElementById("interest-name"), error: document.getElementById("name-error") },
  email: { input: document.getElementById("interest-email"), error: document.getElementById("email-error") },
  whatsapp: { input: document.getElementById("interest-whatsapp"), error: document.getElementById("whatsapp-error") },
};

function whatsappDigits(value) { const digits = value.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, ""); return digits.slice(0, 11); }
function formatWhatsapp(value) {
  const digits = whatsappDigits(value);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function setError(key, message) { fields[key].error.textContent = message; fields[key].input.setAttribute("aria-invalid", message ? "true" : "false"); }
function validate() {
  let valid = true;
  const name = fields.name.input.value.trim(), email = fields.email.input.value.trim(), whatsapp = whatsappDigits(fields.whatsapp.input.value);
  setError("name", name.length >= 2 ? "" : "Informe seu nome.");
  setError("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Informe um e-mail válido.");
  setError("whatsapp", /^\d{10,11}$/.test(whatsapp) ? "" : "Informe um WhatsApp com DDD.");
  for (const field of Object.values(fields)) if (field.error.textContent) valid = false;
  if (!valid) Object.values(fields).find((field) => field.error.textContent)?.input.focus();
  return valid;
}

fields.whatsapp.input.addEventListener("input", (event) => { event.currentTarget.value = formatWhatsapp(event.currentTarget.value); setError("whatsapp", ""); });
for (const [key, field] of Object.entries(fields)) field.input.addEventListener("input", () => setError(key, ""));

form.addEventListener("submit", async (event) => {
  event.preventDefault(); formError.textContent = "";
  if (!validate()) return;
  submitButton.disabled = true; submitButton.textContent = "Enviando...";
  const payload = { name: fields.name.input.value, email: fields.email.input.value, whatsapp: fields.whatsapp.input.value, company: document.getElementById("interest-company").value, website: document.getElementById("interest-website").value };
  try {
    const response = await fetch(`${apiBase}/submit-course-interest`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success !== true) throw Object.assign(new Error(result.code || "REQUEST_FAILED"), { status: response.status });
    if (notificationWarning) notificationWarning.hidden = result.notificationSent !== false;
    form.hidden = true; success.hidden = false; success.querySelector("h2").focus?.(); success.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    console.error("Course interest submission failed", { code: error.message, status: error.status });
    const messages = {
      RATE_LIMITED: "Recebemos várias tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.",
      RATE_LIMIT_UNAVAILABLE: "Não conseguimos verificar o envio agora. Aguarde alguns instantes e tente novamente.",
      INVALID_PAYLOAD: "Alguns dados não puderam ser validados. Confira os campos e tente novamente.",
      STORAGE_FAILED: "Não conseguimos salvar seus dados agora. Nenhuma solicitação foi registrada. Aguarde alguns instantes e tente novamente.",
      SERVICE_UNAVAILABLE: "Nosso serviço de inscrição está temporariamente indisponível. Seus dados continuam preenchidos; tente novamente em alguns instantes.",
    };
    formError.textContent = messages[error.message] || "Não conseguimos confirmar se seus dados foram registrados. Aguarde alguns instantes e tente novamente.";
  } finally { submitButton.disabled = false; submitButton.textContent = "Solicitar minha inscrição"; }
});
