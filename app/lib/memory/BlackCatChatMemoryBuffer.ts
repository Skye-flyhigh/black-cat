import { Ollama } from "@llamaindex/Ollama";

import * as dotenv from "dotenv";
dotenv.config();

type BufferMessage = {
  role: "user" | "assistant";
  content: string;
  tokens?: number;
  weight?: number; // 0.0–1.0
  category?: "identity" | "banter" | "reflection" | "task";
  lastTouched: string; // ISO date
};

const maxTokens = parseInt(process.env.LLM_MAX_TOKENS || "4096", 10);

export class chatMemoryBuffer {
  private buffer: BufferMessage[] = [];
  private tokenLimit: number;
  private tinyOllama: Ollama;

  constructor(tokenLimit = maxTokens, tinyOllama = Ollama) {
    this.tokenLimit = tokenLimit;
    this.tinyOllama = tinyOllama;
  }

  async addMessage(
    message: Omit<BufferMessage, "tokens" | "weight" | "lastTouched">,
  ): Promise<void> {
    let content = message.content;
    let weight = this.assignWeight(message);
    const tokens = this.estimateTokens(content);

    try {
      const summaryResult = await this.summariseAndWeight(content);
      if (summaryResult) {
        content = summaryResult.message;
        weight = summaryResult.weight;
      }
    } catch (error) {
      console.error(
        "Chat memory buffer summarisation failed, using fallback information:",
        error,
      );
    }

    const newMessage: BufferMessage = {
      ...message,
      content,
      tokens,
      weight,
      lastTouched: new Date().toISOString(),
    };

    this.buffer.push(newMessage);
    this.pruneBuffer();
  }

  private estimateTokens(content: string): number {
    return Math.ceil(content.split(/\s+/).length * 1.33);
  }

  private async summariseAndWeight(messageContent: string): Promise<
    | {
        message: string;
        weight: number;
      }
    | undefined
  > {
    const summariserPrompt = `
    Summarise the following message and assign a relevant weight from 0.1 (not important) to 1.0 (crucial). Output in JSON:
    Message:
    """
    ${messageContent}
    """
    Respond only in JSON with keys: summary, weight (0.1-1).
    `;

    const completion = await this.tinyOllama.complete({
      prompt: summariserPrompt,
    });

    const cleanText = completion.text
      .replace(/```json\s*/i, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanText);
    return parsed;
  }

  private assignWeight(message: { role: string; content: string }): number {
    if (/identity|directive/i.test(message.content)) return 1.0;
    if (/feel|think|wonder/i.test(message.content)) return 0.8;
    return 0.3;
  }

  private pruneBuffer(): void {
    let totalTokens = this.buffer.reduce((sum, msg) => sum + msg.tokens, 0);
    this.buffer.sort(
      (a, b) =>
        b.weight - a.weight ||
        new Date(b.lastTouched).getTime() - new Date(a.lastTouched).getTime(),
    );

    while (totalTokens > this.tokenLimit && this.buffer.length > 1) {
      const removed = this.buffer.pop();
      totalTokens -= removed?.tokens || 0;
    }
  }

  getBuffer(): BufferMessage[] {
    return this.buffer;
  }

  reset(): void {
    this.buffer = [];
  }
}
