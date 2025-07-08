import React from 'react';

interface FooterProps {
  phone: string;
  teamsUrl: string;
  educaPortalUrl: string;
}

const Footer: React.FC<FooterProps> = ({ phone, teamsUrl, educaPortalUrl }) => {
  return (
    <footer className="bg-gray-800 text-gray-300 p-3 text-[11px] sm:text-xs" role="contentinfo">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-y-3 md:gap-y-2 gap-x-4 text-center">
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <a href={`tel:${phone.replace(/\D/g, '')}`} className="hover:text-white hover:underline transition-colors">Telefone: {phone}</a>
          <a href={educaPortalUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline transition-colors">Portal Educa - TI</a>
          <a href={teamsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline transition-colors">Acessar Chat no Teams</a>
        </div>
        <div className="opacity-80 order-last md:order-first pt-2 md:pt-0 border-t border-gray-700 md:border-none w-full md:w-auto mt-2 md:mt-0">
          &copy; {new Date().getFullYear()} SEDUC-GO. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;