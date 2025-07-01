import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory placeholder for discussions
let discussions: any[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  switch (req.method) {
    case 'GET': {
      const discussion = discussions.find(d => d.id === id);
      if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
      res.status(200).json(discussion);
      break;
    }
    case 'PUT': {
      const idx = discussions.findIndex(d => d.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Discussion not found' });
      discussions[idx] = { ...discussions[idx], ...req.body };
      res.status(200).json(discussions[idx]);
      break;
    }
    case 'DELETE': {
      const idx = discussions.findIndex(d => d.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Discussion not found' });
      discussions.splice(idx, 1);
      res.status(200).json({ message: 'Discussion deleted successfully' });
      break;
    }
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}