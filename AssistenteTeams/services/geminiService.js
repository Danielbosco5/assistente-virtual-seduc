
const { GoogleGenAI } = require('@google/genai');
const { GEMINI_MODEL, SYSTEM_INSTRUCTION } = require('../constants');

// Validação crítica da chave da API na inicialização
if (!process.env.API_KEY) {
    throw new Error("CRITICAL: A variável de ambiente API_KEY do Gemini não está configurada.");
}

// Instância única do cliente Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Encapsula a lógica de chamada à API Gemini, incluindo tratamento de resposta e erro.
 * @param {Array<Object>} history O histórico da conversa atual.
 * @param {Array<Object>} currentUserParts As partes da mensagem atual do usuário (texto e/ou imagem).
 * @returns {Promise<{text?: string, sources?: Array<{uri: string, title: string}>, error?: string}>} Um objeto contendo a resposta ou um erro.
 */
async function askSeducAssistant(history, currentUserParts) {
    // Monta o conteúdo completo para a API, incluindo o histórico e a nova pergunta
    const contents = [...history, { role: "user", parts: currentUserParts }];

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                tools: [{googleSearch: {}}],
            },
        });

        // Extração robusta do texto da resposta
        let responseText = getTextFromResponse(response);
        
        // Extração de fontes (grounding metadata)
        const sources = getSourcesFromResponse(response);

        return { text: responseText, sources };

    } catch (error) {
        console.error("Erro ao chamar a API do Gemini:", error);
        // Mapeia o erro da API para uma mensagem amigável para o usuário
        const userFriendlyError = mapErrorToUserMessage(error);
        return { error: userFriendlyError };
    }
}

/**
 * Extrai o texto da resposta da API de forma segura.
 * @param {import('@google/genai').GenerateContentResponse} response A resposta da API.
 * @returns {string} O texto da resposta.
 */
function getTextFromResponse(response) {
    if (response.text) {
        return response.text;
    }
    
    // Fallback caso a propriedade .text não esteja disponível
    if (response.candidates && response.candidates[0]?.content?.parts?.length > 0) {
        const textFromParts = response.candidates[0].content.parts
            .map(part => part.text)
            .filter(text => typeof text === 'string')
            .join("\n\n")
            .trim();
        if (textFromParts) return textFromParts;
    }

    // Resposta padrão se nenhum texto puder ser extraído
    return "Não consegui encontrar uma resposta clara para isso. Pode tentar perguntar de outra forma ou com mais detalhes?";
}

/**
 * Extrai as fontes de pesquisa da web (se houver) da resposta.
 * @param {import('@google/genai').GenerateContentResponse} response A resposta da API.
 * @returns {Array<{uri: string, title: string}>|undefined} Uma lista de fontes ou indefinido.
 */
function getSourcesFromResponse(response) {
     const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
     return groundingMetadata?.groundingChunks
        ?.map(chunk => chunk.web)
        .filter(web => web?.uri && web.title)
        .map(web => ({ uri: web.uri, title: web.title }));
}

/**
 * Mapeia erros técnicos da API para mensagens amigáveis ao usuário.
 * @param {Error} error O objeto de erro capturado.
 * @returns {string} Uma mensagem de erro para ser exibida ao usuário.
 */
function mapErrorToUserMessage(error) {
    const errStr = error.toString().toLowerCase();

    if (errStr.includes("api key not valid") || errStr.includes("permission denied")) {
        return "Problema técnico: Parece que há um erro na configuração do assistente. Por favor, avise o suporte (erro de chave).";
    }
    if (errStr.includes("quota") || errStr.includes("rate limit") || errStr.includes("resource has been exhausted")) {
        return "Estamos recebendo muitas perguntas agora! Por favor, tente novamente em alguns minutos.";
    }
    if (errStr.includes("candidate was blocked") || errStr.includes("safety settings")) {
        return "Não consegui processar essa pergunta por segurança. Tente perguntar de uma forma diferente, por favor.";
    }
    if (errStr.includes("network error") || errStr.includes("failed to fetch")) {
        return "Não estou conseguindo me conectar à internet para buscar sua resposta. Verifique sua conexão e tente novamente.";
    }
    if (error.message) {
        return `Oops! Algo deu errado: ${error.message}. Tente de novo, por favor.`;
    }
    
    return "Oops! Algo não funcionou bem ao tentar buscar sua resposta. Por favor, tente de novo em instantes.";
}


module.exports = { askSeducAssistant };