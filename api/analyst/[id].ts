import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_db';
import yahooFinance from 'yahoo-finance2';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid analyst ID' });
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

    const priceMap: Record<string, number> = {};
    try {
      const quotes = await Promise.all(
        tickers.map(async (ticker) => {
          try {
            const q = await yahooFinance.quote(ticker);
            return { ticker, price: q.regularMarketPrice ?? 0 };
          } catch {
            return { ticker, price: 0 };
          }
        }),
      );
      for (const q of quotes) {
        priceMap[q.ticker] = q.price;
      }
    } catch (err) {
      console.warn('Yahoo Finance batch error:', err);
    }

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
