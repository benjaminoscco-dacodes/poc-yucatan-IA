import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { AnalysisStatus } from '../types';

interface ReportViewProps {
  report: string;
  status: AnalysisStatus;
}

export const ReportView: React.FC<ReportViewProps> = ({ report, status }) => {
  if (status === AnalysisStatus.IDLE) return null;

  if (status === AnalysisStatus.LOADING) {
    return (
      <div className="bg-white p-12 rounded-sm shadow-lg border-t-4 border-yucatan-secondary flex flex-col items-center justify-center text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping bg-yucatan-secondary/20 rounded-full"></div>
          <Sparkles className="text-yucatan-secondary mb-6 relative z-10 animate-spin-slow" size={48} />
        </div>
        <h3 className="text-2xl font-serif font-bold text-yucatan-primary">Generando Análisis Estratégico</h3>
        <p className="text-gray-500 mt-3 font-light">El motor de IA está procesando los indicadores territoriales...</p>
      </div>
    );
  }

  if (status === AnalysisStatus.ERROR) {
    return (
      <div className="bg-red-50 p-8 rounded-sm border-l-4 border-red-800 flex items-center gap-4 shadow-md">
        <AlertTriangle className="text-red-800" size={32} />
        <div>
          <h3 className="text-lg font-serif font-bold text-red-900">Error en el Análisis</h3>
          <p className="text-red-700">{report}</p>
        </div>
      </div>
    );
  }

  // Formatting
  const formattedReport = report.split('\n').map((line, index) => {
    if (line.startsWith('# ')) return <h2 key={index} className="text-3xl font-serif font-bold text-yucatan-primary mt-8 mb-4 pb-2 border-b border-gray-200">{line.replace('# ', '')}</h2>;
    if (line.startsWith('## ')) return <h3 key={index} className="text-xl font-bold text-gray-800 mt-6 mb-3 flex items-center gap-2"><span className="w-2 h-2 bg-yucatan-secondary rotate-45"></span>{line.replace('## ', '')}</h3>;
    if (line.startsWith('### ')) return <h4 key={index} className="text-lg font-semibold text-yucatan-primary mt-4 mb-2">{line.replace('### ', '')}</h4>;
    if (line.trim().startsWith('-') || line.trim().startsWith('*')) return <li key={index} className="ml-4 list-none relative pl-5 text-gray-700 mb-2 before:content-['•'] before:absolute before:left-0 before:text-yucatan-secondary before:font-bold">{line.replace(/^[-*]\s/, '')}</li>;
    if (line.match(/^\d\./)) return <li key={index} className="ml-4 list-decimal text-gray-700 mb-2 font-medium marker:text-yucatan-primary">{line}</li>;
    if (line.trim() === '') return <br key={index} />;
    return <p key={index} className="text-gray-700 leading-relaxed mb-2 font-light">{line}</p>;
  });

  return (
    <div className="bg-white rounded-sm shadow-xl overflow-hidden border-t-4 border-yucatan-primary">
      <div className="bg-[#2D2D2D] p-6 flex justify-between items-center relative overflow-hidden">
        {/* Mayan Texture Overlay */}
        <div className="absolute inset-0 opacity-5 bg-maya-pattern"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-yucatan-primary p-3 rounded-sm">
             <FileText className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-white tracking-wide">Dictamen Técnico RPEE</h2>
            <p className="text-yucatan-secondary text-xs uppercase tracking-widest">Generado con Inteligencia Artificial</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-yucatan-secondary text-sm font-medium bg-white/5 px-4 py-2 rounded-full border border-yucatan-secondary/30">
          <CheckCircle size={16} />
          <span>Reporte Oficial</span>
        </div>
      </div>
      <div className="p-10 max-w-5xl mx-auto bg-white">
        <div className="prose prose-slate max-w-none font-sans">
           {formattedReport}
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col items-center">
          <div className="w-16 h-16 opacity-10 mb-4">
            {/* Reuse simple logo shape */}
             <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-gray-900">
                <path d="M50 0L100 50L50 100L0 50Z" />
             </svg>
          </div>
          <p className="text-sm text-gray-400 italic text-center max-w-md">
            Este documento es un prototipo generado por el sistema RPEE para fines de planeación interna. 
            Gobierno del Estado de Yucatán.
          </p>
        </div>
      </div>
    </div>
  );
};