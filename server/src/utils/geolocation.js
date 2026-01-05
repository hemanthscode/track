import axios from "axios";
import logger from "./logger.js";

/**
 * Get location from IP address using ip-api.com (free tier)
 */
export const getLocationFromIP = async (ipAddress) => {
  try {
    // Skip for local IPs
    if (!ipAddress || ipAddress === "::1" || ipAddress.startsWith("127.")) {
      return "Local";
    }

    const response = await axios.get(`http://ip-api.com/json/${ipAddress}`, {
      timeout: 3000,
    });

    if (response.data.status === "success") {
      const { city, country } = response.data;
      return `${city}, ${country}`;
    }

    return "Unknown";
  } catch (error) {
    logger.warn("Failed to get geolocation", { 
      ip: ipAddress, 
      error: error.message 
    });
    return "Unknown";
  }
};

/**
 * Extract IP from request (handles proxies)
 */
export const getClientIP = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip
  );
};
