# Configuração do Aprendizado Persistente

## Como configurar o Upstash Redis

O sistema de aprendizado persistente usa o Upstash Redis para armazenar o conhecimento entre sessões.

### Passos para configurar:

1. **No Dashboard do Vercel:**
   - Acesse seu projeto em https://vercel.com/dashboard
   - Vá em "Storage" > "Create Database" > "Upstash"
   - Crie uma nova database Redis (gratuita até 10.000 comandos/dia)

2. **Conectar ao projeto:**
   - Após criar, clique em "Connect Project"
   - Selecione seu projeto `assistente-virtual-seduc`
   - O Vercel automaticamente configurará as variáveis de ambiente

3. **Variáveis configuradas automaticamente:**
   ```
   UPSTASH_REDIS_REST_URL
   UPSTASH_REDIS_REST_TOKEN
   ```

### Funcionalidades disponíveis:

- ✅ **Aprendizado persistente**: Conhecimento salvo permanentemente
- ✅ **Backup automático**: Dados armazenados na nuvem
- ✅ **Disponível entre sessões**: Funciona após recarregar página
- ✅ **Não sobrescreve no Git**: Dados não são perdidos em deploys
- ✅ **Performance alta**: Redis é otimizado para velocidade

### APIs criadas:

- `POST /api/learn` - Salvar novo conhecimento
- `GET /api/knowledge` - Recuperar todo conhecimento
- `GET/DELETE /api/admin` - Administrar conhecimento (listar/excluir)

### Comandos disponíveis:

| Comando | Função | Exemplo |
|---------|---------|---------|
| `#Aprend@` | Ensinar algo novo | `#Aprend@` → `O horário é 7h às 17h` |
| `#Issoétudo@` | Cancelar aprendizado | Cancela o modo de aprendizado |
| `#Admin@` | Painel de administração | Mostra link para gerenciar conhecimento |

### Administração do Conhecimento:

**Painel Admin**: https://assistente-virtual-seduc-994yeura5.vercel.app/admin.html
**Chave de Admin**: `seduc-admin-2025`

**Funcionalidades do painel:**
- 📊 Estatísticas de conhecimento
- 👁️ Visualizar todas as entradas
- 🗑️ Excluir conhecimento específico
- 📅 Ver data/hora de cada entrada

### Uso:

O assistente agora aprende permanentemente usando o comando `#Aprend@` seguido da informação.

**Exemplo:**
```
#Aprend@
```
Depois digite: `O horário de funcionamento da SEDUC é de 7h às 17h`

**Para administrar o conhecimento:**
```
#Admin@
```

O conhecimento será salvo permanentemente e estará disponível em todas as futuras conversas!
