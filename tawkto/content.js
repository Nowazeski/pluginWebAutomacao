// --- CONFIGURACOES ---
const seletorChatNovo = '.tawk-chat-item.unseen.need-attn';
const seletorBotaoJoin = '.tawk-button.tawk-button-solid-primary.tawk-button-solid.tawk-button-medium';
const seletorCampoTexto = '.tawk-message-input.tawk-input-field';
const seletorBotaoEnviar = '.tawk-button.tawk-button-solid-primary.tawk-button-solid.tawk-button-small.tawk-message-send';

const mensagemAutomatica = 'Hola! 👋Mi nombre es Linette, soy parte del equipo de soporte comercial de Adrian Rivera 🦈¿Como puedo ayudarte a formalizar tu inscripción?🔥';
const delay = 3000; // milissegundos entre as acoes

// --- ESTADO ---
window.autoLigado = false;
const jaRespondidos = new WeakSet();

// --- FUNCOES AUXILIARES ---
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- FUNCAO PRINCIPAL ---
async function responderChat(chatEl) {
  if (!window.autoLigado || !chatEl || jaRespondidos.has(chatEl)) return;
  jaRespondidos.add(chatEl);

  console.log('🟢 Novo chat detectado!');
  chatEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  chatEl.click();
  await esperar(delay);

  const botaoJoin = document.querySelector(seletorBotaoJoin);
  if (botaoJoin) {
    botaoJoin.click();
    console.log('👉 Ingressando no chat...');
    await esperar(delay);
  }

  const campoMsg = document.querySelector(seletorCampoTexto);
  if (campoMsg) {
    campoMsg.focus();
    campoMsg.value = mensagemAutomatica;
    campoMsg.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('💬 Mensagem escrita.');
    await esperar(delay);
  }

  const botaoEnviar = document.querySelector(seletorBotaoEnviar);
  if (botaoEnviar) {
    botaoEnviar.click();
    console.log('📨 Mensagem enviada!');
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
function criarBotaoFlutuante() {
  if (document.getElementById('autoTawkBtn')) return;

  const btn = document.createElement('button');
  btn.id = 'autoTawkBtn';
  btn.textContent = '▶️';
  btn.style.position = 'fixed';
  btn.style.bottom = '20px';
  btn.style.right = '20px';
  btn.style.zIndex = '999999';
  btn.style.width = '60px';
  btn.style.height = '60px';
  btn.style.borderRadius = '50%';
  btn.style.border = 'none';
  btn.style.background = '#0078d7';
  btn.style.color = 'white';
  btn.style.fontSize = '28px';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
  btn.style.transition = 'background 0.3s, transform 0.2s';
  btn.title = 'Auto responder';

  btn.addEventListener('mouseenter', () => (btn.style.transform = 'scale(1.1)'));
  btn.addEventListener('mouseleave', () => (btn.style.transform = 'scale(1)'));

  btn.addEventListener('click', () => {
    window.autoLigado = !window.autoLigado;
    if (window.autoLigado) {
      btn.textContent = '⏹️';
      btn.style.background = '#d9534f';
      console.log('🤖 Auto ligado!');
    } else {
      btn.textContent = '▶️';
      btn.style.background = '#0078d7';
      console.log('🛑 Auto desligado!');
    }
  });

  document.body.appendChild(btn);
}

// Cria o botao e ativa o observador
criarBotaoFlutuante();
const observer = new MutationObserver(verificarChats);
observer.observe(document.body, { childList: true, subtree: true });

console.log('🚀 Auto Tawk carregado!');
