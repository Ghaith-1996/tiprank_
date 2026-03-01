import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient, ObjectId } from 'mongodb';

let cachedClient: MongoClient | null = null;

async function getDb() {
  if (!cachedClient) {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL || '';
    if (!uri) throw new Error('MONGODB_URI is not set');
    cachedClient = await new MongoClient(uri).connect();
  }
  return cachedClient.db();
}

async function fetchPrices(tickers: string[]): Promise<Record<string, number>> {
  const map: Record<string, number> = {};
  if (tickers.length === 0) return map;

  try {
    const symbols = tickers.join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Yahoo API ${res.status}`);

    const data = await res.json() as {
      quoteResponse?: { result?: Array<{ symbol: string; regularMarketPrice?: number }> }
    };

    const quotes = data?.quoteResponse?.result ?? [];
    for (const q of quotes) {
      if (q.symbol && q.regularMarketPrice) {
        map[q.symbol] = q.regularMarketPrice;
      }
    }
  } catch (err) {
    console.warn('Yahoo Finance price fetch failed:', err);
  }

  return map;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;

  if (!id) {
    return res.status(400).json({ error: 'Missing ?id= parameter' });
  }

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return res.status(400).json({ error: 'Invalid analyst ID format' });
  }

  try {
    const db = await getDb();

    const analyst = await db.collection('analysts').findOne({ _id: objectId });
    if (!analyst) {
      return res.status(404).json({ error: 'Analyst not found' });
    }

    const ratingDocs = await db
      .collection('ratings')
      .find({ analystId: objectId })
      .sort({ ratingDate: -1 })
      .toArray();

    const tickers = [...new Set(ratingDocs.map((r) => r.ticker as string))];
    const priceMap = await fetchPrices(tickers);

    const ratings = ratingDocs.map((r) => {
      const currentPrice = priceMap[r.ticker] || 0;
      const newPriceTarget = r.newPriceTarget ?? 0;
      const upside =
        currentPrice > 0 && newPriceTarget > 0
          ? parseFloat(((newPriceTarget / currentPrice - 1) * 100).toFixed(2))
          : 0;

      const ratingDate =
        r.ratingDate instanceof Date
          ? r.ratingDate.toISOString().split('T')[0]
          : typeof r.ratingDate === 'string'
            ? r.ratingDate.split('T')[0]
            : '';

      return {
        id: r._id.toString(),
        ticker: r.ticker,
        companyName: r.companyName,
        ratingDate,
        actionType: r.actionType,
        previousRating: r.previousRating ?? null,
        newRating: r.newRating,
        previousPriceTarget: r.previousPriceTarget ?? null,
        newPriceTarget,
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        upside,
      };
    });

    const latest = ratings[0];
    const latestRating = latest
      ? `${latest.actionType} ${latest.ticker} → ${latest.newRating}`
      : 'No ratings yet';

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.json({
      id: analyst._id.toString(),
      name: analyst.name,
      slug: analyst.slug,
      tipranksUrl: analyst.tipranksUrl,
      latestRating,
      ratings,
    });
  } catch (error) {
    console.error('Error fetching analyst:', error);
    return res.status(500).json({ error: 'Failed to fetch analyst', details: String(error) });
  }
}
