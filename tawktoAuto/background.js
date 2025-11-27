// Inicializa valores padrão ao instalar a extensão
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    autoLigado: false,
    botaoVisivel: true,
    pluginBloqueado: true
  });
});
