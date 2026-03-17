import { scrape, filterResultadoPreliminar } from "./scraper.js";
import { detectNew } from "./detector.js";
import { notify } from "./notifier.js";

export interface Env {
  SNAPSHOT: KVNamespace;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    console.log("Buscando página do OAB...");

    const allItems = await scrape();
    console.log(`Encontrados ${allItems.length} itens na página`);

    const resultados = filterResultadoPreliminar(allItems);
    console.log(`${resultados.length} item(ns) contendo "resultado preliminar"`);

    const newItems = await detectNew(resultados, env.SNAPSHOT);
    console.log(`${newItems.length} item(ns) novo(s)`);

    if (newItems.length === 0) {
      console.log("Nenhum resultado preliminar novo encontrado.");
      return;
    }

    console.log("Enviando notificações...");
    await notify(newItems, env);
    console.log("Concluído!");
  },
} satisfies ExportedHandler<Env>;
