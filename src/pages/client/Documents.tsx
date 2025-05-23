
import React, { useState } from 'react';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Download, X, Check } from 'lucide-react';

const ClientDocumentsPage = () => {
  const [activeTab, setActiveTab] = useState('notes');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Mock data
  const sessionNotes = [
    { id: 1, title: 'Session Notes - May 18, 2023', date: 'May 18, 2023', status: 'Shared' },
    { id: 2, title: 'Session Notes - May 11, 2023', date: 'May 11, 2023', status: 'Shared' },
    { id: 3, title: 'Treatment Plan Updates', date: 'May 4, 2023', status: 'Shared' }
  ];
  
  const myDocuments = [
    { id: 1, name: 'Insurance Card.jpg', uploadedDate: 'May 10, 2023', size: '1.2 MB', status: 'Uploaded' },
    { id: 2, title: 'Intake Form.pdf', uploadedDate: 'May 10, 2023', size: '245 KB', status: 'Uploaded' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateUpload(e.target.files[0].name);
    }
  };

  const simulateUpload = (fileName: string) => {
    setUploading(true);
    setUploadProgress(0);
    
    // Simulate an upload with progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploading(false);
            // In a real app, we'd update the documents list here
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Documents & Notes</h1>
          <label htmlFor="file-upload">
            <Button className="bg-purple-600 hover:bg-purple-700" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </span>
            </Button>
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>
        
        {uploading && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Uploading document...</p>
                  <button className="text-gray-500 hover:text-gray-700">
                    <X className="h-4 w-4" />
                  </button>
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
                                <p className="font-medium">{note.title}</p>
                              </div>
                              <p className="text-sm text-gray-500">Shared on {note.date}</p>
                            </div>
                            <div className="flex items-center">
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center mr-2">
                                <Check className="h-3 w-3 mr-1" />
                                {note.status}
                              </span>
                              <Button variant="outline" size="sm">
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
                {myDocuments.length > 0 || uploading ? (
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
                        {myDocuments.map((doc) => (
                          <tr key={doc.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {doc.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {doc.uploadedDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {doc.size}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Button variant="outline" size="sm">
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
                      Maximum file size: 10MB. Supported formats: PDF, JPG, PNG
                    </p>
                    <input 
                      id="drag-drop-upload" 
                      type="file" 
                      className="hidden"
                      onChange={handleFileChange} 
                      multiple
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
