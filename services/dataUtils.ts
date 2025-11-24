import { Transaction, ValidationResult } from '../types';

// Helper to assign mock coordinates if missing, based on municipality logic
const getCoordinatesForMunicipality = (municipality: string) => {
  const base = municipality.toLowerCase();
  // Random jitter to prevent exact overlap
  const jitter = () => Math.random() * 10 - 5; 

  if (base.includes('mérida') || base.includes('merida')) return { x: 50 + jitter(), y: 70 + jitter() };
  if (base.includes('kanasín') || base.includes('kanasin')) return { x: 65 + jitter(), y: 45 + jitter() };
  if (base.includes('hunucmá') || base.includes('hunucma')) return { x: 15 + jitter(), y: 55 + jitter() };
  if (base.includes('umán') || base.includes('uman')) return { x: 35 + jitter(), y: 25 + jitter() };
  if (base.includes('progreso')) return { x: 50 + jitter(), y: 90 + jitter() };
  if (base.includes('motul')) return { x: 75 + jitter(), y: 65 + jitter() };
  
  // Default center
  return { x: 50 + jitter(), y: 50 + jitter() };
};

// Simple normalization for visualization (Mapping real Lat/Lon to 0-100 grid)
// Yucatan approx bounds: Lat 20.0 - 21.5, Lon -90.5 - -87.5
const normalizeCoordinates = (lat: number, lon: number) => {
  const minLat = 20.5;
  const maxLat = 21.5; // Range 1.0
  const minLon = -90.2;
  const maxLon = -89.0; // Range 1.2

  let y = ((lat - minLat) / (maxLat - minLat)) * 100;
  let x = ((lon - minLon) / (maxLon - minLon)) * 100;

  // Clamp to 0-100
  y = Math.max(5, Math.min(95, y));
  x = Math.max(5, Math.min(95, x));

  return { x, y };
};

export const parseCSV = (text: string): ValidationResult => {
  try {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length < 2) return { isValid: false, error: "El archivo CSV está vacío o solo contiene cabeceras." };

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    // Updated logic to handle the specific provided dataset headers
    // Headers: id_transaccion, fecha_registro, municipio, zona_colonia, tipo_propiedad, monto_mxn, latitud, longitud, uso_suelo_sugerido
    
    const requiredFields = ['monto', 'municipio']; // Relaxed check to allow 'monto_mxn' match 'monto'
    
    // Identify column indices
    const idxId = headers.findIndex(h => h.includes('id'));
    const idxDate = headers.findIndex(h => h.includes('fecha'));
    const idxMuni = headers.findIndex(h => h.includes('municipio'));
    const idxZone = headers.findIndex(h => h.includes('zona') || h.includes('colonia'));
    const idxType = headers.findIndex(h => h.includes('tipo'));
    const idxAmount = headers.findIndex(h => h.includes('monto'));
    const idxLat = headers.findIndex(h => h.includes('latitud'));
    const idxLon = headers.findIndex(h => h.includes('longitud'));

    if (idxAmount === -1 || idxMuni === -1) {
      return { isValid: false, error: "Faltan columnas requeridas: municipio, monto." };
    }

    const transactions: Transaction[] = lines.slice(1).map((line, index) => {
      const cols = line.split(',').map(c => c.trim());
      
      const date = idxDate > -1 ? cols[idxDate] : new Date().toISOString().split('T')[0];
      const municipality = cols[idxMuni] || 'Desconocido';
      const zone = idxZone > -1 ? cols[idxZone] : 'General';
      const amount = parseFloat(cols[idxAmount]) || 0;
      const type = idxType > -1 ? cols[idxType] : 'Desconocido';
      const id = idxId > -1 ? cols[idxId] : `csv-${index}`;

      let coordinates;
      // If we have lat/lon in the CSV, use them (normalized)
      if (idxLat > -1 && idxLon > -1) {
        const lat = parseFloat(cols[idxLat]);
        const lon = parseFloat(cols[idxLon]);
        if (!isNaN(lat) && !isNaN(lon)) {
          coordinates = normalizeCoordinates(lat, lon);
        } else {
          coordinates = getCoordinatesForMunicipality(municipality);
        }
      } else {
        coordinates = getCoordinatesForMunicipality(municipality);
      }

      return {
        id,
        date,
        municipality,
        zone,
        amount,
        type,
        coordinates
      };
    });

    return { isValid: true, data: transactions };
  } catch (e) {
    return { isValid: false, error: "Error al procesar el formato CSV." };
  }
};

export const parseJSON = (text: string): ValidationResult => {
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) return { isValid: false, error: "El JSON debe ser un array de objetos." };
    
    // Enrich with coordinates if missing
    const transactions: Transaction[] = data.map((item: any, index: number) => ({
      ...item,
      id: item.id || item.id_transaccion || `json-${index}`,
      date: item.date || item.fecha_registro || new Date().toISOString().split('T')[0],
      municipality: item.municipality || item.municipio,
      zone: item.zone || item.zona_colonia,
      amount: item.amount || item.monto_mxn,
      type: item.type || item.tipo_propiedad,
      coordinates: item.coordinates || getCoordinatesForMunicipality(item.municipality || item.Municipio || '')
    }));

    return { isValid: true, data: transactions };
  } catch (e) {
    return { isValid: false, error: "Error de sintaxis JSON." };
  }
};

export const downloadData = (data: Transaction[], format: 'json' | 'csv') => {
  let content = '';
  let type = '';
  const filename = `rpee-reporte-${new Date().toISOString().split('T')[0]}.${format}`;

  if (format === 'json') {
    content = JSON.stringify(data, null, 2);
    type = 'application/json';
  } else {
    const headers = ['ID', 'Fecha', 'Municipio', 'Zona', 'Monto', 'Tipo', 'Lat(Rel)', 'Lng(Rel)'];
    const rows = data.map(t => 
      `${t.id},${t.date},${t.municipality},${t.zone},${t.amount},${t.type},${t.coordinates.y},${t.coordinates.x}`
    );
    content = [headers.join(','), ...rows].join('\n');
    type = 'text/csv';
  }

  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};