// Vercel Serverless Function: Login (stateless demo)
export default function handler(req, res) {
  // In a real app, issue a JWT or similar
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    return res.status(200).json({ success: true, token: 'demo-token' });
  }
  res.status(401).json({ error: 'Invalid credentials' });
}
