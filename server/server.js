require("dotenv").config();
const app = require("./app");
const http = require("http");
const connectDB = require("./config/db");
const socketModule = require("./socket");
const cron = require("node-cron");
const Reminder = require("./models/Reminder.model");
const Notification = require("./models/Notification.model");
const Subscription = require("./models/Subscription.model");
const webpushUtil = require("./utils/webpush");

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP Server and Wrap Express
const server = http.createServer(app);

// Initialize Socket.io
const io = socketModule.init(server);

// Init Cron Reminders
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const tenantsConfig = require("./config/tenants");
  const { getTenantConnection, asyncLocalStorage } = require("./middleware/tenant.middleware");

  for (const domain of Object.keys(tenantsConfig)) {
    const config = tenantsConfig[domain];
    try {
      const connection = await getTenantConnection(domain, config.MONGODB_URI);

      await asyncLocalStorage.run({ connection, config, tenant: domain }, async () => {
        const reminders = await Reminder.find({ due: { $lte: now }, isProcessed: false });

        if (reminders.length > 0) {
          const admins = socketModule.getAdmins(domain);
          for (const rem of reminders) {
            const notificationData = {
              title: "Reminder ⏰",
              message: rem.message,
              type: "reminder",
              redirectUrl: `/admin/reminders`,
            };

            const savedNotif = await Notification.create(notificationData);

            admins.forEach(admin => {
              io.to(admin.socketId).emit("newNotification", savedNotif);
            });

            const subscriptions = await Subscription.find();
            Promise.all(subscriptions.map(sub => webpushUtil.sendWebPush(sub, notificationData)))
              .catch(err => console.error(`Web Push broadcast issue on Reminder for tenant ${domain}:`, err));

            rem.isProcessed = true;
            await rem.save();
          }
        }
      });
    } catch (err) {
      console.error(`Error running cron reminders for tenant ${domain}:`, err);
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
