const btnToggle = document.getElementById('toggle');
const btnVisibilidade = document.getElementById('visibilidade');

// Atualiza visual do botao principal
function atualizarBotao(ligado) {
  btnToggle.textContent = ligado ? 'Parar Auto' : 'Ativar Auto';
  btnToggle.classList.toggle('on', ligado);
}

// Função para soltar os corações ❤️
function soltarCoracoes() {
  for (let i = 0; i < 20; i++) {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = '❤️';
    heart.style.left = `${Math.random() * 200}px`;
    heart.style.fontSize = `${16 + Math.random() * 10}px`;
    heart.style.animationDelay = `${Math.random() * 0.5}s`;
    document.body.appendChild(heart);

    // Remove o coração após a animação
    setTimeout(() => heart.remove(), 2500);
  }
}

// Carrega estado inicial
chrome.storage.local.get(['autoLigado', 'botaoVisivel'], (data) => {
  atualizarBotao(data.autoLigado ?? false);
  btnVisibilidade.textContent = data.botaoVisivel === false ? 'Mostrar Botão' : 'Ocultar Botão';
});

// Alternar ligar/desligar
btnToggle.addEventListener('click', async () => {
  const { autoLigado } = await chrome.storage.local.get('autoLigado');
  const novoEstado = !autoLigado;

  await chrome.storage.local.set({ autoLigado: novoEstado });
  atualizarBotao(novoEstado);

  // Se ativar, solta corações ❤️
  if (novoEstado) soltarCoracoes();

  // Envia o novo estado para o content.js ativo
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
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
      args: [novoEstado],
    });
  }
});

// Alternar visibilidade do botão flutuante
btnVisibilidade.addEventListener('click', async () => {
  const { botaoVisivel } = await chrome.storage.local.get('botaoVisivel');
  const novo = botaoVisivel === false ? true : false;
  await chrome.storage.local.set({ botaoVisivel: novo });
  btnVisibilidade.textContent = novo ? 'Ocultar Botão' : 'Mostrar Botão';
});
