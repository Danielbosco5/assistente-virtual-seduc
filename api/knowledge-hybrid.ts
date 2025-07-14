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
    // Chave para armazenar o conhecimento
    const KNOWLEDGE_KEY = 'seduc-knowledge-base';
    
    let knowledgeData: KnowledgeData = { learnedEntries: [] };
    let storageType = '';

    // Tentar usar Upstash Redis primeiro, depois Vercel KV
    let useUpstash = false;
    let useVercelKV = false;

    // Verificar se Upstash está configurado
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      useUpstash = true;
      storageType = 'Upstash Redis';
    }
    // Senão, verificar se Vercel KV está configurado
    else if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      useVercelKV = true;
      storageType = 'Vercel KV';
    }
    else {
      return res.status(500).json({
        success: false,
        message: 'Nenhum banco de dados configurado. Configure Upstash Redis ou Vercel KV no Vercel.'
      });
    }

    try {
      // Usar Upstash Redis
      if (useUpstash) {
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL!,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });

        const existingData = await redis.get<KnowledgeData>(KNOWLEDGE_KEY);
        if (existingData) {
          knowledgeData = existingData;
        }
      }
      // Usar Vercel KV
      else if (useVercelKV) {
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
