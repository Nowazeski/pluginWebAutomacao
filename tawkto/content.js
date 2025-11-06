(async () => {
  // --- Utilitários ---
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

  // Só executa se for no domínio do Tawk.to
  if (!location.hostname.includes("tawk.to")) return;

  // Evita duplicar o botão
  if (document.getElementById("autoTawkBtn")) return;

  // --- Estado inicial ---
  let { autoLigado = false, botaoVisivel = true } = await chrome.storage.local.get([
    "autoLigado",
    "botaoVisivel",
  ]);

  // --- Criar botão flutuante ---
  const btn = document.createElement("button");
  btn.id = "autoTawkBtn";
  btn.textContent = autoLigado ? "⏹️" : "▶️";
  Object.assign(btn.style, {
    position: "fixed",
    bottom: "25px",
    right: "25px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: autoLigado ? "#d9534f" : "#0078d7",
    color: "white",
    fontSize: "26px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    zIndex: "2147483647",
    transition: "all 0.3s ease",
    display: botaoVisivel ? "block" : "none",
    opacity: "0.9",
  });

  btn.addEventListener("mouseenter", () => (btn.style.transform = "scale(1.1)"));
  btn.addEventListener("mouseleave", () => (btn.style.transform = "scale(1)"));
  document.body.appendChild(btn);

  function atualizarVisual() {
    btn.textContent = autoLigado ? "⏹️" : "▶️";
    btn.style.background = autoLigado ? "#d9534f" : "#0078d7";
    btn.style.display = botaoVisivel ? "block" : "none";
  }

  atualizarVisual();

  // Sincroniza estado com o popup
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.autoLigado) autoLigado = changes.autoLigado.newValue;
    if (changes.botaoVisivel) botaoVisivel = changes.botaoVisivel.newValue;
    atualizarVisual();
  });

  // Clique no botão flutuante
  btn.addEventListener("click", async () => {
    autoLigado = !autoLigado;
    await chrome.storage.local.set({ autoLigado });
    atualizarVisual();
    if (autoLigado) iniciarAuto();
  });

  // --- Automação principal ---
  async function iniciarAuto() {
    while (autoLigado) {
      try {
        // Seleciona o chat com mensagens não lidas
        const chat = document.querySelector(".tawk-chat-item.unseen.need-attn");
        if (!chat) {
          await esperar(2000);
          continue;
        }

        chat.click();
        await esperar(1500);

        // Clica em "Ingressar"
        const ingressar = document.querySelector(
          ".tawk-button.tawk-button-solid-primary.tawk-button-solid.tawk-button-medium"
        );
        if (ingressar) {
          ingressar.click();
          await esperar(1500);
        }

        // Campo de texto
        const campo = document.querySelector(
          ".tawk-border-remove.tawk-message-input.tawk-input-field.tawk-message-autoresize"
        );
        if (!campo) {
          await esperar(2000);
          continue;
        }

        campo.focus();
        campo.innerText =
          "Hola! 👋 Mi nombre es Linette, soy parte del equipo de soporte comercial de Adrian Rivera 🦈 ¿Cómo puedo ayudarte a formalizar tu inscripción? 🔥";
        campo.dispatchEvent(new InputEvent("input", { bubbles: true }));
        await esperar(500);

        // Envia só UMA mensagem
        const enviar = document.querySelector(
          ".tawk-button.tawk-button-solid-primary.tawk-button-solid.tawk-button-small.tawk-message-send"
        );
        if (enviar) {
          enviar.click();
          console.log("Mensagem enviada ✅");
          await esperar(1500);
        }

        // Volta à lista de conversas
        const voltar = document.querySelector(".top-navigation__item.tawk-margin-xsmall-right");
        if (voltar) {
          voltar.click();
          console.log("Voltando à lista de conversas...");
          await esperar(1500);
        }

        // Verifica se ainda está ativo
        const { autoLigado: aindaLigado } = await chrome.storage.local.get("autoLigado");
        if (!aindaLigado) break;
      } catch (err) {
        console.error("Erro na automação:", err);
        await esperar(2000);
      }
    }
  }
})();
