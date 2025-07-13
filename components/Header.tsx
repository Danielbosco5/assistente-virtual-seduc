import React from 'react';
import { SeducGoIcon } from './icons/SeducGoIcon';
import { EDUCA_PORTAL_TI_SOLUTIONS_URL } from '../constants';

interface HeaderProps {
  assistantName: string;
}

const Header: React.FC<HeaderProps> = ({ assistantName }) => {
  // Detectar se está em iframe ou modo embarcado
  const isEmbedded = window.location !== window.parent.location || 
                    new URLSearchParams(window.location.search).has('embedded') ||
                    new URLSearchParams(window.location.search).has('iframe') ||
                    new URLSearchParams(window.location.search).get('source') === 'portal-educa';

  return (
    <header className={`bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-lg sticky top-0 z-20 ${isEmbedded ? 'p-1.5' : 'p-3 sm:p-4'}`}>
      <div className="container mx-auto flex items-center justify-between">
        <div>
          <h1 className={`font-semibold ${isEmbedded ? 'text-lg' : 'text-xl sm:text-2xl'}`}>{assistantName}</h1>
          <p className={`opacity-90 ${isEmbedded ? 'text-xs' : 'text-sm'}`}>Suporte SEDUC-GO</p>
        </div>
         <a 
            href={EDUCA_PORTAL_TI_SOLUTIONS_URL} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            title="Acessar Portal Educa - Soluções de TI"
            aria-label="Acessar Portal Educa - Soluções de TI"
          >
            <SeducGoIcon 
                className={isEmbedded ? "w-5 h-5" : "w-7 h-7"}
                aria-hidden="true"
            />
         </a>
      </div>
    </header>
  );
};

export default Header;