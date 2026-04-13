import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const chatWithGemini = async (
  prompt: string,
  history: { role: string; parts: { text: string }[] }[] = [],
) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemma-4-26b-a4b-it",
      systemInstruction:
        "Anda adalah asisten pencari data untuk siswa. Anda WAJIB menjawab dalam format JSON dengan struktur: { \"pesan\": \"...\", \"sumber_data\": [...] }. Masukkan semua tautan (URL) dataset yang Anda temukan langsung ke dalam teks pada field \"pesan\" agar siswa dapat melihatnya. Field \"sumber_data\" tetap diisi sebagai metadata terstruktur.",
    });

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw new Error("Gagal mendapatkan respon dari AI.");
  }
};
