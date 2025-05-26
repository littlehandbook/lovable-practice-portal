
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, BookOpen } from 'lucide-react';
import { ClientResource } from '@/models/ClientResource';

interface ResourcesTabProps {
  resources: ClientResource[];
  onDownload: (resource: ClientResource) => void;
}

export const ResourcesTab: React.FC<ResourcesTabProps> = ({ resources, onDownload }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          Learning Resources
        </CardTitle>
      </CardHeader>
      <CardContent>
        {resources.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p>No learning resources available yet.</p>
            <p className="text-sm mt-1">Your practitioner will share helpful resources here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map((resource) => (
              <div key={resource.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{resource.title}</h3>
                    {resource.description && (
                      <p className="text-gray-600 mt-1">{resource.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        resource.resource_type === 'url' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {resource.resource_type === 'url' ? 'Web Link' : 'Document'}
                      </span>
                      <span>Shared {formatDate(resource.created_at)}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {resource.resource_type === 'url' ? (
                      <Button
                        onClick={() => window.open(resource.url, '_blank', 'noopener,noreferrer')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Link
                      </Button>
                    ) : (
                      <Button
                        onClick={() => onDownload(resource)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
