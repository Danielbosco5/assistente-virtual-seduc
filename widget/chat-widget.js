/**
 * Widget de Chat - Assistente Virtual SEDUC-GO
 * Para incorporar em sites WordPress
 */
(function() {
    'use strict';
    
    // Configurações do widget
    const WIDGET_CONFIG = {
        apiUrl: window.SEDUC_API_URL || 'https://assistente-virtual-seduc.vercel.app/api/chat', // Substitua pela URL do seu deploy
        assistantName: 'Assistente Virtual SEDUC-GO',
        theme: {
            primaryColor: '#2563eb',
            hoverColor: '#1d4ed8',
            backgroundColor: '#f9fafb',
            textColor: '#374151'
        }
    };

    // Verificar se o widget já foi carregado
    if (window.SeducChatWidget) {
        return;
    }

    // CSS do widget
    const widgetCSS = `
        .seduc-chat-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .seduc-chat-toggle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: ${WIDGET_CONFIG.theme.primaryColor};
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            color: white;
        }
        
        .seduc-chat-toggle:hover {
            background: ${WIDGET_CONFIG.theme.hoverColor};
            transform: scale(1.1);
        }
        
        .seduc-chat-window {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            display: none;
            flex-direction: column;
            overflow: hidden;
        }
        
        .seduc-chat-window.open {
            display: flex;
            animation: slideUp 0.3s ease;
        }
        
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .seduc-chat-header {
            background: ${WIDGET_CONFIG.theme.primaryColor};
            color: white;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .seduc-chat-title {
            font-weight: 600;
            font-size: 14px;
        }
        
        .seduc-chat-close {
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .seduc-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: ${WIDGET_CONFIG.theme.backgroundColor};
        }
        
        .seduc-message {
            margin-bottom: 12px;
            display: flex;
            align-items: flex-start;
        }
        
        .seduc-message.user {
            justify-content: flex-end;
        }
        
        .seduc-message-content {
            max-width: 80%;
            padding: 8px 12px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.4;
        }
        
        .seduc-message.user .seduc-message-content {
            background: ${WIDGET_CONFIG.theme.primaryColor};
            color: white;
        }
        
        .seduc-message.assistant .seduc-message-content {
            background: white;
            color: ${WIDGET_CONFIG.theme.textColor};
            border: 1px solid #e5e7eb;
        }
        
        .seduc-chat-input-container {
            padding: 16px;
            border-top: 1px solid #e5e7eb;
            background: white;
        }
        
        .seduc-chat-input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 20px;
            outline: none;
            font-size: 14px;
            resize: none;
        }
        
        .seduc-chat-input:focus {
            border-color: ${WIDGET_CONFIG.theme.primaryColor};
        }
        
        .seduc-loading {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 8px 12px;
        }
        
        .seduc-loading-dot {
            width: 4px;
            height: 4px;
            background: #9ca3af;
            border-radius: 50%;
            animation: bounce 1.4s ease-in-out infinite both;
        }
        
        .seduc-loading-dot:nth-child(1) { animation-delay: -0.32s; }
        .seduc-loading-dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
        
        @media (max-width: 480px) {
            .seduc-chat-window {
                width: calc(100vw - 40px);
                height: calc(100vh - 120px);
                bottom: 80px;
                right: 20px;
                left: 20px;
            }
        }
    `;

    // Classe principal do widget
    class SeducChatWidget {
        constructor() {
            this.isOpen = false;
            this.messages = [];
            this.isLoading = false;
            this.init();
        }

        init() {
            this.injectCSS();
            this.createWidget();
            this.addEventListeners();
            this.addInitialMessage();
        }

        injectCSS() {
            const style = document.createElement('style');
            style.textContent = widgetCSS;
            document.head.appendChild(style);
        }

        createWidget() {
            const widget = document.createElement('div');
            widget.className = 'seduc-chat-widget';
            widget.innerHTML = `
                <div class="seduc-chat-window" id="seduc-chat-window">
                    <div class="seduc-chat-header">
                        <div class="seduc-chat-title">${WIDGET_CONFIG.assistantName}</div>
                        <button class="seduc-chat-close" id="seduc-chat-close">×</button>
                    </div>
                    <div class="seduc-chat-messages" id="seduc-chat-messages"></div>
                    <div class="seduc-chat-input-container">
                        <textarea 
                            class="seduc-chat-input" 
                            id="seduc-chat-input" 
                            placeholder="Digite sua pergunta..."
                            rows="1"
                        ></textarea>
                    </div>
                </div>
                <button class="seduc-chat-toggle" id="seduc-chat-toggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                </button>
            `;
            
            document.body.appendChild(widget);
            this.widget = widget;
        }

        addEventListeners() {
            const toggle = document.getElementById('seduc-chat-toggle');
            const close = document.getElementById('seduc-chat-close');
            const input = document.getElementById('seduc-chat-input');

            toggle.addEventListener('click', () => this.toggleChat());
            close.addEventListener('click', () => this.closeChat());
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Auto-resize textarea
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 100) + 'px';
            });
        }

        toggleChat() {
            const window = document.getElementById('seduc-chat-window');
            this.isOpen = !this.isOpen;
            
            if (this.isOpen) {
                window.classList.add('open');
                document.getElementById('seduc-chat-input').focus();
            } else {
                window.classList.remove('open');
            }
        }

        closeChat() {
            this.isOpen = false;
            document.getElementById('seduc-chat-window').classList.remove('open');
        }

        addInitialMessage() {
            this.addMessage('assistant', `Olá! Sou o ${WIDGET_CONFIG.assistantName}. Estou aqui para ajudar com suas dúvidas sobre os sistemas e programas da Secretaria de Educação.

Posso te ajudar a:
- Entender como usar os sistemas (SIGE, SIAP, etc.)
- Resolver mensagens de erro
- Saber mais sobre o programa ReFormar VI

Como posso te ajudar hoje? 😊`);
        }

        addMessage(sender, text) {
            const messagesContainer = document.getElementById('seduc-chat-messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `seduc-message ${sender}`;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'seduc-message-content';
            contentDiv.textContent = text;
            
            messageDiv.appendChild(contentDiv);
            messagesContainer.appendChild(messageDiv);
            
            // Scroll para a última mensagem
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            this.messages.push({ sender, text, timestamp: new Date() });
        }

        showLoading() {
            const messagesContainer = document.getElementById('seduc-chat-messages');
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'seduc-message assistant';
            loadingDiv.id = 'seduc-loading-message';
            loadingDiv.innerHTML = `
                <div class="seduc-message-content">
                    <div class="seduc-loading">
                        <div class="seduc-loading-dot"></div>
                        <div class="seduc-loading-dot"></div>
                        <div class="seduc-loading-dot"></div>
                    </div>
                </div>
            `;
            messagesContainer.appendChild(loadingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        hideLoading() {
            const loadingMessage = document.getElementById('seduc-loading-message');
            if (loadingMessage) {
                loadingMessage.remove();
            }
        }

        async sendMessage() {
            const input = document.getElementById('seduc-chat-input');
            const message = input.value.trim();
            
            if (!message || this.isLoading) return;
            
            // Adicionar mensagem do usuário
            this.addMessage('user', message);
            input.value = '';
            input.style.height = 'auto';
            
            // Mostrar loading
            this.isLoading = true;
            this.showLoading();
            
            try {
                const response = await fetch(WIDGET_CONFIG.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userInput: message,
                        chatHistory: this.messages.slice(-10), // Últimas 10 mensagens
                        learnedKnowledge: []
                    }),
                });
                
                if (!response.ok) {
                    throw new Error('Erro na comunicação com o servidor');
                }
                
                const data = await response.json();
                this.hideLoading();
                this.addMessage('assistant', data.text);
                
            } catch (error) {
                this.hideLoading();
                this.addMessage('assistant', 'Desculpe, ocorreu um erro. Tente novamente mais tarde ou entre em contato com o suporte: (62) 3220-9546');
                console.error('Erro no chat:', error);
            } finally {
                this.isLoading = false;
            }
        }
    }

    // Inicializar o widget quando o DOM estiver pronto
    function initWidget() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.SeducChatWidget = new SeducChatWidget();
            });
        } else {
            window.SeducChatWidget = new SeducChatWidget();
        }
    }

    initWidget();
})();
