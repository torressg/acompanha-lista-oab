import * as cheerio from "cheerio";

export interface OabItem {
  titulo: string;
  url: string;
  data: string;
}

const DEFAULT_URL =
  "https://oab.fgv.br/NovoSec.aspx?key=5cmxTPp7FC0=&codSec=5149";

export async function scrape(url?: string): Promise<OabItem[]> {
  const targetUrl = url ?? DEFAULT_URL;

  const response = await fetch(targetUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const items: OabItem[] = [];

  $("tr").each((_, row) => {
    const dateSpan = $(row).find(
      'span[id*="ContentPlaceHolder1_gvArquivos_lbData"]'
    );
    const link = $(row).find(
      'a[id*="ContentPlaceHolder1_gvArquivos_linkTeste"]'
    );

    if (dateSpan.length && link.length) {
      items.push({
        titulo: link.text().trim(),
        url: link.attr("href") ?? "",
        data: dateSpan.text().trim(),
      });
    }
  });

  return items;
}

export function filterResultadoPreliminar(items: OabItem[]): OabItem[] {
  return items.filter((item) =>
    item.titulo.toLowerCase().includes("resultado preliminar")
  );
}
