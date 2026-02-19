# ✅ SistemFinishedTask

> Sistema fullstack para gerenciar e monitorar a **finalização em massa de Ordens de Serviço** no suporte técnico.

---

## 📋 Sobre o Projeto

O **SistemFinishedTask** é uma aplicação **fullstack** criada para resolver um desafio operacional crítico em equipes de suporte: a necessidade de **finalizar múltiplas Ordens de Serviço (OS) simultaneamente** de forma segura, controlada e rastreável.

Em operações de suporte com alto volume de chamados, é comum que um conjunto de OS precise ser encerrado ao mesmo tempo — seja por conclusão de um projeto, encerramento de um período, resolução de um incidente em massa ou por limpeza de filas. Fazer isso manualmente, OS por OS, é lento, propenso a erros e difícil de auditar. O SistemFinishedTask automatiza e centraliza esse processo, garantindo controle total sobre quais OS estão sendo finalizadas, quem autorizou e qual foi o resultado de cada operação.

### Problemas que resolve

- Finalização manual e repetitiva de grandes lotes de OS
- Falta de rastreabilidade sobre quais OS foram encerradas em massa e por quem
- Risco de finalizar OS erradas sem confirmação e revisão prévia
- Ausência de um painel para monitorar o progresso e os resultados do processo em lote

---

## 🏗️ Arquitetura

O projeto é dividido em duas camadas que se comunicam via API REST:

```
SistemFinishedTask/
│
├── sistem-back/               # ⚙️  Backend — lógica de finalização em massa (Python)
│
├── sistem-front/              # 🎨 Frontend — interface de gerenciamento (JS/CSS/HTML)
│
└── README.md
```

### Stack Tecnológica

| Camada | Tecnologia | Proporção |
|--------|-----------|-----------|
| Frontend | JavaScript + CSS + HTML | ~65.6% |
| Backend | Python | ~34.4% |

---

## 🎨 Frontend — `sistem-front`

Interface web desenvolvida com **JavaScript**, **CSS** e **HTML**, responsável por toda a experiência do usuário durante o processo de finalização em massa. Funcionalidades esperadas:

- **Seleção e filtragem de OS** para composição do lote a ser finalizado (por período, técnico, status, tipo, etc.)
- **Pré-visualização do lote** com listagem das OS que serão afetadas antes da confirmação
- **Painel de progresso em tempo real** durante a execução da finalização massiva
- **Log de resultados** exibindo quais OS foram finalizadas com sucesso e quais apresentaram erros
- **Histórico de operações** em lote realizadas anteriormente com detalhes de cada execução
- **Confirmação de segurança** antes de disparar a finalização, evitando ações acidentais

### Estrutura típica do frontend

```
sistem-front/
│
├── index.html               # Página principal da aplicação
├── css/
│   └── styles.css           # Estilos globais e layout
├── js/
│   ├── app.js               # Lógica principal e inicialização
│   ├── api.js               # Comunicação com o backend
│   ├── filtros.js           # Lógica de filtragem e seleção de OS
│   └── monitor.js           # Monitoramento de progresso em tempo real
└── components/              # Componentes reutilizáveis de UI
```

---

## ⚙️ Backend — `sistem-back`

Camada servidor desenvolvida em **Python**, responsável pelo núcleo de processamento das finalizações. É a parte mais crítica do sistema, pois executa operações irreversíveis ou de difícil reversão na API do sistema de suporte.

Responsabilidades:

- Receber do frontend a lista de OS a serem finalizadas
- **Validar cada OS** antes de processá-la (verificar se está elegível para finalização)
- **Executar a finalização em lote** na API do sistema de suporte, OS por OS, com tratamento de erros individual
- Retornar em tempo real o **progresso e resultado** de cada operação
- **Registrar o histórico** completo de todas as execuções em massa
- Garantir **atomicidade parcial**: se uma OS falha, as demais continuam sendo processadas e o erro é reportado

### Estrutura típica do backend

```
sistem-back/
│
├── app.py / main.py           # Ponto de entrada e configuração da API
├── routes/
│   ├── finalizacao.py         # Endpoint de execução do lote de finalização
│   ├── historico.py           # Endpoints de consulta ao histórico
│   └── preview.py             # Endpoint de pré-visualização do lote
├── services/
│   ├── os_service.py          # Integração com a API do sistema de suporte
│   └── batch_processor.py     # Lógica de processamento em lote com controle de erros
├── models/
│   └── operacao.py            # Modelo de uma operação em lote
└── requirements.txt
```

---

## 🔄 Fluxo do Sistema

