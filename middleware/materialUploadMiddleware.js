/**
 * Material Attachment Upload Middleware
 * Handles photo and document uploads for materials
 * Ethiopian IT Park Corporation - VMMS v4.0
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const uploadDirs = [
  'public/uploads/materials/photos',
  'public/uploads/materials/documents'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration for photos
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/materials/photos');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  }
});

// Storage configuration for documents
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/materials/documents');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

// File filter for photos
const photoFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// File filter for documents
const documentFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|txt|xls|xlsx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /pdf|msword|document|text|spreadsheet/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only document files are allowed (pdf, doc, docx, txt, xls, xlsx)'));
  }
};

// Configure multer for photos
const uploadPhotos = multer({
  storage: photoStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: photoFileFilter
});

// Configure multer for documents
const uploadDocuments = multer({
  storage: documentStorage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB max
  },
  fileFilter: documentFileFilter
});

// Combined storage for both types
const combinedStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on field name
    if (file.fieldname === 'photos') {
      cb(null, 'public/uploads/materials/photos');
    } else if (file.fieldname === 'documents') {
      cb(null, 'public/uploads/materials/documents');
    } else {
      cb(null, 'public/uploads/materials');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'photos' ? 'photo' : 'doc';
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

// Combined file filter
const combinedFileFilter = (req, file, cb) => {
  if (file.fieldname === 'photos') {
    return photoFileFilter(req, file, cb);
  } else if (file.fieldname === 'documents') {
    return documentFileFilter(req, file, cb);
  } else {
    cb(new Error('Invalid field name'));
  }
};

// Combined upload for both photos and documents
const uploadMaterialAttachments = multer({
  storage: combinedStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max
    files: 20 // Max 20 files
  },
  fileFilter: combinedFileFilter
});

module.exports = {
  uploadPhotos: uploadPhotos.array('photos', 10),
  uploadDocuments: uploadDocuments.array('documents', 10),
  uploadMaterialAttachments: uploadMaterialAttachments.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'documents', maxCount: 10 }
  ])
};
