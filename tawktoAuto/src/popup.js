import { auth, db } from './firebase-init.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
  const title = document.getElementById('title');
  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');
  const nomeInput = document.getElementById('nome');
  const sobrenomeInput = document.getElementById('sobrenome');
  const actionBtn = document.getElementById('actionBtn');
  const toggleCreate = document.getElementById('toggleCreate');
  const voltarBtn = document.getElementById('voltarBtn');
  const statusMsg = document.getElementById('statusMsg');
  const mainArea = document.getElementById('main-area');

  let isCreateMode = false;

  function setCreateMode(on) {
    isCreateMode = on;
    if (on) {
      title.textContent = "Criar Conta";
      nomeInput.style.display = sobrenomeInput.style.display = "block";
      actionBtn.textContent = "Criar Conta";
      toggleCreate.style.display = "none";
      voltarBtn.style.display = "block";
      emailInput.value = senhaInput.value = nomeInput.value = sobrenomeInput.value = "";
      statusMsg.textContent = "";
    } else {
      title.textContent = "Entrar";
      nomeInput.style.display = sobrenomeInput.style.display = "none";
      actionBtn.textContent = "Entrar";
      toggleCreate.style.display = "block";
      voltarBtn.style.display = "none";
      emailInput.value = senhaInput.value = "";
      statusMsg.textContent = "";
    }
  }

  toggleCreate.addEventListener('click', (e) => { e.preventDefault(); setCreateMode(true); });
  voltarBtn.addEventListener('click', (e) => { e.preventDefault(); setCreateMode(false); });

  actionBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const senha = senhaInput.value.trim();
    if (!email || !senha) return alert("Preencha email e senha!");

    if (isCreateMode) {
      const nome = nomeInput.value.trim();
      const sobrenome = sobrenomeInput.value.trim();
      if (!nome || !sobrenome) return alert("Preencha todos os campos!");
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, senha);
        await setDoc(doc(db, 'usuarios', cred.user.uid), {
          nome, sobrenome, email, liberado: false, criadoEm: new Date().toISOString()
        });
        statusMsg.style.color = "#117a37";
        statusMsg.textContent = "Conta criada! Aguarde liberação.";
        setCreateMode(false);
      } catch (err) {
        statusMsg.style.color = "#c0392b";
        statusMsg.textContent = "Erro: " + (err.message || err);
      }
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, senha);
      const docSnap = await getDoc(doc(db, 'usuarios', cred.user.uid));
      const data = docSnap.exists() ? docSnap.data() : null;
      if (!data || !data.liberado) {
        statusMsg.style.color = "#c0392b";
        statusMsg.textContent = "Aguardando liberação...";
        mainArea.style.display = "none";
        chrome.storage.local.set({ pluginBloqueado: true });
        return;
      }
      statusMsg.style.color = "#117a37";
      statusMsg.textContent = "Login autorizado!";
      mainArea.style.display = "block";
      chrome.storage.local.set({ pluginBloqueado: false });
    } catch (err) {
      statusMsg.style.color = "#c0392b";
      statusMsg.textContent = "Erro ao logar: " + (err.message || err);
    }
  });

  setCreateMode(false);

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      mainArea.style.display = 'none';
      chrome.storage.local.set({ pluginBloqueado: true });
      return;
    }
    const docSnap = await getDoc(doc(db, 'usuarios', user.uid));
    const data = docSnap.exists() ? docSnap.data() : null;
    if (data && data.liberado) {
      mainArea.style.display = 'block';
      chrome.storage.local.set({ pluginBloqueado: false });
    } else {
      mainArea.style.display = 'none';
      chrome.storage.local.set({ pluginBloqueado: true });
      statusMsg.style.color = "#c0392b";
      statusMsg.textContent = "Logado — aguardando liberação.";
    }
  });
});
