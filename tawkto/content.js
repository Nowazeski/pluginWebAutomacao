// --- CONFIGURACOES ---
const seletorChatNovo = '.tawk-chat-item.unseen.need-attn';
const seletorBotaoJoin = '.tawk-button.tawk-button-solid-primary.tawk-button-solid.tawk-button-medium';
const seletorCampoTexto = '.tawk-border-remove.tawk-message-input.tawk-input-field.tawk-message-autoresize';
const seletorBotaoEnviar = '.tawk-button.tawk-button-solid-primary.tawk-button-solid.tawk-button-small.tawk-message-send';
const mensagemAutomatica = 'Hola! 👋Mi nombre es Linette, soy parte del equipo de soporte comercial de Adrian Rivera 🦈¿Como puedo ayudarte a formalizar tu inscripcion?🔥';
const delay = 1000;

// --- ESTADO ---
window.autoLigado = false;
let botaoVisivel = true;
const jaRespondidos = new WeakSet();

// --- FUNCOES ---
function esperar(ms) { return new Promise(r => setTimeout(r, ms)); }

async function responderChat(chatEl) {
  if (!window.autoLigado || !chatEl || jaRespondidos.has(chatEl)) return;
  jaRespondidos.add(chatEl);

  chatEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  chatEl.click();
  await esperar(delay);

  const join = document.querySelector(seletorBotaoJoin);
  if (join) { join.click(); await esperar(delay * 2); }

  const campo = document.querySelector(seletorCampoTexto);
  if (campo) {
    campo.focus();
    // Preenche o campo (contenteditable ou textarea)
    if (campo.tagName.toLowerCase() === 'textarea') {
      campo.value = mensagemAutomatica;
      campo.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      campo.textContent = mensagemAutomatica;
      campo.dispatchEvent(new Event('input', { bubbles: true }));
      campo.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
      campo.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    }
    await esperar(delay);
    const enviar = document.querySelector(seletorBotaoEnviar);
    if (enviar) enviar.click();
  }
}

// Monitor
function verificarChats() {
  if (!window.autoLigado) return;
  document.querySelectorAll(seletorChatNovo).forEach(responderChat);
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
    // Atualiza estado global via storage -> popup escuta storage.onChanged
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

// --- SINCRONIZACAO: reage a mudancas feitas pelo popup ---
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

// --- INICIALIZAR ---
(async () => {
  const data = await chrome.storage.local.get(['autoLigado', 'botaoVisivel']);
  window.autoLigado = data.autoLigado ?? false;
  botaoVisivel = data.botaoVisivel !== false; // default true

  const btn = criarBotaoFlutuante(botaoVisivel, window.autoLigado);
  atualizarBotaoVisual(btn, window.autoLigado);
  btn.style.display = botaoVisivel ? 'block' : 'none';

  const observer = new MutationObserver(verificarChats);
  observer.observe(document.body, { childList: true, subtree: true });
})();
