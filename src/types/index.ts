export interface User {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'operator';
  name: string;
  created_at: string;
}

export interface ProductionParameter {
  id: number;
  name: string;
  value: number;
  unit: string;
  category: string;
  updated_by: number;
  updated_at: string;
}

export interface ProductionData {
  id: number;
  raw_material_available: number;
  standard_process_time: number;
  projected_demand: number;
  actual_production: number;
  efficiency_rate: number;
  date: string;
  created_by: number;
  created_at: string;
}

export interface Prediction {
  id: number;
  production_data_id: number;
  predicted_production_time: number;
  confidence_level: number;
  model_used: string;
  recommendations: string;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}