```
  [Usuário / Gestor]
        │
        │  1. Filtra e seleciona as OS
        ▼
  [Frontend JS]
  • Exibe lista de OS para revisão
  • Solicita confirmação do lote
        │
        │  2. Envia lista de OS confirmadas
        ▼
  [Backend Python]
  • Valida elegibilidade de cada OS
  • Processa finalização na API externa
  • Reporta progresso em tempo real
        │
        │  3. Executa para cada OS
        ▼
  [API do Sistema de Suporte]
  • Finaliza a OS individualmente
  • Retorna sucesso ou erro por OS
        │
        │  4. Retorna resultado consolidado
        ▼
  [Frontend JS]
  • Exibe painel de resultados
  • Lista OS finalizadas e com erro
  • Registra no histórico
```

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- [Python](https://www.python.org/) 3.8+
- [Node.js](https://nodejs.org/) v16+
- `pip`
- Credenciais de acesso à API do sistema de suporte
- Servidor web simples (ou abrir `index.html` diretamente no navegador)

---

### ⚙️ Backend

```bash
# 1. Entre na pasta do backend
cd sistem-back

# 2. Crie e ative o ambiente virtual
python -m venv venv
source venv/bin/activate      # Linux/macOS
venv\Scripts\activate         # Windows

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# 5. Inicie o servidor
python app.py
```

Backend disponível em: `http://localhost:5000`

---

### 🎨 Frontend

```bash
# Opção 1 — Abrir diretamente no navegador (sem servidor)
# Basta abrir o arquivo sistem-front/index.html no navegador

# Opção 2 — Servir com servidor local Python
cd sistem-front
python -m http.server 3000
# Acesse: http://localhost:3000

# Opção 3 — Live Server (VS Code)
# Instale a extensão Live Server e clique em "Go Live"
```

---

## 🔐 Variáveis de Ambiente

### Backend (`.env`)

```env
# API do sistema de suporte
API_BASE_URL=https://sua-api-de-suporte.com
API_TOKEN=seu_token_aqui

# Configurações do servidor
PORT=5000
DEBUG=True

# Configurações de processamento em lote
BATCH_DELAY_MS=200        # Intervalo entre cada finalização (evita sobrecarga na API)
MAX_RETRIES=3             # Tentativas em caso de falha por OS
```

> ⚠️ **Nunca** commite arquivos `.env` com credenciais reais. Certifique-se de que estão no `.gitignore`.

---

## 📦 Dependências Principais

### Backend (Python)

| Pacote | Descrição |
|--------|-----------|
| `flask` ou `fastapi` | Framework web para a API REST |
| `requests` | Requisições HTTP para a API do sistema de suporte |
| `python-dotenv` | Gerenciamento de variáveis de ambiente |
| `flask-cors` | Habilita CORS para comunicação com o frontend |

### Frontend (JavaScript)

| Recurso | Descrição |
|---------|-----------|
| `fetch` API nativa | Comunicação assíncrona com o backend |
| `CSS Grid / Flexbox` | Layout responsivo da interface |
| `EventSource` | Recebimento de progresso em tempo real via SSE |

---

## 🌐 Endpoints da API (Backend)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/finalizacao/preview` | Retorna pré-visualização das OS que serão afetadas |
| `POST` | `/finalizacao/executar` | Executa a finalização em massa do lote enviado |
| `GET` | `/finalizacao/progresso/:id` | Consulta o progresso de uma execução em andamento |
| `GET` | `/historico` | Lista todas as operações em lote já realizadas |
| `GET` | `/historico/:id` | Detalha uma operação específica (OS processadas, erros, etc.) |
| `GET` | `/os?filtros=...` | Consulta OS disponíveis para compor um lote |

---

## ⚠️ Considerações de Segurança

Por se tratar de um sistema que executa **operações em massa e potencialmente irreversíveis**, é essencial:

- **Implementar autenticação** antes de expor os endpoints de finalização
- **Exigir confirmação explícita** do usuário antes de disparar o processo
- **Registrar logs de auditoria** com usuário, data/hora, lista de OS e resultado de cada operação
- **Implementar rate limiting** no backend para não sobrecarregar a API do sistema de suporte
- **Testar sempre em ambiente de homologação** antes de usar em produção

---

## 🌟 Diferenciais do Sistema

- **Operação em lote controlada** — Finaliza dezenas ou centenas de OS de uma vez sem risco de erros manuais
- **Pré-visualização antes da execução** — O usuário revisa exatamente quais OS serão afetadas antes de confirmar
- **Tolerância a falhas** — Erros em OS individuais não interrompem o processamento das demais
- **Rastreabilidade completa** — Histórico detalhado de cada operação em massa realizada
- **Flexibilidade de filtros** — Permite compor lotes por qualquer combinação de critérios

---

## 👤 Autor

**Gabriel Marques**
- GitHub: [@GabrielMarques011](https://github.com/GabrielMarques011)

---

## 📄 Licença

Este projeto não possui uma licença definida. Entre em contato com o autor para mais informações sobre uso e distribuição.