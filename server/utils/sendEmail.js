const nodemailer = require("nodemailer");
const { getTenantConfig } = require("../middleware/tenant.middleware");

const sendEmail = async (options) => {
  const tenantConfig = getTenantConfig();
  let transporter;

  if (tenantConfig && tenantConfig.MAIL_USER && tenantConfig.MAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: tenantConfig.MAIL_USER,
        pass: tenantConfig.MAIL_PASS,
      },
    });
  } else {
    transporter = require("../config/smtp");
  }

  const mailOptions = {
    from: tenantConfig ? tenantConfig.MAIL_USER : process.env.MAIL_USER,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
    attachments: options.attachments || [],
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
