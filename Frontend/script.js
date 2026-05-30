// =============================================
//  script.js — Lógica do Dashboard EcoTag
// =============================================

// Variáveis globais para guardar dados
let meusVeiculos = [];
let meusLocais   = [];

// ——— INICIALIZAÇÃO ———
document.addEventListener("DOMContentLoaded", async function () {
  const token = getToken();

  if (!token) {
    // Não logado: mostra aviso e esconde conteúdo
    document.getElementById("avisoLogin").style.display = "block";
    document.getElementById("headerDeslogado").style.display = "flex";
    document.getElementById("headerLogado").style.display = "none";
    return;
  }

  // Logado: mostra conteúdo
  document.getElementById("avisoLogin").style.display = "none";
  document.getElementById("headerDeslogado").style.display = "none";
  document.getElementById("headerLogado").style.display = "flex";
  document.getElementById("conteudoPrincipal").style.display = "grid";

  // Carrega tudo em paralelo (mais rápido!)
  await Promise.all([
    carregarDashboard(),
    carregarVeiculos(),
    carregarLocais(),
    carregarGamificacao(),
    carregarRanking(),
    carregarPassagens(),
  ]);
});

// ——— DASHBOARD ———
async function carregarDashboard() {
  try {
    const data = await getDashboard();
    if (!data) return;

    document.getElementById("dashboardConteudo").innerHTML = `
      <div class="dashboard-grid">
        <div class="dash-item">
          <span class="dash-valor">${data.mesAtualKg?.toFixed(2) ?? "0.00"} kg</span>
          <span class="dash-label">CO₂ este mês</span>
        </div>
        <div class="dash-item">
          <span class="dash-valor">${data.anoAtualKg?.toFixed(2) ?? "0.00"} kg</span>
          <span class="dash-label">CO₂ este ano</span>
        </div>
        <div class="dash-item">
          <span class="dash-valor">${data.totalHistoricoKg?.toFixed(2) ?? "0.00"} kg</span>
          <span class="dash-label">Total histórico</span>
        </div>
        <div class="dash-item">
          <span class="dash-valor">${data.totalPassagens ?? 0}</span>
          <span class="dash-label">Passagens</span>
        </div>
        <div class="dash-item destaque-pts">
          <span class="dash-valor">⭐ ${data.pontosSustentaveis ?? 0}</span>
          <span class="dash-label">Pontos sustentáveis</span>
        </div>
      </div>
    `;
  } catch (err) {
    document.getElementById("dashboardConteudo").innerHTML =
      `<p class="msg-erro">Erro ao carregar dashboard.</p>`;
  }
}

// ——— VEÍCULOS ———
async function carregarVeiculos() {
  try {
    meusVeiculos = await listarVeiculos();
    renderizarVeiculos();
    preencherSelectVeiculos();
  } catch (err) {
    document.getElementById("vehicleList").innerHTML =
      `<li class="msg-erro">Erro ao carregar veículos.</li>`;
  }
}

function renderizarVeiculos() {
  const lista = document.getElementById("vehicleList");

  if (meusVeiculos.length === 0) {
    lista.innerHTML = `<li style="color:#888;">Nenhum veículo cadastrado.</li>`;
    return;
  }

  lista.innerHTML = meusVeiculos.map(v => `
    <li>
      <span>
        ${iconeVeiculo(v.tipoVeiculo)} ${v.tipoVeiculo} — ${v.tipoCombustivel}
      </span>
      <button class="btn-remover" onclick="removerVeiculoUI(${v.id})">Remover</button>
    </li>
  `).join("");
}

function iconeVeiculo(tipo) {
  const icones = { carro: "🚗", moto: "🏍️", caminhao: "🚚" };
  return icones[tipo] || "🚗";
}

