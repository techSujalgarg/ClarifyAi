import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Legal analysis
  app.post("/api/analyze", async (req: express.Request, res: express.Response) => {
    try {
      const { contractText, customApiKey } = req.body;

      if (!contractText || contractText.trim() === "") {
        return res.status(400).json({ error: "No contract text was provided." });
      }

      // Direct fallback strategy: check for custom key or environment config
      const apiKey = (customApiKey && customApiKey.trim() !== "") ? customApiKey : process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({ 
          error: "API key is missing. Please provide it in the API Key input field on the top right, or configure it as GEMINI_API_KEY." 
        });
      }

      // Initialize the official developer SDK
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = 
        "You are an elite legal analyst. Your task is to analyze contracts and agreements, particularly for freelancers or independent contractors. " +
        "You must analyze the text very carefully and structure your response into exactly three main parts: " +
        "1. A clear, highly concise 'Simple Summary' written in plain english (decoding the complex legalese into clear layperson terms). " +
        "2. A detailed list of '🚨 Red Flags Highlighted' detailing hidden clauses, modern gotchas, problematic payment terms, IP grabs, and liability traps. Style each red flag item nicely with bold headings and direct explanations of what makes it problematic. " +
        "3. Concrete 'Suggested Counter-Clauses' or alternative phrasing for the highlighted red flags that protect the freelancer's interests. " +
        "Ensure your markdown formatting is extremely clean, highly legible, structured and professional.";

      const prompt = `Please analyze the following contract and agreement text thoroughly:\n\n${contractText}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
        }
      });

      const resultText = response.text;
      if (!resultText) {
        return res.status(500).json({ error: "Gemini did not return any analyzed text." });
      }

      return res.json({ result: resultText });
    } catch (error: any) {
      console.error("Analysis failed:", error);
      return res.status(500).json({ error: error.message || "Internal Server Error during contract review." });
    }
  });

  // Serve static assets or mount Vite dev server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
