const state = {
  user: null,
  flash: null,
};

const routes = {
  "/login": { public: true, render: renderLogin },
  "/cadastro": { public: true, render: renderCadastro },
  "/dashboard": { protected: true, user: true, render: renderDashboard },
  "/veiculos": { protected: true, user: true, render: renderVeiculos },
  "/passagens": { protected: true, user: true, render: renderPassagens },
  "/simulador": { protected: true, user: true, render: renderSimulador },
  "/ranking": { protected: true, user: true, render: renderRanking },
  "/perfil": { protected: true, user: true, render: renderPerfil },
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
    window.history.replaceState(null, "", getToken() ? `#${defaultRouteForSession()}` : "#/login");
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
      ${pageTitle("Tela não encontrada", "A rota solicitada não existe no EcoTag.")}
      <div class="notice warning">Volte para o dashboard ou escolha uma opção no menu.</div>
    `);
    return;
  }

  if (routeConfig.protected && !getToken()) {
    state.flash = { type: "warning", message: "Entre para acessar esta tela." };
    navigate("/login");
    return;
  }

  if (getToken() && isAdmin() && route !== "/admin") {
    state.flash = { type: "warning", message: "Administradores acessam apenas a área administrativa." };
    navigate("/admin");
    return;
  }

  if (routeConfig.admin && !isAdmin()) {
    renderHeader(route);
    setApp(`
      ${pageTitle("Acesso administrativo", "Esta área é liberada apenas para usuários administradores.")}
      <div class="notice warning">Sua conta atual não possui permissão para alterar premissas ambientais.</div>
    `);
    return;
  }

  renderHeader(route);
  setApp(`<div class="loader">Carregando...</div>`);

  try {
    await routeConfig.render();
  } catch (error) {
    if (error.status === 401) {
      state.flash = { type: "warning", message: "Sua sessão expirou. Entre novamente." };
      navigate("/login");
      return;
    }

    setApp(`
      ${pageTitle("Algo saiu do esperado", "Não foi possível carregar esta tela agora.")}
      <div class="notice error">${escapeHtml(error.message || "Erro inesperado.")}</div>
    `);
  }
}

function renderHeader(activeRoute = getRoute()) {
  const header = document.getElementById("appHeader");
  const logged = Boolean(getToken());
  const user = state.user || getUsuario();

  const navItems = logged
    ? isAdmin()
      ? [
          ["/admin", "Admin"],
        ]
      : [
        ["/dashboard", "Dashboard"],
        ["/veiculos", "Veículos"],
        ["/passagens", "Passagens"],
        ["/simulador", "Simulador"],
        ["/ranking", "Ranking"],
        ["/perfil", "Perfil"],
        ["/sobre", "Sobre"],
      ]
    : [
        ["/login", "Login"],
        ["/cadastro", "Cadastro"],
        ["/sobre", "Sobre"],
      ];

  header.innerHTML = `
    <a class="brand" href="#${logged ? defaultRouteForSession() : "/login"}">
      <span class="brand-mark">ET</span>
      <span>EcoTag</span>
    </a>
    <nav class="nav" aria-label="Navegação principal">
      ${navItems.map(([href, label]) => `
        <a href="#${href}" class="${activeRoute === href ? "active" : ""}">${label}</a>
      `).join("")}
    </nav>
    <div class="actions">
      ${logged ? `
        <span class="hello">Olá, ${escapeHtml(field(user, "nome", "usuário"))}</span>
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

function defaultRouteForSession() {
  return isAdmin() ? "/admin" : "/dashboard";
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
    caminhao: "Caminhão",
  }[tipo] || tipo || "Veículo";
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
    pedagio: "Pedágio",
    estacionamento: "Estacionamento",
  }[tipo] || tipo || "Local";
}

function vehicleOptions(veiculos) {
  return veiculos.map((veiculo) => `
    <option value="${field(veiculo, "id")}">
      ${escapeHtml(vehicleSummary(veiculo))}
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

function vehicleName(veiculo) {
  return field(veiculo, "nome") || labelVeiculo(field(veiculo, "tipoVeiculo"));
}

function vehicleSummary(veiculo) {
  return `${vehicleName(veiculo)} - ${labelVeiculo(field(veiculo, "tipoVeiculo"))} / ${labelCombustivel(field(veiculo, "tipoCombustivel"))}`;
}

function passagemVehicleName(passagem) {
  return field(passagem, "veiculoNome") || labelVeiculo(field(passagem, "tipoVeiculo"));
}

function authIntro() {
  return `
    <aside class="auth-panel">
      <h1>Mobilidade com impacto visivel.</h1>
      <p>
        O EcoTag calcula quanto CO₂e você evita usando passagem automática,
        organiza seu histórico e transforma os resultados em pontos e selos.
      </p>
      <div class="auth-stats">
        <div class="auth-stat"><strong>CO₂e</strong><span>Indicadores</span></div>
        <div class="auth-stat"><strong>Tags</strong><span>Passagens</span></div>
        <div class="auth-stat"><strong>Ranking</strong><span>Mensal</span></div>
      </div>
    </aside>
  `;
}

function renderLogin() {
  if (getToken()) {
    navigate(defaultRouteForSession());
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
          Ainda não tem conta? <a href="#/cadastro">Crie uma agora</a>.
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
        navigate(defaultRouteForSession());
      } catch (error) {
        showInlineMessage("loginMessage", "error", error.message || "E-mail ou senha invalidos.");
      }
    });
  });
}

