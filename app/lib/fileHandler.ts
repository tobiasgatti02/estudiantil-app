import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Asegúrate de que el directorio de subidas exista
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    form.uploadDir = uploadDir;
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error al procesar el archivo' });
      }

      const file = files.file as formidable.File;
      if (!file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
      }

      const fileName = file.newFilename || 'undefined';
      const filePath = `/uploads/${fileName}`;

      return res.status(200).json({ fileName, filePath });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}