// Content script - roda na página com o botão flutuante
(function(){
  function getBtn(){ return document.getElementById('autoTawkBtn'); }

  function aplicarBloqueio(bloquear){
    const btn = getBtn();
    if(!btn) return;
    btn.style.display = bloquear ? 'none' : '';
  }

  // lê estado inicial
  chrome.storage.local.get('pluginBloqueado', (res) => {
    aplicarBloqueio(res.pluginBloqueado === true);
  });

  // escuta mudanças
  chrome.storage.onChanged.addListener((changes, area) => {
    if(area === 'local' && changes.pluginBloqueado){
      aplicarBloqueio(changes.pluginBloqueado.newValue === true);
    }
  });
})();