function renderCadastro() {
  if (getToken()) {
    navigate(defaultRouteForSession());
    return;
  }

  setApp(`
    ${consumeFlash()}
    <section class="auth-page">
      ${authIntro()}
      <div class="auth-card">
        <h2>Criar conta</h2>
        <p>Cadastre-se para salvar veículos, passagens e simulações.</p>
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
        showInlineMessage("cadastroMessage", "error", error.message || "Não foi possível criar a conta.");
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
  const selosDesbloqueados = selos.filter((selo) => field(selo, "desbloqueado", false) === true);

  setApp(`
    ${consumeFlash()}
    ${pageTitle("Dashboard", "Acompanhe os principais indicadores de uso da EcoTag.")}

    <section class="metric-grid">
      <div class="metric-card accent"><strong>${formatKg(field(dashboard, "mesAtualKg"))}</strong><span>CO₂e este mês</span></div>
      <div class="metric-card"><strong>${formatKg(field(dashboard, "anoAtualKg"))}</strong><span>CO₂e este ano</span></div>
      <div class="metric-card"><strong>${formatKg(field(dashboard, "totalHistoricoKg"))}</strong><span>Total histórico</span></div>
      <div class="metric-card"><strong>${field(dashboard, "totalPassagens", 0)}</strong><span>Passagens</span></div>
      <div class="metric-card"><strong>${field(dashboard, "pontosSustentaveis", 0)}</strong><span>Pontos sustentáveis</span></div>
    </section>

    <section class="grid">
      <article class="card span-6">
        <h2>Selos desbloqueados</h2>
        ${selosDesbloqueados.length ? `
          <div class="tag-list">
            ${selosDesbloqueados.map((selo) => `<span class="tag">${escapeHtml(field(selo, "nome"))}</span>`).join("")}
          </div>
        ` : `<div class="empty">Nenhum selo liberado ainda.</div>`}
      </article>

      <article class="card span-6">
        <h2>Resumo da conta</h2>
        <ul class="list">
          <li class="list-item">
            <div class="list-main"><strong>${veiculos.length}</strong><span>Veículos cadastrados</span></div>
            <a class="btn btn-secondary btn-small" href="#/veiculos">Gerenciar</a>
          </li>
          <li class="list-item">
            <div class="list-main"><strong>${recentes.length}</strong><span>Passagens recentes exibidas</span></div>
            <a class="btn btn-secondary btn-small" href="#/passagens">Ver histórico</a>
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
    ${pageTitle("Veículos", "Cadastre e mantenha os veículos usados nas passagens com tag.")}
    <section class="section-split">
      <article class="card">
        <h2 id="vehicleFormTitle">Adicionar veículo</h2>
        <div id="vehicleMessage" class="notice error hidden"></div>
        <form id="vehicleForm">
          <input id="vehicleId" type="hidden" />
          <label for="vehicleNome">Nome do veículo</label>
          <input id="vehicleNome" type="text" maxlength="100" placeholder="Ex.: Volkswagen Gol, Honda Biz" required />

          <label for="vehicleTipo">Tipo de veículo</label>
          <select id="vehicleTipo" required>
            <option value="carro">Carro</option>
            <option value="moto">Moto</option>
            <option value="caminhao">Caminhão</option>
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
        <h2>Seus veículos</h2>
        ${veiculos.length ? vehicleListHtml(veiculos) : `<div class="empty">Nenhum veículo cadastrado.</div>`}
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
        const nome = field(veiculo, "nome");
        const tipo = field(veiculo, "tipoVeiculo");
        const fuel = field(veiculo, "tipoCombustivel");
        return `
          <li class="list-item">
            <div class="list-main">
              <strong>${escapeHtml(vehicleName(veiculo))}</strong>
              <span>${labelVeiculo(tipo)} / ${labelCombustivel(fuel)}</span>
            </div>
            <div class="item-actions">
              <button class="btn-secondary btn-small" type="button" data-action="edit" data-id="${id}" data-nome="${escapeHtml(nome)}" data-tipo="${escapeHtml(tipo)}" data-fuel="${escapeHtml(fuel)}">Editar</button>
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
    const nome = document.getElementById("vehicleNome").value.trim();
    const tipo = document.getElementById("vehicleTipo").value;
    const fuel = document.getElementById("vehicleFuel").value;

    await runWithButton(button, "Salvando...", async () => {
      try {
        if (id) {
          await atualizarVeiculo(Number(id), nome, tipo, fuel);
          state.flash = { type: "success", message: "Veículo atualizado." };
        } else {
          await adicionarVeiculo(nome, tipo, fuel);
          state.flash = { type: "success", message: "Veículo adicionado." };
        }
        await renderVeiculos();
      } catch (error) {
        showInlineMessage("vehicleMessage", "error", error.message);
      }
    });
  });

  cancel.addEventListener("click", () => {
    document.getElementById("vehicleId").value = "";
    document.getElementById("vehicleFormTitle").textContent = "Adicionar veículo";
    document.getElementById("vehicleSubmit").textContent = "Adicionar";
    cancel.classList.add("hidden");
    form.reset();
  });

  document.getElementById("vehicleList")?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    if (button.dataset.action === "edit") {
      document.getElementById("vehicleId").value = button.dataset.id;
      document.getElementById("vehicleNome").value = button.dataset.nome;
      document.getElementById("vehicleTipo").value = button.dataset.tipo;
      document.getElementById("vehicleFuel").value = button.dataset.fuel;
      document.getElementById("vehicleFormTitle").textContent = "Editar veículo";
      document.getElementById("vehicleSubmit").textContent = "Salvar";
      cancel.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (button.dataset.action === "delete" && confirm("Remover este veículo?")) {
      await runWithButton(button, "Removendo...", async () => {
        try {
          await deletarVeiculo(Number(button.dataset.id));
          state.flash = { type: "success", message: "Veículo removido." };
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
    ${pageTitle("Passagens", "Registre usos reais de tag e consulte o histórico calculado pelo backend.")}
    ${formDisabled ? `<div class="notice warning">Cadastre um veículo e confirme que existem locais disponíveis antes de registrar passagens.</div>` : ""}
    <section class="grid">
      <article class="card span-4">
        <h2>Registrar passagem</h2>
        <div id="passagemMessage" class="notice error hidden"></div>
        <form id="passagemForm">
          <label for="passagemVeiculo">Veículo</label>
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
        <h2>Histórico</h2>
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
          message: `Passagem registrada. CO₂e evitado: ${formatKg(field(resultado, "co2EvitadoKg"), 3)}.`,
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
            <th>Veículo</th>
            <th>Local</th>
            <th>CO₂e evitado</th>
          </tr>
        </thead>
        <tbody>
          ${passagens.map((passagem) => `
            <tr>
              <td>${formatDate(field(passagem, "dataHora"))}</td>
              <td>${escapeHtml(passagemVehicleName(passagem))} <span class="pill">${labelVeiculo(field(passagem, "tipoVeiculo"))} / ${labelCombustivel(field(passagem, "tipoCombustivel"))}</span></td>
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
            <span>${escapeHtml(passagemVehicleName(passagem))} - ${formatDate(field(passagem, "dataHora"))}</span>
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
    ${pageTitle("Simulador", "Estime o impacto de uma rotina de passagens sem alterar o histórico.")}
    ${formDisabled ? `<div class="notice warning">Cadastre um veículo e use um local disponível para simular.</div>` : ""}
    <section class="grid">
      <article class="card span-6">
        <h2>Cenário</h2>
        <div id="simuladorMessage" class="notice error hidden"></div>
        <form id="simuladorForm">
          <div class="form-grid">
            <label>Veículo
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
        <div id="simuladorResultado" class="empty">Preencha o cenário para ver a estimativa.</div>
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
    ${pageTitle("Ranking mensal", "Compare os pontos sustentáveis acumulados no mês atual.")}
    <article class="card span-12">
      ${itens.length ? rankingTableHtml(itens) : `<div class="empty">Ainda não há dados suficientes para o ranking.</div>`}
    </article>
  `);
}

function rankingListHtml(itens) {
  return `
    <ul class="list">
      ${itens.map((item, index) => `
        <li class="list-item">
          <div class="list-main">
            <strong>${index + 1}. ${escapeHtml(field(item, "nome", "Usuário"))}</strong>
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
            <th>Posição</th>
            <th>Usuário</th>
            <th>CO₂e evitado</th>
            <th>Pontos</th>
          </tr>
        </thead>
        <tbody>
          ${itens.map((item, index) => `
            <tr>
              <td class="rank-pos">${index + 1}</td>
              <td>${escapeHtml(field(item, "nome", "Usuário"))}</td>
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
            <div class="list-main"><strong>${escapeHtml(field(user, "role", "user"))}</strong><span>Perfil de permissão</span></div>
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
  const [usuarios, locais, fatores, parametros] = await Promise.all([
    adminListarUsuarios(),
    adminListarLocais(),
    adminListarFatores(),
    adminListarParametros(),
  ]);

  setApp(`
    ${consumeFlash()}
    ${pageTitle("Administração", "Mantenha usuários, locais de uso e premissas ambientais usadas nos cálculos.")}
    <section class="admin-stack">
      ${adminUsuariosHtml(usuarios)}
      ${adminLocaisHtml(locais)}
      ${adminFatoresHtml(fatores)}
      ${adminParametrosHtml(parametros)}
    </section>
  `);

  bindAdminEvents();
}

function adminUsuariosHtml(usuarios) {
  const currentUserId = Number(field(state.user || getUsuario(), "id", 0));

  return `
    <article class="card admin-card">
      <h2>Usuários</h2>
      <p class="muted">Edite nome e e-mail de usuários comuns. Excluir um usuário remove também veículos e passagens ligados a ele.</p>
      <div id="adminUserMessage" class="notice error hidden"></div>
      ${usuarios.length ? `
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Criado em</th><th>Ações</th></tr></thead>
            <tbody>
              ${usuarios.map((usuario) => {
                const id = Number(field(usuario, "id"));
                const isCurrent = id === currentUserId;
                const nome = field(usuario, "nome", "Usuário");
                const email = field(usuario, "email", "-");
                const role = String(field(usuario, "role", "user")).toLowerCase();
                const canEdit = role === "user";
                return `
                  <tr>
                    <td>${escapeHtml(nome)}</td>
                    <td>${escapeHtml(email)}</td>
                    <td><span class="pill ${role === "admin" ? "pill-blue" : ""}">${escapeHtml(role)}</span></td>
                    <td>${formatDate(field(usuario, "createdAt"))}</td>
                    <td>
                      <div class="item-actions">
                        ${canEdit ? `
                          <button class="btn-secondary btn-small" type="button" data-admin="edit-user" data-id="${id}" data-nome="${escapeHtml(nome)}" data-email="${escapeHtml(email)}">Editar</button>
                        ` : ""}
                        ${isCurrent ? `
                          <span class="pill">Usuário atual</span>
                        ` : `
                          <button class="btn-danger btn-small" type="button" data-admin="delete-user" data-id="${id}" data-nome="${escapeHtml(nome)}">Excluir</button>
                        `}
                      </div>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      ` : `<div class="empty">Nenhum usuário cadastrado.</div>`}
      <form id="adminUserForm" class="admin-edit-panel hidden">
        <input id="adminUserId" type="hidden" />
        <label>Nome
          <input id="adminUserNome" type="text" maxlength="100" required />
        </label>
        <label>E-mail
          <input id="adminUserEmail" type="email" maxlength="150" required />
        </label>
        <div class="form-actions">
          <button id="adminUserSubmit" type="submit">Salvar usuário</button>
          <button id="adminUserCancel" class="btn-ghost" type="button">Cancelar</button>
        </div>
      </form>
    </article>
  `;
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
              <option value="pedagio">Pedágio</option>
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
              <thead><tr><th>Nome</th><th>Tipo</th><th>Ações</th></tr></thead>
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
      <h2>Fatores de emissão</h2>
      <div id="adminFatorMessage" class="notice error hidden"></div>
      <p class="muted">Gasolina, etanol e diesel são premissas fixas do cálculo. Edite apenas os valores.</p>
      ${fatores.length ? `
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Combustível</th><th>Fator</th><th>Marcha lenta</th><th>Aceleração</th><th>Editar</th></tr></thead>
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
                      </div>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      ` : `<div class="empty">Nenhum fator cadastrado.</div>`}
      <form id="adminFatorForm" class="admin-edit-panel hidden">
        <input id="adminFatorOriginal" type="hidden" />
        <label>Combustível
          <input id="adminFatorTipo" type="text" readonly required />
        </label>
        <div class="form-grid">
          <label>Fator emissão
            <input id="adminFatorEmissao" type="number" min="0.000001" step="0.000001" required />
          </label>
          <label>Consumo marcha lenta
            <input id="adminFatorMarcha" type="number" min="0" step="0.000001" required />
          </label>
          <label class="full">Consumo aceleração
            <input id="adminFatorAceleracao" type="number" min="0" step="0.000001" required />
          </label>
        </div>
        <div class="form-actions">
          <button id="adminFatorSubmit" type="submit">Salvar alterações</button>
          <button id="adminFatorCancel" class="btn-ghost" type="button">Cancelar</button>
        </div>
      </form>
    </article>
  `;
}

function adminParametrosHtml(parametros) {
  return `
    <article class="card admin-card">
      <h2>Parâmetros de cenário sem tag</h2>
      <div id="adminParametroMessage" class="notice error hidden"></div>
      <p class="muted">Pedágio e estacionamento são os cenários fixos do comparativo. Edite somente fila, espera e ticket.</p>
      ${parametros.length ? `
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Tipo</th><th>Fila</th><th>Espera</th><th>Ticket</th><th>Editar</th></tr></thead>
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
                      </div>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      ` : `<div class="empty">Nenhum parâmetro cadastrado.</div>`}
      <form id="adminParametroForm" class="admin-edit-panel hidden">
        <input id="adminParametroOriginal" type="hidden" />
        <label>Tipo de local
          <select id="adminParametroTipo" disabled required>
            <option value="pedagio">Pedágio</option>
            <option value="estacionamento">Estacionamento</option>
          </select>
        </label>
        <div class="form-grid">
          <label>Fila média (min)
            <input id="adminParametroFila" type="number" min="0" max="240" step="1" required />
          </label>
          <label>Espera cabine (s)
            <input id="adminParametroEspera" type="number" min="0" max="3600" step="1" required />
          </label>
          <label class="full">Emissão ticket papel (kg)
            <input id="adminParametroTicket" type="number" min="0" step="0.000001" required />
          </label>
        </div>
        <div class="form-actions">
          <button id="adminParametroSubmit" type="submit">Salvar alterações</button>
          <button id="adminParametroCancel" class="btn-ghost" type="button">Cancelar</button>
        </div>
      </form>
    </article>
  `;
}

function bindAdminEvents() {
  bindAdminUserEvents();
  bindAdminLocalEvents();
  bindAdminFatorEvents();
  bindAdminParametroEvents();

  document.querySelector(".admin-stack").addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-admin]");
    if (!button) return;

    const action = button.dataset.admin;

    if (action === "delete-user" && confirm(`Excluir o usuário ${button.dataset.nome}? Todos os veículos e passagens relacionados serão removidos.`)) {
      await adminDelete(button, () => adminExcluirUsuario(Number(button.dataset.id)), "Usuário removido.");
    }

    if (action === "edit-user") {
      const form = document.getElementById("adminUserForm");
      document.getElementById("adminUserId").value = button.dataset.id;
      document.getElementById("adminUserNome").value = button.dataset.nome;
      document.getElementById("adminUserEmail").value = button.dataset.email;
      form.classList.remove("hidden");
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    }

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
      const form = document.getElementById("adminFatorForm");
      document.getElementById("adminFatorOriginal").value = button.dataset.tipo;
      document.getElementById("adminFatorTipo").value = button.dataset.tipo;
      document.getElementById("adminFatorEmissao").value = button.dataset.emissao;
      document.getElementById("adminFatorMarcha").value = button.dataset.marcha;
      document.getElementById("adminFatorAceleracao").value = button.dataset.aceleracao;
      form.classList.remove("hidden");
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (action === "edit-parametro") {
      const form = document.getElementById("adminParametroForm");
      document.getElementById("adminParametroOriginal").value = button.dataset.tipo;
      document.getElementById("adminParametroTipo").value = button.dataset.tipo;
      document.getElementById("adminParametroFila").value = button.dataset.fila;
      document.getElementById("adminParametroEspera").value = button.dataset.espera;
      document.getElementById("adminParametroTicket").value = button.dataset.ticket;
      form.classList.remove("hidden");
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

function bindAdminUserEvents() {
  document.getElementById("adminUserForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.getElementById("adminUserSubmit");
    const id = document.getElementById("adminUserId").value;
    const nome = document.getElementById("adminUserNome").value.trim();
    const email = document.getElementById("adminUserEmail").value.trim();

    if (!id) {
      showInlineMessage("adminUserMessage", "error", "Escolha um usuário comum para editar.");
      return;
    }

    await runWithButton(button, "Salvando...", async () => {
      try {
        await adminAtualizarUsuario(Number(id), nome, email);
        state.flash = { type: "success", message: "Usuário atualizado." };
        await renderAdmin();
      } catch (error) {
        showInlineMessage("adminUserMessage", "error", error.message);
      }
    });
  });

  document.getElementById("adminUserCancel").addEventListener("click", () => {
    const form = document.getElementById("adminUserForm");
    form.reset();
    document.getElementById("adminUserId").value = "";
    form.classList.add("hidden");
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

    if (!tipoOriginal) {
      showInlineMessage("adminFatorMessage", "error", "Escolha um fator para editar.");
      return;
    }

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
    const form = document.getElementById("adminFatorForm");
    form.reset();
    document.getElementById("adminFatorOriginal").value = "";
    form.classList.add("hidden");
  });
}

function bindAdminParametroEvents() {
  document.getElementById("adminParametroForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.getElementById("adminParametroSubmit");
    const tipoOriginal = document.getElementById("adminParametroOriginal").value;

    if (!tipoOriginal) {
      showInlineMessage("adminParametroMessage", "error", "Escolha um parâmetro para editar.");
      return;
    }

    const payload = {
      tipoLocal: document.getElementById("adminParametroTipo").value,
      tempoMedioFilaMinutos: Number(document.getElementById("adminParametroFila").value),
      tempoEsperaCabineSegundos: Number(document.getElementById("adminParametroEspera").value),
      emissaoTicketPapelKg: Number(document.getElementById("adminParametroTicket").value),
    };

    await runWithButton(button, "Salvando...", async () => {
      try {
        await adminSalvarParametro(tipoOriginal, payload);
        state.flash = { type: "success", message: "Parâmetro salvo." };
        await renderAdmin();
      } catch (error) {
        showInlineMessage("adminParametroMessage", "error", error.message);
      }
    });
  });

  document.getElementById("adminParametroCancel").addEventListener("click", () => {
    const form = document.getElementById("adminParametroForm");
    form.reset();
    document.getElementById("adminParametroOriginal").value = "";
    form.classList.add("hidden");
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
    ${pageTitle("Sobre o EcoTag", "Uma aplicação para demonstrar impacto ambiental evitado por uso de tag automática.")}
    <section class="about-bands">
      <article class="about-band">
        <div class="about-text">
          <h2>O que o sistema calcula</h2>
          <p>
            O EcoTag compara a passagem automática com um cenário sem tag, considerando fila,
            espera em cabine, marcha lenta, aceleração e emissão associada ao ticket em papel.
          </p>
        </div>
        <div class="about-visual">
          <div class="about-panel">
            <span class="about-panel-label">Comparação</span>
            <h3>Sem tag x com tag</h3>
            <ul class="about-checklist">
              <li><strong>Fila</strong><span>tempo parado evitado</span></li>
              <li><strong>Cabine</strong><span>espera reduzida</span></li>
              <li><strong>Retomada</strong><span>menos aceleração</span></li>
              <li><strong>Ticket</strong><span>papel não emitido</span></li>
            </ul>
          </div>
        </div>
      </article>

      <article class="about-band">
        <div class="about-visual">
          <div class="about-panel">
            <span class="about-panel-label">Fluxo</span>
            <h3>Da passagem ao ranking</h3>
            <div class="about-flow">
              <span>Passagem</span>
              <span>Cálculo</span>
              <span>Pontos</span>
              <span>Selos</span>
            </div>
          </div>
        </div>
        <div class="about-text">
          <h2>Como os dados viram experiência</h2>
          <p>
            Cada passagem alimenta o dashboard, o histórico, os pontos sustentáveis,
            os selos e o ranking mensal, criando uma trilha clara do impacto acumulado.
          </p>
        </div>
      </article>

      <article class="about-band">
        <div class="about-text">
          <h2>Como o CO₂e é calculado</h2>
          <p>
            O cálculo estima quanto combustível deixaria de ser gasto em uma parada sem tag.
            Primeiro o sistema soma o tempo médio de fila e o tempo de cabine, converte esse
            tempo para horas e calcula os litros evitados em marcha lenta. Depois soma um
            consumo adicional de retomada/aceleração.
          </p>
          <p>
            Fórmula usada: litros evitados = consumo em marcha lenta × tempo parado + consumo
            adicional de aceleração. O resultado em litros é multiplicado pelo fator de emissão
            do combustível e recebe a emissão evitada de ticket em papel.
          </p>
        </div>
        <div class="about-visual">
          <div class="about-panel">
            <span class="about-panel-label">Fórmula</span>
            <h3>CO₂e evitado</h3>
            <div class="about-formula">
              <span>litros evitados</span>
              <strong>×</strong>
              <span>fator do combustível</span>
              <strong>+</strong>
              <span>ticket evitado</span>
            </div>
          </div>
        </div>
      </article>

      <article class="about-band">
        <div class="about-visual">
          <div class="about-panel">
            <span class="about-panel-label">Premissas atuais</span>
            <h3>Fatores iniciais</h3>
            <div class="about-kpis">
              <div><strong>2,31</strong><span>gasolina kg CO₂e/L</span></div>
              <div><strong>1,53</strong><span>etanol kg CO₂e/L</span></div>
              <div><strong>2,68</strong><span>diesel kg CO₂e/L</span></div>
            </div>
          </div>
        </div>
        <div class="about-text">
          <h2>De onde vêm as métricas</h2>
          <p>
            Os fatores iniciais de combustível usam valores de referência de combustão
            compatíveis com bases públicas como EPA, IPCC e GHG Protocol. No MVP, eles foram
            cadastrados como premissas editáveis: gasolina 2,31 kg CO₂e/L, etanol 1,53 kg
            CO₂e/L e diesel 2,68 kg CO₂e/L.
          </p>
          <p>
            As premissas operacionais também são editáveis no painel admin. Hoje o sistema usa
            3 min de fila e 20 s de cabine para pedágio, 2 min de fila e 15 s para
            estacionamento, além de estimativas de marcha lenta, aceleração e ticket em papel.
            Esses números servem para demonstração e não substituem um inventário oficial de
            emissões.
          </p>
          <p>
            Referências: <a href="https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator-calculations-and-references" target="_blank" rel="noopener">EPA</a>,
            <a href="https://www.ipcc-nggip.iges.or.jp/public/2006gl/vol2.html" target="_blank" rel="noopener">IPCC 2006</a> e
            <a href="https://ghgprotocol.org/calculation-tools" target="_blank" rel="noopener">GHG Protocol</a>.
          </p>
        </div>
      </article>
    </section>
  `);
}
