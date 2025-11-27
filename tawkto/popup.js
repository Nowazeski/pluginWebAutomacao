const btnToggle = document.getElementById('toggle');
const btnVisibilidade = document.getElementById('visibilidade');

// Atualiza visual
function atualizarBotao(ligado) {
  btnToggle.textContent = ligado ? 'Parar Auto' : 'Ativar Auto';
  btnToggle.classList.toggle('on', ligado);
}

// Animação de corações
function soltarCoracoes() {
  const largura = document.body.clientWidth;

  for (let i = 0; i < 12; i++) {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = '❤️';
    heart.style.left = `${Math.random() * largura}px`;
    heart.style.fontSize = `${16 + Math.random() * 10}px`;
    heart.style.animationDelay = `${Math.random() * 0.5}s`;
    document.body.appendChild(heart);

    setTimeout(() => heart.remove(), 2500);
  }
}

// Carrega estado inicial
chrome.storage.local.get(['autoLigado', 'botaoVisivel'], (data) => {
  atualizarBotao(data.autoLigado ?? false);
  btnVisibilidade.textContent = data.botaoVisivel === false ? 'Mostrar Botão' : 'Ocultar Botão';
});

// Liga / Desliga automação
btnToggle.addEventListener('click', async () => {
  const { autoLigado } = await chrome.storage.local.get('autoLigado');
  const novoEstado = !autoLigado;

  await chrome.storage.local.set({ autoLigado: novoEstado });
  atualizarBotao(novoEstado);

  if (novoEstado) soltarCoracoes();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (ligado) => {
        const btn = document.getElementById('autoTawkBtn');
        if (btn) {
          btn.textContent = ligado ? '⏹️' : '▶️';
          btn.style.background = ligado ? '#d9534f' : '#0078d7';
        }
        window.autoLigado = ligado;
      },
      args: [novoEstado],
    });
  }
});

// Alternar visibilidade
btnVisibilidade.addEventListener('click', async () => {
  const { botaoVisivel } = await chrome.storage.local.get('botaoVisivel');
  const novo = botaoVisivel === false ? true : false;

  await chrome.storage.local.set({ botaoVisivel: novo });
  btnVisibilidade.textContent = novo ? 'Ocultar Botão' : 'Mostrar Botão';
});
