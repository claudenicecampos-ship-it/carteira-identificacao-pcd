import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === 'foto') {
      cb(null, path.join(__dirname, '../../imgs'));
    } else if (file.fieldname === 'laudo') {
      cb(null, path.join(__dirname, '../../laudos'));
    } else {
      cb(new Error('Campo de arquivo inválido.'));
    }
  },
  filename(req, file, cb) {
    const timestamp = Date.now();
    const safeName = file.originalname
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '');
    const ext = path.extname(safeName);
    const basename = path.basename(safeName, ext);
    cb(null, `${file.fieldname}-${basename}-${timestamp}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'foto') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('A foto deve ser uma imagem.'));
    }
  } else if (file.fieldname === 'laudo') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('O laudo deve ser um arquivo PDF.'));
    }
  } else {
    cb(new Error('Campo de upload inválido.'));
  }
};

export const createUploadMiddleware = (fields) => multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
}).fields(fields);

export const uploadCarteira = createUploadMiddleware([
  { name: 'foto', maxCount: 1 },
  { name: 'laudo', maxCount: 1 }
]);
