// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    autoLigado: false,
    botaoVisivel: true,
    pluginBloqueado: true // começa bloqueado até login/liberação
  });
});
