const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer to a directory inside the project
  // so it persists across deployments on platforms like Render.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
