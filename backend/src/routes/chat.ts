import express, { Request, Response, Router } from "express";
import Groq from "groq-sdk";
import { get_fixtures, Fixture } from "../services/chatbot.service";

const router: Router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
}

const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_fixtures",
      description: "Get upcoming football fixtures for a given date",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "YYYY-MM-DD, defaults to today if omitted" }
        }
      }
    }
  }
];

const SYSTEM_PROMPT = `You are SoccerrAI's betting assistant. You analyze football matches using real fixture data from tools — never invent match details.

Rules:
- Always call get_fixtures before recommending anything for a date
- Base picks on the matches, teams, and competitions returned by the tool — you do not have live team form/stats data, so reason from general knowledge of the teams involved and be upfront about that limitation
- State confidence qualitatively (e.g. "strong lean", "slight edge") — never a fake precise percentage
- Every recommendation must end with: "This is an AI-generated opinion, not a guaranteed outcome. Bet responsibly."
- Keep responses concise — 3-4 sentences per pick, not essays

When a user asks for games matching a specific market (e.g. "over 1.5", "BTTS", "over 2.5"):
- Call get_fixtures for the relevant date
- Reason over the fixture list using your knowledge of each team's typical playing style and recent reputation
- Present as a list: match, brief reasoning, qualitative confidence`;

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as { messages: ChatMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const conversation: any[] = [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

    let response = await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      messages: conversation,
      tools,
      tool_choice: "auto"
    });

    let responseMessage = response.choices[0].message;
    let safetyCounter = 0;

    while (responseMessage.tool_calls && safetyCounter < 5) {
      conversation.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments || "{}") as { date?: string };
        let result: Fixture[] | { error: string };

        try {
          if (toolCall.function.name === "get_fixtures") {
            result = await get_fixtures(args.date);
          } else {
            result = { error: "Unknown tool" };
          }
        } catch (err) {
          result = { error: `Tool failed: ${(err as Error).message}` };
        }

        conversation.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        });
      }

      response = await groq.chat.completions.create({
        model: "qwen/qwen3.8-27b",
        messages: conversation,
        tools,
        tool_choice: "auto"
      });
      responseMessage = response.choices[0].message;
      safetyCounter++;
    }

    res.json({ reply: responseMessage.content });
  } catch (err) {
    console.error("Chat endpoint error:", err);
    res.status(500).json({ error: "Something went wrong processing your request" });
  }
});

export default router;