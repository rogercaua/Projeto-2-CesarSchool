const state = {
  user: null,
  flash: null,
};

const routes = {
  "/login": { public: true, render: renderLogin },
  "/cadastro": { public: true, render: renderCadastro },
  "/dashboard": { protected: true, render: renderDashboard },
  "/veiculos": { protected: true, render: renderVeiculos },
  "/passagens": { protected: true, render: renderPassagens },
  "/simulador": { protected: true, render: renderSimulador },
  "/ranking": { protected: true, render: renderRanking },
  "/perfil": { protected: true, render: renderPerfil },
  "/admin": { protected: true, admin: true, render: renderAdmin },
  "/sobre": { public: true, render: renderSobre },
};

document.addEventListener("DOMContentLoaded", initApp);
window.addEventListener("hashchange", renderRoute);

async function initApp() {
  state.user = getUsuario();

  if (getToken()) {
    try {
      state.user = await getPerfil();
    } catch (error) {
      if (error.status === 401) state.user = null;
    }
  }

  if (!window.location.hash) {
    window.history.replaceState(null, "", getToken() ? "#/dashboard" : "#/login");
  }

  await renderRoute();
}

function getRoute() {
  const route = window.location.hash.replace("#", "") || "/login";
  return route.startsWith("/") ? route : `/${route}`;
}

function navigate(route) {
  window.location.hash = route;
}

async function renderRoute() {
  const route = getRoute();
  const routeConfig = routes[route];

  if (!routeConfig) {
    renderHeader(route);
    setApp(`
      ${pageTitle("Tela nao encontrada", "A rota solicitada nao existe no EcoTag.")}
      <div class="notice warning">Volte para o dashboard ou escolha uma opcao no menu.</div>
    `);
    return;
  }

  if (routeConfig.protected && !getToken()) {
    state.flash = { type: "warning", message: "Entre para acessar esta tela." };
    navigate("/login");
    return;
  }

  if (routeConfig.admin && !isAdmin()) {
    renderHeader(route);
    setApp(`
      ${pageTitle("Acesso administrativo", "Esta area e liberada apenas para usuarios administradores.")}
      <div class="notice warning">Sua conta atual nao possui permissao para alterar premissas ambientais.</div>
    `);
    return;
  }

  renderHeader(route);
  setApp(`<div class="loader">Carregando...</div>`);

  try {
    await routeConfig.render();
  } catch (error) {
    if (error.status === 401) {
      state.flash = { type: "warning", message: "Sua sessao expirou. Entre novamente." };
      navigate("/login");
      return;
    }

    setApp(`
      ${pageTitle("Algo saiu do esperado", "Nao foi possivel carregar esta tela agora.")}
      <div class="notice error">${escapeHtml(error.message || "Erro inesperado.")}</div>
    `);
  }
}

function renderHeader(activeRoute = getRoute()) {
  const header = document.getElementById("appHeader");
  const logged = Boolean(getToken());
  const user = state.user || getUsuario();

  const navItems = logged
    ? [
        ["/dashboard", "Dashboard"],
        ["/veiculos", "Veiculos"],
        ["/passagens", "Passagens"],
        ["/simulador", "Simulador"],
        ["/ranking", "Ranking"],
        ["/perfil", "Perfil"],
        ...(isAdmin() ? [["/admin", "Admin"]] : []),
        ["/sobre", "Sobre"],
      ]
    : [
        ["/login", "Login"],
        ["/cadastro", "Cadastro"],
        ["/sobre", "Sobre"],
      ];

  header.innerHTML = `
    <a class="brand" href="#${logged ? "/dashboard" : "/login"}">
      <span class="brand-mark">ET</span>
      <span>EcoTag</span>
    </a>
    <nav class="nav" aria-label="Navegacao principal">
      ${navItems.map(([href, label]) => `
        <a href="#${href}" class="${activeRoute === href ? "active" : ""}">${label}</a>
      `).join("")}
    </nav>
    <div class="actions">
      ${logged ? `
        <span class="hello">Ola, ${escapeHtml(field(user, "nome", "usuario"))}</span>
        <button class="btn-header" type="button" onclick="logout()">Sair</button>
      ` : `
        <a class="btn-header" href="#/login">Entrar</a>
        <a class="btn-header btn-dark" href="#/cadastro">Criar conta</a>
      `}
    </div>
  `;
}

function setApp(html) {
  document.getElementById("app").innerHTML = html;
}

function pageTitle(title, description, action = "") {
  return `
    <section class="page-title">
      <div>
        <h1>${escapeHtml(title)}</h1>
        ${description ? `<p>${escapeHtml(description)}</p>` : ""}
      </div>
      ${action}
    </section>
  `;
}

function consumeFlash() {
  if (!state.flash) return "";
  const flash = state.flash;
  state.flash = null;
  return `<div class="notice ${flash.type || "success"}">${escapeHtml(flash.message)}</div>`;
}

function showInlineMessage(id, type, message) {
  const element = document.getElementById(id);
  if (!element) return;
  element.className = `notice ${type}`;
  element.textContent = message;
  element.classList.remove("hidden");
}

