// Vercel Serverless Function: Handle GET, PUT, DELETE for a single house

let houses = [];

export default function handler(req, res) {
  const {
    query: { id },
    method,
    body
  } = req;

  const houseIndex = houses.findIndex(h => h.id == id);

  if (method === 'GET') {
    const house = houses.find(h => h.id == id);
    if (!house) return res.status(404).json({ error: 'House not found' });
    return res.status(200).json(house);
  }

  if (method === 'PUT') {
    if (houseIndex === -1) return res.status(404).json({ error: 'House not found' });
    const { title, price, address, description, status } = body;
    houses[houseIndex] = {
      ...houses[houseIndex],
      title: title || houses[houseIndex].title,
      price: price ? Number(price) : houses[houseIndex].price,
      address: address || houses[houseIndex].address,
      description: description || houses[houseIndex].description,
      status: status || houses[houseIndex].status
    };
    return res.status(200).json(houses[houseIndex]);
  }

  if (method === 'DELETE') {
    if (houseIndex === -1) return res.status(404).json({ error: 'House not found' });
    houses.splice(houseIndex, 1);
    return res.status(200).json({ message: 'House deleted successfully' });
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
