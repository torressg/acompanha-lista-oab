import { scrape, filterResultadoPreliminar } from "./scraper.js";
import { detectNew } from "./detector.js";
import { notify } from "./notifier.js";

const TEST_MODE = process.env.TEST_MODE === "1";

async function main() {
  console.log("🔍 Buscando página do OAB...");

  const allItems = await scrape();
  console.log(`  Encontrados ${allItems.length} itens na página`);

  if (TEST_MODE) {
    console.log("⚠️  MODO TESTE: enviando os 2 primeiros itens da página");
    const testItems = allItems.slice(0, 2);
    testItems.forEach((i) => console.log(`  → ${i.data} - ${i.titulo}`));
    await notify(testItems);
    console.log("✅ Teste concluído!");
    return;
  }

  const resultados = filterResultadoPreliminar(allItems);
  console.log(
    `  ${resultados.length} item(ns) contendo "resultado preliminar"`
  );

  const newItems = await detectNew(resultados);
  console.log(`  ${newItems.length} item(ns) novo(s)`);

  if (newItems.length === 0) {
    console.log("✅ Nenhum resultado preliminar novo encontrado.");
    return;
  }

  console.log("📨 Enviando notificações...");
  await notify(newItems);
  console.log("✅ Concluído!");
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(0); // Exit 0 to avoid failing the GitHub Actions workflow
});
