import { diskStorage } from 'multer';
import { extname } from 'path';

export const avatarStorage = diskStorage({
  destination: './public/uploads/avatars',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

export const documentoStorage = diskStorage({
  destination: './public/uploads/documentos',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `doc-${uniqueSuffix}${ext}`);
  },
});
