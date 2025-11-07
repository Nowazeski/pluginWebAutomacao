document.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  // elementos
  const title = document.getElementById('title');
  const nomeInput = document.getElementById('nome');
  const sobrenomeInput = document.getElementById('sobrenome');
  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');
  const actionBtn = document.getElementById('actionBtn');
  const toggleCreate = document.getElementById('toggleCreate');
  const statusMsg = document.getElementById('statusMsg');
  const mainArea = document.getElementById('main-area');

  const toggleMain = document.getElementById('toggleMain');
  const visibilidadeMain = document.getElementById('visibilidadeMain');

  let isCreateMode = false;

  // alterna entre Login e Criar Conta
  function setCreateMode(on) {
    isCreateMode = !!on;
    if (isCreateMode) {
      title.textContent = 'Criar Conta';
      nomeInput.style.display = 'block';
      sobrenomeInput.style.display = 'block';
      actionBtn.textContent = 'Criar conta';
      toggleCreate.textContent = 'Já tenho conta';
      statusMsg.textContent = '';
      nomeInput.value = sobrenomeInput.value = '';
      senhaInput.value = emailInput.value = '';
    } else {
      title.textContent = 'Entrar';
      nomeInput.style.display = 'none';
      sobrenomeInput.style.display = 'none';
      actionBtn.textContent = 'Entrar';
      toggleCreate.textContent = 'Criar nova conta';
      statusMsg.textContent = '';
      senhaInput.value = emailInput.value = '';
    }
  }

  toggleCreate.addEventListener('click', (e) => {
    e.preventDefault();
    setCreateMode(!isCreateMode);
  });

  // ação do botão (entrar ou criar)
  actionBtn.addEventListener('click', async () => {
    const em = emailInput.value.trim();
    const se = senhaInput.value.trim();

    if (isCreateMode) {
      const nome = nomeInput.value.trim();
      const sobrenome = sobrenomeInput.value.trim();
      if (!nome || !sobrenome || !em || !se)
        return alert('Preencha todos os campos!');

      try {
        const cred = await auth.createUserWithEmailAndPassword(em, se);
        await db.collection('usuarios').doc(cred.user.uid).set({
          nome,
          sobrenome,
          email: em,
          liberado: false,
          criadoEm: new Date().toISOString(),
        });

        await chrome.storage.local.set({ pluginBloqueado: true });
        statusMsg.style.color = '#117a37';
        statusMsg.textContent = 'Conta criada! Aguarde liberação.';
        setCreateMode(false);
      } catch (err) {
        statusMsg.style.color = '#c0392b';
        statusMsg.textContent = 'Erro: ' + (err.message || err);
      }
      return;
    }

    // login
    if (!em || !se) return alert('Preencha email e senha!');
    try {
      const cred = await auth.signInWithEmailAndPassword(em, se);
      const doc = await db.collection('usuarios').doc(cred.user.uid).get();
      const data = doc.exists ? doc.data() : null;

      if (!data || !data.liberado) {
        statusMsg.style.color = '#c0392b';
        statusMsg.textContent = 'Aguardando liberação do administrador...';
        mainArea.style.display = 'none';
        await chrome.storage.local.set({ pluginBloqueado: true });
        return;
      }

      statusMsg.style.color = '#117a37';
      statusMsg.textContent = 'Login autorizado!';
      mainArea.style.display = 'block';
      await chrome.storage.local.set({ pluginBloqueado: false });
    } catch (err) {
      statusMsg.style.color = '#c0392b';
      statusMsg.textContent = 'Erro ao logar: ' + (err.message || err);
    }
  });

  // botões principais do plugin
  toggleMain?.addEventListener('click', async () => {
    const res = await chrome.storage.local.get('autoLigado');
    const novo = !res.autoLigado;
    await chrome.storage.local.set({ autoLigado: novo });
    toggleMain.textContent = novo ? 'Parar Auto' : 'Ativar Auto';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (ligado) => {
          const btn = document.getElementById('autoTawkBtn');
          if (btn) {
            btn.textContent = ligado ? '⏹️' : '▶️';
            btn.style.background = ligado ? '#d9534f' : '#0078d7';
          }
          window.autoLigado = ligado;
        },
        args: [novo],
      });
    }
  });

  visibilidadeMain?.addEventListener('click', async () => {
    const res = await chrome.storage.local.get('botaoVisivel');
    const novo = res.botaoVisivel === false ? true : false;
    await chrome.storage.local.set({ botaoVisivel: novo });
    visibilidadeMain.textContent = novo ? 'Ocultar Botão' : 'Mostrar Botão';
  });

  // estado inicial
  setCreateMode(false);

  // se já houver usuário logado
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      document.getElementById('card').style.display = 'flex';
      mainArea.style.display = 'none';
      await chrome.storage.local.set({ pluginBloqueado: true });
      return;
    }

    try {
      const doc = await db.collection('usuarios').doc(user.uid).get();
      const data = doc.exists ? doc.data() : null;
      if (data && data.liberado) {
        statusMsg.style.color = '#117a37';
        statusMsg.textContent = 'Logado e liberado.';
        mainArea.style.display = 'block';
        await chrome.storage.local.set({ pluginBloqueado: false });
      } else {
        statusMsg.style.color = '#c0392b';
        statusMsg.textContent = 'Logado — aguardando liberação.';
        mainArea.style.display = 'none';
        await chrome.storage.local.set({ pluginBloqueado: true });
      }
    } catch (e) {
      console.error(e);
      statusMsg.style.color = '#c0392b';
      statusMsg.textContent = 'Erro verificando autorização.';
      await chrome.storage.local.set({ pluginBloqueado: true });
    }
  });
});
