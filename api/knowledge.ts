import { kv } from '@vercel/kv';

export interface KnowledgeEntry {
  content: string;
  timestamp: string;
  source: string;
}

export interface KnowledgeData {
  learnedEntries: KnowledgeEntry[];
}

export default async function handler(req: any, res: any) {
  // Permitir apenas GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    // Chave para armazenar o conhecimento no Vercel KV
    const KNOWLEDGE_KEY = 'seduc-knowledge-base';
    
    let knowledgeData: KnowledgeData = { learnedEntries: [] };
    
    try {
      // Tentar ler dados existentes do Vercel KV
      const existingData = await kv.get<KnowledgeData>(KNOWLEDGE_KEY);
      if (existingData) {
        knowledgeData = existingData;
      }
    } catch (error: any) {
      console.log('Base de conhecimento não encontrada, retornando vazia');
    }

    return res.status(200).json({
      success: true,
      data: knowledgeData,
      totalEntries: knowledgeData.learnedEntries.length
    });

  } catch (error) {
    console.error('Erro ao recuperar conhecimento:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao recuperar conhecimento'
    });
  }
}
