import { ChatMessage, WebSource } from '../types'; 

interface SeducAssistantResponse {
  text: string;
  sources?: WebSource[];
}

export const askSeducAssistant = async (
  userInput: string,
  chatHistory: ChatMessage[],
  imageBase64?: string,
  learnedKnowledge: string[] = []
): Promise<SeducAssistantResponse> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userInput,
        chatHistory,
        imageBase64,
        learnedKnowledge,
      }),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorData;
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
      } else {
        // Fallback for non-JSON responses, e.g., HTML error pages from the server
        const textError = await response.text();
        console.error("Server returned non-JSON error:", textError);
        throw new Error(`O servidor retornou um erro inesperado (código: ${response.status}). Por favor, informe o suporte técnico.`);
      }
      // Use the error message from the backend, or a default message
      throw new Error(errorData.error || `Erro na comunicação com o servidor: ${response.statusText}`);
    }

    const data: SeducAssistantResponse = await response.json();
    return data;

  } catch (error: any) {
    console.error("Erro ao chamar a API de chat do backend:", error);
    let detailedErrorMessage = "Oops! Algo não funcionou bem ao tentar buscar sua resposta. Por favor, tente de novo em instantes.";
    
    if (error.message.toLowerCase().includes("failed to fetch")) {
        detailedErrorMessage = "Não estou conseguindo me conectar à internet para buscar sua resposta. Verifique sua conexão e tente novamente."
    } else if (error.message) { 
        detailedErrorMessage = `Oops! Algo deu errado: ${error.message}. Tente de novo, por favor.`;
    }

    // Retorna o erro no formato esperado
    return { text: detailedErrorMessage };
  }
};