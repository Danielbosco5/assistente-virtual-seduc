// API para debug das variáveis de ambiente (REMOVER EM PRODUÇÃO)
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    const envVars = {
      // Variáveis do Upstash/Redis
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? 'SET' : 'NOT_SET',
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? 'SET' : 'NOT_SET',
      KV_URL: process.env.KV_URL ? 'SET' : 'NOT_SET',
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? 'SET' : 'NOT_SET',
      KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN ? 'SET' : 'NOT_SET',
      
      // Outras variáveis importantes
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'SET' : 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
      
      // Contar todas as variáveis que começam com KV_ ou UPSTASH_
      allKVVars: Object.keys(process.env).filter(key => key.startsWith('KV_')),
      allUpstashVars: Object.keys(process.env).filter(key => key.startsWith('UPSTASH_')),
    };

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envVars
    });

  } catch (error) {
    console.error('Erro no debug:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
