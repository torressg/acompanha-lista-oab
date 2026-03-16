import type { OabItem } from "./scraper.js";

const TELEGRAM_API = "https://api.telegram.org/bot";

function getConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    throw new Error(
      "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID environment variables"
    );
  }
  return { token, chatId };
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
  // Download PDF
  const pdfRes = await fetch(pdfUrl);
  if (!pdfRes.ok) {
    console.warn(`Failed to download PDF: ${pdfUrl} (${pdfRes.status})`);
    return;
  }
  const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
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

export async function notify(items: OabItem[]): Promise<void> {
  const { token, chatId } = getConfig();

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

    console.log(`  ✔ Notificação enviada: ${item.titulo}`);
  }
}
