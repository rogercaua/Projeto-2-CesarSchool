# 🌱 EcoTag

## 📖 Sobre o Projeto

O **EcoTag** é um MVP (*Minimum Viable Product*) desenvolvido como uma extensão de serviços de mobilidade, como tags de pedágio e estacionamento.

Seu principal objetivo é **quantificar e apresentar ao usuário o volume de emissões de CO₂e (Gases de Efeito Estufa)** evitadas ao utilizar o pagamento automático, em comparação com o pagamento manual.

O sistema compara dois cenários:

* 🚫 **Sem Tag:** envolve frenagem, aceleração, tempo em marcha lenta em filas e emissão de tickets.
* ✅ **Com Tag:** passagem contínua, sem paradas.

A partir disso, o EcoTag traduz **microeficiências operacionais em dados concretos de sustentabilidade (ESG)**, tornando o impacto ambiental visível para o usuário.


## 🚀 Funcionalidades

Para atender aos critérios da avaliação (onde CRUD vale no máximo 2 pontos), o projeto foca em **regras de negócio relevantes**:

### 1. 🚗 Adicionar Veículo *(CRUD 1/2)*

Permite ao usuário cadastrar veículos em sua conta, informando:

* Categoria (carro, moto, caminhão)
* Tipo de combustível (gasolina, etanol, diesel)

Esses dados são essenciais para o cálculo de emissões.

---

### 2. 👤 Gerenciar Perfil e Veículos *(CRUD 2/2)*

Permite ao usuário:

* Visualizar veículos cadastrados
* Editar informações (ex: mudança de combustível)
* Excluir veículos
* Gerenciar dados pessoais básicos

---

### 3. ⚙️ Motor de Cálculo de Emissões Evitadas *(Core Business)*

Este é o núcleo do sistema.

Sempre que ocorre um evento de passagem de tag:

1. O sistema identifica o veículo
2. Considera o tipo de local (pedágio ou estacionamento)
3. Aplica uma fórmula baseada em premissas ambientais

📊 Resultado:

* Quantidade exata de CO₂e evitada (em kg) por transação

---

### 4. 📊 Dashboard de Impacto do Usuário

Interface (ou endpoint de API) que apresenta:

* Emissões evitadas no mês atual
* Emissões evitadas no ano
* Total histórico acumulado

Foco em visualização clara e engajadora.

---

### 5. 🔧 Gestão Dinâmica de Premissas Ambientais

Funcionalidade voltada para administradores.

Permite atualizar:

* Fatores de emissão (ex: gasolina, diesel, etc.)
* Parâmetros de cálculo

✅ Sem necessidade de alterar o código-fonte
✅ Facilita adaptação a novas regulamentações ambientais

---

### 6. 🌍 Simulador de Cenários Sustentáveis

Ferramenta interativa para o usuário.

Exemplo de uso:

> “Se eu passasse 30 dias utilizando 10 pedágios sem a tag, quanto CO₂ eu emitiria a mais?”

Objetivo:

* Aumentar a conscientização ambiental
* Engajar o usuário com dados práticos

---
### 7. 🏅 Sistema de Gamificação (Pontos e Selos)
Transforma o uso contínuo da tag em uma jornada de recompensas positivas.

Motor de regras que:

Converte a quantidade de CO₂ evitado em "Pontos Sustentáveis".

Desbloqueia conquistas/selos virtuais ao atingir marcos históricos (Ex: Selo "Iniciante Verde" ao evitar o primeiro 1kg de CO₂).

Objetivo:

Aumentar drasticamente a retenção e o engajamento do usuário com o aplicativo.

---

### 8. 🏆 Ranking de Sustentabilidade (Leaderboard)
Fomenta a competição saudável através da gamificação social.

Funcionalidade que:

Utiliza o saldo de "Pontos Sustentáveis" para ranquear os usuários.

Exibe os motoristas (ou frotas) com o maior impacto positivo no mês.

Permite ao usuário visualizar sua posição em relação a toda a base de clientes.

Objetivo:

Incentivar o uso contínuo da tag para melhorar o posicionamento no ranking.

___

## 🧠 Conceito Central

O EcoTag transforma pequenas ações do dia a dia em **indicadores reais de impacto ambiental**, incentivando comportamentos mais sustentáveis através de dados.

---


## 📌 Status do Projeto

🚧 Em desenvolvimento (MVP)