async function runWithButton(button, loadingText, action) {
  const originalText = button.textContent;
  button.textContent = loadingText;
  button.disabled = true;

  try {
    await action();
  } finally {
    button.textContent = originalText;
    button.disabled = false;
  }
}

function isAdmin() {
  const user = state.user || getUsuario();
  return String(field(user, "role", "")).toLowerCase() === "admin";
}

function field(obj, name, fallback = "") {
  if (!obj) return fallback;
  const pascal = name.charAt(0).toUpperCase() + name.slice(1);
  return obj[name] ?? obj[pascal] ?? fallback;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNumber(value, digits = 2) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value || 0));
}

function formatKg(value, digits = 2) {
  return `${formatNumber(value, digits)} kg`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR");
}

function labelVeiculo(tipo) {
  return {
    carro: "Carro",
    moto: "Moto",
    caminhao: "Caminhao",
  }[tipo] || tipo || "Veiculo";
}

function labelCombustivel(tipo) {
  return {
    gasolina: "Gasolina",
    etanol: "Etanol",
    diesel: "Diesel",
  }[tipo] || tipo || "Combustivel";
}

function labelLocal(tipo) {
  return {
    pedagio: "Pedagio",
    estacionamento: "Estacionamento",
  }[tipo] || tipo || "Local";
}

function vehicleOptions(veiculos) {
  return veiculos.map((veiculo) => `
    <option value="${field(veiculo, "id")}">
      ${labelVeiculo(field(veiculo, "tipoVeiculo"))} - ${labelCombustivel(field(veiculo, "tipoCombustivel"))}
    </option>
  `).join("");
}

function localOptions(locais) {
  return locais.map((local) => `
    <option value="${field(local, "id")}">
      ${escapeHtml(field(local, "nome"))} - ${labelLocal(field(local, "tipoLocal"))}
    </option>
  `).join("");
}

function authIntro() {
  return `
    <aside class="auth-panel">
      <h1>Mobilidade com impacto visivel.</h1>
      <p>
        O EcoTag calcula quanto CO2e voce evita usando passagem automatica,
        organiza seu historico e transforma os resultados em pontos e selos.
      </p>
      <div class="auth-stats">
        <div class="auth-stat"><strong>CO2e</strong><span>Indicadores</span></div>
        <div class="auth-stat"><strong>Tags</strong><span>Passagens</span></div>
        <div class="auth-stat"><strong>Ranking</strong><span>Mensal</span></div>
      </div>
    </aside>
  `;
}

function renderLogin() {
  if (getToken()) {
    navigate("/dashboard");
    return;
  }

  setApp(`
    ${consumeFlash()}
    <section class="auth-page">
      ${authIntro()}
      <div class="auth-card">
        <h2>Entrar</h2>
        <p>Acesse sua conta para acompanhar seu impacto ambiental.</p>
        <div id="loginMessage" class="notice error hidden"></div>
        <form id="loginForm">
          <label for="email">E-mail</label>
          <input id="email" type="email" autocomplete="email" placeholder="seu@email.com" required />

          <label for="password">Senha</label>
          <input id="password" type="password" autocomplete="current-password" placeholder="Sua senha" required />

          <div class="form-actions">
            <button id="loginSubmit" type="submit">Entrar</button>
          </div>
        </form>
        <div class="auth-links">
          Ainda nao tem conta? <a href="#/cadastro">Crie uma agora</a>.
        </div>
      </div>
    </section>
  `);

  document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.getElementById("loginSubmit");
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    await runWithButton(button, "Entrando...", async () => {
      try {
        const authResponse = await login(email, password);
        salvarSessao(authResponse);
        state.user = authResponse.user || await getPerfil();
        state.flash = { type: "success", message: "Login realizado com sucesso." };
        navigate("/dashboard");
      } catch (error) {
        showInlineMessage("loginMessage", "error", error.message || "E-mail ou senha invalidos.");
      }
    });
  });
}

function renderCadastro() {
  if (getToken()) {
    navigate("/dashboard");
    return;
  }

  setApp(`
    ${consumeFlash()}
    <section class="auth-page">
      ${authIntro()}
      <div class="auth-card">
        <h2>Criar conta</h2>
        <p>Cadastre-se para salvar veiculos, passagens e simulacoes.</p>
        <div id="cadastroMessage" class="notice error hidden"></div>
        <form id="cadastroForm">
          <label for="nome">Nome</label>
          <input id="nome" type="text" autocomplete="name" placeholder="Seu nome" required />

          <label for="email">E-mail</label>
          <input id="email" type="email" autocomplete="email" placeholder="seu@email.com" required />

          <label for="password">Senha</label>
          <input id="password" type="password" autocomplete="new-password" placeholder="Minimo 6 caracteres" minlength="6" required />

          <div class="form-actions">
            <button id="cadastroSubmit" type="submit">Criar conta</button>
          </div>
        </form>
        <div class="auth-links">
          Ja tem conta? <a href="#/login">Entre aqui</a>.
        </div>
      </div>
    </section>
  `);

  document.getElementById("cadastroForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.getElementById("cadastroSubmit");
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    await runWithButton(button, "Criando...", async () => {
      try {
        await registrar(nome, email, password);
        state.flash = { type: "success", message: "Conta criada. Entre para continuar." };
        navigate("/login");
      } catch (error) {
        showInlineMessage("cadastroMessage", "error", error.message || "Nao foi possivel criar a conta.");
      }
    });
  });
}