function preencherSelectVeiculos() {
  const selects = ["veiculoPassagem", "veiculoSimulador"];
  selects.forEach(id => {
    const sel = document.getElementById(id);
    const valorAtual = sel.value;
    sel.innerHTML = `<option value="">Selecione o veículo</option>`;
    meusVeiculos.forEach(v => {
      sel.innerHTML += `<option value="${v.id}">${iconeVeiculo(v.tipoVeiculo)} ${v.tipoVeiculo} (${v.tipoCombustivel})</option>`;
    });
    sel.value = valorAtual;
  });
}

async function adicionarVeiculoUI() {
  const tipo        = document.getElementById("category").value;
  const combustivel = document.getElementById("fuel").value;
  const btn         = document.getElementById("btnAdicionarVeiculo");
  const erroEl      = document.getElementById("erroVeiculo");

  btn.textContent = "Adicionando...";
  btn.disabled = true;
  erroEl.style.display = "none";

  try {
    await adicionarVeiculo(tipo, combustivel);
    await carregarVeiculos(); // atualiza a lista
    btn.textContent = "✅ Adicionado!";
    setTimeout(() => { btn.textContent = "Adicionar"; btn.disabled = false; }, 2000);
  } catch (err) {
    erroEl.textContent = err.message;
    erroEl.style.display = "block";
    btn.textContent = "Adicionar";
    btn.disabled = false;
  }
}

async function removerVeiculoUI(id) {
  if (!confirm("Remover este veículo?")) return;
  try {
    await deletarVeiculo(id);
    await carregarVeiculos(); // atualiza
  } catch (err) {
    alert("Erro ao remover: " + err.message);
  }
}

// ——— LOCAIS ———
async function carregarLocais() {
  try {
    meusLocais = await listarLocais();
    preencherSelectLocais();
  } catch (err) {
    // silencioso — locais podem não estar disponíveis
  }
}

function preencherSelectLocais() {
  const selects = ["localPassagem", "localSimulador"];
  selects.forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = `<option value="">Selecione o local</option>`;
    meusLocais.forEach(l => {
      const icone = l.tipoLocal === "pedagio" ? "🛣️" : "🅿️";
      sel.innerHTML += `<option value="${l.id}">${icone} ${l.nome ?? l.tipoLocal}</option>`;
    });
  });
}

// ——— PASSAGEM ———
async function registrarPassagemUI() {
  const veiculoId = document.getElementById("veiculoPassagem").value;
  const localId   = document.getElementById("localPassagem").value;
  const erroEl    = document.getElementById("erroPassagem");
  const sucessoEl = document.getElementById("resultadoPassagem");

  erroEl.style.display = "none";
  sucessoEl.style.display = "none";

  if (!veiculoId || !localId) {
    erroEl.textContent = "Selecione o veículo e o local.";
    erroEl.style.display = "block";
    return;
  }

  try {
    const resultado = await registrarPassagem(Number(veiculoId), Number(localId));
    sucessoEl.innerHTML = `
      ✅ Passagem registrada!
      CO₂ evitado: <strong>${resultado.co2eEvitadoKg?.toFixed(3)} kg</strong>
    `;
    sucessoEl.style.display = "block";
    // Atualiza dashboard e gamificação após registrar passagem
    await Promise.all([carregarDashboard(), carregarGamificacao(), carregarPassagens()]);
  } catch (err) {
    erroEl.textContent = err.message;
    erroEl.style.display = "block";
  }
}

