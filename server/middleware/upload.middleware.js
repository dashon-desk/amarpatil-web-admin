const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");
const { asyncLocalStorage } = require("./tenant.middleware");

const wrapMiddleware = (middlewareFn) => {
  return (req, res, next) => {
    const store = asyncLocalStorage.getStore();
    if (!store) {
      return middlewareFn(req, res, next);
    }
    middlewareFn(req, res, (err) => {
      asyncLocalStorage.run(store, () => {
        next(err);
      });
    });
  };
};

// Store files in memory so Sharp can manipulate the buffer
const storage = multer.memoryStorage();
const rawUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"), false);
    }
  },
});

// Proxy multer instance to automatically wrap middleware calls
const upload = new Proxy(rawUpload, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (typeof value === "function" && ["single", "array", "fields", "any", "none"].includes(prop)) {
      return function (...args) {
        const middleware = value.apply(target, args);
        return wrapMiddleware(middleware);
      };
    }
    return value;
  }
});

const processAndUploadImage = async (req, res, next) => {
  if (!req.file && (!req.files || Object.keys(req.files).length === 0)) {
    return next();
  }

  try {
    const uploadBufferToCloudinary = (buffer, folderName) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: folderName, format: "webp" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        Readable.from(buffer).pipe(stream);
      });
    };

    // Helper to process a single file object
    const processFile = async (fileObj) => {
      const processedBuffer = await sharp(fileObj.buffer)
        .webp({ quality: 80 }) // Compress to WebP
        .toBuffer();
      const url = await uploadBufferToCloudinary(processedBuffer, "photo_crm/cms");
      fileObj.cloudinaryUrl = url;
    };

    // 1. If upload.single() was used
    if (req.file) {
      await processFile(req.file);
    }

    // 2. If upload.array() was used
    if (req.files && Array.isArray(req.files)) {
      await Promise.all(req.files.map(file => processFile(file)));
    }

    // 3. If upload.fields() was used
    if (req.files && !Array.isArray(req.files)) {
      const promises = [];
      for (const fieldName in req.files) {
        req.files[fieldName].forEach(file => {
          promises.push(processFile(file));
        });
      }
      await Promise.all(promises);
    }

    next();
  } catch (error) {
    console.error("Image Processing Error:", error);
    res.status(500).json({ message: "Error processing image", error: error.message });
  }
};

module.exports = {
  upload,
  processAndUploadImage
};
