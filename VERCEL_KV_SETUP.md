# Configuração do Aprendizado Persistente

## Como configurar o Vercel KV

O sistema de aprendizado persistente usa o Vercel KV (Redis) para armazenar o conhecimento entre sessões.

### Passos para configurar:

1. **No Dashboard do Vercel:**
   - Acesse seu projeto em https://vercel.com/dashboard
   - Vá em "Storage" > "Create Database" > "KV"
   - Crie uma nova database KV (gratuita até 3GB)

2. **Conectar ao projeto:**
   - Após criar, clique em "Connect Project"
   - Selecione seu projeto `assistente-virtual-seduc`
   - O Vercel automaticamente configurará as variáveis de ambiente

3. **Variáveis configuradas automaticamente:**
   ```
   KV_REST_API_URL
   KV_REST_API_TOKEN
   KV_REST_API_READ_ONLY_TOKEN
   ```

### Funcionalidades disponíveis:

- ✅ **Aprendizado persistente**: Conhecimento salvo permanentemente
- ✅ **Backup automático**: Dados armazenados na nuvem
- ✅ **Disponível entre sessões**: Funciona após recarregar página
- ✅ **Não sobrescreve no Git**: Dados não são perdidos em deploys

### APIs criadas:

- `POST /api/learn` - Salvar novo conhecimento
- `GET /api/knowledge` - Recuperar todo conhecimento

### Uso:

O assistente agora aprende permanentemente usando o comando `/aprender` seguido da informação.

**Exemplo:**
```
/aprender O horário de funcionamento da SEDUC é de 7h às 17h
```

O conhecimento será salvo permanentemente e estará disponível em todas as futuras conversas!
