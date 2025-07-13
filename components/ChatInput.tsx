import React, { useState, useRef } from 'react';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import LoadingSpinner from './LoadingSpinner';

interface ChatInputProps {
  onSubmit: (text: string, imageBase64?: string) => void;
  isLoading: boolean;
  isLearningMode?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isLoading, isLearningMode = false }) => {
  // Detectar se está em iframe ou modo embarcado
  const isEmbedded = window.location !== window.parent.location || 
                    new URLSearchParams(window.location.search).has('embedded') ||
                    new URLSearchParams(window.location.search).has('iframe') ||
                    new URLSearchParams(window.location.search).get('source') === 'portal-educa';

  const [inputText, setInputText] = useState('');
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("A imagem é muito grande. Por favor, escolha uma imagem menor que 5MB.");
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || (!inputText.trim() && !imageBase64)) return;
    onSubmit(inputText, imageBase64);
    setInputText('');
    setImageBase64(undefined);
    setImagePreviewUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }
    // Reset textarea height
    const textarea = e.currentTarget.querySelector('textarea');
    if (textarea) {
        textarea.style.height = 'auto';
    }
  };

  const removeImage = () => {
    setImageBase64(undefined);
    setImagePreviewUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const placeholderText = isLearningMode
    ? "Digite a informação a ser aprendida ou 'parar' para sair..."
    : "Escreva sua dúvida aqui. Estou pronto para te ajudar! 😊";

  return (
    <div className={`bg-gray-100 border-t border-gray-300 sticky bottom-0 shadow-top ${isEmbedded ? 'p-2' : 'p-2 sm:p-3'}`}>
      {imagePreviewUrl && !isLearningMode && (
        <div className="px-2 pt-1">
            <div className="relative inline-block p-1 bg-gray-200 rounded-md shadow max-w-[120px] max-h-24 overflow-hidden">
            <img src={imagePreviewUrl} alt="Pré-visualização da imagem anexada" className="max-w-full max-h-20 object-contain rounded" />
            <button
                type="button"
                onClick={removeImage}
                className="absolute top-0 right-0 m-0.5 p-0.5 bg-gray-700 text-white rounded-full hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Remover imagem anexada"
            >
                <XCircleIcon className="w-5 h-5" />
            </button>
            </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2 pt-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`${isEmbedded ? 'p-1.5' : 'p-2 sm:p-2.5'} text-gray-600 hover:text-blue-600 transition-colors duration-150 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          aria-label="Anexar imagem"
          title="Anexar imagem"
          disabled={isLoading || isLearningMode}
        >
          <PaperclipIcon className="w-6 h-6" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/png, image/jpeg, image/gif, image/webp, image/heic"
          className="hidden"
          disabled={isLoading || isLearningMode}
          aria-hidden="true" 
        />
        <div className="flex-grow relative">
          <textarea
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none custom-scrollbar max-h-36 bg-white text-gray-900 placeholder:text-gray-500 ${isEmbedded ? 'py-2 px-2.5 text-sm min-h-[36px]' : 'py-2.5 px-3 text-base min-h-[44px]'} leading-snug`}
            rows={1}
            disabled={isLoading}
            aria-label="Caixa de texto para sua mensagem"
            aria-multiline="true"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || (!inputText.trim() && !imageBase64)}
          className={`${isEmbedded ? 'p-2' : 'p-2.5 sm:p-3'} bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150`}
          aria-label="Enviar mensagem"
          title="Enviar mensagem"
        >
          {isLoading ? <LoadingSpinner size="sm" color="text-white" /> : <PaperAirplaneIcon className="w-6 h-6" />}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;