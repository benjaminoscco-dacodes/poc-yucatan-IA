import React from 'react';
import { X, FileText, Target, Eye, Shield } from 'lucide-react';

interface FichaTecnicaProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FichaTecnica: React.FC<FichaTecnicaProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl flex flex-col relative">
        
        {/* Header */}
        <div className="bg-yucatan-primary text-white p-6 flex justify-between items-center sticky top-0 z-10 shadow-md">
          <div>
             <h2 className="text-2xl font-serif font-bold">Ficha Técnica del Proyecto</h2>
             <p className="text-yucatan-secondary text-sm uppercase tracking-widest mt-1">Prototipos de IA para el Gobierno de Yucatán</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 bg-[#FDFBF7]">
          
          {/* Section 1: Resumen */}
          <section>
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yucatan-secondary/20 rounded text-yucatan-primary">
                   <FileText size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">1. Resumen Ejecutivo</h3>
             </div>
             <p className="text-gray-700 leading-relaxed text-justify border-l-4 border-yucatan-secondary pl-4">
               El <strong>Registro Público – Mapa Piloto de Expansión Económica (RPEE)</strong> es un prototipo innovador que aplica Inteligencia Artificial (IA) y datos sintéticos para ofrecer una visión clara y dinámica de las zonas con mayor potencial de crecimiento urbano y económico en Yucatán.
               <br/><br/>
               El usuario principal es la <strong>Secretaría de Economía y Desarrollo Urbano</strong>, que podrá anticipar tendencias, identificar corredores estratégicos de inversión y planificar infraestructura de manera proactiva.
             </p>
          </section>

          {/* Section 2: Objetivo */}
          <section className="bg-white p-6 rounded shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yucatan-secondary/20 rounded text-yucatan-primary">
                   <Target size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">2. Objetivo del POC y Valor Público</h3>
             </div>
             <p className="text-gray-700 mb-4">
               Validar la factibilidad de un modelo analítico que permita identificar zonas de mayor concentración de compraventas y tendencias de crecimiento temporal.
             </p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded border-l-2 border-yucatan-primary">
                   <h4 className="font-bold text-yucatan-primary mb-2">Planeación basada en evidencia</h4>
                   <p className="text-sm text-gray-600">Identificación precisa de municipios y corredores con mayor dinamismo inmobiliario.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border-l-2 border-yucatan-primary">
                   <h4 className="font-bold text-yucatan-primary mb-2">Facilitación de inversión</h4>
                   <p className="text-sm text-gray-600">Ofrecer información objetiva sobre polos de crecimiento para reducir riesgos.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border-l-2 border-yucatan-primary">
                   <h4 className="font-bold text-yucatan-primary mb-2">Política pública proactiva</h4>
                   <p className="text-sm text-gray-600">Anticipar demanda de servicios (agua, transporte, energía) ante crecimiento poblacional.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border-l-2 border-yucatan-primary">
                   <h4 className="font-bold text-yucatan-primary mb-2">Transparencia y confianza</h4>
                   <p className="text-sm text-gray-600">Análisis verificables con datos públicos y sintéticos.</p>
                </div>
             </div>
          </section>

          {/* Section 3: Alcance */}
          <section>
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yucatan-secondary/20 rounded text-yucatan-primary">
                   <Eye size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">3. Alcance Funcional</h3>
             </div>
             <ul className="space-y-3">
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-yucatan-secondary text-lg">01</span>
                  <p className="text-gray-700"><strong>Ingesta de dataset sintético:</strong> Simulación de compraventas para validar el modelo sin comprometer datos sensibles.</p>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-yucatan-secondary text-lg">02</span>
                  <p className="text-gray-700"><strong>Mapa de calor por zonas:</strong> Visualización de densidad de transacciones para identificar patrones de concentración.</p>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-yucatan-secondary text-lg">03</span>
                  <p className="text-gray-700"><strong>Series temporales:</strong> Detección de tendencias de crecimiento o declive mensual/trimestral.</p>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-yucatan-secondary text-lg">04</span>
                  <p className="text-gray-700"><strong>Clusterización de hotspots:</strong> Agrupación automática de zonas con patrones similares usando IA.</p>
                </li>
             </ul>
          </section>

           {/* Footer Note */}
           <div className="mt-8 p-4 bg-gray-800 text-white rounded flex items-start gap-3">
              <Shield className="text-yucatan-secondary flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm uppercase">Confidencialidad y Datos</h4>
                <p className="text-xs opacity-80 mt-1">
                  Este prototipo utiliza datos sintéticos. En fases posteriores integrará información del Registro Público de la Propiedad y Comercio bajo estrictos protocolos de seguridad.
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};