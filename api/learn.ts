import { Redis } from '@upstash/redis';

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

    // Verificar se as variáveis de ambiente estão configuradas
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    
    if (!redisUrl || !redisToken) {
      console.error('Variáveis de ambiente do Upstash não configuradas');
      console.error('URL:', !!redisUrl ? 'OK' : 'MISSING');
      console.error('TOKEN:', !!redisToken ? 'OK' : 'MISSING');
      return res.status(500).json({
        success: false,
        message: 'Configuração do banco de dados não encontrada. Verifique as variáveis de ambiente no Vercel.'
      });
    }

    // Configurar Redis Upstash
    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
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

    // Salvar dados atualizados no Redis
    await redis.set(KNOWLEDGE_KEY, knowledgeData);

    return res.status(200).json({
      success: true,
      message: `Conhecimento salvo com sucesso! Total de entradas: ${knowledgeData.learnedEntries.length}`
    });

  } catch (error) {
    console.error('Erro ao salvar conhecimento:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao salvar conhecimento'
    });
  }
}
