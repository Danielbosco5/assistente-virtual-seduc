import { Redis } from '@upstash/redis';
import { kv } from '@vercel/kv';

export interface LearnRequest {
  knowledge: string;
}

export interface LearnResponse {
  success: boolean;
  message: string;
}

export interface KnowledgeEntry {
  content: string;
  timestamp: string;
  source: string;
}

export interface KnowledgeData {
  learnedEntries: KnowledgeEntry[];
}

export default async function handler(req: any, res: any) {
  // Permitir apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    const { knowledge }: LearnRequest = req.body;

    if (!knowledge || knowledge.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Conhecimento não pode estar vazio' 
      });
    }

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
      console.log('Criando nova base de conhecimento:', error.message);
    }

    // Garantir que learnedEntries existe
    knowledgeData.learnedEntries = knowledgeData.learnedEntries || [];
    
    // Adicionar novo conhecimento
    const newEntry: KnowledgeEntry = {
      content: knowledge.trim(),
      timestamp: new Date().toISOString(),
      source: 'web-learning'
    };
    
    knowledgeData.learnedEntries.push(newEntry);

    // Salvar dados atualizados
    if (useUpstash) {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      await redis.set(KNOWLEDGE_KEY, knowledgeData);
    } else if (useVercelKV) {
      await kv.set(KNOWLEDGE_KEY, knowledgeData);
    }

    return res.status(200).json({
      success: true,
      message: `Conhecimento salvo com sucesso no ${storageType}! Total de entradas: ${knowledgeData.learnedEntries.length}`
    });

  } catch (error) {
    console.error('Erro ao salvar conhecimento:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao salvar conhecimento'
    });
  }
}