async function renderDashboard() {
  const [dashboard, gamificacao, ranking, passagens, veiculos] = await Promise.all([
    getDashboard(),
    getGamificacao(),
    getRanking("mensal", 5),
    listarPassagens(),
    listarVeiculos(),
  ]);

  const rankingItens = field(ranking, "itens", []);
  const recentes = [...passagens].slice(0, 4);
  const selos = field(gamificacao, "selos", []);

  setApp(`
    ${consumeFlash()}
    ${pageTitle("Dashboard", "Acompanhe os principais indicadores de uso da EcoTag.")}

    <section class="metric-grid">
      <div class="metric-card accent"><strong>${formatKg(field(dashboard, "mesAtualKg"))}</strong><span>CO2e este mes</span></div>
      <div class="metric-card"><strong>${formatKg(field(dashboard, "anoAtualKg"))}</strong><span>CO2e este ano</span></div>
      <div class="metric-card"><strong>${formatKg(field(dashboard, "totalHistoricoKg"))}</strong><span>Total historico</span></div>
      <div class="metric-card"><strong>${field(dashboard, "totalPassagens", 0)}</strong><span>Passagens</span></div>
      <div class="metric-card"><strong>${field(dashboard, "pontosSustentaveis", 0)}</strong><span>Pontos</span></div>
    </section>

    <section class="grid">
      <article class="card span-6">
        <h2>Selos desbloqueados</h2>
        ${selos.length ? `
          <div class="tag-list">
            ${selos.map((selo) => `<span class="tag">${escapeHtml(field(selo, "nome"))}</span>`).join("")}
          </div>
        ` : `<div class="empty">Nenhum selo liberado ainda.</div>`}
      </article>

      <article class="card span-6">
        <h2>Resumo da conta</h2>
        <ul class="list">
          <li class="list-item">
            <div class="list-main"><strong>${veiculos.length}</strong><span>Veiculos cadastrados</span></div>
            <a class="btn btn-secondary btn-small" href="#/veiculos">Gerenciar</a>
          </li>
          <li class="list-item">
            <div class="list-main"><strong>${recentes.length}</strong><span>Passagens recentes exibidas</span></div>
            <a class="btn btn-secondary btn-small" href="#/passagens">Ver historico</a>
          </li>
        </ul>
      </article>

      <article class="card span-6">
        <h2>Ranking mensal</h2>
        ${rankingItens.length ? rankingListHtml(rankingItens) : `<div class="empty">Ranking sem dados neste periodo.</div>`}
      </article>

      <article class="card span-6">
        <h2>Passagens recentes</h2>
        ${recentes.length ? passagensListHtml(recentes) : `<div class="empty">Nenhuma passagem registrada ainda.</div>`}
      </article>
    </section>
  `);
}

async function renderVeiculos() {
  const veiculos = await listarVeiculos();

  setApp(`
    ${consumeFlash()}
    ${pageTitle("Veiculos", "Cadastre e mantenha os veiculos usados nas passagens com tag.")}
    <section class="section-split">
      <article class="card">
        <h2 id="vehicleFormTitle">Adicionar veiculo</h2>
        <div id="vehicleMessage" class="notice error hidden"></div>
        <form id="vehicleForm">
          <input id="vehicleId" type="hidden" />
          <label for="vehicleTipo">Tipo de veiculo</label>
          <select id="vehicleTipo" required>
            <option value="carro">Carro</option>
            <option value="moto">Moto</option>
            <option value="caminhao">Caminhao</option>
          </select>

          <label for="vehicleFuel">Combustivel</label>
          <select id="vehicleFuel" required>
            <option value="gasolina">Gasolina</option>
            <option value="etanol">Etanol</option>
            <option value="diesel">Diesel</option>
          </select>

          <div class="form-actions">
            <button id="vehicleSubmit" type="submit">Adicionar</button>
            <button id="vehicleCancel" class="btn-ghost hidden" type="button">Cancelar</button>
          </div>
        </form>
      </article>

      <article class="card">
        <h2>Seus veiculos</h2>
        ${veiculos.length ? vehicleListHtml(veiculos) : `<div class="empty">Nenhum veiculo cadastrado.</div>`}
      </article>
    </section>
  `);

  bindVehicleEvents();
}

function vehicleListHtml(veiculos) {
  return `
    <ul class="list" id="vehicleList">
      ${veiculos.map((veiculo) => {
        const id = field(veiculo, "id");
        const tipo = field(veiculo, "tipoVeiculo");
        const fuel = field(veiculo, "tipoCombustivel");
        return `
          <li class="list-item">
            <div class="list-main">
              <strong>${labelVeiculo(tipo)}</strong>
              <span>${labelCombustivel(fuel)}</span>
            </div>
            <div class="item-actions">
              <button class="btn-secondary btn-small" type="button" data-action="edit" data-id="${id}" data-tipo="${escapeHtml(tipo)}" data-fuel="${escapeHtml(fuel)}">Editar</button>
              <button class="btn-danger btn-small" type="button" data-action="delete" data-id="${id}">Remover</button>
            </div>
          </li>
        `;
      }).join("")}
    </ul>
  `;
}

