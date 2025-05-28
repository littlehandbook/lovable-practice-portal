
export interface User {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserRole {
  id: string;
  role_name: string;
  role_description?: string;
  tenant_id: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PagePermission {
  id: string;
  page_path: string;
  page_name: string;
  component_name?: string;
  roles: string[];
  tenant_id: string;
  created_at?: string;
  updated_at?: string;
}
