const baseUrl = document.querySelector('meta[name="api-base-url"]')?.content?.replace(/\/$/, "") || "/api";

async function request(path, payload) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success !== true) throw new Error(body.code || "REQUEST_FAILED");
  return body;
}

export const submitDiagnostic = (email, answers) => request("/submit-diagnostic", { email, answers, questionnaireVersion: "1.0" });
export const changeEmail = (deliveryToken, newEmail) => request("/diagnostic-action", { action: "change_email", deliveryToken, newEmail });
export const sendAgainDiagnostic = (deliveryToken) => request("/diagnostic-action", { action: "resend", deliveryToken });
