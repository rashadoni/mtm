/**
 * Role-Based Access Control (RBAC) System
 *
 * Roles hierarchy:
 *   super_admin > admin > manager > agent
 *
 * Each role inherits permissions of roles below it.
 */

import { UserRole } from '@/types';

export interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

type Resource =
  | 'dashboard'
  | 'map'
  | 'routes'
  | 'reports'
  | 'photos'
  | 'customers'
  | 'tasks'
  | 'alerts'
  | 'analytics'
  | 'activity'
  | 'users'
  | 'settings'
  | 'agents';

// Role hierarchy level (higher = more permissions)
const ROLE_LEVEL: Record<UserRole, number> = {
  super_admin: 4,
  admin: 3,
  manager: 2,
  agent: 1,
};

// Minimum role required for each resource action
const RESOURCE_PERMISSIONS: Record<Resource, Record<keyof Permission, UserRole>> = {
  dashboard:  { view: 'agent',       create: 'admin',       edit: 'admin',       delete: 'super_admin' },
  map:        { view: 'agent',       create: 'manager',     edit: 'manager',     delete: 'admin' },
  routes:     { view: 'agent',       create: 'manager',     edit: 'manager',     delete: 'admin' },
  reports:    { view: 'manager',     create: 'manager',     edit: 'admin',       delete: 'admin' },
  photos:     { view: 'agent',       create: 'agent',       edit: 'manager',     delete: 'admin' },
  customers:  { view: 'agent',       create: 'manager',     edit: 'manager',     delete: 'admin' },
  tasks:      { view: 'agent',       create: 'manager',     edit: 'manager',     delete: 'admin' },
  alerts:     { view: 'agent',       create: 'admin',       edit: 'admin',       delete: 'admin' },
  analytics:  { view: 'manager',     create: 'admin',       edit: 'admin',       delete: 'super_admin' },
  activity:   { view: 'manager',     create: 'admin',       edit: 'admin',       delete: 'super_admin' },
  users:      { view: 'admin',       create: 'admin',       edit: 'admin',       delete: 'super_admin' },
  settings:   { view: 'admin',       create: 'super_admin', edit: 'admin',       delete: 'super_admin' },
  agents:     { view: 'manager',     create: 'admin',       edit: 'admin',       delete: 'super_admin' },
};

/**
 * Check if a role has sufficient permission level
 */
export function hasPermission(userRole: UserRole, resource: Resource, action: keyof Permission): boolean {
  const requiredRole = RESOURCE_PERMISSIONS[resource]?.[action];
  if (!requiredRole) return false;
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[requiredRole];
}

/**
 * Get all permissions for a resource based on user role
 */
export function getPermissions(userRole: UserRole, resource: Resource): Permission {
  return {
    view: hasPermission(userRole, resource, 'view'),
    create: hasPermission(userRole, resource, 'create'),
    edit: hasPermission(userRole, resource, 'edit'),
    delete: hasPermission(userRole, resource, 'delete'),
  };
}

/**
 * Get sidebar items visible to this role
 */
export function getVisibleNavItems(userRole: UserRole): Resource[] {
  const allResources: Resource[] = [
    'dashboard', 'map', 'routes', 'reports', 'photos',
    'customers', 'tasks', 'alerts', 'analytics', 'activity',
    'users', 'settings',
  ];
  return allResources.filter((resource) => hasPermission(userRole, resource, 'view'));
}

/**
 * Role display labels (in Azerbaijani)
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Baş Admin',
  admin: 'Admin',
  manager: 'Menecer',
  agent: 'Sahə Agenti',
};

/**
 * Role badge colors
 */
export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: '#6C63FF',
  admin: '#3498DB',
  manager: '#00BFA6',
  agent: '#FFC107',
};
