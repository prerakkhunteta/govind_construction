// Vercel Serverless Function: Health check
export default function handler(req, res) {
  res.status(200).json({ status: 'OK' });
}
