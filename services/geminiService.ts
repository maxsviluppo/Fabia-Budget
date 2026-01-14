
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

// Initialize Gemini Client
// Note: In a real production app, ensure this is handled securely.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
  try {
    if (transactions.length === 0) {
      return "Non ci sono ancora abbastanza dati per generare un report. Aggiungi alcune spese o entrate!";
    }

    // Prepare data for the prompt
    const recentTransactions = transactions.slice(0, 50); // Analyze last 50 for brevity
    const dataString = JSON.stringify(recentTransactions.map(t => ({
      date: t.date.split('T')[0],
      type: t.type === 'income' ? 'Entrata' : 'Uscita',
      category: t.category,
      amount: t.amount,
      desc: t.description
    })));

    // Use gemini-3-flash-preview as per model selection guidelines for basic text tasks
    const model = 'gemini-3-flash-preview';
    const prompt = `
      Sei un assistente finanziario personale gentile e intelligente per una famiglia.
      Analizza le seguenti transazioni (JSON):
      ${dataString}

      Fornisci un breve riassunto amichevole (massimo 3 paragrafi) in italiano.
      1. Evidenzia dove stiamo spendendo di più (es. "Sembra che Zara stia mangiando molto questo mese!").
      2. Dai un consiglio su come risparmiare o gestire meglio il budget.
      3. Mantieni un tono incoraggiante e simpatico ("dark soft aesthetic vibe").
      
      Non usare formattazione Markdown complessa, solo testo semplice e paragrafi.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    // Accessing the .text property directly as per the current SDK guidelines
    return response.text || "Non sono riuscito a generare un consiglio al momento.";
  } catch (error) {
    console.error("Error fetching Gemini advice:", error);
    return "Ops! Qualcosa è andato storto mentre consultavo le stelle finanziarie. Riprova più tardi.";
  }
};