function bindVehicleEvents() {
  const form = document.getElementById("vehicleForm");
  const cancel = document.getElementById("vehicleCancel");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.getElementById("vehicleSubmit");
    const id = document.getElementById("vehicleId").value;
    const tipo = document.getElementById("vehicleTipo").value;
    const fuel = document.getElementById("vehicleFuel").value;

    await runWithButton(button, "Salvando...", async () => {
      try {
        if (id) {
          await atualizarVeiculo(Number(id), tipo, fuel);
          state.flash = { type: "success", message: "Veiculo atualizado." };
        } else {
          await adicionarVeiculo(tipo, fuel);
          state.flash = { type: "success", message: "Veiculo adicionado." };
        }
        await renderVeiculos();
      } catch (error) {
        showInlineMessage("vehicleMessage", "error", error.message);
      }
    });
  });

  cancel.addEventListener("click", () => {
    document.getElementById("vehicleId").value = "";
    document.getElementById("vehicleFormTitle").textContent = "Adicionar veiculo";
    document.getElementById("vehicleSubmit").textContent = "Adicionar";
    cancel.classList.add("hidden");
    form.reset();
  });

  document.getElementById("vehicleList")?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    if (button.dataset.action === "edit") {
      document.getElementById("vehicleId").value = button.dataset.id;
      document.getElementById("vehicleTipo").value = button.dataset.tipo;
      document.getElementById("vehicleFuel").value = button.dataset.fuel;
      document.getElementById("vehicleFormTitle").textContent = "Editar veiculo";
      document.getElementById("vehicleSubmit").textContent = "Salvar";
      cancel.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (button.dataset.action === "delete" && confirm("Remover este veiculo?")) {
      await runWithButton(button, "Removendo...", async () => {
        try {
          await deletarVeiculo(Number(button.dataset.id));
          state.flash = { type: "success", message: "Veiculo removido." };
          await renderVeiculos();
        } catch (error) {
          state.flash = { type: "error", message: error.message };
          await renderVeiculos();
        }
      });
    }
  });
}

async function renderPassagens() {
  const [veiculos, locais, passagens] = await Promise.all([
    listarVeiculos(),
    listarLocais(),
    listarPassagens(),
  ]);

  const formDisabled = veiculos.length === 0 || locais.length === 0;

  setApp(`
    ${consumeFlash()}
    ${pageTitle("Passagens", "Registre usos reais de tag e consulte o historico calculado pelo backend.")}
    ${formDisabled ? `<div class="notice warning">Cadastre um veiculo e confirme que existem locais disponiveis antes de registrar passagens.</div>` : ""}
    <section class="grid">
      <article class="card span-4">
        <h2>Registrar passagem</h2>
        <div id="passagemMessage" class="notice error hidden"></div>
        <form id="passagemForm">
          <label for="passagemVeiculo">Veiculo</label>
          <select id="passagemVeiculo" ${formDisabled ? "disabled" : ""} required>
            <option value="">Selecione</option>
            ${vehicleOptions(veiculos)}
          </select>

          <label for="passagemLocal">Local</label>
          <select id="passagemLocal" ${formDisabled ? "disabled" : ""} required>
            <option value="">Selecione</option>
            ${localOptions(locais)}
          </select>

          <div class="form-actions">
            <button id="passagemSubmit" type="submit" ${formDisabled ? "disabled" : ""}>Registrar</button>
          </div>
        </form>
      </article>

      <article class="card span-8">
        <h2>Historico</h2>
        ${passagens.length ? passagensTableHtml(passagens) : `<div class="empty">Nenhuma passagem registrada.</div>`}
      </article>
    </section>
  `);

  document.getElementById("passagemForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.getElementById("passagemSubmit");
    const veiculoId = Number(document.getElementById("passagemVeiculo").value);
    const localUsoId = Number(document.getElementById("passagemLocal").value);

    await runWithButton(button, "Registrando...", async () => {
      try {
        const resultado = await registrarPassagem(veiculoId, localUsoId);
        state.flash = {
          type: "success",
          message: `Passagem registrada. CO2e evitado: ${formatKg(field(resultado, "co2EvitadoKg"), 3)}.`,
        };
        await renderPassagens();
      } catch (error) {
        showInlineMessage("passagemMessage", "error", error.message);
      }
    });
  });
}

