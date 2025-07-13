import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, MessageSender, NewMessagePayload, WebSource } from './types';
import { ASSISTANT_NAME, INITIAL_ASSISTANT_MESSAGE_PAYLOAD, SEDUC_HELP_DESK_PHONE, SEDUC_HELP_DESK_TEAMS_URL, EDUCA_PORTAL_TI_SOLUTIONS_URL, LEARN_COMMAND, CANCEL_LEARN_COMMAND, ADMIN_COMMAND } from './constants';
import ChatInput from './components/ChatInput';
import MessageDisplay from './components/ChatMessage';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import { askSeducAssistant } from './services/geminiService';
import { saveKnowledge, getKnowledge, formatKnowledgeForPrompt } from './services/knowledgeService';
import { ChatIcon } from './components/icons/ChatIcon';
import { XIcon } from './components/icons/XIcon';

const App: React.FC = () => {
  // Detectar se está em iframe ou modo embarcado
  const isEmbedded = window.location !== window.parent.location || 
                    new URLSearchParams(window.location.search).has('embedded') ||
                    new URLSearchParams(window.location.search).has('iframe') ||
                    new URLSearchParams(window.location.search).get('source') === 'portal-educa';
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLearningMode, setIsLearningMode] = useState<boolean>(false);
  const [persistentKnowledge, setPersistentKnowledge] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(isEmbedded); // Abrir automaticamente se embedded
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  const addMessage = useCallback((payload: NewMessagePayload, sources?: WebSource[]): ChatMessage => {
    const newMessage: ChatMessage = {
      ...payload,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      sources: sources,
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    return newMessage;
  }, []);

  useEffect(() => {
    if (isOpen && !isInitialized.current) {
      addMessage(INITIAL_ASSISTANT_MESSAGE_PAYLOAD);
      isInitialized.current = true;
    }
  }, [isOpen, addMessage]);

  useEffect(() => {
    if (isOpen) {
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    }
  }, [messages, isOpen]);

  // Carregar conhecimento persistente ao inicializar
  useEffect(() => {
    const loadPersistentKnowledge = async () => {
      try {
        const knowledgeData = await getKnowledge();
        const formattedKnowledge = formatKnowledgeForPrompt(knowledgeData);
        setPersistentKnowledge(formattedKnowledge);
      } catch (error) {
        console.error('Erro ao carregar conhecimento persistente:', error);
      }
    };

    loadPersistentKnowledge();
  }, []);

  const handleSubmit = async (userInput: string, imageBase64?: string) => {
    if (!userInput.trim() && !imageBase64) return;
    const trimmedInput = userInput.trim().toLowerCase();

    // Handle admin command
    if (trimmedInput === ADMIN_COMMAND.toLowerCase()) {
      addMessage({
        text: `🛡️ **Painel de Administração**\n\nPara acessar o painel de administração do conhecimento, visite:\n\n${window.location.origin}/admin.html\n\n⚠️ **Acesso restrito**: Necessária chave de administração.`,
        sender: MessageSender.SYSTEM,
      });
      return;
    }

    // Handle learning command
    if (trimmedInput === LEARN_COMMAND.toLowerCase()) {
      setIsLearningMode(true);
      addMessage({
        text: `Modo de aprendizado ativado. Por favor, insira a nova informação ou correção que devo aprender. Para sair, digite '${CANCEL_LEARN_COMMAND}'.`,
        sender: MessageSender.SYSTEM,
      });
      return;
    }

    // Handle input during learning mode
    if (isLearningMode) {
      setIsLearningMode(false); // Exit learning mode after one input
      if (trimmedInput === CANCEL_LEARN_COMMAND.toLowerCase()) {
        addMessage({ text: 'Modo de aprendizado cancelado.', sender: MessageSender.SYSTEM });
        return;
      }
      
      const newKnowledge = userInput.trim();
      setIsLoading(true);
      
      try {
        // Salvar conhecimento persistentemente
        const result = await saveKnowledge(newKnowledge);
        
        if (result.success) {
          // Recarregar conhecimento persistente
          const knowledgeData = await getKnowledge();
          const formattedKnowledge = formatKnowledgeForPrompt(knowledgeData);
          setPersistentKnowledge(formattedKnowledge);
          
          addMessage({
            text: `Obrigado! A seguinte informação foi salva permanentemente no meu conhecimento:\n\n*_"${newKnowledge}"_*\n\nEsta informação agora estará disponível em todas as futuras conversas, mesmo após recarregar a página.`,
            sender: MessageSender.SYSTEM,
          });
        } else {
          addMessage({
            text: `Desculpe, ocorreu um erro ao salvar o conhecimento: ${result.message}`,
            sender: MessageSender.SYSTEM,
          });
        }
      } catch (error) {
        console.error('Erro ao salvar conhecimento:', error);
        addMessage({
          text: `Erro ao salvar conhecimento. Tente novamente mais tarde.`,
          sender: MessageSender.SYSTEM,
        });
      } finally {
        setIsLoading(false);
      }
      
      return;
    }


    addMessage({ text: userInput, sender: MessageSender.USER, image: imageBase64 });
    setIsLoading(true);
    setError(null);

    try {
      const assistantResponse = await askSeducAssistant(userInput, messages, imageBase64, persistentKnowledge); 
      addMessage(
        { text: assistantResponse.text, sender: MessageSender.ASSISTANT },
        assistantResponse.sources
      );
    } catch (e: any) {
      console.error("Error processing user input:", e);
      const errorMessage = e.message || "Ocorreu um erro desconhecido ao tentar processar sua pergunta.";
      setError(errorMessage); // This error will be simplified by geminiService, but keep a fallback.
      addMessage({ text: `Desculpe, algo não saiu como esperado: ${errorMessage}. Tente perguntar de novo ou um pouco mais tarde.`, sender: MessageSender.SYSTEM });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={isEmbedded ? "h-screen w-full flex flex-col bg-gray-50" : "fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-[9999] flex flex-col items-end"}>
      {/* Chat Window */}
      <div
        className={`
          flex flex-col transition-all duration-300 ease-in-out
          ${isEmbedded 
            ? 'w-full h-full opacity-100 scale-100 bg-gray-50 rounded-none shadow-none' 
            : `bg-gray-50 rounded-xl shadow-2xl origin-bottom-right ${isOpen 
              ? 'w-[calc(100vw-32px)] h-[calc(100vh-88px)] sm:w-[400px] sm:h-[70vh] max-h-[600px] opacity-100 scale-100' 
              : 'w-0 h-0 opacity-0 scale-95'
            }`
          }
        `}
        style={{
          pointerEvents: isOpen || isEmbedded ? 'auto' : 'none',
        }}
      >
        <Header assistantName={ASSISTANT_NAME} />
        
        <main 
          className={`flex-grow overflow-y-auto custom-scrollbar bg-white shadow-inner ${isEmbedded ? 'p-1 space-y-2' : 'p-3 sm:p-4 space-y-4'}`}
          role="log"
          aria-live="polite"
          aria-atomic="false"
          aria-relevant="additions text"
        >
          {messages.map((msg) => (
            <MessageDisplay key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className={`flex justify-center ${isEmbedded ? 'py-2' : 'py-3'}`}>
              <LoadingSpinner size="md" />
            </div>
          )}
          {error && (
            <div 
              className={`text-red-700 bg-red-100 border border-red-300 rounded-lg my-2 mx-auto text-center shadow ${isEmbedded ? 'p-2 text-sm max-w-full' : 'p-3 text-base max-w-lg'}`}
              role="alert"
            >
              <strong>Atenção:</strong> {error}
            </div>
          )}
          <div ref={chatEndRef} />
        </main>

        <ChatInput onSubmit={handleSubmit} isLoading={isLoading} isLearningMode={isLearningMode} />
        
        {/* Footer - apenas mostrar se não estiver embarcado */}
        {!isEmbedded && (
          <Footer
            phone={SEDUC_HELP_DESK_PHONE}
            teamsUrl={SEDUC_HELP_DESK_TEAMS_URL}
            educaPortalUrl={EDUCA_PORTAL_TI_SOLUTIONS_URL}
          />
        )}
      </div>

      {/* Toggle Button - apenas mostrar se não estiver embarcado */}
      {!isEmbedded && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mt-4 bg-blue-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-75"
          aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
          title={isOpen ? "Fechar chat" : "Abrir chat"}
        >
          <div className="transition-transform duration-300 ease-in-out" style={{ transform: isOpen ? 'rotate(180deg) scale(0)' : 'rotate(0) scale(1)' }}>
              <ChatIcon className={`w-7 h-7 sm:w-8 sm:h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${!isOpen ? 'opacity-100' : 'opacity-0'}`} />
          </div>
          <div className="transition-transform duration-300 ease-in-out" style={{ transform: !isOpen ? 'rotate(-180deg) scale(0)' : 'rotate(0) scale(1)' }}>
              <XIcon className={`w-7 h-7 sm:w-8 sm:h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        </button>
      )}
    </div>
  );
};

export default App;
