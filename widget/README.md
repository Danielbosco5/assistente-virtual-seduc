# 📱 Widgets do Assistente Virtual SEDUC-GO

Esta pasta contém widgets prontos para integração do Assistente Virtual SEDUC-GO em diferentes plataformas.

## 🎯 Widgets Disponíveis

### 1. **WIDGET-WORDPRESS-HEADER-FOOTER.html** ⭐ RECOMENDADO
**Para:** WordPress com plugin Header Footer Code  
**Características:**
- ✅ Design moderno e responsivo
- ✅ Animações fluidas
- ✅ Badge de notificação
- ✅ Suporte a analytics
- ✅ Teclas de atalho (ESC para fechar)
- ✅ Loading spinner
- ✅ Totalmente customizável

**Instalação:**
1. Instale o plugin "Header Footer Code"
2. Vá em **Ferramentas > Header Footer Code**
3. Cole o código na seção **Footer** ou **Before </body> tag**
4. Salve as alterações

### 2. **WIDGET-WORDPRESS-SIMPLES.html**
**Para:** WordPress básico ou sites com limitações  
**Características:**
- ✅ Código mínimo e leve
- ✅ Máxima compatibilidade
- ✅ Sem dependências externas
- ✅ Responsivo

**Instalação:**
1. Cole o código no footer do seu tema
2. Ou use qualquer plugin de inserção de HTML/JS

### 3. **chat-widget.js** 
**Para:** Sites customizados e aplicações  
**Características:**
- ✅ JavaScript puro (sem jQuery)
- ✅ API completa de configuração
- ✅ Múltiplos temas de cores
- ✅ Posicionamento flexível
- ✅ Modo debug
- ✅ Controle programático

**Instalação:**
```html
<!-- Básico -->
<script src="chat-widget.js"></script>

<!-- Com configurações customizadas -->
<script src="chat-widget.js"></script>
<script>
// Customizar após carregamento
window.seducAssistantInstance.updateConfig({
    theme: 'green',
    position: 'bottom-left',
    showBadge: false
});
</script>
```

## ⚙️ Configurações Avançadas

### Widget JavaScript (chat-widget.js)

```javascript
// Configuração completa
const config = {
    assistantUrl: 'https://assistente-virtual-seduc-danielbosco5s-projects.vercel.app',
    position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    offsetX: 20,              // Distância da borda horizontal
    offsetY: 20,              // Distância da borda vertical
    buttonSize: 60,           // Tamanho do botão em pixels
    modalWidth: 380,          // Largura do modal
    modalHeight: 500,         // Altura do modal
    showBadge: true,          // Mostrar badge de notificação
    badgeDelay: 5000,         // Delay para mostrar badge (ms)
    theme: 'blue',            // blue, red, green, purple
    analytics: false,         // Integração com Google Analytics
    autoOpen: false,          // Abrir automaticamente
    debug: false              // Modo debug
};

// Inicializar com configurações
window.seducAssistantInstance = new SeducAssistant(config);
```

### Temas Disponíveis

| Tema | Cor Principal | Uso |
|------|---------------|-----|
| `blue` | Azul (#3B82F6) | Padrão, profissional |
| `red` | Vermelho (#EF4444) | Urgência, suporte |
| `green` | Verde (#10B981) | Sucesso, vendas |
| `purple` | Roxo (#8B5CF6) | Criativo, inovação |

### Posicionamento

| Posição | Descrição |
|---------|-----------|
| `bottom-right` | Canto inferior direito (padrão) |
| `bottom-left` | Canto inferior esquerdo |
| `top-right` | Canto superior direito |
| `top-left` | Canto superior esquerdo |

## 📱 Responsividade

Todos os widgets são responsivos e se adaptam automaticamente a dispositivos móveis:

- **Desktop**: Modal com tamanho fixo
- **Mobile**: Modal ocupa quase toda a tela
- **Tablet**: Tamanho intermediário

## 🎨 Personalização

### Cores Customizadas (Widget HTML)

Para alterar as cores nos widgets HTML, modifique as variáveis CSS:

```css
/* Cor principal */
background: #SUA_COR_AQUI;

/* Cor de hover */
box-shadow: 0 6px 20px rgba(SUA_COR_RGB, 0.6);
```

### Tamanho do Botão

```css
/* Alterar tamanho do botão */
#seduc-chat-button {
    width: 70px;  /* Tamanho desejado */
    height: 70px; /* Tamanho desejado */
}
```

### Posição Customizada

```css
/* Mover para outro canto */
#seduc-assistant-widget {
    bottom: auto;
    top: 20px;    /* Para canto superior */
    right: auto;
    left: 20px;   /* Para lado esquerdo */
}
```

## 🔧 Solução de Problemas

### Widget não aparece
1. ✅ Verifique se o JavaScript está carregando
2. ✅ Confirme que não há conflitos com outros scripts
3. ✅ Teste em um navegador diferente
4. ✅ Verifique o console do navegador para erros

### Modal não abre
1. ✅ Verifique se a URL do assistente está correta
2. ✅ Confirme que não há bloqueador de pop-ups ativo
3. ✅ Teste a conectividade com a internet

### Problemas de CSS
1. ✅ Verifique se há CSS conflitante no tema
2. ✅ Adicione `!important` às regras CSS se necessário
3. ✅ Use um z-index maior se o widget ficar atrás de outros elementos

### Iframe não carrega
1. ✅ Verifique se o site permite iframes
2. ✅ Confirme se não há políticas CSP bloqueando
3. ✅ Teste a URL diretamente no navegador

## 📊 Analytics

### Google Analytics 4

Para rastrear interações com o widget:

```javascript
// Habilitar analytics no widget JS
window.seducAssistantInstance.updateConfig({
    analytics: true
});

// Eventos rastreados automaticamente:
// - chat_opened: Quando o usuário abre o chat
// - chat_closed: Quando o usuário fecha o chat
```

### Google Tag Manager

```javascript
// Eventos customizados para GTM
function trackChatInteraction(action) {
    if (typeof dataLayer !== 'undefined') {
        dataLayer.push({
            'event': 'assistente_virtual_interaction',
            'action': action,
            'category': 'assistente_virtual',
            'label': 'seduc_go'
        });
    }
}
```

## 🔒 Segurança

- ✅ Todos os widgets usam HTTPS
- ✅ Iframe com sandbox apropriado
- ✅ Sem execução de código externo
- ✅ CSP-friendly

## 📞 Suporte

Para dúvidas ou problemas:

1. 📖 Consulte a documentação completa no [README principal](../README.md)
2. 🐛 Reporte bugs no [GitHub Issues](https://github.com/Danielbosco5/assistente-virtual-seduc/issues)
3. 💬 Entre em contato via assistente virtual

## 📝 Changelog

### v1.0.0
- ✅ Widget WordPress Header Footer Code
- ✅ Widget WordPress simples
- ✅ Widget JavaScript puro
- ✅ Suporte a múltiplos temas
- ✅ Responsividade completa
- ✅ Analytics integrado
