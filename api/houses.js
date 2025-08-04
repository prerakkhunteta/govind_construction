// Vercel Serverless Function: Get all houses

let houses = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(houses);
  } else if (req.method === 'POST') {
    // For demonstration: simple house creation (no admin/session logic)
    const { title, price, address, description, status = 'available' } = req.body;
    if (!title || !price || !address) {
      return res.status(400).json({ error: 'Title, price, and address are required' });
    }
    const house = {
      id: houses.length + 1,
      title,
      price: Number(price),
      address,
      description: description || '',
      status,
      images: [],
      createdAt: new Date().toISOString()
    };
    houses.push(house);
    res.status(201).json(house);
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
