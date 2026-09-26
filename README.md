# Acompanha Lista OAB

Watches the 45th OAB Exam page (São Paulo section) and sends a **Telegram** message as soon as a new **preliminary result** is published, with the PDF attached when there is one.

Runs as a **Cloudflare Worker** on a cron trigger every 5 minutes. No server to maintain.

## How it works

```
┌──────────────┐    ┌─────────────┐    ┌──────────────┐    ┌──────────┐
│  Cloudflare  │───▶│   Scraper   │───▶│   Detector   │───▶│ Telegram │
│  Cron 5 min  │    │  (cheerio)  │    │  (KV store)  │    │ Bot API  │
└──────────────┘    └─────────────┘    └──────────────┘    └──────────┘
```

1. **Scraper** fetches the FGV page and extracts every item (notices, results, exams)
2. **Detector** compares it with the last snapshot in Cloudflare KV and picks new items that mention "resultado preliminar"
3. **Notifier** sends the Telegram message

## Stack

TypeScript · Cloudflare Workers · Cloudflare KV · Cheerio · Telegram Bot API

## Setup

### 1. Create a Telegram bot

Talk to [@BotFather](https://t.me/BotFather), send `/newbot` and copy the bot **token**.

### 2. Get your chat ID

Send any message to your bot, open `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` and copy `chat.id`.

### 3. Deploy

```bash
npm install
npx wrangler login

# Create the KV namespace and put its id in wrangler.toml
npx wrangler kv namespace create SNAPSHOT

# Secrets
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID

npm run deploy
```

### 4. Check the logs

```bash
npm run tail
```

To change the interval, edit the cron in `wrangler.toml`:

```toml
[triggers]
crons = ["*/5 * * * *"]
```

## License

MIT
