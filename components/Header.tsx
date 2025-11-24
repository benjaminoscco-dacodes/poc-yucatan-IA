import React from 'react';

// Government Logo - Renacimiento Maya
const GOB_LOGO = (
  <svg viewBox="0 0 300 80" className="h-16 w-auto">
    {/* Icon Section */}
    <g transform="translate(10, 10) scale(0.6)">
       {/* Top Diamond/Chevron - Gold */}
      <path d="M0 45 L15 60 L0 75 L-15 60 Z" transform="translate(50, -50)" fill="#C59B4B" />
      <path d="M30 30 L50 5 L70 30" fill="none" stroke="#C59B4B" strokeWidth="6" />

      {/* Center Diamond - Gold */}
      <path d="M50 40 L60 50 L50 60 L40 50 Z" fill="#C59B4B" />

      {/* Side Chevrons - Burgundy */}
      <path d="M30 50 L10 30 L-10 50 L10 70 Z" transform="translate(0,0)" fill="#8A1B33" />
      <path d="M70 50 L90 30 L110 50 L90 70 Z" transform="translate(0,0)" fill="#8A1B33" />
      
      {/* Bottom Chevron - Burgundy */}
      <path d="M50 70 L70 90 L50 110 L30 90 Z" fill="#8A1B33" />

      {/* Dots */}
      <circle cx="20" cy="20" r="4" fill="#C59B4B" />
      <circle cx="80" cy="20" r="4" fill="#C59B4B" />
      <circle cx="20" cy="80" r="4" fill="#C59B4B" />
      <circle cx="80" cy="80" r="4" fill="#C59B4B" />
    </g>

    {/* Text Section */}
    <g transform="translate(90, 0)">
       <text x="0" y="25" fontFamily="sans-serif" fontSize="10" fontWeight="bold" fill="#C59B4B" letterSpacing="2">RENACIMIENTO MAYA</text>
       <text x="0" y="55" fontFamily="serif" fontSize="34" fontWeight="bold" fill="#8A1B33" letterSpacing="1">YUCATÁN</text>
       <line x1="0" y1="62" x2="180" y2="62" stroke="#8A1B33" strokeWidth="0.5" />
       <text x="0" y="74" fontFamily="sans-serif" fontSize="8" fontWeight="medium" fill="#4A4A4A" letterSpacing="1">GOBIERNO DEL ESTADO | 2024 - 2030</text>
    </g>
  </svg>
);

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md border-b border-gray-200 relative overflow-hidden">
      {/* Decorative Top Line */}
      <div className="w-full h-2 bg-yucatan-primary"></div>
      
      <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between relative z-10 gap-4 md:gap-0">
        
        {/* Left: Government Logo */}
        <div className="flex items-center justify-start w-auto lg:w-64">
           {GOB_LOGO}
        </div>
        
        {/* Center Title (Desktop only) */}
        <div className="hidden lg:block text-center">
          <h2 className="text-lg font-bold text-gray-800 tracking-tight">Prototipos de Inteligencia Artificial</h2>
          <p className="text-xs text-yucatan-primary uppercase tracking-widest font-medium">para el Gobierno de Yucatán</p>
        </div>

        {/* Right: Empty Placeholder for spacing balance */}
        <div className="flex items-center w-16 lg:w-64">
        </div>
      </div>
    </header>
  );
};