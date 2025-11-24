import React, { useState, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { Visualizations } from './components/Visualizations';
import { ReportView } from './components/ReportView';
import { FileUploader } from './components/FileUploader';
import { FichaTecnica } from './components/FichaTecnica';
import { Transaction, DashboardMetrics, AnalysisStatus } from './types';
import { MOCK_TRANSACTIONS } from './constants';
import { analyzeDataWithGemini } from './services/geminiService';
import { downloadData } from './services/dataUtils';
import { Download, RefreshCw, Calendar, Map as MapIcon, Info, ArrowRight, Tag, Home, Layers } from 'lucide-react';

// Helper to categorize property types based on description
const getPropertyCategory = (type: string): string => {
  const t = type.toLowerCase();
  if (t.includes('industrial') || t.includes('bodega') || t.includes('nave')) return 'Industrial';
  if (t.includes('terreno') || t.includes('lote') || t.includes('macrolote')) return 'Terreno';
  if (t.includes('local') || t.includes('oficina') || t.includes('comercial') || t.includes('hotel')) return 'Comercial';
  if (t.includes('casa') || t.includes('departamento') || t.includes('townhouse')) return 'Residencial';
  return 'Otros';
};

const App: React.FC = () => {
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [analysisReport, setAnalysisReport] = useState<string>('');
  const [showFicha, setShowFicha] = useState(false);
  
  // Filters
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('Todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos'); // New high-level filter
  const [selectedType, setSelectedType] = useState<string>('Todos'); // Specific filter
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({ start: '', end: '' });

  // Derived Filtered Data
  const filteredTransactions = useMemo(() => {
    return rawTransactions.filter(t => {
      const category = getPropertyCategory(t.type);
      
      const matchesMuni = selectedMunicipality === 'Todos' || t.municipality === selectedMunicipality;
      const matchesCategory = selectedCategory === 'Todos' || category === selectedCategory;
      const matchesType = selectedType === 'Todos' || t.type === selectedType;
      const matchesStart = dateRange.start ? t.date >= dateRange.start : true;
      const matchesEnd = dateRange.end ? t.date <= dateRange.end : true;
      
      return matchesMuni && matchesCategory && matchesType && matchesStart && matchesEnd;
    });
  }, [rawTransactions, selectedMunicipality, selectedCategory, selectedType, dateRange]);

  // Metrics Calculation
  const metrics: DashboardMetrics = useMemo(() => {
    if (filteredTransactions.length === 0) return { totalVolume: 0, transactionCount: 0, topZone: 'N/A', averageAmount: 0 };

    const totalVolume = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const zoneCounts = filteredTransactions.reduce((acc, t) => {
      acc[t.zone] = (acc[t.zone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topZone = Object.entries(zoneCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const averageAmount = totalVolume / filteredTransactions.length;

    return { totalVolume, transactionCount: filteredTransactions.length, topZone, averageAmount };
  }, [filteredTransactions]);

  // Filter Options Generation
  const uniqueMunicipalities = useMemo(() => {
    return ['Todos', ...new Set(rawTransactions.map(t => t.municipality))];
  }, [rawTransactions]);

  const uniqueCategories = useMemo(() => {
    return ['Todos', 'Residencial', 'Terreno', 'Industrial', 'Comercial', 'Otros'];
  }, []);

  // Dependent Dropdown: Only show Types available in the selected Category
  const uniqueTypes = useMemo(() => {
    const availableTypes = rawTransactions
      .filter(t => selectedCategory === 'Todos' || getPropertyCategory(t.type) === selectedCategory)
      .map(t => t.type);
    return ['Todos', ...new Set(availableTypes)];
  }, [rawTransactions, selectedCategory]);

  const handleLoadMockData = useCallback(() => {
    setRawTransactions(MOCK_TRANSACTIONS);
  }, []);

  const handleReset = useCallback(() => {
    setRawTransactions([]);
    setAnalysisStatus(AnalysisStatus.IDLE);
    setAnalysisReport('');
    setSelectedMunicipality('Todos');
    setSelectedCategory('Todos');
    setSelectedType('Todos');
    setDateRange({ start: '', end: '' });
  }, []);

  const handleRunAnalysis = useCallback(async () => {
    if (filteredTransactions.length === 0) return;

    setAnalysisStatus(AnalysisStatus.LOADING);
    // Scroll to report section
    setTimeout(() => {
        document.getElementById('ai-report')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    const report = await analyzeDataWithGemini(filteredTransactions);
    
    if (report.startsWith("Error")) {
        setAnalysisStatus(AnalysisStatus.ERROR);
    } else {
        setAnalysisStatus(AnalysisStatus.COMPLETE);
    }
    setAnalysisReport(report);
  }, [filteredTransactions]);

  const handleExport = (format: 'json' | 'csv') => {
    downloadData(filteredTransactions, format);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] relative">
      {/* Global Pattern Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-maya-pattern opacity-20 z-0"></div>

      <Header />
      <FichaTecnica isOpen={showFicha} onClose={() => setShowFicha(false)} />
      
      <main className="flex-grow container mx-auto px-6 py-8 relative z-10">
        
        {/* Top Info Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
             <h2 className="text-2xl font-serif font-bold text-gray-800">Tablero de Control</h2>
             <p className="text-gray-500 text-sm">Análisis de expansión económica y transacciones inmobiliarias.</p>
          </div>
          
          <div className="flex gap-3">
            {/* Prominent Home Button (Only visible when data is loaded) */}
            {rawTransactions.length > 0 && (
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 bg-yucatan-primary text-white hover:bg-[#6d1528] font-bold text-sm px-5 py-2.5 rounded shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <Home size={18} />
                INICIO / NUEVA CONSULTA
              </button>
            )}

            <button 
               onClick={() => setShowFicha(true)}
               className="flex items-center gap-2 text-yucatan-primary hover:text-yucatan-secondary font-bold text-sm px-4 py-2.5 bg-white rounded shadow-sm border border-yucatan-primary/20 transition-all hover:shadow-md"
            >
               <Info size={18} />
               Ver Ficha Técnica
            </button>
          </div>
        </div>

        {/* Data Loading State */}
        {rawTransactions.length === 0 ? (
          <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded shadow-lg border-t-4 border-yucatan-secondary">
             <h3 className="text-xl font-serif font-bold text-center mb-6 text-gray-800">Inicializar Sistema RPEE</h3>
             <FileUploader onDataLoaded={setRawTransactions} />
             
             <div className="text-center mt-8">
               <div className="relative flex py-5 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-widest">Acceso Rápido</span>
                  <div className="flex-grow border-t border-gray-200"></div>
               </div>
               <button 
                 onClick={handleLoadMockData}
                 className="text-yucatan-primary hover:text-white border border-yucatan-primary hover:bg-yucatan-primary font-medium text-sm px-6 py-2 rounded transition-colors"
               >
                 Cargar Dataset Piloto (Q1-Q2 2024)
               </button>
             </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-8">
            
            {/* Control Bar */}
            <div className="bg-white p-5 rounded shadow-sm border-b-2 border-gray-100 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
               
               <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
                  {/* Municipality Filter */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1 tracking-wide">
                      <MapIcon size={12}/> Municipio / Zona
                    </label>
                    <select 
                      value={selectedMunicipality}
                      onChange={(e) => setSelectedMunicipality(e.target.value)}
                      className="bg-[#F9F9F9] border border-gray-300 text-gray-800 text-sm rounded focus:ring-yucatan-secondary focus:border-yucatan-secondary block w-40 p-2 font-medium"
                    >
                      {uniqueMunicipalities.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  {/* Category Filter (New) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1 tracking-wide">
                      <Layers size={12}/> Giro / Categoría
                    </label>
                    <select 
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedType('Todos'); // Reset specific type when category changes
                      }}
                      className="bg-[#F9F9F9] border border-gray-300 text-gray-800 text-sm rounded focus:ring-yucatan-secondary focus:border-yucatan-secondary block w-40 p-2 font-medium"
                    >
                      {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Type Filter (Dependent on Category) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1 tracking-wide">
                      <Tag size={12}/> Detalle Transacción
                    </label>
                    <select 
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="bg-[#F9F9F9] border border-gray-300 text-gray-800 text-sm rounded focus:ring-yucatan-secondary focus:border-yucatan-secondary block w-48 p-2 font-medium truncate"
                    >
                      {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1 tracking-wide">
                      <Calendar size={12}/> Periodo
                    </label>
                    <input 
                      type="date" 
                      className="bg-[#F9F9F9] border border-gray-300 text-gray-800 text-sm rounded p-2 w-32 font-medium"
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  {/* Export Buttons */}
                  <div className="flex bg-gray-100 rounded p-1 border border-gray-200">
                    <button onClick={() => handleExport('csv')} className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-white hover:text-yucatan-primary hover:shadow-sm rounded transition-all">CSV</button>
                    <div className="w-px bg-gray-300 mx-1 my-1"></div>
                    <button onClick={() => handleExport('json')} className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-white hover:text-yucatan-primary hover:shadow-sm rounded transition-all">JSON</button>
                    <div className="pl-2 pr-1 flex items-center text-gray-400"><Download size={14}/></div>
                  </div>

                  <button 
                      onClick={handleRunAnalysis}
                      disabled={analysisStatus === AnalysisStatus.LOADING || analysisStatus === AnalysisStatus.COMPLETE}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded font-bold shadow transition-all text-sm tracking-wide uppercase ${
                        analysisStatus === AnalysisStatus.COMPLETE 
                        ? 'bg-green-600 text-white cursor-default'
                        : 'bg-yucatan-secondary hover:bg-[#B0893C] text-white'
                      }`}
                  >
                    {analysisStatus === AnalysisStatus.LOADING ? 'Procesando...' : 
                      analysisStatus === AnalysisStatus.COMPLETE ? (
                        <><span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> Listo</>
                      ) : (
                        <>Analizar con IA <ArrowRight size={16}/></>
                      )
                    }
                  </button>
               </div>
            </div>

            <StatsCards metrics={metrics} />
            
            <Visualizations data={filteredTransactions} />

            <div id="ai-report" className="mt-16 scroll-mt-20">
              <ReportView report={analysisReport} status={analysisStatus} />
            </div>
          </div>
        )}

      </main>

      <footer className="bg-[#2D2D2D] text-white py-12 mt-12 relative overflow-hidden border-t-8 border-yucatan-primary">
        <div className="absolute top-0 left-0 w-full h-2 bg-yucatan-secondary opacity-30"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
           <div className="mb-6 opacity-20">
              {/* Simple Mayan Pattern Strip in Footer */}
              <div className="h-4 w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSIxMCIgdmlld0JveD0iMCAwIDQwIDEwIj48cGF0aCBkPSJNMCAwaDEwdjEwSDB6TTIwIDBoMTB2MTBIMjB6IiBmaWxsPSIjZmZmIiAvPjwvc3ZnPg==')]"></div>
           </div>
           <h4 className="font-serif font-bold text-lg tracking-widest mb-2 text-yucatan-secondary">RENACIMIENTO MAYA</h4>
           <p className="opacity-60 text-sm mb-6 font-light">Gobierno del Estado de Yucatán | 2024 - 2030</p>
           <div className="flex justify-center gap-8 text-xs opacity-40 uppercase tracking-wider">
             <span>Secretaría de Economía</span>
             <span>•</span>
             <span>Desarrollo Urbano</span>
             <span>•</span>
             <span>Innovación Digital</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;