// custom-storage.engine.ts
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

export const CustomStorageReviewMedia = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const type = getFileType(file);
      const destinationFolder = getDestinationFolder(type);
      cb(null, destinationFolder);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = extname(file.originalname);
      cb(null, `${uniqueSuffix}${extension}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'video/mp4',
      'video/mpeg',
    ];
    const maxImageSize = 1024 * 1024 * 5; // 5 MB for example, adjust as needed

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'), false);
    }

    // Check file size for images
    if (file.mimetype.startsWith('image') && file.size > maxImageSize) {
      return cb(new Error('Image file size exceeds the limit'), false);
    }

    cb(null, true);
  },
};

const getFileType = (file: Express.Multer.File) => {
  if (file.mimetype.startsWith('image')) {
    return 'image';
  } else if (file.mimetype.startsWith('video')) {
    return 'video';
  }
};

const getDestinationFolder = (type: string) => {
  const folderPath = `./public/uploads/review/${type}s`;

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  return folderPath;
};
