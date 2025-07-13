# Assistente Virtual SEDUC-GO 🤖

Sistema de assistente virtual inteligente desenvolvido para a Secretaria de Estado da Educação de Goiás (SEDUC-GO), utilizando tecnologia Google Gemini AI para fornecer suporte automatizado aos usuários.

## 🌟 Características

- ✅ **Interface Moderna**: React 19 + TypeScript + Vite
- ✅ **AI Avançada**: Integração com Google Gemini API
- ✅ **Deploy Automático**: Vercel com CI/CD
- ✅ **Widgets Responsivos**: Múltiplas opções de integração
- ✅ **Base de Conhecimento**: Sistema estruturado de informações
- ✅ **Suporte Multiplataforma**: WordPress, sites customizados, apps

## 🚀 Acesso Online

**Aplicação Principal**: https://assistente-virtual-seduc-danielbosco5s-projects.vercel.app  
**API Endpoint**: https://assistente-virtual-seduc-danielbosco5s-projects.vercel.app/api/chat

## 📱 Widgets Disponíveis

O projeto inclui diversos widgets prontos para integração em diferentes plataformas:

### WordPress + Elementor ⭐
- **Arquivo**: `widget/WIDGET-ELEMENTOR-FLUTUANTE.html`
- **Características**: Modal responsivo, elemento flutuante
- **Instalação**: Elementor → Widget HTML → Colar código

### WordPress.com Gratuito
- **Arquivo**: `widget/WIDGET-WORDPRESS-GRATUITO.html`
- **Características**: Máxima compatibilidade, botão simples
- **Instalação**: Widgets → HTML Personalizado → Footer

### Sites Customizados
- **Arquivo**: `widget/chat-widget.js`
- **Características**: JavaScript puro, flexibilidade total
- **Instalação**: `<script src="chat-widget.js"></script>`

> 📂 **Documentação completa**: Veja `/widget/README.md` para todas as opções

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- Chave API do Google Gemini

### Instalação
```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
# Crie .env.local com:
GEMINI_API_KEY=sua_chave_aqui

# 3. Executar em desenvolvimento
npm run dev

# 4. Build para produção
npm run build
```

## 🏗️ Arquitetura

```
├── 📱 Frontend (React + TypeScript)
│   ├── components/         # Componentes reutilizáveis
│   ├── services/          # Integração com APIs
│   └── types.ts           # Tipagens TypeScript
│
├── 🔌 API (Vercel Functions)
│   └── api/chat.ts        # Endpoint do assistente
│
├── 🎨 Widgets
│   ├── WIDGET-ELEMENTOR-FLUTUANTE.html
│   ├── WIDGET-WORDPRESS-GRATUITO.html
│   ├── chat-widget.js
│   └── README.md          # Documentação completa
│
└── 📚 Base de Conhecimento
    ├── knowledge_base.json # Perguntas e respostas
    └── metadata.json      # Configurações do sistema
```

## ⚙️ Configuração

### Base de Conhecimento
O arquivo `knowledge_base.json` contém:
- Perguntas frequentes da SEDUC-GO
- Informações sobre programas educacionais
- Procedimentos administrativos
- Links úteis e contatos

### Personalização do Widget
```javascript
// Configurações disponíveis
const config = {
  apiUrl: 'https://seu-dominio.vercel.app/api/chat',
  primaryColor: '#1e40af',
  position: 'bottom-right',
  title: 'Assistente SEDUC-GO'
};
```

## 🎯 Casos de Uso

### Para Desenvolvedores
- API REST simples para integração
- Widgets prontos para qualquer plataforma
- Documentação completa disponível

### Para Administradores
- Sistema pronto para produção
- Fácil integração em WordPress
- Zero manutenção necessária

### Para Usuários Finais
- Interface intuitiva e responsiva
- Respostas instantâneas e precisas
- Disponível 24/7

## 📊 Stack Tecnológica

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React** | 19.1.0 | Interface do usuário |
| **TypeScript** | 5.6.2 | Tipagem estática |
| **Vite** | 5.3.4 | Build e dev server |
| **Vercel** | Latest | Deploy e hosting |
| **Google Gemini** | 1.5 Flash | Inteligência artificial |
| **Tailwind CSS** | 3.4.4 | Estilização |

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento local
npm run build    # Build para produção  
npm run preview  # Preview do build
npm run lint     # Verificação de código
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# 1. Conectar repositório ao Vercel
# 2. Configurar GEMINI_API_KEY nas variáveis de ambiente
# 3. Deploy automático a cada push
```

### Outras Plataformas
```bash
npm run build  # Gera pasta dist/
# Upload da pasta dist/ para seu provedor
```

## 📞 Suporte

### Documentação
- **Widget**: `/widget/README.md`
- **API**: Endpoint `/api/chat` com documentação inline
- **Código**: Comentários em português em todos os arquivos

### Troubleshooting
- **Widget não aparece**: Verificar z-index e cache
- **API não responde**: Verificar GEMINI_API_KEY
- **Erro de CORS**: Verificar domínio permitido

## 📜 Licença

Este projeto foi desenvolvido pela equipe de TI da SEDUC-GO para uso interno da secretaria.

---

**Versão**: 2.0 | **Última atualização**: Janeiro 2025  
**Desenvolvido por**: Equipe de TI - SEDUC-GO
