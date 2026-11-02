// Ultra-fast agent configuration optimized for speed
export const agentConfig = {
  maxTokens: 800, // Reduced for faster responses
  temperature: 0, // Deterministic for speed
  streaming: true,
  timeout: 15000, // 15s timeout for quick responses
  maxRetries: 1, // Reduced retries
  model: "claude-sonnet-4-20250514", // Claude Sonnet 4
};
