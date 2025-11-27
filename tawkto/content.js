// content.js — Versão final: envia mensagem → delay 2s → fecha chat
(async () => {
  if (!location.hostname.includes("tawk.to")) return;
  if (window.__tawkAutoInjected) return;
  window.__tawkAutoInjected = true;

  const esperar = (ms) => new Promise(r => setTimeout(r, ms));

  // ---------- Configurações ----------
  const CHAT_SELECTORS = [
    ".tawk-chat-item.unseen.need-attn",
    ".tawk-chat-item.need-attn",
    ".tawk-chat-item.unseen",
    ".tawk-chat-item.focused.transfer-request",
    ".tawk-chat-item.transfer-request",
    ".tawk-chat-item.focused",
    ".tawk-chat-item"
  ];

  const NAME_IN_ITEM_SELECTOR = ".tawk-flex.tawk-flex-middle.tawk-chat-item-content .tawk-text-truncate";
  const OPERADOR_NAME_SELECTOR = "span.tawk-margin-left.tawk-margin-right.tawk-text-truncate";

  const JOIN_SELECTOR = ".tawk-button.tawk-button-solid-primary.tawk-button-solid.tawk-button-medium";
  const INPUT_SELECTORS = [
    ".tawk-border-remove.tawk-message-input.tawk-input-field.tawk-message-autoresize",
    "[contenteditable='true']",
    "textarea",
    "input[type='text']"
  ];
  const SEND_SELECTORS = [
    ".tawk-button.tawk-button-solid-primary.tawk-button-solid.tawk-button-small.tawk-message-send",
    ".tawk-message-send"
  ];
  const BACK_BUTTON_SELECTORS = [
    ".top-navigation__item",
    ".tawk-chat-back-button",
    ".tawk-back"
  ];
  const FECHAR_SELECTOR = ".tawk-icon.tawk-icon-circlecross.tawk-icon-large";

  const MENSAGEM = "Hola! 👋 Mi nombre es Linette, soy parte del equipo de soporte comercial de Adrian Rivera 🦈 ¿Cómo puedo ayudarte a formalizar tu inscripción? 🔥";

  let { autoLigado = false } = await chrome.storage.local.get("autoLigado");
  let chatsAtendidos = [];

  // ---------- Botão de controle ----------
  const ctrlBtn = document.createElement("button");
  ctrlBtn.id = "autoTawkBtn";
  ctrlBtn.textContent = autoLigado ? "⏹️" : "▶️";
  Object.assign(ctrlBtn.style, {
    position: "fixed",
    bottom: "25px",
    right: "25px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: autoLigado ? "#d9534f" : "#0078d7",
    color: "#fff",
    fontSize: "20px",
    border: "none",
    cursor: "pointer",
    zIndex: "2147483647",
    opacity: "0.95"
  });
  document.body.appendChild(ctrlBtn);

  ctrlBtn.onclick = async () => {
    autoLigado = !autoLigado;
    await chrome.storage.local.set({ autoLigado });
    ctrlBtn.textContent = autoLigado ? "⏹️" : "▶️";
    ctrlBtn.style.background = autoLigado ? "#d9534f" : "#0078d7";
    if (!autoLigado) {
      chatsAtendidos = [];
      console.log("[AutoTawk] desligado — memória limpa");
    } else {
      iniciarAuto();
    }
  };

  chrome.storage.onChanged.addListener(changes => {
    if (changes.autoLigado) {
      autoLigado = changes.autoLigado.newValue;
      ctrlBtn.textContent = autoLigado ? "⏹️" : "▶️";
      ctrlBtn.style.background = autoLigado ? "#d9534f" : "#0078d7";
      if (!autoLigado) chatsAtendidos = [];
      else iniciarAuto();
    }
  });

  // ---------- Helpers ----------
  function deepQuerySelector(selector, root = document) {
    try {
      const direct = root.querySelector(selector);
      if (direct) return direct;
      for (const node of root.querySelectorAll("*")) {
        if (node.shadowRoot) {
          const found = deepQuerySelector(selector, node.shadowRoot);
          if (found) return found;
        }
      }
    } catch (e) {}
    return null;
  }

  function deepQuerySelectorAll(selector, root = document, acc = []) {
    try {
      acc.push(...root.querySelectorAll(selector));
      for (const node of root.querySelectorAll("*")) {
        if (node.shadowRoot) deepQuerySelectorAll(selector, node.shadowRoot, acc);
      }
    } catch (e) {}
    return acc;
  }

  function localizarChats() {
    const encontrados = [];
    for (const sel of CHAT_SELECTORS) encontrados.push(...deepQuerySelectorAll(sel));
    return [...new Set(encontrados)];
  }

  function itemÉCliente(chatItem) {
    const nameEl = chatItem.querySelector(NAME_IN_ITEM_SELECTOR);
    if (!nameEl) return false;
    if (nameEl.tagName.toLowerCase() === "span" && nameEl.matches(OPERADOR_NAME_SELECTOR)) return false;
    return true;
  }

  function obterNomeChatNoItem(chatItem) {
    const el = chatItem.querySelector(NAME_IN_ITEM_SELECTOR);
    if (!el) return null;
    return el.textContent.trim();
  }

  function obterBotaoVoltar() {
    const botoes = [];
    for (const sel of BACK_BUTTON_SELECTORS) botoes.push(...deepQuerySelectorAll(sel));
    return botoes[0] || null;
  }

  async function preencherEClicarEnviar(campo, mensagem) {
    if (!campo) return false;
    try {
      campo.focus();
      campo.innerText = mensagem;
      campo.dispatchEvent(new InputEvent("input", { bubbles: true }));
      await esperar(300);
    } catch (e) {}

    let botaoEnviar = null;
    for (const sel of SEND_SELECTORS) {
      botaoEnviar = deepQuerySelector(sel);
      if (botaoEnviar) break;
    }
    if (botaoEnviar) {
      try { botaoEnviar.click(); await esperar(300); return true; } catch (e) {}
    }
    return false;
  }

  async function clicarJoin(chatPanel) {
    const join = deepQuerySelector(JOIN_SELECTOR, chatPanel);
    if (!join) return false;
    // filtrar botão que não seja "New Organization"
    if (join.textContent && join.textContent.includes("New Organization")) return false;
    try { join.click(); await esperar(600); return true; } catch (e) { return false; }
  }

  // ---------- Loop principal ----------
  let rodando = false;
  async function iniciarAuto() {
    if (rodando) return;
    rodando = true;

    while (autoLigado) {
      try {
        const chats = localizarChats().filter(itemÉCliente);

        for (const chat of chats) {
          const nomeChat = obterNomeChatNoItem(chat);
          if (!nomeChat || chatsAtendidos.includes(nomeChat)) continue;

          // abrir chat
          try { chat.click(); } catch {}
          await esperar(800);

          const painel = document.querySelector(".tawk-chat-panel") || document;
          const joinClicado = await clicarJoin(painel);
          if (!joinClicado) {
            console.log("[AutoTawk] JOIN não encontrado para:", nomeChat);
            continue;
          }

          // esperar campo aparecer
          let campo = null;
          for (const sel of INPUT_SELECTORS) {
            campo = deepQuerySelector(sel, painel);
            if (campo) break;
          }
          if (!campo) { await esperar(600); campo = deepQuerySelector(INPUT_SELECTORS[0], painel); }
          if (!campo) continue;

          // enviar mensagem
          await preencherEClicarEnviar(campo, MENSAGEM);
          chatsAtendidos.push(nomeChat);
          console.log("[AutoTawk] mensagem enviada para:", nomeChat);

          // delay de 2 segundos
          await esperar(2000);

          // clicar botão fechar chat
          const fechar = deepQuerySelector(FECHAR_SELECTOR, painel);
          if (fechar) {
            try { fechar.click(); await esperar(400); } catch {}
          }

          // voltar botão seguro caso ainda exista
          const voltar = obterBotaoVoltar();
          if (voltar) try { voltar.click(); } catch {}
          await esperar(700);
        }

        await esperar(1000);
      } catch (e) { console.error("[AutoTawk] erro loop:", e); await esperar(1200); }
    }

    rodando = false;
  }

  if (autoLigado) iniciarAuto();
  window.addEventListener("beforeunload", () => { chatsAtendidos = []; });

})();
