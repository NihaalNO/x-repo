import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory placeholder for algorithms
let algorithms: any[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  switch (req.method) {
    case 'GET': {
      const algorithm = algorithms.find(a => a.id === id);
      if (!algorithm) return res.status(404).json({ error: 'Algorithm not found' });
      res.status(200).json(algorithm);
      break;
    }
    case 'PUT': {
      const idx = algorithms.findIndex(a => a.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Algorithm not found' });
      algorithms[idx] = { ...algorithms[idx], ...req.body };
      res.status(200).json(algorithms[idx]);
      break;
    }
    case 'DELETE': {
      const idx = algorithms.findIndex(a => a.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Algorithm not found' });
      algorithms.splice(idx, 1);
      res.status(200).json({ message: 'Algorithm deleted successfully' });
      break;
    }
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}