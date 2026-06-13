// EcoTag API helpers.
// The frontend is static, so the backend URL can be adjusted in localStorage if needed.

const BASE_URL = localStorage.getItem("ecotagApiBaseUrl") || "http://localhost:5295";
const TOKEN_KEY = "ecotagToken";
const USER_KEY = "ecotagUser";

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token");
}

function getUsuario() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function salvarUsuario(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function salvarSessao(authResponse) {
  const token = authResponse?.token || authResponse;
  const user = authResponse?.user || null;

  if (!token) {
    throw new Error("Token de acesso não recebido.");
  }

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem("token", token);
  if (user) salvarUsuario(user);
}

function salvarSessaoEIr(authResponse) {
  salvarSessao(authResponse);
  window.location.href = "index.html#/dashboard";
}

function limparSessao() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("token");
}

function logout() {
  limparSessao();
  window.location.href = "index.html#/login";
}

function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest(path, options = {}) {
  const needsAuth = options.auth !== false;
  const headers = {
    "Content-Type": "application/json",
    ...(needsAuth ? authHeader() : {}),
    ...(options.headers || {}),
  };

  const requestOptions = {
    ...options,
    headers,
  };

  delete requestOptions.auth;

  if (requestOptions.body && typeof requestOptions.body !== "string") {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  const response = await fetch(`${BASE_URL}${path}`, requestOptions);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (response.status === 401) {
    limparSessao();
  }

  if (!response.ok) {
    const message = data?.message || data || "Não foi possível concluir a ação.";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.status === 204 ? null : data;
}

async function login(email, senha) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    auth: false,
    body: {
      email,
      password: String(senha),
    },
  });
}

async function registrar(nome, email, senha) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    auth: false,
    body: {
      nome,
      email,
      password: String(senha),
    },
  });
}

async function getPerfil() {
  const user = await apiRequest("/api/users/me");
  salvarUsuario(user);
  return user;
}

async function atualizarPerfil(nome, email) {
  const user = await apiRequest("/api/users/me", {
    method: "PUT",
    body: { nome, email },
  });
  salvarUsuario(user);
  return user;
}

async function listarVeiculos() {
  return apiRequest("/api/veiculos");
}

async function adicionarVeiculo(nome, tipoVeiculo, tipoCombustivel) {
  return apiRequest("/api/veiculos", {
    method: "POST",
    body: { nome, tipoVeiculo, tipoCombustivel },
  });
}

async function atualizarVeiculo(id, nome, tipoVeiculo, tipoCombustivel) {
  return apiRequest(`/api/veiculos/${id}`, {
    method: "PUT",
    body: { nome, tipoVeiculo, tipoCombustivel },
  });
}

async function deletarVeiculo(id) {
  return apiRequest(`/api/veiculos/${id}`, {
    method: "DELETE",
  });
}

async function getDashboard() {
  return apiRequest("/api/dashboard/impacto");
}

async function listarLocais() {
  return apiRequest("/api/locais-uso");
}

async function registrarPassagem(veiculoId, localUsoId) {
  return apiRequest("/api/passagens", {
    method: "POST",
    body: { veiculoId, localUsoId },
  });
}

async function listarPassagens() {
  return apiRequest("/api/passagens");
}

async function simular(veiculoId, localUsoId, dias, passagensPorDia) {
  return apiRequest("/api/simulador", {
    method: "POST",
    body: { veiculoId, localUsoId, dias, passagensPorDia },
  });
}

async function getGamificacao() {
  return apiRequest("/api/gamificacao/me");
}

async function getRanking(periodo = "mensal", limit = 10) {
  return apiRequest(`/api/ranking?periodo=${periodo}&limit=${limit}`);
}

async function adminListarLocais() {
  return apiRequest("/api/admin/locais-uso");
}

async function adminListarUsuarios() {
  return apiRequest("/api/admin/users");
}

async function adminAtualizarUsuario(id, nome, email) {
  return apiRequest(`/api/admin/users/${id}`, {
    method: "PUT",
    body: { nome, email },
  });
}

async function adminExcluirUsuario(id) {
  return apiRequest(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
}

async function adminCriarLocal(nome, tipoLocal) {
  return apiRequest("/api/admin/locais-uso", {
    method: "POST",
    body: { nome, tipoLocal },
  });
}

async function adminAtualizarLocal(id, nome, tipoLocal) {
  return apiRequest(`/api/admin/locais-uso/${id}`, {
    method: "PUT",
    body: { nome, tipoLocal },
  });
}

async function adminExcluirLocal(id) {
  return apiRequest(`/api/admin/locais-uso/${id}`, {
    method: "DELETE",
  });
}

async function adminListarFatores() {
  return apiRequest("/api/admin/fatores-emissao");
}

async function adminSalvarFator(tipoOriginal, payload) {
  const isEditing = Boolean(tipoOriginal);
  return apiRequest(`/api/admin/fatores-emissao${isEditing ? `/${tipoOriginal}` : ""}`, {
    method: isEditing ? "PUT" : "POST",
    body: payload,
  });
}

async function adminExcluirFator(tipoCombustivel) {
  return apiRequest(`/api/admin/fatores-emissao/${tipoCombustivel}`, {
    method: "DELETE",
  });
}

async function adminListarParametros() {
  return apiRequest("/api/admin/parametros-cenario");
}

async function adminSalvarParametro(tipoOriginal, payload) {
  const isEditing = Boolean(tipoOriginal);
  return apiRequest(`/api/admin/parametros-cenario${isEditing ? `/${tipoOriginal}` : ""}`, {
    method: isEditing ? "PUT" : "POST",
    body: payload,
  });
}

async function adminExcluirParametro(tipoLocal) {
  return apiRequest(`/api/admin/parametros-cenario/${tipoLocal}`, {
    method: "DELETE",
  });
}
