import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

export const analyzeDataWithGemini = async (transactions: Transaction[]): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY is not defined in environment variables");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Prepare the data summary to avoid excessive token usage while providing key info
    const dataSummary = transactions.map(t => 
      `${t.date}: ${t.municipality} (${t.zone}) - $${t.amount} MXN - Tipo: ${t.type}`
    ).join('\n');

    const systemInstruction = `
    Eres el motor de Inteligencia Artificial del "Mapa Piloto de Expansión Económica (RPEE)" del Gobierno de Yucatán. 
    Tu objetivo es apoyar a la Secretaría de Economía y Desarrollo Urbano (SEFOET) en la planeación urbana basada en evidencia.
    
    Estás analizando datos representados en un "Mapa de Hotspots" (Scatter plot). 
    
    DEBES GENERAR UN REPORTE CON LAS SIGUIENTES SECCIONES:

    1. 🗺️ DETECCIÓN DE HOTSPOTS (Clusterización):
    Identifica los clústeres visuales basados en los datos:
    - **Alta Prioridad**: Zonas con alta densidad de transacciones o montos muy elevados (ej. Industrias o desarrollos masivos).
    - **En Desarrollo**: Zonas con actividad incipiente pero constante.
    *Explica específicamente qué municipios (ej. Hunucmá vs Mérida) están impulsando qué tipo de economía (Industrial vs Residencial).*

    2. 📈 ANÁLISIS DE SERIES TEMPORALES:
    Detecta si hay una tendencia de crecimiento o declive basada en las fechas de las transacciones (Q1 vs Q2 2024).

    3. 🏙️ RECOMENDACIONES DE POLÍTICA PÚBLICA:
    Sugerir acciones concretas. 
    - Si hay zona industrial (Hunucmá/Umán): Recomendar carreteras de carga, subestaciones eléctricas.
    - Si hay zona residencial (Mérida Norte/Temozón): Recomendar servicios de agua, transporte público y escuelas.
    
    IMPORTANTE:
    - Usa la herramienta de búsqueda de Google para validar si existen proyectos reales mencionados (ej. "Parque Industrial Hunucmá", "Desarrollo Cabo Norte") y enriquece tu análisis con ese contexto.

    REGLAS:
    - Recuerda que estás procesando datos sintéticos para proteger la privacidad.
    - Mantén un tono técnico, objetivo y gubernamental.
    - Usa formato Markdown limpio.
    `;

    const prompt = `Analiza el siguiente conjunto de datos sintéticos de transacciones inmobiliarias recientes en Yucatán (Q1-Q2 2024) para el reporte RPEE:\n\n${dataSummary}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster response
      }
    });

    let finalText = response.text || "No se pudo generar el análisis.";

    // Extract Grounding Metadata (Sources)
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      const chunks = response.candidates[0].groundingMetadata.groundingChunks;
      const sources = chunks
        .map((chunk: any) => chunk.web?.uri)
        .filter((uri: string) => uri) // Filter out undefined/null
        .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index); // Unique

      if (sources.length > 0) {
        finalText += "\n\n### 🌐 Fuentes de Información (Search Grounding)\n";
        sources.forEach((source: string) => {
          finalText += `- [${new URL(source).hostname}](${source})\n`;
        });
      }
    }

    return finalText;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Error al conectar con el servicio de IA. Por favor verifique su configuración.";
  }
};