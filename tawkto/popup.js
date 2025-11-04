const btnToggle = document.getElementById('toggle');
const btnVisibilidade = document.getElementById('visibilidade');

// Atualiza visual do botao principal
function atualizarBotao(ligado) {
  btnToggle.textContent = ligado ? 'Parar Auto' : 'Ativar Auto';
  btnToggle.classList.toggle('on', ligado);
}

// Atualiza label de visibilidade (assume visivel por padrao)
function atualizarLabelVisibilidade(visivel) {
  btnVisibilidade.textContent = visivel === false ? 'Mostrar Botao' : 'Ocultar Botao';
}

// Carrega estado inicial
chrome.storage.local.get(['autoLigado', 'botaoVisivel'], (data) => {
  atualizarBotao(data.autoLigado ?? false);
  atualizarLabelVisibilidade(data.botaoVisivel !== false);
});

// Ouve mudancas no storage para sincronizar quando o content.js alterar o estado
chrome.storage.onChanged.addListener((changes) => {
  if (changes.autoLigado) {
    atualizarBotao(changes.autoLigado.newValue);
  }
  if (changes.botaoVisivel) {
    atualizarLabelVisibilidade(changes.botaoVisivel.newValue);
  }
});

// Alternar ligar/desligar (salva no storage; content.js vai reagir)
btnToggle.addEventListener('click', async () => {
  const data = await chrome.storage.local.get('autoLigado');
  const novoEstado = !data.autoLigado;
  await chrome.storage.local.set({ autoLigado: novoEstado });
  // atualizar UI localmente imediatamente
  atualizarBotao(novoEstado);
});

// Alternar visibilidade do botao (salva no storage; content.js vai reagir)
btnVisibilidade.addEventListener('click', async () => {
  const data = await chrome.storage.local.get('botaoVisivel');
  // se undefined => atualmente visivel (true). Novo = !atual
  const atual = data.botaoVisivel;
  const novo = atual === false ? true : false;
  await chrome.storage.local.set({ botaoVisivel: novo });
  atualizarLabelVisibilidade(novo);
});
