import 'dotenv/config';

const BRAVE_KEY = process.env.BRAVE_API_KEY || '';

export interface WebSonuc {
  baslik: string;
  url: string;
  ozet: string;
}

export async function webAra(sorgu: string, adet = 5): Promise<WebSonuc[]> {
  if (!BRAVE_KEY) throw new Error('BRAVE_API_KEY tanımlı değil (server/.env)');
  const url = new URL('https://api.search.brave.com/res/v1/web/search');
  url.searchParams.set('q', sorgu);
  url.searchParams.set('count', String(Math.min(adet, 10)));
  url.searchParams.set('text_decorations', 'false');
  url.searchParams.set('search_lang', 'tr');
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': BRAVE_KEY,
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Brave ${res.status}: ${t.slice(0, 200)}`);
  }
  const j: any = await res.json();
  const items: any[] = j?.web?.results ?? [];
  return items.slice(0, adet).map((r) => ({
    baslik: String(r.title ?? '').replace(/<[^>]+>/g, ''),
    url: String(r.url ?? ''),
    ozet: String(r.description ?? '').replace(/<[^>]+>/g, '').trim(),
  }));
}