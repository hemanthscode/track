import Groq from "groq-sdk";
import { config } from "./env.js";
import logger from "../utils/logger.js";

let groqClient = null;

export const initializeGroq = () => {
  try {
    groqClient = new Groq({
      apiKey: config.groq.apiKey,
    });
    
    logger.info("✅ Groq AI initialized");
    return groqClient;
  } catch (error) {
    logger.error("Failed to initialize Groq", { error: error.message });
    throw error;
  }
};

export const getGroqClient = () => {
  if (!groqClient) {
    return initializeGroq();
  }
  return groqClient;
};

export const groqConfig = {
  model: config.groq.model,
  temperature: 0.3,
  maxTokens: 1024,
  topP: 1,
  stream: false,
};

export default { initializeGroq, getGroqClient, groqConfig };
