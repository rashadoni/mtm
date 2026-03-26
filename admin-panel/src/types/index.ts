// User type
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'agent';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  companyId: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt?: Date;
  updatedAt?: Date;
}

// Company type
export interface Company {
  id: string;
  name: string;
  logo?: string;
  settings?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Customer type
export interface LocationCoords {
  lat: number;
  lng: number;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  address: string;
  location: LocationCoords;
  group?: string;
  contactPerson?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Route related types
export interface RoutePoint {
  customerId: string;
  order: number;
  tasks: string[];
  estimatedTime: number; // in minutes
}

export interface Route {
  id: string;
  agentId: string;
  date: Date;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  points: RoutePoint[];
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Visit type
export type VisitStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface LocationSnapshot {
  lat: number;
  lng: number;
}

export interface Visit {
  id: string;
  agentId: string;
  customerId: string;
  routeId: string;
  checkInTime: Date;
  checkOutTime?: Date;
  checkInLocation: LocationSnapshot;
  checkOutLocation?: LocationSnapshot;
  duration?: number; // in minutes
  status: VisitStatus;
  photos?: string[]; // photo IDs
  tasks: string[]; // task descriptions or IDs
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Task type
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  name: string;
  description?: string;
  assignedTo: string; // user ID
  customerId?: string;
  status: TaskStatus;
  createdBy: string;
  dueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Photo type
export type PhotoLikeStatus = 'liked' | 'disliked' | 'neutral';

export interface WatermarkData {
  agentName?: string;
  timestamp?: Date;
  location?: LocationCoords;
  customerId?: string;
  visitId?: string;
}

export interface Photo {
  id: string;
  visitId: string;
  agentId: string;
  customerId: string;
  url: string;
  thumbnailUrl?: string;
  location?: LocationCoords;
  timestamp: Date;
  watermarkData?: WatermarkData;
  likeStatus: PhotoLikeStatus;
  review?: string;
  reviewedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Location tracking type
export interface LocationPoint {
  agentId: string;
  lat: number;
  lng: number;
  timestamp: Date;
  accuracy?: number;
  speed?: number;
  battery?: number;
}

// Alert type
export type AlertType = 'off_route' | 'delay' | 'task_overdue' | 'low_battery' | 'system';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
  id: string;
  type: AlertType;
  agentId: string;
  message: string;
  severity: AlertSeverity;
  createdAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

// Dashboard Statistics type
export interface DashboardStats {
  routePlanned: number;
  routeCompleted: number;
  offRoute: number;
  pendingTasks: number;
  totalRouteTime: number; // in minutes
  avgRouteTime: number; // in minutes
  totalCustomerTime: number; // in minutes
  avgCustomerTime: number; // in minutes
  totalPhotos: number;
  likedPhotos: number;
  dislikedPhotos: number;
  pendingReviewPhotos: number;
}
