import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';

const storage = multer.diskStorage(
    {
        filename: function (req, file, callback) {
            const ext = path.extname(file.originalname || '').toLowerCase();
            const safeExt = /^[.][a-z0-9]+$/.test(ext) ? ext : '';
            callback(null, `${Date.now()}-${randomUUID()}${safeExt}`);
        }
    }
)

const upload = multer({ storage})

export default upload