function passagensTableHtml(passagens) {
  return `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Veiculo</th>
            <th>Local</th>
            <th>CO2e evitado</th>
          </tr>
        </thead>
        <tbody>
          ${passagens.map((passagem) => `
            <tr>
              <td>${formatDate(field(passagem, "dataHora"))}</td>
              <td>${labelVeiculo(field(passagem, "tipoVeiculo"))} / ${labelCombustivel(field(passagem, "tipoCombustivel"))}</td>
              <td>${escapeHtml(field(passagem, "localNome"))} <span class="pill">${labelLocal(field(passagem, "tipoLocal"))}</span></td>
              <td><strong>${formatKg(field(passagem, "co2EvitadoKg"), 3)}</strong></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function passagensListHtml(passagens) {
  return `
    <ul class="list">
      ${passagens.map((passagem) => `
        <li class="list-item">
          <div class="list-main">
            <strong>${escapeHtml(field(passagem, "localNome")) || labelLocal(field(passagem, "tipoLocal"))}</strong>
            <span>${formatDate(field(passagem, "dataHora"))}</span>
          </div>
          <span class="pill">${formatKg(field(passagem, "co2EvitadoKg"), 3)}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

async function renderSimulador() {
  const [veiculos, locais] = await Promise.all([listarVeiculos(), listarLocais()]);
  const formDisabled = veiculos.length === 0 || locais.length === 0;

  setApp(`
    ${consumeFlash()}
    ${pageTitle("Simulador", "Estime o impacto de uma rotina de passagens sem alterar o historico.")}
    ${formDisabled ? `<div class="notice warning">Cadastre um veiculo e use um local disponivel para simular.</div>` : ""}
    <section class="grid">
      <article class="card span-6">
        <h2>Cenario</h2>
        <div id="simuladorMessage" class="notice error hidden"></div>
        <form id="simuladorForm">
          <div class="form-grid">
            <label>Veiculo
              <select id="simVeiculo" ${formDisabled ? "disabled" : ""} required>
                <option value="">Selecione</option>
                ${vehicleOptions(veiculos)}
              </select>
            </label>

            <label>Local
              <select id="simLocal" ${formDisabled ? "disabled" : ""} required>
                <option value="">Selecione</option>
                ${localOptions(locais)}
              </select>
            </label>

            <label>Dias
              <input id="simDias" type="number" min="1" value="30" required />
            </label>

            <label>Passagens por dia
              <input id="simPassagensDia" type="number" min="1" value="1" required />
            </label>
          </div>

          <div class="form-actions">
            <button id="simuladorSubmit" type="submit" ${formDisabled ? "disabled" : ""}>Simular</button>
          </div>
        </form>
      </article>

      <article class="card span-6">
        <h2>Resultado</h2>
        <div id="simuladorResultado" class="empty">Preencha o cenario para ver a estimativa.</div>
      </article>
    </section>
  `);

  document.getElementById("simuladorForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.getElementById("simuladorSubmit");
    const veiculoId = Number(document.getElementById("simVeiculo").value);
    const localUsoId = Number(document.getElementById("simLocal").value);
    const dias = Number(document.getElementById("simDias").value);
    const passagensPorDia = Number(document.getElementById("simPassagensDia").value);

    await runWithButton(button, "Simulando...", async () => {
      try {
        const resultado = await simular(veiculoId, localUsoId, dias, passagensPorDia);
        document.getElementById("simuladorResultado").className = "";
        document.getElementById("simuladorResultado").innerHTML = `
          <div class="sim-result">
            <div><strong>${formatKg(field(resultado, "co2EvitadoTotalKg"), 3)}</strong><span>Total evitado</span></div>
            <div><strong>${field(resultado, "totalPassagens", 0)}</strong><span>Passagens simuladas</span></div>
            <div><strong>${formatKg(field(resultado, "co2EvitadoPorPassagemKg"), 3)}</strong><span>Por passagem</span></div>
          </div>
        `;
      } catch (error) {
        showInlineMessage("simuladorMessage", "error", error.message);
      }
    });
  });
}

async function renderRanking() {
  const ranking = await getRanking("mensal", 10);
  const itens = field(ranking, "itens", []);

  setApp(`
    ${consumeFlash()}
    ${pageTitle("Ranking mensal", "Compare os pontos sustentaveis acumulados no mes atual.")}
    <article class="card span-12">
      ${itens.length ? rankingTableHtml(itens) : `<div class="empty">Ainda nao ha dados suficientes para o ranking.</div>`}
    </article>
  `);
}

function rankingListHtml(itens) {
  return `
    <ul class="list">
      ${itens.map((item, index) => `
        <li class="list-item">
          <div class="list-main">
            <strong>${index + 1}. ${escapeHtml(field(item, "nomeUsuario", "Usuario"))}</strong>
            <span>${formatKg(field(item, "co2EvitadoKg"))} evitados</span>
          </div>
          <span class="pill pill-amber">${field(item, "pontosSustentaveis", 0)} pts</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function rankingTableHtml(itens) {
  return `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Posicao</th>
            <th>Usuario</th>
            <th>CO2e evitado</th>
            <th>Pontos</th>
          </tr>
        </thead>
        <tbody>
          ${itens.map((item, index) => `
            <tr>
              <td class="rank-pos">${index + 1}</td>
              <td>${escapeHtml(field(item, "nomeUsuario", "Usuario"))}</td>
              <td>${formatKg(field(item, "co2EvitadoKg"))}</td>
              <td><span class="pill pill-amber">${field(item, "pontosSustentaveis", 0)} pts</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function renderPerfil() {
  const user = await getPerfil();
  state.user = user;
  renderHeader("/perfil");

  setApp(`
    ${consumeFlash()}
    ${pageTitle("Perfil", "Atualize os dados da sua conta EcoTag.")}
    <section class="grid">
      <article class="card span-6">
        <h2>Dados pessoais</h2>
        <div id="perfilMessage" class="notice error hidden"></div>
        <form id="perfilForm">
          <label for="perfilNome">Nome</label>
          <input id="perfilNome" type="text" value="${escapeHtml(field(user, "nome"))}" required />

          <label for="perfilEmail">E-mail</label>
          <input id="perfilEmail" type="email" value="${escapeHtml(field(user, "email"))}" required />

          <div class="form-actions">
            <button id="perfilSubmit" type="submit">Salvar perfil</button>
          </div>
        </form>
      </article>

      <article class="card span-6">
        <h2>Conta</h2>
        <ul class="list">
          <li class="list-item">
            <div class="list-main"><strong>${escapeHtml(field(user, "email"))}</strong><span>E-mail de acesso</span></div>
          </li>
          <li class="list-item">
            <div class="list-main"><strong>${escapeHtml(field(user, "role", "user"))}</strong><span>Perfil de permissao</span></div>
          </li>
          <li class="list-item">
            <div class="list-main"><strong>${formatDate(field(user, "createdAt"))}</strong><span>Conta criada em</span></div>
          </li>
        </ul>
      </article>
    </section>
  `);

  document.getElementById("perfilForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.getElementById("perfilSubmit");
    const nome = document.getElementById("perfilNome").value.trim();
    const email = document.getElementById("perfilEmail").value.trim();

    await runWithButton(button, "Salvando...", async () => {
      try {
        state.user = await atualizarPerfil(nome, email);
        state.flash = { type: "success", message: "Perfil atualizado." };
        await renderPerfil();
      } catch (error) {
        showInlineMessage("perfilMessage", "error", error.message);
      }
    });
  });
}

async function renderAdmin() {
  const [locais, fatores, parametros] = await Promise.all([
    adminListarLocais(),
    adminListarFatores(),
    adminListarParametros(),
  ]);

  setApp(`
    ${consumeFlash()}
    ${pageTitle("Administracao", "Mantenha locais de uso e premissas ambientais usadas nos calculos.")}
    <section class="admin-stack">
      ${adminLocaisHtml(locais)}
      ${adminFatoresHtml(fatores)}
      ${adminParametrosHtml(parametros)}
    </section>
  `);

  bindAdminEvents();
}

function adminLocaisHtml(locais) {
  return `
    <article class="card admin-card">
      <h2>Locais de uso</h2>
      <div id="adminLocalMessage" class="notice error hidden"></div>
      <div class="section-split">
        <form id="adminLocalForm">
          <input id="adminLocalId" type="hidden" />
          <label>Nome
            <input id="adminLocalNome" type="text" placeholder="Ex.: Pedagio Recife Sul" required />
          </label>
          <label>Tipo
            <select id="adminLocalTipo" required>
              <option value="pedagio">Pedagio</option>
              <option value="estacionamento">Estacionamento</option>
            </select>
          </label>
          <div class="form-actions">
            <button id="adminLocalSubmit" type="submit">Salvar local</button>
            <button id="adminLocalCancel" class="btn-ghost hidden" type="button">Cancelar</button>
          </div>
        </form>
        ${locais.length ? `
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Nome</th><th>Tipo</th><th>Acoes</th></tr></thead>
              <tbody>
                ${locais.map((local) => `
                  <tr>
                    <td>${escapeHtml(field(local, "nome"))}</td>
                    <td><span class="pill">${labelLocal(field(local, "tipoLocal"))}</span></td>
                    <td>
                      <div class="item-actions">
                        <button class="btn-secondary btn-small" type="button" data-admin="edit-local" data-id="${field(local, "id")}" data-nome="${escapeHtml(field(local, "nome"))}" data-tipo="${escapeHtml(field(local, "tipoLocal"))}">Editar</button>
                        <button class="btn-danger btn-small" type="button" data-admin="delete-local" data-id="${field(local, "id")}">Remover</button>
                      </div>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : `<div class="empty">Nenhum local cadastrado.</div>`}
      </div>
    </article>
  `;
}

function adminFatoresHtml(fatores) {
  return `
    <article class="card admin-card">
      <h2>Fatores de emissao</h2>
      <div id="adminFatorMessage" class="notice error hidden"></div>
      <div class="section-split">
        <form id="adminFatorForm">
          <input id="adminFatorOriginal" type="hidden" />
          <label>Combustivel
            <input id="adminFatorTipo" type="text" placeholder="gasolina, etanol ou diesel" required />
          </label>
          <div class="form-grid">
            <label>Fator emissao
              <input id="adminFatorEmissao" type="number" min="0.000001" step="0.000001" required />
            </label>
            <label>Consumo marcha lenta
              <input id="adminFatorMarcha" type="number" min="0" step="0.000001" required />
            </label>
            <label class="full">Consumo aceleracao
              <input id="adminFatorAceleracao" type="number" min="0" step="0.000001" required />
            </label>
          </div>
          <div class="form-actions">
            <button id="adminFatorSubmit" type="submit">Salvar fator</button>
            <button id="adminFatorCancel" class="btn-ghost hidden" type="button">Cancelar</button>
          </div>
        </form>
        ${fatores.length ? `
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Combustivel</th><th>Fator</th><th>Marcha lenta</th><th>Aceleracao</th><th>Acoes</th></tr></thead>
              <tbody>
                ${fatores.map((fator) => {
                  const tipo = field(fator, "tipoCombustivel");
                  return `
                    <tr>
                      <td>${labelCombustivel(tipo)}</td>
                      <td>${formatNumber(field(fator, "fatorEmissao"), 6)}</td>
                      <td>${formatNumber(field(fator, "consumoMarchaLenta"), 6)}</td>
                      <td>${formatNumber(field(fator, "consumoAdicionalAceleracao"), 6)}</td>
                      <td>
                        <div class="item-actions">
                          <button class="btn-secondary btn-small" type="button"
                            data-admin="edit-fator"
                            data-tipo="${escapeHtml(tipo)}"
                            data-emissao="${field(fator, "fatorEmissao")}"
                            data-marcha="${field(fator, "consumoMarchaLenta")}"
                            data-aceleracao="${field(fator, "consumoAdicionalAceleracao")}">Editar</button>
                          <button class="btn-danger btn-small" type="button" data-admin="delete-fator" data-tipo="${escapeHtml(tipo)}">Remover</button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        ` : `<div class="empty">Nenhum fator cadastrado.</div>`}
      </div>
    </article>
  `;
}

function adminParametrosHtml(parametros) {
  return `
    <article class="card admin-card">
      <h2>Parametros de cenario sem tag</h2>
      <div id="adminParametroMessage" class="notice error hidden"></div>
      <div class="section-split">
        <form id="adminParametroForm">
          <input id="adminParametroOriginal" type="hidden" />
          <label>Tipo de local
            <select id="adminParametroTipo" required>
              <option value="pedagio">Pedagio</option>
              <option value="estacionamento">Estacionamento</option>
            </select>
          </label>
          <div class="form-grid">
            <label>Fila media (min)
              <input id="adminParametroFila" type="number" min="0" max="240" step="1" required />
            </label>
            <label>Espera cabine (s)
              <input id="adminParametroEspera" type="number" min="0" max="3600" step="1" required />
            </label>
            <label class="full">Emissao ticket papel (kg)
              <input id="adminParametroTicket" type="number" min="0" step="0.000001" required />
            </label>
          </div>
          <div class="form-actions">
            <button id="adminParametroSubmit" type="submit">Salvar parametro</button>
            <button id="adminParametroCancel" class="btn-ghost hidden" type="button">Cancelar</button>
          </div>
        </form>
        ${parametros.length ? `
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Tipo</th><th>Fila</th><th>Espera</th><th>Ticket</th><th>Acoes</th></tr></thead>
              <tbody>
                ${parametros.map((parametro) => {
                  const tipo = field(parametro, "tipoLocal");
                  return `
                    <tr>
                      <td><span class="pill">${labelLocal(tipo)}</span></td>
                      <td>${field(parametro, "tempoMedioFilaMinutos", 0)} min</td>
                      <td>${field(parametro, "tempoEsperaCabineSegundos", 0)} s</td>
                      <td>${formatKg(field(parametro, "emissaoTicketPapelKg"), 6)}</td>
                      <td>
                        <div class="item-actions">
                          <button class="btn-secondary btn-small" type="button"
                            data-admin="edit-parametro"
                            data-tipo="${escapeHtml(tipo)}"
                            data-fila="${field(parametro, "tempoMedioFilaMinutos", 0)}"
                            data-espera="${field(parametro, "tempoEsperaCabineSegundos", 0)}"
                            data-ticket="${field(parametro, "emissaoTicketPapelKg", 0)}">Editar</button>
                          <button class="btn-danger btn-small" type="button" data-admin="delete-parametro" data-tipo="${escapeHtml(tipo)}">Remover</button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        ` : `<div class="empty">Nenhum parametro cadastrado.</div>`}
      </div>
    </article>
  `;
}

function bindAdminEvents() {
  bindAdminLocalEvents();
  bindAdminFatorEvents();
  bindAdminParametroEvents();

  document.querySelector(".admin-stack").addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-admin]");
    if (!button) return;

    const action = button.dataset.admin;

    if (action === "edit-local") {
      document.getElementById("adminLocalId").value = button.dataset.id;
      document.getElementById("adminLocalNome").value = button.dataset.nome;
      document.getElementById("adminLocalTipo").value = button.dataset.tipo;
      document.getElementById("adminLocalCancel").classList.remove("hidden");
    }

    if (action === "delete-local" && confirm("Remover este local?")) {
      await adminDelete(button, () => adminExcluirLocal(Number(button.dataset.id)), "Local removido.");
    }

    if (action === "edit-fator") {
      document.getElementById("adminFatorOriginal").value = button.dataset.tipo;
      document.getElementById("adminFatorTipo").value = button.dataset.tipo;
      document.getElementById("adminFatorEmissao").value = button.dataset.emissao;
      document.getElementById("adminFatorMarcha").value = button.dataset.marcha;
      document.getElementById("adminFatorAceleracao").value = button.dataset.aceleracao;
      document.getElementById("adminFatorCancel").classList.remove("hidden");
    }

    if (action === "delete-fator" && confirm("Remover este fator de emissao?")) {
      await adminDelete(button, () => adminExcluirFator(button.dataset.tipo), "Fator removido.");
    }

    if (action === "edit-parametro") {
      document.getElementById("adminParametroOriginal").value = button.dataset.tipo;
      document.getElementById("adminParametroTipo").value = button.dataset.tipo;
      document.getElementById("adminParametroFila").value = button.dataset.fila;
      document.getElementById("adminParametroEspera").value = button.dataset.espera;
      document.getElementById("adminParametroTicket").value = button.dataset.ticket;
      document.getElementById("adminParametroCancel").classList.remove("hidden");
    }

    if (action === "delete-parametro" && confirm("Remover estes parametros?")) {
      await adminDelete(button, () => adminExcluirParametro(button.dataset.tipo), "Parametro removido.");
    }
  });
}

function bindAdminLocalEvents() {
  document.getElementById("adminLocalForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.getElementById("adminLocalSubmit");
    const id = document.getElementById("adminLocalId").value;
    const nome = document.getElementById("adminLocalNome").value.trim();
    const tipo = document.getElementById("adminLocalTipo").value;

    await runWithButton(button, "Salvando...", async () => {
      try {
        if (id) await adminAtualizarLocal(Number(id), nome, tipo);
        else await adminCriarLocal(nome, tipo);
        state.flash = { type: "success", message: "Local salvo." };
        await renderAdmin();
      } catch (error) {
        showInlineMessage("adminLocalMessage", "error", error.message);
      }
    });
  });

  document.getElementById("adminLocalCancel").addEventListener("click", () => {
    document.getElementById("adminLocalForm").reset();
    document.getElementById("adminLocalId").value = "";
    document.getElementById("adminLocalCancel").classList.add("hidden");
  });
}

function bindAdminFatorEvents() {
  document.getElementById("adminFatorForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.getElementById("adminFatorSubmit");
    const tipoOriginal = document.getElementById("adminFatorOriginal").value;
    const payload = {
      tipoCombustivel: document.getElementById("adminFatorTipo").value.trim(),
      fatorEmissao: Number(document.getElementById("adminFatorEmissao").value),
      consumoMarchaLenta: Number(document.getElementById("adminFatorMarcha").value),
      consumoAdicionalAceleracao: Number(document.getElementById("adminFatorAceleracao").value),
    };

    await runWithButton(button, "Salvando...", async () => {
      try {
        await adminSalvarFator(tipoOriginal, payload);
        state.flash = { type: "success", message: "Fator salvo." };
        await renderAdmin();
      } catch (error) {
        showInlineMessage("adminFatorMessage", "error", error.message);
      }
    });
  });

  document.getElementById("adminFatorCancel").addEventListener("click", () => {
    document.getElementById("adminFatorForm").reset();
    document.getElementById("adminFatorOriginal").value = "";
    document.getElementById("adminFatorCancel").classList.add("hidden");
  });
}

function bindAdminParametroEvents() {
  document.getElementById("adminParametroForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.getElementById("adminParametroSubmit");
    const tipoOriginal = document.getElementById("adminParametroOriginal").value;
    const payload = {
      tipoLocal: document.getElementById("adminParametroTipo").value,
      tempoMedioFilaMinutos: Number(document.getElementById("adminParametroFila").value),
      tempoEsperaCabineSegundos: Number(document.getElementById("adminParametroEspera").value),
      emissaoTicketPapelKg: Number(document.getElementById("adminParametroTicket").value),
    };

    await runWithButton(button, "Salvando...", async () => {
      try {
        await adminSalvarParametro(tipoOriginal, payload);
        state.flash = { type: "success", message: "Parametro salvo." };
        await renderAdmin();
      } catch (error) {
        showInlineMessage("adminParametroMessage", "error", error.message);
      }
    });
  });

  document.getElementById("adminParametroCancel").addEventListener("click", () => {
    document.getElementById("adminParametroForm").reset();
    document.getElementById("adminParametroOriginal").value = "";
    document.getElementById("adminParametroCancel").classList.add("hidden");
  });
}

async function adminDelete(button, action, successMessage) {
  await runWithButton(button, "Removendo...", async () => {
    try {
      await action();
      state.flash = { type: "success", message: successMessage };
      await renderAdmin();
    } catch (error) {
      state.flash = { type: "error", message: error.message };
      await renderAdmin();
    }
  });
}

function renderSobre() {
  setApp(`
    ${pageTitle("Sobre o EcoTag", "Uma aplicacao para demonstrar impacto ambiental evitado por uso de tag automatica.")}
    <section class="about-bands">
      <article class="about-band">
        <div class="about-text">
          <h2>O que o sistema calcula</h2>
          <p>
            O EcoTag compara a passagem automatica com um cenario sem tag, considerando fila,
            espera em cabine, marcha lenta, aceleracao e emissao associada ao ticket em papel.
          </p>
        </div>
        <div class="about-visual" aria-hidden="true"></div>
      </article>

      <article class="about-band">
        <div class="about-visual" aria-hidden="true"></div>
        <div class="about-text">
          <h2>Como os dados viram experiencia</h2>
          <p>
            Cada passagem alimenta o dashboard, o historico, os pontos sustentaveis,
            os selos e o ranking mensal, criando uma trilha clara do impacto acumulado.
          </p>
        </div>
      </article>
    </section>
  `);
}
