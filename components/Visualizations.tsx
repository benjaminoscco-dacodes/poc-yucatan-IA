import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { Transaction } from '../types';
import { Sliders, Map as MapIcon, Layers, Box, ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';

interface VisualizationProps {
  data: Transaction[];
}

// Custom Shape for 3D Pillar Effect
const CustomPillar = (props: any) => {
  const { cx, cy, z, fill, is3D } = props;
  
  // Scaling factor for height based on amount (z)
  // We normalize z (amount) to a pixel height
  const height = is3D ? Math.min(60, Math.max(10, z / 200000)) : 15; 
  const width = 12;

  // 3D Offset
  const topOffset = is3D ? height : 0;

  if (!cx || !cy) return null;

  return (
    <g className="transition-all duration-500 ease-out cursor-pointer group">
      {/* Shadow / Base */}
      <ellipse cx={cx} cy={cy} rx={width/1.5} ry={width/3} fill="#000" opacity={0.2} />
      
      {/* Pillar Body (Front) - Only visible in 3D mode */}
      {is3D && (
        <path 
          d={`
            M ${cx - width/2} ${cy} 
            v ${-topOffset} 
            a ${width/2} ${width/4} 0 0 1 ${width} 0 
            v ${topOffset} 
            a ${width/2} ${width/4} 0 0 1 ${-width} 0
          `} 
          fill={fill}
          filter="brightness(0.8)"
        />
      )}

      {/* Pillar Top (The "Face") */}
      <ellipse 
        cx={cx} 
        cy={cy - topOffset} 
        rx={width/2} 
        ry={width/4} 
        fill={fill} 
        stroke="white" 
        strokeWidth={1}
        strokeOpacity={0.5}
        className="group-hover:brightness-110 transition-all"
      />
    </g>
  );
};

export const Visualizations: React.FC<VisualizationProps> = ({ data }) => {
  const [granularity, setGranularity] = useState<'month' | 'day'>('month');
  const [hotspotSensitivity, setHotspotSensitivity] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('3D');

  // Zoom & Pan State
  const [xDomain, setXDomain] = useState<[number, number]>([0, 100]);
  const [yDomain, setYDomain] = useState<[number, number]>([0, 100]);
  const [isDragging, setIsDragging] = useState(false);
  const lastMouseRef = useRef<{ x: number; y: number } | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Reset zoom when data changes largely or manually
  const handleResetZoom = () => {
    setXDomain([0, 100]);
    setYDomain([0, 100]);
  };

  // Process Data for Volume Chart
  const volumeByMunicipality = useMemo(() => {
    const counts = data.reduce((acc, curr) => {
      acc[curr.municipality] = (acc[curr.municipality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts).map(key => ({
      name: key,
      transacciones: counts[key]
    })).sort((a, b) => b.transacciones - a.transacciones);
  }, [data]);

  // Process Data for Time Series
  const timeSeriesData = useMemo(() => {
    const grouped = data.reduce((acc, curr) => {
      let key = curr.date; 
      if (granularity === 'month') {
        key = curr.date.substring(0, 7);
      }
      acc[key] = (acc[key] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(grouped).sort().map(key => ({
      date: key,
      monto: grouped[key]
    }));
  }, [data, granularity]);

  // Process Data for Scatter Plot
  const scatterData = useMemo(() => {
    return data
      .filter(t => t.amount >= hotspotSensitivity)
      .map(t => ({
        x: t.coordinates.x,
        y: t.coordinates.y,
        z: t.amount, 
        municipality: t.municipality,
        zone: t.zone,
        type: t.type,
        formattedAmount: `$${(t.amount / 1000000).toFixed(2)}M`
      }));
  }, [data, hotspotSensitivity]);

  // Renacimiento Maya Color Palette Mapping
  const getColor = (muni: string, amount: number) => {
    const colors: Record<string, string> = {
      'Mérida': '#8A1B33', // Burgundy
      'Hunucmá': '#C59B4B', // Gold
      'Umán': '#5D4037', // Earth Brown
      'Kanasín': '#D9C6A3', // Beige
      'Progreso': '#78909C', // Slate
    };
    return colors[muni] || '#8A1B33';
  };

  // --- ZOOM & PAN LOGIC ---
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const scaleFactor = 0.1;
    const direction = e.deltaY > 0 ? 1 : -1; // >0 is scroll down (zoom out), <0 is scroll up (zoom in)
    
    const xRange = xDomain[1] - xDomain[0];
    const yRange = yDomain[1] - yDomain[0];
    
    const dx = xRange * scaleFactor * direction;
    const dy = yRange * scaleFactor * direction;

    // Clamp minimum zoom
    if (direction < 0 && xRange < 10) return; 

    // Calculate new domains (center zoom)
    setXDomain([xDomain[0] - dx / 2, xDomain[1] + dx / 2]);
    setYDomain([yDomain[0] - dy / 2, yDomain[1] + dy / 2]);
  };

  const handleZoomBtn = (direction: 'in' | 'out') => {
    const scaleFactor = 0.2;
    const dir = direction === 'in' ? -1 : 1;
    
    const xRange = xDomain[1] - xDomain[0];
    const yRange = yDomain[1] - yDomain[0];
    
    if (direction === 'in' && xRange < 10) return;

    const dx = xRange * scaleFactor * dir;
    const dy = yRange * scaleFactor * dir;

    setXDomain([xDomain[0] - dx / 2, xDomain[1] + dx / 2]);
    setYDomain([yDomain[0] - dy / 2, yDomain[1] + dy / 2]);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !lastMouseRef.current || !chartContainerRef.current) return;
    
    const dxPixels = e.clientX - lastMouseRef.current.x;
    const dyPixels = e.clientY - lastMouseRef.current.y;
    
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    // Calculate scale (Domain Units per Pixel)
    const { clientWidth, clientHeight } = chartContainerRef.current;
    const xRange = xDomain[1] - xDomain[0];
    const yRange = yDomain[1] - yDomain[0];
    
    const xScale = xRange / clientWidth;
    const yScale = yRange / clientHeight;

    // Shift Domains
    // Dragging LEFT (dx < 0) should move view RIGHT (increase domain x) -> Subtract dx
    const xShift = -dxPixels * xScale;
    
    // Dragging UP (dy < 0). If reversed axis (0 top), we subtract. If normal axis (0 bottom), we Add.
    // We are now using Normal Axis (0 Bottom) for proper map orientation.
    // If I drag mouse UP (negative dy), I want to see the map BELOW.
    // This means moving the window UP (Higher Y values).
    const yShift = dyPixels * yScale; 

    setXDomain([xDomain[0] + xShift, xDomain[1] + xShift]);
    setYDomain([yDomain[0] + yShift, yDomain[1] + yShift]);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    lastMouseRef.current = null;
  };

  return (
    <div className="grid grid-cols-1 gap-8 mb-8">
      
      {/* Geospatial Hotspot Map (3D Visualization) */}
      <div className="bg-white p-1 rounded-sm shadow-xl border-t-4 border-yucatan-primary col-span-1 overflow-hidden">
        
        {/* Header Controls */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-xl font-serif font-bold text-yucatan-primary flex items-center gap-2">
              <Box size={24} />
              Mapa de Densidad Económica 
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Visualización isométrica de clusters de inversión.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Zoom Controls */}
            <div className="flex bg-white border border-gray-200 rounded p-1 shadow-sm items-center">
               <button onClick={() => handleZoomBtn('in')} className="p-1.5 text-gray-600 hover:text-yucatan-primary hover:bg-gray-100 rounded" title="Zoom In">
                 <ZoomIn size={16} />
               </button>
               <div className="w-px h-4 bg-gray-200 mx-1"></div>
               <button onClick={() => handleZoomBtn('out')} className="p-1.5 text-gray-600 hover:text-yucatan-primary hover:bg-gray-100 rounded" title="Zoom Out">
                 <ZoomOut size={16} />
               </button>
               <div className="w-px h-4 bg-gray-200 mx-1"></div>
               <button onClick={handleResetZoom} className="p-1.5 text-gray-600 hover:text-yucatan-primary hover:bg-gray-100 rounded" title="Restablecer Vista">
                 <Maximize size={16} />
               </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-white border border-gray-200 rounded p-1 shadow-sm">
              <button 
                onClick={() => setViewMode('2D')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded transition-all ${viewMode === '2D' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <MapIcon size={14} /> 2D
              </button>
              <button 
                onClick={() => setViewMode('3D')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded transition-all ${viewMode === '3D' ? 'bg-yucatan-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Layers size={14} /> 3D
              </button>
            </div>

            {/* Sensitivity Slider */}
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded border border-gray-200 shadow-sm">
               <Sliders size={14} className="text-yucatan-secondary" />
               <div className="flex flex-col w-32">
                 <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Filtrar por Monto</label>
                 <input 
                   type="range" 
                   min="0" 
                   max="5000000" 
                   step="100000"
                   value={hotspotSensitivity}
                   onChange={(e) => setHotspotSensitivity(Number(e.target.value))}
                   className="h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yucatan-secondary"
                 />
               </div>
            </div>
          </div>
        </div>

        {/* Visualization Container */}
        <div 
          ref={chartContainerRef}
          className={`h-[600px] w-full bg-[#FDFBF7] relative overflow-hidden group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
           
           {/* Dynamic Map Background Grid with Yucatan Shape */}
           <div className={`absolute inset-0 pointer-events-none transition-transform duration-700 ${viewMode === '3D' ? 'scale-105' : 'scale-100'}`}>
             
             <svg width="100%" height="100%" className="opacity-40" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Background Water (Top) - Represented as neutral space or texture */}
                
                {/* Land Mass - Simplified Yucatan North Coast */}
                {/* Coord System: 0,0 is Top-Left in SVG. Recharts Data: 0,0 is Bottom-Left (North Up) */}
                {/* We must align SVG to Data. If Data 100 is Top, SVG 0 is Top. */}
                {/* Progreso (y=91) is near Top. Coastline is around y=95 */}
                {/* In SVG coords (0-100 down), Coastline is at y=5. */}

                <defs>
                  <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
                     <path d="M 4 0 L 0 0 0 4" fill="none" stroke="#C59B4B" strokeWidth="0.1"/>
                  </pattern>
                  <filter id="blur-map">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
                  </filter>
                </defs>

                {/* Gulf Label */}
                <text x="50" y="4" fontFamily="serif" fontSize="3" fill="#999" textAnchor="middle" letterSpacing="1" fontStyle="italic">GOLFO DE MÉXICO</text>

                {/* Land Polygon (Beige) */}
                {/* Drawing roughly from West (Hunucma area) to East (Conkal/Motul) */}
                <path 
                  d="M 0 15 Q 20 12, 40 14 T 60 10 T 100 12 V 100 H 0 Z" 
                  fill="#F5F2EA" 
                  stroke="#D9C6A3" 
                  strokeWidth="0.5"
                />
                
                {/* Grid Overlay only on land */}
                <path 
                  d="M 0 15 Q 20 12, 40 14 T 60 10 T 100 12 V 100 H 0 Z" 
                  fill="url(#grid)" 
                  opacity="0.3"
                />

                {/* Municipality Labels (Approximate positions based on data coords) */}
                {/* Mérida: Data X=50, Y=50. SVG Y = 100-50 = 50. */}
                <text x="50" y="52" fontFamily="sans-serif" fontSize="2.5" fontWeight="bold" fill="#8A1B33" opacity="0.3" textAnchor="middle">MÉRIDA</text>
                
                {/* Progreso: Data X=50, Y=90. SVG Y = 100-90 = 10. */}
                <text x="52" y="14" fontFamily="sans-serif" fontSize="2" fontWeight="bold" fill="#78909C" opacity="0.5" textAnchor="middle">PROGRESO</text>

                {/* Hunucmá: Data X=20, Y=60. SVG Y = 100-60 = 40. */}
                <text x="20" y="42" fontFamily="sans-serif" fontSize="2" fontWeight="bold" fill="#C59B4B" opacity="0.4" textAnchor="middle">HUNUCMÁ</text>

                 {/* Kanasín: Data X=70, Y=45. SVG Y = 100-45 = 55. */}
                <text x="72" y="58" fontFamily="sans-serif" fontSize="2" fontWeight="bold" fill="#D9C6A3" opacity="0.5" textAnchor="middle">KANASÍN</text>

                 {/* Umán: Data X=35, Y=25. SVG Y = 100-25 = 75. */}
                <text x="38" y="78" fontFamily="sans-serif" fontSize="2" fontWeight="bold" fill="#5D4037" opacity="0.4" textAnchor="middle">UMÁN</text>

                 {/* Conkal/Motul: Data X=65, Y=65. SVG Y = 35 */}
                 <text x="68" y="35" fontFamily="sans-serif" fontSize="1.5" fontWeight="bold" fill="#8A1B33" opacity="0.2" textAnchor="middle">CONKAL</text>

                {/* Roads / Connectors (Stylized) */}
                <path d="M 50 15 L 50 50" stroke="#aaa" strokeWidth="0.2" strokeDasharray="1 1" /> {/* Mérida-Progreso */}
                <path d="M 20 40 L 50 50" stroke="#aaa" strokeWidth="0.2" strokeDasharray="1 1" /> {/* Mérida-Hunucmá */}
                <path d="M 38 75 L 50 50" stroke="#aaa" strokeWidth="0.2" strokeDasharray="1 1" /> {/* Mérida-Umán */}

             </svg>
           </div>

           {/* Pan Indicator */}
           <div className="absolute top-4 left-4 z-10 pointer-events-none opacity-0 group-hover:opacity-50 transition-opacity bg-white/80 p-1 rounded">
              <Move size={20} className="text-gray-600"/>
           </div>
           
           {/* Legend / Reference */}
           <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur p-4 rounded-sm shadow-lg border-l-4 border-yucatan-primary z-10 text-xs max-w-[200px] pointer-events-none">
             <span className="font-bold text-yucatan-primary block mb-2 tracking-widest border-b border-gray-200 pb-1">ZONAS ACTIVAS</span>
             <div className="space-y-2">
               <div className="flex items-center justify-between">
                 <span className="text-gray-600">Mérida</span>
                 <div className="w-3 h-3 bg-[#8A1B33] rounded-sm"></div>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-gray-600">Hunucmá</span>
                 <div className="w-3 h-3 bg-[#C59B4B] rounded-sm"></div>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-gray-600">Kanasín</span>
                 <div className="w-3 h-3 bg-[#D9C6A3] rounded-sm"></div>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-gray-600">Progreso</span>
                 <div className="w-3 h-3 bg-[#78909C] rounded-sm"></div>
               </div>
             </div>
             <div className="mt-3 pt-2 border-t border-gray-200 text-[10px] text-gray-400 leading-tight">
               * La altura del indicador representa el volumen de inversión ($).
             </div>
           </div>
           
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
              <XAxis type="number" dataKey="x" hide domain={xDomain} allowDataOverflow />
              {/* IMPORTANT: reversed={false} ensures correct Map Orientation (North Up) */}
              <YAxis type="number" dataKey="y" hide domain={yDomain} reversed={false} allowDataOverflow />
              <ZAxis type="number" dataKey="z" range={[50, 1000]} /> 
              
              <Tooltip 
                cursor={{ stroke: '#C59B4B', strokeWidth: 1, strokeDasharray: '5 5' }}
                wrapperStyle={{ outline: 'none' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length && !isDragging) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-0 rounded-sm shadow-2xl text-sm z-50 font-sans min-w-[220px] border border-gray-200 overflow-hidden animate-fade-in-up">
                        <div className="bg-gray-900 p-3">
                          <p className="font-bold text-yucatan-secondary uppercase tracking-widest text-[10px] mb-0.5">{data.municipality}</p>
                          <p className="text-white font-serif text-lg">{data.zone}</p>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-xs text-gray-500 font-bold uppercase">Monto Inversión</span>
                            <span className="text-xl font-bold text-yucatan-primary">{data.formattedAmount}</span>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full mb-3">
                             <div className="h-1.5 rounded-full bg-gradient-to-r from-yucatan-primary to-yucatan-secondary" style={{ width: `${Math.min(100, (data.z / 20000000) * 100)}%` }}></div>
                          </div>
                          <p className="text-gray-500 text-xs bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            {data.type}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-2 text-right">ID: {data.id}</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              <Scatter 
                data={scatterData} 
                shape={(props: any) => <CustomPillar {...props} is3D={viewMode === '3D'} />}
                style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
              >
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.municipality, entry.z)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribution Chart */}
        <div className="bg-white p-6 rounded-sm shadow-md border-t-4 border-yucatan-primary">
          <h3 className="text-lg font-serif font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-yucatan-primary"></div>
            Transacciones por Municipio
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeByMunicipality} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                <XAxis type="number" stroke="#999" fontSize={10} />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11, fill: '#555', fontWeight: 600}} stroke="none" />
                <Tooltip 
                  contentStyle={{ borderRadius: '0px', border: '1px solid #eee', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontFamily: 'serif' }}
                  cursor={{fill: '#FDFBF7'}}
                />
                <Bar dataKey="transacciones" fill="#8A1B33" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="bg-white p-6 rounded-sm shadow-md border-t-4 border-yucatan-secondary">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-serif font-bold text-gray-800 flex items-center gap-2">
                <div className="w-1 h-6 bg-yucatan-secondary"></div>
                Tendencia de Inversión
             </h3>
             <div className="flex border border-gray-200 rounded-sm overflow-hidden text-xs">
                <button 
                  onClick={() => setGranularity('day')}
                  className={`px-3 py-1.5 transition-colors ${granularity === 'day' ? 'bg-yucatan-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  Diario
                </button>
                <div className="w-px bg-gray-200"></div>
                <button 
                  onClick={() => setGranularity('month')}
                  className={`px-3 py-1.5 transition-colors ${granularity === 'month' ? 'bg-yucatan-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  Mensual
                </button>
             </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{fontSize: 10, fill: '#666'}} stroke="#ddd" />
                <YAxis tickFormatter={(value) => `$${value / 1000000}M`} width={60} tick={{fontSize: 10, fill: '#666'}} stroke="#ddd" />
                <Tooltip 
                   formatter={(value: number) => [`$${value.toLocaleString()}`, 'Monto']}
                   contentStyle={{ borderRadius: '0px', border: '1px solid #C59B4B', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                   labelStyle={{ color: '#8A1B33', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="monto" stroke="#C59B4B" strokeWidth={3} dot={{ r: 3, fill: '#8A1B33', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#8A1B33' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};