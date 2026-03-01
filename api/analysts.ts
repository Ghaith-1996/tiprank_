import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_db';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const db = await getDb();

    const analysts = await db
      .collection('analysts')
      .aggregate([
        {
          $lookup: {
            from: 'ratings',
            localField: '_id',
            foreignField: 'analystId',
            pipeline: [{ $sort: { ratingDate: -1 } }, { $limit: 1 }],
            as: 'latest',
          },
        },
        { $sort: { name: 1 } },
      ])
      .toArray();

    const result = analysts.map((a) => {
      const r = a.latest?.[0];
      return {
        id: a._id.toString(),
        name: a.name,
        slug: a.slug,
        tipranksUrl: a.tipranksUrl,
        latestRating: r
          ? `${r.actionType} ${r.ticker} → ${r.newRating}`
          : 'No ratings yet',
        ratings: [],
      };
    });

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.json(result);
  } catch (error) {
    console.error('Error fetching analysts:', error);
    return res.status(500).json({ error: 'Failed to fetch analysts', details: String(error) });
  }
}
