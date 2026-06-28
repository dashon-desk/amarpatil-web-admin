const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// Create a Proxy for the uploader object to inject dynamic config
const originalUploader = cloudinary.uploader;
const uploaderProxy = new Proxy(originalUploader, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (typeof value === "function") {
      return function (...args) {
        try {
          const { getTenantConfig } = require("../middleware/tenant.middleware");
          const config = getTenantConfig();

          if (config && config.CLOUDINARY_NAME) {
            // In upload_stream, options is the first argument
            if (args[0] && typeof args[0] === "object" && !Array.isArray(args[0])) {
              args[0] = {
                cloud_name: config.CLOUDINARY_NAME,
                api_key: config.CLOUDINARY_API_KEY,
                api_secret: config.CLOUDINARY_SECRET_KEY,
                ...args[0],
              };
            } else if (args[1] && typeof args[1] === "object" && !Array.isArray(args[1])) {
              // In other calls like upload(file, options, callback), options is the second argument
              args[1] = {
                cloud_name: config.CLOUDINARY_NAME,
                api_key: config.CLOUDINARY_API_KEY,
                api_secret: config.CLOUDINARY_SECRET_KEY,
                ...args[1],
              };
            }
          }
        } catch (_) {
          // Fallback if tenant middleware module isn't loaded/ready
        }
        return value.apply(target, args);
      };
    }
    return value;
  }
});

// Override uploader property
Object.defineProperty(cloudinary, "uploader", {
  get() {
    return uploaderProxy;
  },
  configurable: true
});

module.exports = cloudinary;