// ——— SIMULADOR ———
async function simularUI() {
  const veiculoId      = document.getElementById("veiculoSimulador").value;
  const localId        = document.getElementById("localSimulador").value;
  const dias           = Number(document.getElementById("dias").value);
  const passagensDia   = Number(document.getElementById("passagensDia").value);
  const erroEl         = document.getElementById("erroSimulador");
  const resultadoEl    = document.getElementById("resultadoSimulador");

  erroEl.style.display = "none";
  resultadoEl.style.display = "none";

  if (!veiculoId || !localId) {
    erroEl.textContent = "Selecione veículo e local.";
    erroEl.style.display = "block";
    return;
  }

  try {
    const data = await simular(Number(veiculoId), Number(localId), dias, passagensDia);
    resultadoEl.innerHTML = `
      <div class="simulador-resultado">
        <p>🌿 <strong>${data.co2eEvitadoTotalKg?.toFixed(3)} kg</strong> de CO₂ evitado</p>
        <p>📅 ${dias} dias × ${passagensDia} passagens/dia</p>
      </div>
    `;
    resultadoEl.style.display = "block";
  } catch (err) {
    erroEl.textContent = err.message;
    erroEl.style.display = "block";
  }
}

// ——— GAMIFICAÇÃO ———
async function carregarGamificacao() {
  try {
    const data = await getGamificacao();
    if (!data) return;

    const selosHTML = data.selos && data.selos.length > 0
      ? data.selos.map(s => `<span class="selo">${s.nome}</span>`).join("")
      : `<span style="color:#888;">Nenhum selo ainda. Continue usando a tag!</span>`;

    document.getElementById("gamificacaoConteudo").innerHTML = `
      <p><strong>⭐ Pontos:</strong> ${data.pontosSustentaveis ?? 0}</p>
      <p style="margin-top:10px;"><strong>🏅 Selos desbloqueados:</strong></p>
      <div class="selos-lista">${selosHTML}</div>
    `;
  } catch (err) {
    document.getElementById("gamificacaoConteudo").innerHTML =
      `<p class="msg-erro">Erro ao carregar gamificação.</p>`;
  }
}

// ——— RANKING ———
async function carregarRanking() {
  try {
    const data = await getRanking("mensal", 10);
    if (!data || !data.itens) {
      document.getElementById("rankingConteudo").innerHTML =
        `<p style="color:#888;">Ranking indisponível.</p>`;
      return;
    }

    if (data.itens.length === 0) {
      document.getElementById("rankingConteudo").innerHTML =
        `<p style="color:#888;">Nenhum dado no ranking ainda.</p>`;
      return;
    }

    const medalhas = ["🥇", "🥈", "🥉"];
    document.getElementById("rankingConteudo").innerHTML = `
      <ol class="ranking-lista">
        ${data.itens.map((item, i) => `
          <li class="ranking-item">
            <span class="ranking-pos">${medalhas[i] ?? (i + 1) + "º"}</span>
            <span class="ranking-nome">${item.nomeUsuario ?? "Usuário"}</span>
            <span class="ranking-pts">${item.pontosSustentaveis ?? 0} pts</span>
          </li>
        `).join("")}
      </ol>
    `;
  } catch (err) {
    document.getElementById("rankingConteudo").innerHTML =
      `<p class="msg-erro">Erro ao carregar ranking.</p>`;
  }
}

// ——— PASSAGENS RECENTES ———
async function carregarPassagens() {
  try {
    const lista = await listarPassagens();
    const ul = document.getElementById("passagensLista");

    if (!lista || lista.length === 0) {
      ul.innerHTML = `<li style="color:#888;">Nenhuma passagem registrada.</li>`;
      return;
    }

    // Mostra as 5 mais recentes
    const recentes = lista.slice(0, 5);
    ul.innerHTML = recentes.map(p => {
      const data = p.dataHora ? new Date(p.dataHora).toLocaleString("pt-BR") : "–";
      const icone = p.tipoLocal === "pedagio" ? "🛣️" : "🅿️";
      return `
        <li>
          <span>${icone} ${p.tipoVeiculo ?? "veículo"} — ${p.co2eEvitadoKg?.toFixed(3)} kg evitado</span>
          <small style="color:#888;">${data}</small>
        </li>
      `;
    }).join("");
  } catch (err) {
    document.getElementById("passagensLista").innerHTML =
      `<li class="msg-erro">Erro ao carregar passagens.</li>`;
  }
}
