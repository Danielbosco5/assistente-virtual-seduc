# Integração do Widget Assistente Virtual SEDUC-GO no WordPress

## 📋 Instruções para Implementação

### Método 1: Inserção Direta no Tema (Recomendado)

1. **Faça upload do arquivo `chat-widget.js`** para a pasta `/wp-content/themes/seu-tema/js/` do WordPress

2. **Adicione o código no arquivo `functions.php` do tema:**

```php
function adicionar_assistente_seduc() {
    // Carrega apenas nas páginas públicas (não no admin)
    if (!is_admin()) {
        wp_enqueue_script(
            'seduc-chat-widget', 
            get_template_directory_uri() . '/js/chat-widget.js', 
            array(), 
            '1.0.0', 
            true
        );
    }
}
add_action('wp_enqueue_scripts', 'adicionar_assistente_seduc');
```

### Método 2: Via Plugin de Header/Footer

1. **Instale um plugin como "Insert Headers and Footers"**

2. **Cole este código na seção Footer:**

```html
<script>
(function() {
    // Carrega o widget apenas se ainda não foi carregado
    if (!window.SeducChatWidget) {
        var script = document.createElement('script');
        script.src = 'https://SEU_DOMINIO.com/path/chat-widget.js';
        script.async = true;
        document.head.appendChild(script);
    }
})();
</script>
```

### Método 3: Via Customizador do WordPress

1. **Vá em Aparência > Personalizar > HTML/CSS Adicional**

2. **Cole o conteúdo completo do arquivo `chat-widget.js` dentro de tags script:**

```html
<script>
// Cole todo o conteúdo do chat-widget.js aqui
</script>
```

## ⚙️ Configurações Importantes

### 1. URL da API
No arquivo `chat-widget.js`, linha 8, altere:
```javascript
apiUrl: 'https://assistente-virtual-seduc.vercel.app/api/chat'
```
Para a URL onde você fez o deploy da aplicação.

### 2. Personalização Visual
Você pode alterar as cores do widget editando as variáveis na linha 10-16:
```javascript
theme: {
    primaryColor: '#2563eb',     // Cor principal (azul SEDUC)
    hoverColor: '#1d4ed8',       // Cor do hover
    backgroundColor: '#f9fafb',   // Cor de fundo
    textColor: '#374151'         // Cor do texto
}
```

## 🚀 Deploy da API

**IMPORTANTE:** Antes de usar o widget, você precisa fazer o deploy da aplicação principal.

### Opção 1: Vercel (Recomendado)
1. Conecte seu repositório GitHub à Vercel
2. Configure a variável de ambiente `API_KEY` com sua chave do Gemini
3. Faça o deploy
4. Use a URL gerada no widget

### Opção 2: Netlify
1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente
3. Use a URL gerada

## 🧪 Teste Local

Para testar o widget antes da implementação:

1. **Abra o arquivo `exemplo.html` em um navegador**
2. **Certifique-se de que o servidor de desenvolvimento está rodando** (`npm run dev`)
3. **Altere a URL da API no widget** para `http://localhost:5173/api/chat`

## 📱 Recursos do Widget

### Funcionalidades:
- ✅ **Responsivo** - Funciona em desktop e mobile
- ✅ **Acessível** - Suporte a leitores de tela
- ✅ **Leve** - ~15KB minificado
- ✅ **Não invasivo** - Não interfere com o CSS do site
- ✅ **Auto-inicialização** - Carrega automaticamente

### Interações:
- **Clique no botão** para abrir/fechar
- **Enter** para enviar mensagem
- **Shift+Enter** para quebra de linha
- **Auto-scroll** para novas mensagens
- **Loading** visual durante respostas

## 🔧 Personalização Avançada

### Alterar Posicionamento
Para mover o widget para o canto esquerdo, altere no CSS:
```css
.seduc-chat-widget {
    bottom: 20px;
    left: 20px;  /* em vez de right: 20px */
}
```

### Alterar Tamanho
Para aumentar o tamanho da janela:
```css
.seduc-chat-window {
    width: 400px;    /* em vez de 350px */
    height: 600px;   /* em vez de 500px */
}
```

## 🆘 Suporte

Em caso de dúvidas:
1. Verifique se a API está funcionando acessando a URL diretamente
2. Abra o console do navegador (F12) para ver erros
3. Certifique-se de que não há conflitos com outros plugins

## 📄 Licença
Este widget é parte do projeto Assistente Virtual SEDUC-GO e deve ser usado apenas para fins educacionais da SEDUC-GO.
