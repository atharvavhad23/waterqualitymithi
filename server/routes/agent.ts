import type { RequestHandler } from "express";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// Real Claude Sonnet 4 streaming endpoint
export const handleAgentStream: RequestHandler = async (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("X-Accel-Buffering", "no");

  const prompt: string = (req.body && req.body.prompt) || "";
  
  if (!prompt) {
    res.status(400).end("No prompt provided");
    return;
  }

  try {
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800, // Reduced for speed
      temperature: 0, // Deterministic for faster output
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Stream chunks to client
    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        res.write(chunk.delta.text);
      }
    }

    res.end();
  } catch (error) {
    console.error("Claude streaming error:", error);
    res.status(500).end("Stream error");
  }
};

export const handleAgent: RequestHandler = async (req, res) => {
  const prompt: string = (req.body && req.body.prompt) || "";
  
  if (!prompt) {
    res.status(400).json({ ok: false, error: "No prompt provided" });
    return;
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800, // Reduced for speed
      temperature: 0, // Deterministic for faster output
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === "text");
    const answer = textContent && textContent.type === "text" ? textContent.text : "";

    res.json({
      ok: true,
      prompt,
      answer,
    });
  } catch (error) {
    console.error("Claude API error:", error);
    res.status(500).json({ ok: false, error: "API error" });
  }
};

