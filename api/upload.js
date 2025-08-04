// Vercel Serverless Function: Handle image uploads (no session/admin logic)

export const config = {
  api: {
    bodyParser: false,
  },
};

import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm({
    uploadDir: uploadsDir,
    keepExtensions: true,
    multiples: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'File upload failed' });
    }
    const uploaded = Array.isArray(files.images) ? files.images : [files.images];
    const imageUrls = uploaded.filter(Boolean).map(file => `/uploads/${path.basename(file.filepath)}`);
    res.status(200).json({ success: true, imageUrls });
  });
}
