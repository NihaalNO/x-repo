import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory placeholder for algorithms
let algorithms: any[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      res.status(200).json(algorithms);
      break;
    case 'POST':
      const algorithm = { ...req.body, id: Date.now().toString() };
      algorithms.push(algorithm);
      res.status(201).json(algorithm);
      break;
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}