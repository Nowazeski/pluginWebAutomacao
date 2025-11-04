const btn = document.getElementById('toggle');

// Atualiza o estado do botao com base na aba atual
async function atualizarBotao(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => window.autoLigado ?? false,
  });

  const ligado = Boolean(result);
  btn.textContent = ligado ? '⏹️' : '▶️'; // muda icone
  btn.classList.toggle('on', ligado);
}

// Ao clicar, alterna o estado e atualiza o botao
btn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      window.autoLigado = !window.autoLigado;
      console.log(window.autoLigado ? 'Auto ligado' : 'Auto desligado');
      alert(window.autoLigado ? 'Auto ligado' : 'Auto desligado');
    },
  });

  atualizarBotao(tab.id);
});

// Quando o popup abre, mostra o icone correto
chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
  atualizarBotao(tab.id);
});
