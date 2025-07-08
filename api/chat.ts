
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, GenerateContentResponse, Part, Content, GroundingChunk } from "@google/genai";
import { ChatMessage, MessageSender, WebSource } from '../types.js'; 
import { getSystemInstruction } from '../constants.js';

// Handler da Rota de API
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Vercel automaticamente analisa o corpo da requisição para JSON
  const { userInput, chatHistory, imageBase64, learnedKnowledge = [] } = req.body;
  
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("CRÍTICO: A variável de ambiente API_KEY não está definida no servidor.");
    return res.status(500).json({ error: "Problema técnico: A configuração do servidor para a API de IA está ausente. Por favor, avise o suporte." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey }); 
    const modelName = "gemini-2.5-flash";
    const contents: Content[] = [];

    // Cópia do histórico para processamento.
    const processedHistory: ChatMessage[] = [...chatHistory.slice(-10)];
    
    // GARANTIA DE INÍCIO DE CONVERSA: A API Gemini requer que o histórico de chat
    // comece com uma mensagem de 'user'. Se a nossa começa com 'assistant', removemos.
    if (processedHistory.length > 0 && processedHistory[0].sender === MessageSender.ASSISTANT) {
      processedHistory.shift(); // Remove a primeira mensagem (saudação do assistente)
    }

    // Constrói o histórico para o modelo a partir do histórico já processado
    processedHistory.forEach((msg: ChatMessage) => { 
      if (msg.sender === MessageSender.SYSTEM) return;
      
      const parts: Part[] = [{text: msg.text}];
      if (msg.image && msg.sender === MessageSender.USER) { 
          const mimeTypeMatch = msg.image.match(/^data:(image\/(?:jpeg|png|webp|gif|heic));base64,/);
          const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
           parts.unshift({
              inlineData: {
                  mimeType: mimeType,
                  data: msg.image.substring(msg.image.indexOf(',') + 1),
              },
          });
      }
      contents.push({ role: msg.sender === MessageSender.USER ? 'user' : 'model', parts });
    });

    // Entrada atual do usuário
    const currentParts: Part[] = [];
    if (imageBase64) {
      const mimeTypeMatch = imageBase64.match(/^data:(image\/(?:jpeg|png|webp|gif|heic));base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
      currentParts.push({
        inlineData: { mimeType, data: imageBase64.substring(imageBase64.indexOf(',') + 1) },
      });
    }
    currentParts.push({ text: userInput || (imageBase64 ? "Pode me ajudar com esta imagem, por favor?" : "Olá.") });
    contents.push({ role: "user", parts: currentParts });
    
    const systemInstruction = getSystemInstruction(learnedKnowledge);
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: [{googleSearch: {}}],
      },
    });

    let responseText = response.text || "Não consegui encontrar uma resposta clara para isso. Pode tentar perguntar de outra forma?";

    // Extrai fontes
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = groundingMetadata?.groundingChunks
        ?.map(chunk => chunk.web) 
        .filter((web): web is GroundingChunk['web'] & { uri: string; title: string } => 
            web !== undefined && typeof web.uri === 'string' && typeof web.title === 'string'
        )
        .map(web => ({ uri: web.uri, title: web.title } as WebSource));

    return res.status(200).json({ text: responseText, sources });

  } catch (error: any) {
    console.error("Erro na API Route ao chamar a API Gemini:", error);
    let detailedErrorMessage = "Oops! Algo não funcionou bem ao tentar buscar sua resposta no servidor.";
    
    const errStr = error.toString().toLowerCase();

    if (errStr.includes("api key not valid") || errStr.includes("permission denied")) {
      detailedErrorMessage = "Problema técnico: Parece que há um erro na configuração do assistente (erro de chave no servidor).";
    } else if (errStr.includes("quota") || errStr.includes("rate limit")) {
      detailedErrorMessage = "Estamos recebendo muitas perguntas agora! Por favor, tente novamente em alguns minutos.";
    } else if (errStr.includes("candidate was blocked")) {
      detailedErrorMessage = "Não consegui processar essa pergunta por segurança. Tente perguntar de uma forma diferente, por favor.";
    }
    
    return res.status(500).json({ error: detailedErrorMessage });
  }
}