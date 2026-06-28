const { Server } = require("socket.io");
const { resolveTenantId } = require("./middleware/tenant.middleware");

let io;
// Key: tenantId, Value: array of { adminId, socketId }
let adminsByTenant = {};

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: "*", // Adjust for production domains
        methods: ["GET", "POST"]
      }
    });

    io.on("connection", (socket) => {
      // 1. Identify domain from query parameters or origin header
      let clientDomain = socket.handshake.query.domain || socket.handshake.headers.origin || socket.handshake.headers.referer;
      
      // 2. Resolve to a Tenant ID (e.g., 'amarpatil', 'gabha')
      let tenantId = resolveTenantId(clientDomain);

      // Local development override: if server host is localhost/127.0.0.1 and DEFAULT_TENANT_DOMAIN is set, prioritize it!
      const socketHost = socket.handshake.headers.host || "";
      if (socketHost.includes("localhost") || socketHost.includes("127.0.0.1")) {
        if (process.env.DEFAULT_TENANT_DOMAIN) {
          tenantId = process.env.DEFAULT_TENANT_DOMAIN;
        }
      }

      if (!tenantId) {
        tenantId = "default";
      }

      console.log(`Socket connected: ${socket.id} on tenant: ${tenantId} (origin: ${clientDomain || 'none'})`);

      // 3. Put the socket into a tenant-specific room
      socket.join(tenantId);

      socket.on("registerAdmin", (adminId) => {
        if (!adminsByTenant[tenantId]) {
          adminsByTenant[tenantId] = [];
        }

        // Prevent duplicate registers for same socket under this tenant
        if (!adminsByTenant[tenantId].find(a => a.socketId === socket.id)) {
          adminsByTenant[tenantId].push({ adminId, socketId: socket.id });
          console.log(`Admin ${adminId} registered under tenant ${tenantId} with Socket ${socket.id}`);
        }
      });

      socket.on("disconnect", () => {
        if (adminsByTenant[tenantId]) {
          adminsByTenant[tenantId] = adminsByTenant[tenantId].filter(a => a.socketId !== socket.id);
        }
        console.log(`Socket disconnected: ${socket.id} from tenant ${tenantId}`);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },

  // Retrieve admins for a specific tenant ID
  getAdmins: (tenantId = "default") => {
    return adminsByTenant[tenantId] || [];
  },
};
