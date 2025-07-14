import { Redis } from '@upstash/redis';

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
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.error('Variáveis de ambiente do Upstash não configuradas');
      return res.status(500).json({
        success: false,
        message: 'Configuração do banco de dados não encontrada. Verifique as variáveis de ambiente no Vercel.'
      });
    }

    // Configurar Redis Upstash
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    
    // Chave para armazenar o conhecimento no Redis
    const KNOWLEDGE_KEY = 'seduc-knowledge-base';
    
    let knowledgeData: KnowledgeData = { learnedEntries: [] };
    
    try {
      // Tentar ler dados existentes do Redis
      const existingData = await redis.get<KnowledgeData>(KNOWLEDGE_KEY);
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
