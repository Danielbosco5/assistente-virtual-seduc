
import React from 'react';
import { ChatMessage, MessageSender, WebSource } from '../types';
import { UserIcon } from './icons/UserIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SystemIcon } from './icons/SystemIcon';

const FormattedText = ({ text, isEmbedded = false }: { text: string; isEmbedded?: boolean }): JSX.Element => {
  const blocks = text.split(/\n{2,}/); // Split by one or more empty lines for paragraphs

  const htmlContentFromBlocks = blocks.map(block => {
    const lines = block.split('\n');
    let blockHtml = '';
    let inList = false;

    lines.forEach(line => {
      let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold

      if (processedLine.match(/^(\*|-)\s(.*)/)) { // Starts with * or - then space
        if (!inList) {
          blockHtml += `<ul class="list-disc list-inside ${isEmbedded ? 'ml-1 my-1 space-y-0' : 'ml-2 my-2 space-y-1'}">`;
          inList = true;
        }
        blockHtml += `<li>${processedLine.substring(2)}</li>`;
      } else {
        if (inList) {
          blockHtml += '</ul>';
          inList = false;
        }
        // Add <p> for lines with content, or if it's an empty line that's not part of list processing.
        if (processedLine.trim()) {
             blockHtml += `<p class="${isEmbedded ? 'my-0.5' : 'my-1'}">${processedLine}</p>`;
        } else if (!inList && block.trim() === '' && lines.length === 1) {
            // This case handles a block that is essentially a paragraph break (an empty line between paragraphs)
            // We can represent it as a paragraph with a non-breaking space or let it be handled by CSS margins.
            // Adding an empty <p> might be collapsed by prose, so <br> might be an option if more space is needed.
            // For now, let's allow it to be an empty string, relying on block separation.
        } else if (!inList && processedLine === '' && block.trim() !== '') {
            // An empty line within a text block that is not a list.
             blockHtml += '<br />';
        }
      }
    });

    if (inList) {
      blockHtml += '</ul>'; // Close any open list at the end of the block
    }
    return blockHtml;
  }).join('');

  let finalHtmlOutput: string = ''; // Initialize finalHtmlOutput

  const hasMeaningfulHtmlStructure = htmlContentFromBlocks.includes("<ul") || htmlContentFromBlocks.includes("<p");

  if (!hasMeaningfulHtmlStructure && text.trim()) {
    // Fallback: If primary processing yielded no specific structure but there is text,
    // wrap lines in <p> or use <br /> for empty lines.
    finalHtmlOutput = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .split('\n')
      .map(line => line.trim() ? `<p class="my-1">${line}</p>` : '<br/>')
      .join('');
  } else if (!htmlContentFromBlocks && !text.trim()) {
    // Both original text and processed HTML are empty.
    finalHtmlOutput = ''; // Already initialized, but explicit assignment is fine.
  } else {
    finalHtmlOutput = htmlContentFromBlocks;
  }

  // Defensive cleanup for multiple <br> tags or completely empty <p> tags
  finalHtmlOutput = finalHtmlOutput.replace(/(<br\s*\/?>\s*){2,}/gi, '<br />'); // Collapse multiple <br> to one
  finalHtmlOutput = finalHtmlOutput.replace(/<p class="my-1">\s*<\/p>/gi, ''); // Remove empty paragraphs

  return <div className="prose prose-sm sm:prose-base max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: finalHtmlOutput }} />;
};


const MessageDisplay: React.FC<{ message: ChatMessage }> = ({ message }) => {
  // Detectar se está em iframe ou modo embarcado
  const isEmbedded = window.location !== window.parent.location || 
                    new URLSearchParams(window.location.search).has('embedded') ||
                    new URLSearchParams(window.location.search).has('iframe') ||
                    new URLSearchParams(window.location.search).get('source') === 'portal-educa';

  const isUser = message.sender === MessageSender.USER;
  const isSystem = message.sender === MessageSender.SYSTEM;

  const bubbleClasses = isUser
    ? 'bg-blue-500 text-white rounded-br-none'
    : isSystem
    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-none'
    : 'bg-slate-100 text-slate-800 rounded-bl-none'; // Changed assistant bubble color
  
  const alignmentClasses = isUser ? 'ml-auto items-end' : 'mr-auto items-start';

  const IconComponent = isUser ? UserIcon : (isSystem ? SystemIcon : SparklesIcon);
  const iconColor = isUser ? "text-blue-500" : (isSystem ? "text-yellow-700" : "text-green-600");

  const formattedTimestamp = new Date(message.timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex flex-col w-full mx-auto ${alignmentClasses} ${isEmbedded ? 'max-w-full' : 'max-w-2xl'}`} role="listitem">
      <div className={`flex items-end ${isEmbedded ? 'space-x-1.5' : 'space-x-2 sm:space-x-2.5'} ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
        {!isSystem && (
            <div className={`flex-shrink-0 rounded-full flex items-center justify-center mb-2 ${isEmbedded ? 'w-6 h-6' : 'w-8 h-8 sm:w-10 sm:h-10 mb-5'} ${isUser ? 'bg-blue-100' : 'bg-green-100'}`}>
                <IconComponent className={`${isEmbedded ? 'w-3.5 h-3.5' : 'w-5 h-5 sm:w-6 sm:h-6'} ${iconColor}`} />
            </div>
        )}
        <div className={`rounded-xl shadow-md ${bubbleClasses} break-words ${isEmbedded ? 'p-2 max-w-[85%] text-sm' : 'p-3 sm:p-3.5 md:p-4 max-w-lg md:max-w-xl'}`}>
          {message.image && (
            <div className={isEmbedded ? "mb-1.5" : "mb-2.5"}>
              <img src={message.image} alt="Conteúdo da imagem enviada pelo usuário" className={`rounded-md object-contain border border-gray-300 ${isEmbedded ? 'max-w-40 max-h-32' : 'max-w-sm max-h-80'}`} />
            </div>
          )}
          <FormattedText text={message.text} isEmbedded={isEmbedded} />
          {message.sources && message.sources.length > 0 && (
            <div className={`border-t border-gray-300/60 ${isEmbedded ? 'mt-2 pt-1.5' : 'mt-3.5 pt-2.5'}`}>
              <h4 className={`font-semibold opacity-80 ${isEmbedded ? 'text-xs mb-1' : 'text-sm mb-1.5'}`}>{isUser ? 'Minhas Fontes (se aplicável)' : 'Fontes Consultadas:'}</h4>
              <ul className={`list-disc list-inside ${isEmbedded ? 'space-y-0.5' : 'space-y-1.5'}`}>
                {message.sources.map((source: WebSource, index: number) => (
                  <li key={index} className={isEmbedded ? "text-xs" : "text-sm"}>
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:underline opacity-90 break-all text-current hover:text-blue-600 visited:text-purple-600">
                      {source.title || source.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <p className={`text-gray-500 ${isEmbedded ? 'text-[10px] mt-0.5' : 'text-xs mt-1.5'} ${isUser ? 'text-right' : (isSystem ? 'text-center w-full' : `text-left ${isEmbedded ? 'ml-8' : 'ml-10 sm:ml-12'}`)}`} aria-label={`Mensagem enviada às ${formattedTimestamp}`}>
        {formattedTimestamp}
      </p>
    </div>
  );
};

export default MessageDisplay;