const webpush = require("web-push");
const { getTenantConfig } = require("../middleware/tenant.middleware");

// Set default fallback VAPID details
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:mafpco.dev@gmail.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

exports.sendWebPush = async (subscription, data, tenantConfigOverride = null) => {
  const tenantConfig = tenantConfigOverride || getTenantConfig();

  const payload = JSON.stringify({
    title: data.title,
    message: data.message,
    url: data.redirectUrl || "/admin",
  });

  const options = {};
  if (tenantConfig && tenantConfig.VAPID_PUBLIC_KEY && tenantConfig.VAPID_PRIVATE_KEY) {
    options.vapidDetails = {
      subject: "mailto:mafpco.dev@gmail.com",
      publicKey: tenantConfig.VAPID_PUBLIC_KEY,
      privateKey: tenantConfig.VAPID_PRIVATE_KEY
    };
  }

  try {
    await webpush.sendNotification(subscription, payload, options);
  } catch (error) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      // The subscription has expired or is no longer valid
      console.log(`Subscription ${subscription.endpoint} deleted by the service provider.`);
      const Subscription = require("../models/Subscription.model");
      await Subscription.deleteOne({ endpoint: subscription.endpoint });
    } else {
      console.error("WebPush Error:", error);
    }
  }
};
