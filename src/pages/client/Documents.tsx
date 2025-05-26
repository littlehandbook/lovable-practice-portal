
import React, { useState, useEffect } from 'react';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentsTab } from '@/components/client/DocumentsTab';
import { SessionNotesTab } from '@/components/client/SessionNotesTab';
import { HomeworkTab } from '@/components/client/HomeworkTab';
import { DocumentService } from '@/services/DocumentService';
import { DocumentRecord } from '@/models';
import { useToast } from '@/hooks/use-toast';

const ClientDocumentsPage = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [sessionNotes, setSessionNotes] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data, error } = await DocumentService.getClientDocuments();
        
        if (error) {
          console.error('Error fetching documents:', error);
          toast({
            title: 'Error',
            description: 'Failed to load documents',
            variant: 'destructive'
          });
          return;
        }

        // Filter documents by type
        const clientUploads = data.filter(doc => doc.document_type === 'client_upload');
        const sharedNotes = data.filter(doc => doc.document_type === 'session_notes' && doc.is_shared_with_client);
        
        setDocuments(clientUploads);
        setSessionNotes(sharedNotes);
      } catch (error) {
        console.error('Unexpected error fetching documents:', error);
        toast({
          title: 'Error',
          description: 'Failed to load documents',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [toast]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleUpload = async (files: FileList) => {
    try {
      const uploadPromises = Array.from(files).map(file => 
        DocumentService.uploadDocument(file)
      );
      
      const results = await Promise.all(uploadPromises);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        toast({
          title: 'Upload Error',
          description: `Failed to upload ${errors.length} file(s)`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Success',
          description: `Successfully uploaded ${files.length} file(s)`,
        });
        
        // Refresh documents list
        const { data } = await DocumentService.getClientDocuments();
        if (data) {
          const clientUploads = data.filter(doc => doc.document_type === 'client_upload');
          setDocuments(clientUploads);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload files',
        variant: 'destructive'
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files);
    }
  };

  const handleFileSelect = (file: File) => {
    const fileList = new DataTransfer();
    fileList.items.add(file);
    handleUpload(fileList.files);
  };

  const handleDownload = async (documentRecord: DocumentRecord) => {
    try {
      const { data, error } = await DocumentService.downloadDocument(documentRecord.file_path);
      
      if (error || !data) {
        toast({
          title: 'Error',
          description: 'Failed to download file',
          variant: 'destructive'
        });
        return;
      }

      // Create download link using global document object
      const url = window.URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = documentRecord.name;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive'
      });
    }
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents & Resources</h1>
          <p className="text-gray-500">Manage your documents, view session notes, and track homework assignments</p>
        </div>

        <Tabs defaultValue="documents" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documents">My Documents</TabsTrigger>
            <TabsTrigger value="notes">Session Notes</TabsTrigger>
            <TabsTrigger value="homework">Homework</TabsTrigger>
          </TabsList>

          <TabsContent value="documents">
            <DocumentsTab 
              documents={documents}
              formatFileSize={formatFileSize}
              onDownload={handleDownload}
              onFileChange={handleFileChange}
              onFileSelect={handleFileSelect}
              uploading={false}
            />
          </TabsContent>

          <TabsContent value="notes">
            <SessionNotesTab 
              sessionNotes={sessionNotes}
              onDownload={handleDownload}
            />
          </TabsContent>

          <TabsContent value="homework">
            <HomeworkTab loading={loading} />
          </TabsContent>
        </Tabs>
      </div>
    </ClientLayout>
  );
};

export default ClientDocumentsPage;
