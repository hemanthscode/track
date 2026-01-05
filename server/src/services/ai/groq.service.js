import { getGroqClient, groqConfig } from "../../config/groq.js";
import { AI_PROMPTS } from "../../config/constants.js";
import logger from "../../utils/logger.js";
import ApiError from "../../utils/ApiError.js";

/**
 * Generate completion using Groq LLM
 */
export const generateCompletion = async (systemPrompt, userPrompt, options = {}) => {
  try {
    const groq = getGroqClient();

    const response = await groq.chat.completions.create({
      model: options.model || groqConfig.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: options.temperature || groqConfig.temperature,
      max_tokens: options.maxTokens || groqConfig.maxTokens,
      top_p: groqConfig.topP,
      stream: false,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from Groq API");
    }

    logger.debug("Groq completion generated", {
      model: groqConfig.model,
      tokens: response.usage?.total_tokens,
    });

    return content.trim();
  } catch (error) {
    logger.error("Groq API error", { error: error.message });
    throw ApiError.internal("AI service temporarily unavailable");
  }
};

/**
 * Generate streaming completion (for chatbot)
 */
export const generateStreamingCompletion = async (messages, options = {}) => {
  try {
    const groq = getGroqClient();

    const stream = await groq.chat.completions.create({
      model: options.model || groqConfig.model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1024,
      stream: true,
    });

    return stream;
  } catch (error) {
    logger.error("Groq streaming error", { error: error.message });
    throw ApiError.internal("AI streaming service unavailable");
  }
};

/**
 * Extract structured data from text using JSON mode
 */
export const extractStructuredData = async (prompt, schema) => {
  try {
    const groq = getGroqClient();

    const response = await groq.chat.completions.create({
      model: groqConfig.model,
      messages: [
        {
          role: "system",
          content: `You are a data extraction assistant. Extract information according to the schema and respond ONLY with valid JSON. Schema: ${JSON.stringify(schema)}`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    return JSON.parse(content);
  } catch (error) {
    logger.error("Structured data extraction failed", { error: error.message });
    throw ApiError.internal("Failed to extract structured data");
  }
};

export default { generateCompletion, generateStreamingCompletion, extractStructuredData };
