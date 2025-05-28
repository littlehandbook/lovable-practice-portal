
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink, Download, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ClientResourceService } from '@/services/ClientResourceService';
import { ClientResource } from '@/models/ClientResource';
import { AddResourceDialog } from './AddResourceDialog';

interface ClientResourcesListProps {
  clientId: string;
}

export const ClientResourcesList = ({ clientId }: ClientResourcesListProps) => {
  const [resources, setResources] = useState<ClientResource[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await ClientResourceService.getClientResources(clientId);
      if (error) {
        // Only show error for actual failures, not empty data
        if (!error.includes('No resources') && !error.includes('empty')) {
          toast({
            title: "Error",
            description: error,
            variant: "destructive"
          });
        }
      } else {
        setResources(data);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      // Only show error for actual failures
      if (!errorMessage.includes('No resources') && !errorMessage.includes('empty')) {
        toast({
          title: "Error",
          description: "Failed to load resources",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [clientId]);

  const handleDelete = async (resourceId: string) => {
    try {
      const { error } = await ClientResourceService.deleteResource(resourceId);
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Resource deleted successfully"
        });
        loadResources();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDownload = async (resource: ClientResource) => {
    if (!resource.file_path) return;

    try {
      const { data, error } = await ClientResourceService.downloadResource(resource.file_path);
      if (error) {
        toast({
          title: "Download failed",
          description: error,
          variant: "destructive"
        });
        return;
      }

      if (data) {
        const url = URL.createObjectURL(data);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = resource.title;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      }
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Client Resources</CardTitle>
          <AddResourceDialog clientId={clientId} onResourceAdded={loadResources} />
        </div>
      </CardHeader>
      <CardContent>
        {resources.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No resources found</h3>
            <p className="text-gray-400 mb-4">
              Add resources to help educate your client and support their therapy journey.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map((resource) => (
              <div key={resource.id} className="flex justify-between items-start p-3 border rounded-md">
                <div className="flex-1">
                  <h4 className="font-medium">{resource.title}</h4>
                  {resource.description && (
                    <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100">
                      {resource.resource_type === 'url' ? 'URL' : 'Document'}
                    </span>
                    <span>Added {formatDate(resource.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {resource.resource_type === 'url' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(resource.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(resource)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(resource.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
