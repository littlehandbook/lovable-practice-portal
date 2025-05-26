
export interface ClientResource {
  id: string;
  client_id: string;
  tenant_id: string;
  resource_type: 'url' | 'document';
  title: string;
  description?: string;
  url?: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface CreateResourceInput {
  client_id: string;
  resource_type: 'url' | 'document';
  title: string;
  description?: string;
  url?: string;
  file?: File;
}
