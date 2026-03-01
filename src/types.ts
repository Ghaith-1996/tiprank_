export interface StockRating {
  id: string;
  ticker: string;
  companyName: string;
  ratingDate: string;
  actionType: string;
  previousRating: string | null;
  newRating: string;
  previousPriceTarget: number | null;
  newPriceTarget: number;
  currentPrice: number;
  upside: number;
}

export interface Analyst {
  id: string;
  name: string;
  slug: string;
  tipranksUrl: string;
  latestRating: string;
  ratings: StockRating[];
}
