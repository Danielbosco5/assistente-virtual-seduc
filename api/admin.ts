import { Redis } from '@upstash/redis';

export interface KnowledgeEntry {
  content: string;
  timestamp: string;
  source: string;
}

export interface KnowledgeData {
  learnedEntries: KnowledgeEntry[];
}

export interface AdminRequest {
  action: 'list' | 'delete';
  entryIndex?: number;
  adminKey?: string;
}

// Chave de administração simples (em produção, use algo mais seguro)
const ADMIN_KEY = 'seduc-admin-2025';

export default async function handler(req: any, res: any) {
  // Permitir GET (listar) e DELETE (remover)
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    // Configurar Redis Upstash
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    
    const KNOWLEDGE_KEY = 'seduc-knowledge-base';

    // LISTAR conhecimento (GET)
    if (req.method === 'GET') {
      const { adminKey } = req.query;
      
      if (adminKey !== ADMIN_KEY) {
        return res.status(401).json({ 
          success: false, 
          message: 'Acesso negado. Chave de administração inválida.' 
        });
      }

      const knowledgeData = await redis.get<KnowledgeData>(KNOWLEDGE_KEY) || { learnedEntries: [] };
      
      return res.status(200).json({
        success: true,
        data: knowledgeData,
        totalEntries: knowledgeData.learnedEntries.length
      });
    }

    // DELETAR entrada específica (DELETE)
    if (req.method === 'DELETE') {
      const { entryIndex, adminKey } = req.body;
      
      if (adminKey !== ADMIN_KEY) {
        return res.status(401).json({ 
          success: false, 
          message: 'Acesso negado. Chave de administração inválida.' 
        });
      }

      if (typeof entryIndex !== 'number' || entryIndex < 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Índice da entrada inválido.' 
        });
      }

      const knowledgeData = await redis.get<KnowledgeData>(KNOWLEDGE_KEY) || { learnedEntries: [] };
      
      if (entryIndex >= knowledgeData.learnedEntries.length) {
        return res.status(404).json({ 
          success: false, 
          message: 'Entrada não encontrada.' 
        });
      }

      // Remover entrada específica
      const removedEntry = knowledgeData.learnedEntries.splice(entryIndex, 1)[0];
      
      // Salvar dados atualizados
      await redis.set(KNOWLEDGE_KEY, knowledgeData);

      return res.status(200).json({
        success: true,
        message: `Entrada removida com sucesso: "${removedEntry.content.substring(0, 50)}..."`,
        totalEntries: knowledgeData.learnedEntries.length
      });
    }

  } catch (error) {
    console.error('Erro na administração do conhecimento:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}
