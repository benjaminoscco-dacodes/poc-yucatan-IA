import React from 'react';
import { Activity, TrendingUp, MapPin, DollarSign } from 'lucide-react';
import { DashboardMetrics } from '../types';

interface StatsCardsProps {
  metrics: DashboardMetrics;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Card 1 */}
      <div className="bg-white p-6 rounded-sm shadow-md border-t-4 border-yucatan-primary relative overflow-hidden group hover:shadow-lg transition-all">
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity size={64} className="text-yucatan-primary" />
        </div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Transacciones</p>
            <h3 className="text-3xl font-serif font-bold text-yucatan-primary mt-2">{metrics.transactionCount}</h3>
          </div>
          <div className="p-2 bg-yucatan-primary/10 rounded text-yucatan-primary">
            <Activity size={20} />
          </div>
        </div>
      </div>

      {/* Card 2 */}
      <div className="bg-white p-6 rounded-sm shadow-md border-t-4 border-yucatan-secondary relative overflow-hidden group hover:shadow-lg transition-all">
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign size={64} className="text-yucatan-secondary" />
        </div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Volumen Total</p>
            <h3 className="text-3xl font-serif font-bold text-gray-800 mt-2">
              ${(metrics.totalVolume / 1000000).toFixed(1)}M
            </h3>
          </div>
          <div className="p-2 bg-yucatan-secondary/10 rounded text-yucatan-secondary">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Card 3 */}
      <div className="bg-white p-6 rounded-sm shadow-md border-t-4 border-gray-600 relative overflow-hidden group hover:shadow-lg transition-all">
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={64} className="text-gray-600" />
        </div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Zona Activa</p>
            <h3 className="text-lg font-serif font-bold text-gray-800 mt-3 truncate max-w-[150px]" title={metrics.topZone}>
              {metrics.topZone}
            </h3>
          </div>
          <div className="p-2 bg-gray-100 rounded text-gray-600">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>
      
      {/* Card 4 */}
       <div className="bg-white p-6 rounded-sm shadow-md border-t-4 border-yucatan-accent relative overflow-hidden group hover:shadow-lg transition-all">
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <MapPin size={64} className="text-yucatan-accent" />
        </div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fuente Datos</p>
            <h3 className="text-lg font-serif font-bold text-gray-800 mt-3">
              Sintético
            </h3>
          </div>
          <div className="p-2 bg-yucatan-accent/20 rounded text-yucatan-primary">
            <MapPin size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};