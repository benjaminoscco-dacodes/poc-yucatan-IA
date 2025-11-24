export interface Transaction {
  id: string;
  municipality: string;
  zone: string; // e.g., "Centro", "Norte", "Industrial"
  amount: number;
  date: string; // YYYY-MM-DD
  type: string;
  coordinates: {
    x: number; // Relative Longitude for visualization (0-100)
    y: number; // Relative Latitude for visualization (0-100)
  };
}

export interface DashboardMetrics {
  totalVolume: number;
  transactionCount: number;
  topZone: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  data?: Transaction[];
}
