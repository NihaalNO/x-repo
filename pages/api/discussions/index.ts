import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory placeholder for discussions
let discussions: any[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      res.status(200).json(discussions);
      break;
    case 'POST':
      const discussion = { ...req.body, id: Date.now().toString() };
      discussions.push(discussion);
      res.status(201).json(discussion);
      break;
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}