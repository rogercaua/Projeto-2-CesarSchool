// =============================================
//  api.js — Funções para chamar o backend EcoTag
//  Troque BASE_URL pela URL do seu servidor!
// =============================================

const BASE_URL = "http://localhost:5000"; // ← mude se necessário

// Retorna o token salvo no localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Monta o header com autenticação JWT
function authHeader() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// Salva token e redireciona para o dashboard
function salvarTokenEIr(token) {
  localStorage.setItem("token", token);
  window.location.href = "index.html";
}

// Remove o token e vai para o login
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// ——— AUTH ———

async function login(email, senha) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  if (!res.ok) throw new Error("E-mail ou senha inválidos.");
  const data = await res.json();
  return data.token; // backend retorna { token: "..." }
}

async function registrar(nome, email, senha) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Erro ao registrar.");
  }
}

// ——— VEÍCULOS ———

async function listarVeiculos() {
  const res = await fetch(`${BASE_URL}/api/veiculos`, {
    headers: authHeader(),
  });
  if (res.status === 401) { logout(); return []; }
  return res.json();
}

async function adicionarVeiculo(tipoVeiculo, tipoCombustivel) {
  const res = await fetch(`${BASE_URL}/api/veiculos`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ tipoVeiculo, tipoCombustivel }),
  });
  if (!res.ok) throw new Error("Erro ao adicionar veículo.");
  return res.json();
}

async function deletarVeiculo(id) {
  const res = await fetch(`${BASE_URL}/api/veiculos/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Erro ao remover veículo.");
}

// ——— DASHBOARD ———

async function getDashboard() {
  const res = await fetch(`${BASE_URL}/api/dashboard`, {
    headers: authHeader(),
  });
  if (res.status === 401) { logout(); return null; }
  return res.json();
}

// ——— PASSAGENS ———

async function registrarPassagem(veiculoId, localUsoId) {
  const res = await fetch(`${BASE_URL}/api/passagens`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ veiculoId, localUsoId }),
  });
  if (!res.ok) throw new Error("Erro ao registrar passagem.");
  return res.json();
}

async function listarPassagens() {
  const res = await fetch(`${BASE_URL}/api/passagens`, {
    headers: authHeader(),
  });
  if (res.status === 401) { logout(); return []; }
  return res.json();
}

// ——— SIMULADOR ———

async function simular(veiculoId, localUsoId, dias, passagensPorDia) {
  const res = await fetch(`${BASE_URL}/api/simulador`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ veiculoId, localUsoId, dias, passagensPorDia }),
  });
  if (!res.ok) throw new Error("Erro ao simular.");
  return res.json();
}

// ——— GAMIFICAÇÃO ———

async function getGamificacao() {
  const res = await fetch(`${BASE_URL}/api/gamificacao/me`, {
    headers: authHeader(),
  });
  if (res.status === 401) { logout(); return null; }
  return res.json();
}

// ——— RANKING ———

async function getRanking(periodo = "mensal", limit = 10) {
  const res = await fetch(
    `${BASE_URL}/api/ranking?periodo=${periodo}&limit=${limit}`,
    { headers: authHeader() }
  );
  if (res.status === 401) { logout(); return null; }
  return res.json();
}

// ——— LOCAIS DE USO (admin/público) ———

async function listarLocais() {
  const res = await fetch(`${BASE_URL}/api/admin/locais-uso`, {
    headers: authHeader(),
  });
  if (!res.ok) return [];
  return res.json();
}
