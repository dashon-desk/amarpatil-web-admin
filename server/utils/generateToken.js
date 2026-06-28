const jwt = require("jsonwebtoken");
const { getTenantConfig } = require("../middleware/tenant.middleware");

const generateToken = (user) => {
  const tenantConfig = getTenantConfig();
  const secret = tenantConfig ? tenantConfig.JWT_SECRET : process.env.JWT_SECRET;
  
  return jwt.sign(
    { id: user._id, role: user.role },
    secret,
    { expiresIn: "7d" }
  );
};

module.exports = generateToken;
