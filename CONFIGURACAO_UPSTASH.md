# Configuração do Upstash Redis no Vercel

## Problema Identificado
O aprendizado persistente não está funcionando porque as variáveis de ambiente do Upstash Redis não estão configuradas no Vercel.

## Passos para Configurar

### 1. Criar um Banco Redis no Upstash

1. Acesse [https://console.upstash.com/](https://console.upstash.com/)
2. Faça login ou crie uma conta
3. Clique em "Create Database"
4. Escolha um nome para o banco (ex: `seduc-knowledge`)
5. Selecione a região mais próxima (ex: `us-east-1`)
6. Clique em "Create"

### 2. Obter as Credenciais

Na página do banco criado, você verá:
- **UPSTASH_REDIS_REST_URL**: URL do endpoint REST
- **UPSTASH_REDIS_REST_TOKEN**: Token de autenticação

### 3. Configurar no Vercel

1. Acesse [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Vá para o projeto `assistente-virtual-seduc`
3. Acesse a aba "Settings"
4. Clique em "Environment Variables"
5. Adicione as seguintes variáveis:

```
UPSTASH_REDIS_REST_URL=https://your-redis-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
GEMINI_API_KEY=your-gemini-key-here
```

### 4. Redeploy do Projeto

Após adicionar as variáveis:
1. Vá para a aba "Deployments"
2. Clique nos três pontos (...) no último deployment
3. Clique em "Redeploy"

### 5. Testar o Funcionamento

Após o redeploy, teste:
1. Acesse o assistente
2. Digite `#aprenda`
3. Insira uma informação para aprender
4. Verifique se aparece a mensagem de sucesso

## Status Atual

✅ Código atualizado com verificação de variáveis de ambiente
✅ Mensagens de erro mais específicas adicionadas
⚠️ **PENDENTE**: Configurar variáveis no Vercel
⚠️ **PENDENTE**: Redeploy do projeto

## Comandos Úteis para Teste

```bash
# Testar API de aprendizado
curl -X POST https://assistente-virtual-seduc-994yeura5.vercel.app/api/learn \
  -H "Content-Type: application/json" \
  -d '{"knowledge":"teste de API"}'

# Testar API de conhecimento
curl https://assistente-virtual-seduc-994yeura5.vercel.app/api/knowledge
```

## Logs de Debug

As APIs agora incluem verificação de variáveis de ambiente e retornarão mensagens específicas se as credenciais do Upstash não estiverem configuradas.
