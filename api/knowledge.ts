import { Redis } from '@upstash/redis';
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
    // Verificar qual banco de dados usar
    let useUpstash = false;
    let useVercelKV = false;
    let storageType = '';

    // Verificar se Upstash está configurado
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      useUpstash = true;
      storageType = 'Upstash Redis';
    }
    // Senão, verificar se Vercel KV está configurado  
    else if (process.env.KV_URL && process.env.KV_REST_API_TOKEN) {
      useVercelKV = true;
      storageType = 'Vercel KV';
    }
    else {
      console.error('Nenhum banco de dados configurado');
      return res.status(500).json({
        success: false,
        message: 'Configuração do banco de dados não encontrada. Configure Upstash Redis ou Vercel KV no Vercel.'
      });
    }

    // Chave para armazenar o conhecimento
    const KNOWLEDGE_KEY = 'seduc-knowledge-base';
    
    let knowledgeData: KnowledgeData = { learnedEntries: [] };
    
    try {
      // Tentar ler dados existentes
      if (useUpstash) {
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL!,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
        const existingData = await redis.get<KnowledgeData>(KNOWLEDGE_KEY);
        if (existingData) {
          knowledgeData = existingData;
        }
      } else if (useVercelKV) {
        const existingData = await kv.get<KnowledgeData>(KNOWLEDGE_KEY);
        if (existingData) {
          knowledgeData = existingData;
        }
      }
    } catch (error: any) {
      console.log('Base de conhecimento não encontrada, retornando vazia');
    }

    return res.status(200).json({
      success: true,
      data: knowledgeData,
      totalEntries: knowledgeData.learnedEntries.length,
      storageType: storageType
    });

  } catch (error) {
    console.error('Erro ao recuperar conhecimento:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao recuperar conhecimento'
    });
  }
}
