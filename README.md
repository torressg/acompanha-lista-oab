# Acompanha Lista OAB

[![Monitor OAB](https://github.com/torressg/acompanha-lista-oab/actions/workflows/monitor.yml/badge.svg)](https://github.com/torressg/acompanha-lista-oab/actions/workflows/monitor.yml)

Monitor automático da página do 45º Exame OAB (Seccional SP) que detecta quando um novo **Resultado Preliminar** é publicado e envia notificação via **Telegram**.

## Como funciona

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  GitHub      │────▶│  Scraper     │────▶│  Detector   │────▶│ Telegram │
│  Actions     │     │  (cheerio)   │     │  (snapshot)  │     │ Bot API  │
│  cron 2min   │     │  fetch HTML  │     │  novos itens │     │ mensagem │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────┘
```

1. **Scraper**: Faz fetch da página da FGV e extrai todos os itens (editais, resultados, provas)
2. **Detector**: Compara com o snapshot anterior para identificar itens novos contendo "resultado preliminar"
3. **Notifier**: Envia mensagem via Telegram (com PDF anexo quando disponível)

## Setup

### 1. Criar Bot no Telegram

1. Abra o Telegram e converse com [@BotFather](https://t.me/BotFather)
2. Envie `/newbot` e siga as instruções
3. Copie o **token** do bot

### 2. Obter Chat ID

1. Envie qualquer mensagem para o seu bot
2. Acesse: `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates`
3. Copie o `chat.id` da resposta

### 3. Configurar Secrets no GitHub

No repositório, vá em **Settings → Secrets and variables → Actions** e adicione:

| Secret              | Valor                    |
| ------------------- | ------------------------ |
| `TELEGRAM_BOT_TOKEN`| Token do BotFather       |
| `TELEGRAM_CHAT_ID`  | Chat ID do passo anterior|

### 4. Ativar GitHub Actions

O workflow roda automaticamente a cada 2 minutos. Para executar manualmente:

**Actions → Monitor OAB → Run workflow**

## Execução local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com seus tokens

# Executar
node --env-file=.env --import=tsx src/index.ts

# Modo teste (envia os 2 primeiros itens da página)
TEST_MODE=1 node --env-file=.env --import=tsx src/index.ts
```

## Configuração do intervalo

Edite o cron em `.github/workflows/monitor.yml`:

```yaml
schedule:
  - cron: "*/2 * * * *"  # A cada 2 minutos
  # - cron: "*/5 * * * *"  # A cada 5 minutos
  # - cron: "0 * * * *"    # A cada hora
```

> **Nota**: O GitHub Actions pode ter atrasos de alguns minutos no agendamento cron.

## Licença

MIT
