// Vercel Serverless Function: Logout (stateless demo)
export default function handler(req, res) {
  // In a real app, destroy JWT or similar
  res.status(200).json({ success: true });
}
