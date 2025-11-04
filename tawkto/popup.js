const btnToggle = document.getElementById('toggle');
const btnVisibilidade = document.getElementById('visibilidade');

// Atualiza o texto e cor do botao principal
function atualizarBotao(ligado) {
  btnToggle.textContent = ligado ? 'Parar Auto' : 'Ativar Auto';
  btnToggle.classList.toggle('on', ligado);
}

// Carrega o estado inicial do armazenamento
chrome.storage.local.get(['autoLigado', 'botaoVisivel'], (data) => {
  atualizarBotao(data.autoLigado ?? false);
  btnVisibilidade.textContent = data.botaoVisivel === false ? 'Mostrar Botao' : 'Ocultar Botao';
});

// Alternar ligar/desligar
btnToggle.addEventListener('click', async () => {
  const novoEstado = !(await chrome.storage.local.get('autoLigado')).autoLigado;
  chrome.storage.local.set({ autoLigado: novoEstado });
  atualizarBotao(novoEstado);
});

// Alternar visibilidade do botao
btnVisibilidade.addEventListener('click', async () => {
  const atual = (await chrome.storage.local.get('botaoVisivel')).botaoVisivel;
  const novo = atual === false ? true : false;
  chrome.storage.local.set({ botaoVisivel: novo });
  btnVisibilidade.textContent = novo ? 'Ocultar Botao' : 'Mostrar Botao';
});
