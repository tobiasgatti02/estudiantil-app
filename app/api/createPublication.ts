import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { createPublication, addFileToPublication } from '@/app/lib/teacherActions';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), 'public', 'uploads');
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ message: 'Error processing the request' });
    }

    try {
      const { titulo, contenido, materiaId, profesorId } = fields;

      const publicationId = await createPublication(
        Number(materiaId),
        Number(profesorId),
        titulo as string,
        contenido as string
      );

      const filePromises = Object.values(files).map(async (file: any) => {
        const fileName = file.newFilename || 'undefined';
        const filePath = `/uploads/${fileName}`;
        await addFileToPublication(publicationId, fileName, filePath);
      });

      await Promise.all(filePromises);

      res.status(200).json({ message: 'Publication created successfully' });
    } catch (error) {
      console.error('Error creating publication:', error);
      res.status(500).json({ message: 'Error creating publication' });
    }
  });
}