import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';
import { parseCSV, parseJSON } from '../services/dataUtils';
import { Transaction } from '../types';

interface FileUploaderProps {
  onDataLoaded: (data: Transaction[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    setError(null);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      let result;
      
      if (file.name.endsWith('.csv')) {
        result = parseCSV(text);
      } else if (file.name.endsWith('.json')) {
        result = parseJSON(text);
      } else {
        setError("Formato no soportado. Use CSV o JSON.");
        return;
      }

      if (result.isValid && result.data) {
        onDataLoaded(result.data);
      } else {
        setError(result.error || "Error desconocido al procesar archivo.");
      }
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
        isDragging ? 'border-yucatan-primary bg-red-50' : 'border-gray-300 hover:border-yucatan-secondary'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".csv,.json"
        onChange={(e) => e.target.files && processFile(e.target.files[0])}
      />
      
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yucatan-primary">
        <UploadCloud size={32} />
      </div>
      
      <h3 className="text-lg font-bold text-gray-700">Cargar Dataset (CSV / JSON)</h3>
      <p className="text-sm text-gray-500 mt-2 mb-4">
        Arrastra tu archivo aquí o haz clic para explorar.
        <br/>
        <span className="text-xs opacity-75">Formato requerido: Fecha, Municipio, Monto</span>
      </p>

      {error && (
        <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 p-2 rounded text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
