import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = API_BASE.replace("/api", "");

const tenantDomain = window.location.hostname;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  query: {
    domain: tenantDomain
  }
});
