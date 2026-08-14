const ANSWERS_KEY = "togafDiagnosticAnswers";
const TOKEN_KEY = "togafDiagnosticDeliveryToken";

export function loadAnswers() {
  try { return JSON.parse(sessionStorage.getItem(ANSWERS_KEY)) || {}; } catch { return {}; }
}
export function saveAnswers(answers) { sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answers)); }
export function clearAnswers() { sessionStorage.removeItem(ANSWERS_KEY); }
export function saveDeliveryToken(token) { sessionStorage.setItem(TOKEN_KEY, token); }
export function loadDeliveryToken() { return sessionStorage.getItem(TOKEN_KEY); }
