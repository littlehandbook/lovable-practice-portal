
import React, { useState, useEffect } from 'react';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Download, X, Check, AlertCircle } from 'lucide-react';
import { DocumentService } from '@/services/DocumentService';
import { DocumentRecord } from '@/models';
import { useToast } from '@/hooks/use-toast';

const ClientDocumentsPage = () => {
  const [activeTab, setActiveTab] = useState('notes');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [sessionNotes, setSessionNotes] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await DocumentService.getClientDocuments();
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive"
        });
      } else {
        // Separate client uploads from session notes
        const clientDocs = data.filter(doc => doc.document_type === 'client_upload');
        const notes = data.filter(doc => doc.document_type === 'session_notes' && doc.is_shared_with_client);
        setDocuments(clientDocs);
        setSessionNotes(notes);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

      const { data, error } = await DocumentService.uploadDocument(file);
      
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
        // Refresh documents list
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Documents & Notes</h1>
          <label htmlFor="file-upload">
            <Button className="bg-purple-600 hover:bg-purple-700" asChild disabled={uploading}>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Document'}
              </span>
            </Button>
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              onChange={handleFileChange}
              disabled={uploading}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </label>
        </div>
        
        {uploading && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Uploading document...</p>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-purple-600 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }} 
                  />
                </div>
                <p className="text-xs text-gray-500">{uploadProgress}% complete</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="notes">Session Notes</TabsTrigger>
            <TabsTrigger value="documents">My Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Shared Session Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {sessionNotes.length > 0 ? (
                  <div className="space-y-4">
                    {sessionNotes.map((note) => (
                      <Card key={note.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-purple-600 mr-2" />
                                <p className="font-medium">{note.name}</p>
                              </div>
                              <p className="text-sm text-gray-500">
                                Shared on {new Date(note.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center mr-2">
                                <Check className="h-3 w-3 mr-1" />
                                Shared
                              </span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownload(note)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No session notes have been shared with you yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>My Uploaded Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Uploaded
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {documents.map((doc) => (
                          <tr key={doc.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {doc.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(doc.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatFileSize(doc.file_size)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownload(doc)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-4">You haven't uploaded any documents yet</p>
                    <label htmlFor="file-upload-empty">
                      <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                        <span>Upload Document</span>
                      </Button>
                      <input 
                        id="file-upload-empty" 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Drag & Drop Upload</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('drag-drop-upload')?.click()}
                  >
                    <Upload className="h-10 w-10 mx-auto text-gray-400 mb-4" />
                    <p className="font-medium text-gray-700 mb-1">Drag and drop files here</p>
                    <p className="text-sm text-gray-500 mb-4">or click to select files</p>
                    <p className="text-xs text-gray-500">
                      Maximum file size: 10MB. Supported formats: PDF, JPG, PNG, DOC, DOCX
                    </p>
                    <input 
                      id="drag-drop-upload" 
                      type="file" 
                      className="hidden"
                      onChange={handleFileChange} 
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ClientLayout>
  );
};

export default ClientDocumentsPage;
