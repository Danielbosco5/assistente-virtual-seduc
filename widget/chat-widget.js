/**
 * Assistente Virtual SEDUC-GO - Widget JavaScript
 * Versão: 1.0.0
 * Para integração em qualquer site
 */

(function(window, document) {
    'use strict';
    
    // Prevenir múltiplas inicializações
    if (window.SeducAssistant) {
        console.warn('Assistente Virtual SEDUC-GO já foi inicializado');
        return;
    }
    
    // Configurações padrão
    const defaultConfig = {
        assistantUrl: 'https://assistente-virtual-seduc-danielbosco5s-projects.vercel.app',
        position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
        offsetX: 20,
        offsetY: 20,
        buttonSize: 60,
        modalWidth: 380,
        modalHeight: 500,
        showBadge: true,
        badgeDelay: 5000,
        theme: 'blue', // blue, red, green, purple
        analytics: false,
        autoOpen: false,
        debug: false
    };
    
    // Temas de cores
    const themes = {
        blue: {
            primary: '#3B82F6',
            primaryDark: '#1E40AF',
            danger: '#EF4444'
        },
        red: {
            primary: '#EF4444',
            primaryDark: '#DC2626',
            danger: '#3B82F6'
        },
        green: {
            primary: '#10B981',
            primaryDark: '#047857',
            danger: '#EF4444'
        },
        purple: {
            primary: '#8B5CF6',
            primaryDark: '#7C3AED',
            danger: '#EF4444'
        }
    };
    
    class SeducAssistant {
        constructor(config = {}) {
            this.config = { ...defaultConfig, ...config };
            this.theme = themes[this.config.theme] || themes.blue;
            this.isOpen = false;
            this.iframeLoaded = false;
            this.elements = {};
            
            this.init();
        }
        
        init() {
            this.log('Inicializando Assistente Virtual SEDUC-GO...');
            this.createStyles();
            this.createElements();
            this.bindEvents();
            this.setupBadge();
            this.log('Widget carregado com sucesso!');
        }
        
        log(message) {
            if (this.config.debug) {
                console.log('[SeducAssistant]', message);
            }
        }
        
        createStyles() {
            const position = this.getPositionStyles();
            const styles = `
                .seduc-assistant-widget {
                    position: fixed;
                    ${position.button}
                    z-index: 999999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .seduc-chat-button {
                    width: ${this.config.buttonSize}px;
                    height: ${this.config.buttonSize}px;
                    background: linear-gradient(135deg, ${this.theme.primary} 0%, ${this.theme.primaryDark} 100%);
                    border-radius: 50%;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    position: relative;
                    animation: seduc-pulse 2s infinite;
                }
                
                .seduc-chat-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
                }
                
                .seduc-chat-button.active {
                    background: linear-gradient(135deg, ${this.theme.danger} 0%, #DC2626 100%);
                }
                
                @keyframes seduc-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                .seduc-chat-icon {
                    width: 28px;
                    height: 28px;
                    fill: white;
                    transition: transform 0.3s ease;
                }
                
                .seduc-chat-button.active .seduc-chat-icon {
                    transform: rotate(45deg);
                }
                
                .seduc-chat-modal {
                    position: fixed;
                    ${position.modal}
                    width: ${this.config.modalWidth}px;
                    height: ${this.config.modalHeight}px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                    border: 1px solid #e5e7eb;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(20px) scale(0.95);
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    z-index: 999998;
                    overflow: hidden;
                }
                
                .seduc-chat-modal.active {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0) scale(1);
                }
                
                .seduc-chat-iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                    border-radius: 16px;
                }
                
                .seduc-notification-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: ${this.theme.danger};
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transform: scale(0);
                    transition: all 0.3s ease;
                }
                
                .seduc-notification-badge.show {
                    opacity: 1;
                    transform: scale(1);
                    animation: seduc-bounce 0.6s ease;
                }
                
                @keyframes seduc-bounce {
                    0%, 20%, 53%, 80%, 100% {
                        transform: translate3d(0,0,0) scale(1);
                    }
                    40%, 43% {
                        transform: translate3d(0, -6px, 0) scale(1.1);
                    }
                    70% {
                        transform: translate3d(0, -3px, 0) scale(1.05);
                    }
                    90% {
                        transform: translate3d(0,-1px,0) scale(1.02);
                    }
                }
                
                .seduc-loading {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: none;
                }
                
                .seduc-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f4f6;
                    border-top: 4px solid ${this.theme.primary};
                    border-radius: 50%;
                    animation: seduc-spin 1s linear infinite;
                }
                
                @keyframes seduc-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @media (max-width: 480px) {
                    .seduc-chat-modal {
                        width: calc(100vw - 40px);
                        height: 70vh;
                        ${position.modalMobile}
                    }
                    
                    .seduc-assistant-widget {
                        ${position.buttonMobile}
                    }
                }
            `;
            
            const styleEl = document.createElement('style');
            styleEl.textContent = styles;
            document.head.appendChild(styleEl);
        }
        
        getPositionStyles() {
            const { position, offsetX, offsetY } = this.config;
            const buttonSize = this.config.buttonSize;
            const modalOffset = buttonSize + 20;
            
            const positions = {
                'bottom-right': {
                    button: `bottom: ${offsetY}px; right: ${offsetX}px;`,
                    modal: `bottom: ${offsetY + modalOffset}px; right: ${offsetX}px;`,
                    buttonMobile: `bottom: 15px; right: 15px;`,
                    modalMobile: `bottom: 90px; right: 20px; left: 20px;`
                },
                'bottom-left': {
                    button: `bottom: ${offsetY}px; left: ${offsetX}px;`,
                    modal: `bottom: ${offsetY + modalOffset}px; left: ${offsetX}px;`,
                    buttonMobile: `bottom: 15px; left: 15px;`,
                    modalMobile: `bottom: 90px; left: 20px; right: 20px;`
                },
                'top-right': {
                    button: `top: ${offsetY}px; right: ${offsetX}px;`,
                    modal: `top: ${offsetY + modalOffset}px; right: ${offsetX}px;`,
                    buttonMobile: `top: 15px; right: 15px;`,
                    modalMobile: `top: 90px; right: 20px; left: 20px;`
                },
                'top-left': {
                    button: `top: ${offsetY}px; left: ${offsetX}px;`,
                    modal: `top: ${offsetY + modalOffset}px; left: ${offsetX}px;`,
                    buttonMobile: `top: 15px; left: 15px;`,
                    modalMobile: `top: 90px; left: 20px; right: 20px;`
                }
            };
            
            return positions[position] || positions['bottom-right'];
        }
        
        createElements() {
            // Container principal
            const widget = document.createElement('div');
            widget.className = 'seduc-assistant-widget';
            widget.id = 'seduc-assistant-widget';
            
            // Botão flutuante
            const button = document.createElement('button');
            button.className = 'seduc-chat-button';
            button.setAttribute('aria-label', 'Abrir Assistente Virtual SEDUC-GO');
            
            // Badge de notificação
            const badge = document.createElement('div');
            badge.className = 'seduc-notification-badge';
            badge.textContent = '1';
            
            // Ícone do chat
            const icon = document.createElement('div');
            icon.innerHTML = `
                <svg class="seduc-chat-icon" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 14.99 3.01 16.28L1 23L7.72 20.99C9.01 21.64 10.46 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C10.74 20 9.54 19.69 8.5 19.14L8.14 18.92L4.42 19.92L5.42 16.2L5.2 15.84C4.55 14.8 4.24 13.6 4.24 12.36C4.24 7.58 8.22 3.6 13 3.6C17.78 3.6 21.76 7.58 21.76 12.36C21.76 17.14 17.78 21.12 13 21.12L12 20Z"/>
                </svg>
            `;
            
            button.appendChild(badge);
            button.appendChild(icon);
            
            // Modal do chat
            const modal = document.createElement('div');
            modal.className = 'seduc-chat-modal';
            
            // Loading spinner
            const loading = document.createElement('div');
            loading.className = 'seduc-loading';
            loading.innerHTML = '<div class="seduc-spinner"></div>';
            
            // Iframe
            const iframe = document.createElement('iframe');
            iframe.className = 'seduc-chat-iframe';
            iframe.setAttribute('title', 'Assistente Virtual SEDUC-GO');
            iframe.setAttribute('allow', 'microphone; camera');
            iframe.setAttribute('allowfullscreen', '');
            
            modal.appendChild(loading);
            modal.appendChild(iframe);
            
            widget.appendChild(button);
            widget.appendChild(modal);
            
            document.body.appendChild(widget);
            
            // Salvar referências
            this.elements = {
                widget,
                button,
                modal,
                iframe,
                loading,
                badge
            };
        }
        
        bindEvents() {
            // Clique no botão
            this.elements.button.addEventListener('click', () => this.toggle());
            
            // Fechar com ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
            
            // Iframe carregado
            this.elements.iframe.addEventListener('load', () => {
                this.elements.loading.style.display = 'none';
            });
        }
        
        setupBadge() {
            if (this.config.showBadge) {
                setTimeout(() => {
                    if (!this.isOpen) {
                        this.elements.badge.classList.add('show');
                    }
                }, this.config.badgeDelay);
            }
        }
        
        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }
        
        open() {
            this.isOpen = true;
            this.elements.button.classList.add('active');
            this.elements.modal.classList.add('active');
            
            if (!this.iframeLoaded) {
                this.elements.loading.style.display = 'block';
                this.elements.iframe.src = this.config.assistantUrl;
                this.iframeLoaded = true;
            }
            
            this.elements.badge.classList.remove('show');
            
            // Analytics
            this.trackEvent('chat_opened');
            
            this.log('Chat aberto');
        }
        
        close() {
            this.isOpen = false;
            this.elements.button.classList.remove('active');
            this.elements.modal.classList.remove('active');
            
            // Analytics
            this.trackEvent('chat_closed');
            
            this.log('Chat fechado');
        }
        
        trackEvent(action) {
            if (this.config.analytics && typeof gtag !== 'undefined') {
                gtag('event', action, {
                    event_category: 'assistente_virtual',
                    event_label: 'seduc_go'
                });
            }
        }
        
        // API pública
        destroy() {
            if (this.elements.widget && this.elements.widget.parentNode) {
                this.elements.widget.parentNode.removeChild(this.elements.widget);
            }
            delete window.SeducAssistant;
        }
        
        updateConfig(newConfig) {
            this.config = { ...this.config, ...newConfig };
            this.log('Configuração atualizada', this.config);
        }
    }
    
    // Expor para o window
    window.SeducAssistant = SeducAssistant;
    
    // Auto-inicialização se não houver configuração específica
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!window.seducAssistantInstance) {
                window.seducAssistantInstance = new SeducAssistant();
            }
        });
    } else {
        if (!window.seducAssistantInstance) {
            window.seducAssistantInstance = new SeducAssistant();
        }
    }
    
})(window, document);
