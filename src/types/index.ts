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
  raw_material_available: number;
  standard_process_time: number;
  projected_demand: number;
  predicted_production: number;
  confidence_level: number;
  prediction_date: string;
  created_by: number;
  created_at: string;
}

// Nuevos tipos para sistema de pedidos
export interface ProductType {
  id: number;
  name: string;
  description: string;
  base_production_time: number;
  complexity_factor: number;
  material_type: string;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  product_type_id: number;
  customer_name: string;
  quantity: number;
  width?: number;
  height?: number;
  depth?: number;
  dimension_unit: string;
  estimated_production_time: number;
  estimated_delivery_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delivered';
  priority: number;
  order_date: string;
  start_production_date?: string;
  completion_date?: string;
  delivery_date?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface ProductionQueue {
  id: number;
  order_id: number;
  position: number;
  estimated_start: string;
  estimated_end: string;
  actual_start?: string;
  actual_end?: string;
  status: 'queued' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ProductionCapacity {
  id: number;
  date: string;
  total_hours_available: number;
  hours_used: number;
  hours_remaining: number;
  shift_count: number;
  workers_available: number;
  created_at: string;
  updated_at: string;
}

export interface DeliveryEstimate {
  estimated_hours: number;
  estimated_delivery_date: string;
  queue_position: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}