import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello");
    console.log("gemini-pro works:", result.response.text());
  } catch (e) {
    console.log("gemini-pro failed:", e.message);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("gemini-1.5-flash works:", result.response.text());
  } catch (e) {
    console.log("gemini-1.5-flash failed:", e.message);
  }
}

listModels();
