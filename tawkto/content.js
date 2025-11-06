// content.js - versão com pós-envio configurado
// --- CONFIGURACOES ---
const seletorChatNovo = '.tawk-chat-item.unseen.need-attn';
const seletorBotaoJoin = '.tawk-button.tawk-button-solid-primary.tawk-button-solid.tawk-button-medium';
const seletorCampoTexto = '.tawk-border-remove.tawk-message-input.tawk-input-field.tawk-message-autoresize';
const seletorBotaoEnviar = '.tawk-button.tawk-button-solid-primary.tawk-button-solid.tawk-button-small.tawk-message-send';

// Botão que deve ser clicado após enviar a mensagem:
const seletorPosEnvio = '.tawk-icon.tawk-icon-monitoring.tawk-icon-large';

const mensagemAutomatica = 'Hola! 👋Mi nombre es Linette, soy parte del equipo de soporte comercial de Adrian Rivera 🦈¿Como puedo ayudarte a formalizar tu inscripcion?🔥';
const delay = 1000; // tempo padrão entre ações (1 segundo)
const delayPosEnvio = 2000; // tempo para esperar após clicar o botão pós-envio

// --- ESTADO ---
window.autoLigado = false;
let botaoVisivel = true;
const jaRespondidos = new WeakSet();

// --- FUNCOES AUXILIARES ---
function esperar(ms) { return new Promise(r => setTimeout(r, ms)); }

// --- LOGICA DE RESPOSTA ---
async function responderChat(chatEl) {
  if (!window.autoLigado || !chatEl || jaRespondidos.has(chatEl)) return;
  jaRespondidos.add(chatEl);

  try {
    // abrir o chat
    chatEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    chatEl.click();
    await esperar(delay);

    // clicar em Join (se existir)
    const join = document.querySelector(seletorBotaoJoin);
    if (join) {
      join.click();
      await esperar(delay * 2); // mais tempo pra abrir o chat
    }

    // preencher mensagem
    const campo = document.querySelector(seletorCampoTexto);
    if (campo) {
      campo.focus();

      if (campo.tagName.toLowerCase() === 'textarea') {
        campo.value = mensagemAutomatica;
        campo.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        campo.textContent = mensagemAutomatica;
        campo.dispatchEvent(new Event('input', { bubbles: true }));
      }

      await esperar(delay);

      // clicar em enviar
      const enviar = document.querySelector(seletorBotaoEnviar);
      if (enviar) {
        enviar.click();
        await esperar(300);
      }

      // clicar no botão pós-envio
      const botaoPosEnvio = document.querySelector(seletorPosEnvio);
      if (botaoPosEnvio) {
        botaoPosEnvio.scrollIntoView({ behavior: 'smooth', block: 'center' });
        botaoPosEnvio.click();
        console.log('AutoTawk: clicou no botão pós-envio');
      } else {
        console.warn('AutoTawk: botão pós-envio não encontrado');
      }

      // aguarda 2 segundos antes de pegar o próximo chat
      await esperar(delayPosEnvio);
    }
  } catch (e) {
    console.warn('AutoTawk: erro ao responder chat', e);
  }
}

// --- MONITORAMENTO ---
function verificarChats() {
  if (!window.autoLigado) return;
  const chats = document.querySelectorAll(seletorChatNovo);
  chats.forEach(responderChat);
}
setInterval(verificarChats, 2000);

// --- BOTAO FLUTUANTE ---
function criarBotaoFlutuante(visivelInicial = true, ligadoInicial = false) {
  let btn = document.getElementById('autoTawkBtn');
  if (btn) return btn;

  btn = document.createElement('button');
  btn.id = 'autoTawkBtn';
  btn.textContent = ligadoInicial ? '⏹️' : '▶️';
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '999999',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    background: ligadoInicial ? '#d9534f' : '#0078d7',
    color: 'white',
    fontSize: '28px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    transition: 'background 0.3s, opacity 0.3s, transform 0.2s',
    opacity: visivelInicial ? '1' : '0',
    display: visivelInicial ? 'block' : 'none',
  });

  btn.addEventListener('mouseenter', () => (btn.style.transform = 'scale(1.1)'));
  btn.addEventListener('mouseleave', () => (btn.style.transform = 'scale(1)'));

  btn.addEventListener('click', () => {
    window.autoLigado = !window.autoLigado;
    chrome.storage.local.set({ autoLigado: window.autoLigado });
    atualizarBotaoVisual(btn, window.autoLigado);
  });

  document.body.appendChild(btn);
  return btn;
}

function atualizarBotaoVisual(btn, ligado) {
  if (!btn) return;
  btn.textContent = ligado ? '⏹️' : '▶️';
  btn.style.background = ligado ? '#d9534f' : '#0078d7';
}

// --- SINCRONIZACAO ---
chrome.storage.onChanged.addListener((changes) => {
  const btn = document.getElementById('autoTawkBtn');

  if (changes.autoLigado) {
    window.autoLigado = changes.autoLigado.newValue;
    atualizarBotaoVisual(btn, window.autoLigado);
  }

  if (changes.botaoVisivel) {
    botaoVisivel = changes.botaoVisivel.newValue;
    if (btn) {
      if (botaoVisivel) {
        btn.style.display = 'block';
        btn.style.opacity = '0';
        setTimeout(() => (btn.style.opacity = '1'), 50);
      } else {
        btn.style.opacity = '0';
        setTimeout(() => (btn.style.display = 'none'), 300);
      }
    }
  }
});

// --- INICIALIZACAO ---
(async () => {
  const data = await chrome.storage.local.get(['autoLigado', 'botaoVisivel']);
  window.autoLigado = data.autoLigado ?? false;
  botaoVisivel = data.botaoVisivel !== false; // default true

  const btn = criarBotaoFlutuante(botaoVisivel, window.autoLigado);
  atualizarBotaoVisual(btn, window.autoLigado);
  btn.style.display = botaoVisivel ? 'block' : 'none';

  const observer = new MutationObserver(verificarChats);
  observer.observe(document.body, { childList: true, subtree: true });

  console.log('AutoTawk carregado - pós-envio configurado:', seletorPosEnvio);
})();
