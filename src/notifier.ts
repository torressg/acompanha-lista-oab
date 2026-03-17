import type { OabItem } from "./scraper.js";

const TELEGRAM_API = "https://api.telegram.org/bot";

interface TelegramEnv {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
}

async function sendMessage(
  token: string,
  chatId: string,
  text: string
): Promise<void> {
  const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram sendMessage failed: ${res.status} - ${body}`);
  }
}

async function sendDocument(
  token: string,
  chatId: string,
  pdfUrl: string,
  caption: string
): Promise<void> {
  const pdfRes = await fetch(pdfUrl);
  if (!pdfRes.ok) {
    console.warn(`Failed to download PDF: ${pdfUrl} (${pdfRes.status})`);
    return;
  }
  const pdfBuffer = await pdfRes.arrayBuffer();
  const filename =
    decodeURIComponent(pdfUrl.split("/").pop() ?? "documento.pdf");

  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("caption", caption);
  form.append("parse_mode", "HTML");
  form.append("document", new Blob([pdfBuffer]), filename);

  const res = await fetch(`${TELEGRAM_API}${token}/sendDocument`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    console.warn(`Telegram sendDocument failed: ${res.status} - ${body}`);
  }
}

export async function notify(
  items: OabItem[],
  env: TelegramEnv
): Promise<void> {
  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = env;

  for (const item of items) {
    const text = [
      "📋 <b>Novo resultado encontrado!</b>",
      "",
      `<b>${item.titulo}</b>`,
      `🔗 ${item.url}`,
      `📅 ${item.data}`,
    ].join("\n");

    if (item.url.toLowerCase().endsWith(".pdf")) {
      await sendDocument(token, chatId, item.url, text);
    } else {
      await sendMessage(token, chatId, text);
    }

    console.log(`  Notificação enviada: ${item.titulo}`);
  }
}
