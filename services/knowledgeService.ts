// Serviço para gerenciar o conhecimento persistente
export interface KnowledgeEntry {
  content: string;
  timestamp: string;
  source: string;
}

export interface KnowledgeData {
  learnedEntries: KnowledgeEntry[];
}

export interface LearnRequest {
  knowledge: string;
}

export interface LearnResponse {
  success: boolean;
  message: string;
}

export interface KnowledgeResponse {
  success: boolean;
  data: KnowledgeData;
  totalEntries: number;
}

/**
 * Salva uma nova informação no Vercel KV via API
 * @param knowledge A informação a ser aprendida
 * @returns Promise com o resultado da operação
 */
export async function saveKnowledge(knowledge: string): Promise<LearnResponse> {
  try {
    const response = await fetch('/api/learn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ knowledge } as LearnRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json() as LearnResponse;
  } catch (error) {
    console.error('Erro ao salvar conhecimento:', error);
    return {
      success: false,
      message: 'Erro ao comunicar com o servidor para salvar o conhecimento'
    };
  }
}

/**
 * Recupera todo o conhecimento armazenado no Vercel KV
 * @returns Promise com os dados do conhecimento
 */
export async function getKnowledge(): Promise<KnowledgeData> {
  try {
    const response = await fetch('/api/knowledge', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: KnowledgeResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error('Erro ao recuperar conhecimento:', error);
    return { learnedEntries: [] };
  }
}

/**
 * Formata o conhecimento para uso no prompt do assistente
 * @param knowledgeData Dados do conhecimento
 * @returns Array de strings com o conhecimento formatado
 */
export function formatKnowledgeForPrompt(knowledgeData: KnowledgeData): string[] {
  return knowledgeData.learnedEntries.map(entry => entry.content);
}
