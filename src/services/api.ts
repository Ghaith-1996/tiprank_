import type { Analyst } from '../types';

export const api = {
  async getAnalysts(): Promise<Analyst[]> {
    const res = await fetch('/api/analysts');
    if (!res.ok) throw new Error('Failed to fetch analysts');
    return res.json();
  },

  async getAnalystById(id: string): Promise<Analyst | undefined> {
    const res = await fetch(`/api/analyst?id=${encodeURIComponent(id)}`);
    if (!res.ok) return undefined;
    return res.json();
  },
};
