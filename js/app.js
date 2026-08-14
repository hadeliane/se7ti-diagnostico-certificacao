import { QUESTIONS } from "./questions.js";
import { loadAnswers, saveAnswers, clearAnswers, saveDeliveryToken, loadDeliveryToken } from "./storage.js";
import { submitDiagnostic, changeEmail, sendAgainDiagnostic } from "./api.js";

const $ = (id) => document.getElementById(id);
const screens = [...document.querySelectorAll(".screen")];
let answers = loadAnswers();
let index = 0;
let lastEmail = "";
let submitting = false;

function show(id) { screens.forEach((screen) => { screen.hidden = screen.id !== id; }); window.scrollTo({ top: 0, behavior: "smooth" }); }
function renderQuestion() {
  const question = QUESTIONS[index];
  $("counter").textContent = `Pergunta ${index + 1} de 7`;
  $("progress").value = index + 1;
  $("question-text").textContent = question.text;
  $("answers").replaceChildren(...Object.entries(question.answers).map(([value, text]) => {
    const label = document.createElement("label"); label.className = "answer";
    const input = document.createElement("input"); input.type = "radio"; input.name = "answer"; input.value = value; input.checked = answers[question.id] === value;
    const span = document.createElement("span"); span.textContent = text;
    label.append(input, span); return label;
  }));
  $("back").hidden = index === 0; $("question-error").textContent = ""; show("question");
}
$("start").addEventListener("click", renderQuestion);
$("question-form").addEventListener("submit", (event) => {
  event.preventDefault(); const selected = new FormData(event.currentTarget).get("answer");
  if (!selected) { $("question-error").textContent = "Selecione uma alternativa para continuar."; return; }
  answers[QUESTIONS[index].id] = selected; saveAnswers(answers);
  if (index < 6) { index += 1; renderQuestion(); } else show("email");
});
$("back").addEventListener("click", () => { index -= 1; renderQuestion(); });
$("email-back").addEventListener("click", () => { index = 6; renderQuestion(); });
$("email-form").addEventListener("submit", async (event) => {
  event.preventDefault(); if (submitting || !event.currentTarget.reportValidity()) return;
  lastEmail = $("email-input").value.trim(); submitting = true; show("processing");
  try {
    const result = await submitDiagnostic(lastEmail, answers); saveDeliveryToken(result.deliveryToken); clearAnswers();
    const link = $("sent-email"); link.textContent = lastEmail; link.href = `mailto:${lastEmail}`; show("success");
  } catch { show("failure"); } finally { submitting = false; }
});
$("retry").addEventListener("click", () => show("email"));
$("change-email").addEventListener("click", () => { $("change-form").hidden = false; $("new-email").focus(); });
$("change-form").addEventListener("submit", async (event) => {
  event.preventDefault(); const newEmail = $("new-email").value.trim(); const button = event.currentTarget.querySelector("button"); button.disabled = true;
  try { await changeEmail(loadDeliveryToken(), newEmail); lastEmail = newEmail; $("sent-email").textContent = newEmail; $("sent-email").href = `mailto:${newEmail}`; $("action-message").textContent = "Endereço corrigido e diagnóstico reenviado."; event.currentTarget.hidden = true; }
  catch (error) { $("action-message").textContent = error.message === "RATE_LIMITED" ? "Aguarde um pouco antes de tentar novamente." : "Não foi possível corrigir o endereço. Tente novamente."; }
  finally { button.disabled = false; }
});
$("send-again").addEventListener("click", async (event) => {
  event.currentTarget.disabled = true;
  try { await sendAgainDiagnostic(loadDeliveryToken()); $("action-message").textContent = "Diagnóstico reenviado."; }
  catch (error) { $("action-message").textContent = error.message === "RATE_LIMITED" ? "Aguarde um pouco antes de tentar novamente." : "Não foi possível reenviar. Tente novamente."; }
  finally { event.currentTarget.disabled = false; }
});
