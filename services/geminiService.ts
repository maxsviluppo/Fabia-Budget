
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
  try {
    if (transactions.length === 0) {
      return "Non ci sono ancora abbastanza dati per generare un report. Aggiungi alcune spese o entrate!";
    }

    // Initialize GoogleGenAI inside the function using process.env.API_KEY directly
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const recentTransactions = transactions.slice(0, 50);
    const dataString = JSON.stringify(recentTransactions.map(t => ({
      date: t.date.split('T')[0],
      type: t.type === 'income' ? 'Entrata' : 'Uscita',
      category: t.category,
      amount: t.amount,
      desc: t.description
    })));

    // Use gemini-3-flash-preview for basic text tasks like summarization
    const modelName = 'gemini-3-flash-preview';
    const prompt = `
      Sei un assistente finanziario personale gentile e intelligente per una famiglia.
      Analizza le seguenti transazioni (JSON):
      ${dataString}

      Fornisci un breve riassunto amichevole (massimo 3 paragrafi) in italiano.
      1. Evidenzia dove stiamo spendendo di più.
      2. Dai un consiglio su come risparmiare o gestire meglio il budget.
      3. Mantieni un tono incoraggiante e simpatico ("dark soft aesthetic vibe").
      
      Non usare formattazione Markdown complessa, solo testo semplice e paragrafi.
    `;

    // Calling generateContent with both model name and prompt as per guidelines
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    // Access the text property directly (not a method)
    return response.text || "Non sono riuscito a generare un consiglio al momento.";
  } catch (error) {
    console.error("Error fetching Gemini advice:", error);
    return "Consiglio: Mantieni monitorate le uscite extra di questo mese per ottimizzare il risparmio.";
  }
};
