# Acompanha Lista OAB

Monitor automático da página do 45º Exame OAB (Seccional SP) que detecta quando um novo **Resultado Preliminar** é publicado e envia notificação via **Telegram**.

Roda como **Cloudflare Worker** com Cron Trigger a cada 5 minutos.

## Como funciona

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  Cloudflare  │────▶│  Scraper     │────▶│  Detector   │────▶│ Telegram │
│  Cron 5min   │     │  (cheerio)   │     │  (KV store)  │     │ Bot API  │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────┘
```

1. **Scraper**: Faz fetch da página da FGV e extrai todos os itens (editais, resultados, provas)
2. **Detector**: Compara com o snapshot salvo no Cloudflare KV para identificar itens novos contendo "resultado preliminar"
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

### 3. Deploy no Cloudflare Workers

```bash
# Instalar dependências
npm install

# Login no Cloudflare
npx wrangler login

# Criar o KV namespace e colocar o id no wrangler.toml
npx wrangler kv namespace create SNAPSHOT

# Adicionar secrets
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID

# Deploy
npm run deploy
```

### 4. Verificar

```bash
# Logs em tempo real
npm run tail
```

Ou pelo dashboard: [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **acompanha-lista-oab**

## Configuração do intervalo

Edite o cron em `wrangler.toml`:

```toml
[triggers]
crons = ["*/5 * * * *"]  # A cada 5 minutos
```

## Licença

MIT
