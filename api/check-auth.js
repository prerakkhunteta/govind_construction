// Vercel Serverless Function: Check admin (stateless demo)
export default function handler(req, res) {
  // In a real app, check JWT or similar
  res.status(200).json({ isAdmin: false });
}
