import React from 'react';

interface FooterProps {
  phone: string;
  teamsUrl: string;
  educaPortalUrl: string;
}

const Footer: React.FC<FooterProps> = ({ phone, teamsUrl, educaPortalUrl }) => {
  // Detectar se está em iframe ou modo embarcado
  const isEmbedded = window.location !== window.parent.location || 
                    new URLSearchParams(window.location.search).has('embedded') ||
                    new URLSearchParams(window.location.search).has('iframe') ||
                    new URLSearchParams(window.location.search).get('source') === 'portal-educa';

  return (
    <footer className={`bg-gray-800 text-gray-300 text-[10px] sm:text-xs ${isEmbedded ? 'p-2' : 'p-3'}`} role="contentinfo">
      <div className="container mx-auto flex flex-col items-center justify-between gap-y-1 text-center">
        <div className={`flex ${isEmbedded ? 'flex-col gap-y-1' : 'flex-col sm:flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2'}`}>
          <a href={`tel:${phone.replace(/\D/g, '')}`} className="hover:text-white hover:underline transition-colors">Telefone: {phone}</a>
          {!isEmbedded && <a href={educaPortalUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline transition-colors">Portal Educa - TI</a>}
          <a href={teamsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline transition-colors">Acessar Chat no Teams</a>
        </div>
        <div className={`opacity-80 ${isEmbedded ? 'text-[9px]' : 'pt-2 md:pt-0 border-t border-gray-700 md:border-none w-full md:w-auto mt-2 md:mt-0'}`}>
          &copy; {new Date().getFullYear()} SEDUC-GO. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;