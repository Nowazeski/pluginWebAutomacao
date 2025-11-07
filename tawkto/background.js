// Inicializa valores padrão
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    autoLigado: false,
    botaoVisivel: true,
    pluginBloqueado: true
  });
});
