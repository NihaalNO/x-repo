import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory placeholder for discussions
let discussions: any[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(discussions);
}