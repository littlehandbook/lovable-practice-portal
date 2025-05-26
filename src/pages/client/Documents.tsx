
import React, { useState, useEffect } from 'react';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentService } from '@/services/DocumentService';
import { ClientResourceService } from '@/services/ClientResourceService';
import { ClientJournalService, ClientJournalEntry } from '@/services/ClientJournalService';
import { DocumentRecord, ClientResource } from '@/models';
import { useToast } from '@/hooks/use-toast';
import { UploadSection } from '@/components/client/UploadSection';
import { UploadProgress } from '@/components/client/UploadProgress';
import { DocumentsTab } from '@/components/client/DocumentsTab';
import { ResourcesTab } from '@/components/client/ResourcesTab';
import { JournalTab } from '@/components/client/JournalTab';

const ClientDocumentsPage = () => {
  const [activeTab, setActiveTab] = useState('journal');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [resources, setResources] = useState<ClientResource[]>([]);
  const [journalEntries, setJournalEntries] = useState<ClientJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadDocuments(),
        loadResources(),
        loadJournalEntries()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const { data, error } = await DocumentService.getClientDocuments();
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive"
        });
      } else {
        const clientDocs = data.filter(doc => doc.document_type === 'client_upload');
        setDocuments(clientDocs);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    }
  };

  const loadResources = async () => {
    try {
      const mockClientId = 'client-123';
      const { data, error } = await ClientResourceService.getClientResources(mockClientId);
      if (error) {
        console.error('Failed to load resources:', error);
      } else {
        setResources(data);
      }
    } catch (error: any) {
      console.error('Error loading resources:', error);
    }
  };

  const loadJournalEntries = async () => {
    try {
      const { data, error } = await ClientJournalService.getClientJournalEntries();
      if (error) {
        console.error('Failed to load journal entries:', error);
      } else {
        setJournalEntries(data);
      }
    } catch (error: any) {
      console.error('Error loading journal entries:', error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive"
        });
        return;
      }

      await uploadDocument(file);
      // Reset the file input
      e.target.value = '';
    }
  };

  const uploadDocument = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload document without client_id so it appears on practitioner portal
      const { data, error } = await DocumentService.uploadDocument(file, undefined, 'client_upload');
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (error) {
        toast({
          title: "Upload failed",
          description: error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Upload successful",
          description: `${file.name} has been uploaded successfully`,
        });
        await loadDocuments();
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleDownload = async (document: DocumentRecord) => {
    try {
      const { data, error } = await DocumentService.downloadDocument(document.file_path);
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
        const anchor = globalThis.document.createElement('a');
        anchor.href = url;
        anchor.download = document.name;
        globalThis.document.body.appendChild(anchor);
        anchor.click();
        globalThis.document.body.removeChild(anchor);
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

  const handleResourceDownload = async (resource: ClientResource) => {
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

  const handleCreateJournalEntry = async (data: { title: string; content: string; session_date?: string; is_shared_with_practitioner?: boolean }) => {
    const { error } = await ClientJournalService.createJournalEntry(data);
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Journal entry created successfully"
      });
      await loadJournalEntries();
    }
  };

  const handleUpdateJournalEntry = async (data: { id: string; title?: string; content?: string; session_date?: string; is_shared_with_practitioner?: boolean }) => {
    const { error } = await ClientJournalService.updateJournalEntry(data);
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Journal entry updated successfully"
      });
      await loadJournalEntries();
    }
  };

  const handleDeleteJournalEntry = async (entryId: string) => {
    const { error } = await ClientJournalService.deleteJournalEntry(entryId);
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Journal entry deleted successfully"
      });
      await loadJournalEntries();
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="space-y-6">
        <UploadSection uploading={uploading} onFileChange={handleFileChange} />
        
        <UploadProgress uploading={uploading} uploadProgress={uploadProgress} />
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="journal">Journal</TabsTrigger>
            <TabsTrigger value="documents">My Documents</TabsTrigger>
            <TabsTrigger value="resources">Learning Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="journal">
            <JournalTab
              journalEntries={journalEntries}
              onCreateEntry={handleCreateJournalEntry}
              onUpdateEntry={handleUpdateJournalEntry}
              onDeleteEntry={handleDeleteJournalEntry}
              loading={loading}
            />
          </TabsContent>
          
          <TabsContent value="documents">
            <DocumentsTab 
              documents={documents} 
              formatFileSize={formatFileSize} 
              onDownload={handleDownload} 
              onFileChange={handleFileChange} 
            />
          </TabsContent>
          
          <TabsContent value="resources">
            <ResourcesTab 
              resources={resources} 
              onDownload={handleResourceDownload} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </ClientLayout>
  );
};

export default ClientDocumentsPage;
