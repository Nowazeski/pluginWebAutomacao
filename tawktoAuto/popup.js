import { auth, db } from "./firebase/firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";

const title = document.getElementById("title");
const nomeGroup = document.getElementById("nomeGroup");
const sobrenomeGroup = document.getElementById("sobrenomeGroup");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const actionBtn = document.getElementById("actionBtn");
const voltarBtn = document.getElementById("voltarBtn");
const toggleCreate = document.getElementById("toggleCreate");
const recuperarSenha = document.getElementById("recuperarSenha");
const statusMsg = document.getElementById("statusMsg");

let modo = "login";

function atualizarFormulario() {
  if (modo === "login") {
    title.textContent = "Entrar";
    nomeGroup.style.display = "none";
    sobrenomeGroup.style.display = "none";
    actionBtn.textContent = "Entrar";
    voltarBtn.style.display = "none";
    toggleCreate.textContent = "Criar nova conta";
    recuperarSenha.style.display = "block";
  } else if (modo === "criar") {
    title.textContent = "Criar Conta";
    nomeGroup.style.display = "flex";
    sobrenomeGroup.style.display = "flex";
    actionBtn.textContent = "Cadastrar";
    voltarBtn.style.display = "block";
    toggleCreate.textContent = "";
    recuperarSenha.style.display = "none";
  } else if (modo === "recuperar") {
    title.textContent = "Recuperar Senha";
    nomeGroup.style.display = "none";
    sobrenomeGroup.style.display = "none";
    actionBtn.textContent = "Enviar Link";
    voltarBtn.style.display = "block";
    toggleCreate.style.display = "none";
    recuperarSenha.style.display = "none";
  }
}

toggleCreate.addEventListener("click", () => {
  modo = "criar";
  atualizarFormulario();
});

recuperarSenha.addEventListener("click", () => {
  modo = "recuperar";
  atualizarFormulario();
});

voltarBtn.addEventListener("click", () => {
  modo = "login";
  toggleCreate.style.display = "block";
  atualizarFormulario();
});

actionBtn.addEventListener("click", async () => {
  statusMsg.textContent = "";
  const emailVal = email.value.trim();
  const senhaVal = senha.value.trim();

  try {
    if (modo === "login") {
      await signInWithEmailAndPassword(auth, emailVal, senhaVal);
      statusMsg.textContent = "✅ Login realizado com sucesso!";
    } else if (modo === "criar") {
      await createUserWithEmailAndPassword(auth, emailVal, senhaVal);
      statusMsg.textContent = "✅ Conta criada com sucesso!";
    } else if (modo === "recuperar") {
      await sendPasswordResetEmail(auth, emailVal);
      statusMsg.textContent = "📩 Email de recuperação enviado!";
    }
  } catch (err) {
    statusMsg.textContent = "❌ Erro: " + err.message;
  }
});

atualizarFormulario();
