// API para testar conexão com Vercel KV simples
import { kv } from '@vercel/kv';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    // Teste simples: salvar e recuperar um valor
    const testKey = 'test-connection';
    const testValue = { timestamp: new Date().toISOString(), test: 'ok' };
    
    console.log('Tentando salvar no KV:', testKey, testValue);
    
    // Salvar
    await kv.set(testKey, testValue);
    console.log('Salvo com sucesso');
    
    // Recuperar
    const retrieved = await kv.get(testKey);
    console.log('Recuperado:', retrieved);
    
    return res.status(200).json({
      success: true,
      message: 'Teste de conexão KV realizado com sucesso',
      saved: testValue,
      retrieved: retrieved
    });

  } catch (error) {
    console.error('Erro no teste KV:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro no teste de conexão KV',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
