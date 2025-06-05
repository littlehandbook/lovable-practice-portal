
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { FileText, Upload, Download, Eye, EyeOff, Plus } from 'lucide-react';
import { ClientDocument } from '@/repository/EnhancedClientRepository';
import { useToast } from '@/hooks/use-toast';

interface ClientDocumentsTabProps {
  clientId: string;
  tenantId: string;
  documents: ClientDocument[];
}

export const ClientDocumentsTab: React.FC<ClientDocumentsTabProps> = ({ 
  clientId, 
  tenantId, 
  documents 
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      // File upload logic would go here
      toast({
        title: 'Success',
        description: 'Document uploaded successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateReport = (reportType: string, category: string) => {
    toast({
      title: 'Report Generation',
      description: `Generating ${reportType} report...`,
    });
    // Report generation logic would go here
  };

  const toggleDocumentPrivacy = async (documentId: string, isPrivate: boolean) => {
    try {
      // Privacy toggle logic would go here
      toast({
        title: 'Success',
        description: `Document ${isPrivate ? 'made private' : 'shared with client'}`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update document privacy',
        variant: 'destructive'
      });
    }
  };

  const reportCategories = [
    {
      category: 'Legal / Forensic Reports',
      reports: [
        'Court-Ordered Evaluations',
        'Custody Evaluations (parental fitness, child preferences, family dynamics)',
        'Competency Evaluations (defendant\'s understanding of proceedings)',
        'Risk Assessments (danger to self/others: violence, sexual offending)',
        'Personal Injury (psychological damages from accidents/trauma)',
        'Guardianship/Conservatorship (decision-making capacity)',
        'Workers\' Compensation (link psychological symptoms to work injuries)'
      ]
    },
    {
      category: 'Insurance & Healthcare Documentation',
      reports: [
        'Treatment Authorization Requests (justify medical necessity, DSM-5/ICD codes)',
        'Progress Reports (track improvement for continued care approval)',
        'Discharge Summaries (outcomes and aftercare plans)'
      ]
    },
    {
      category: 'Educational / School-Based Reports',
      reports: [
        'Special Education Eligibility (emotional/behavioral barriers, IEP/504 plans)',
        'Behavioral Intervention Plans (BIP) (strategies for school staff)'
      ]
    },
    {
      category: 'Employment & Occupational Reports',
      reports: [
        'Fitness-for-Duty (readiness to return to work after mental health leave)',
        'Reasonable Accommodation Requests (support ADA accommodations, e.g., anxiety disorders)'
      ]
    },
    {
      category: 'Government & Disability Reports',
      reports: [
        'Social Security Disability (SSA) (functional limitations for disability claims)',
        'Veterans Affairs (VA) (assess service-connected mental health conditions)'
      ]
    },
    {
      category: 'Client-Requested Documentation',
      reports: [
        'Emotional Support Animal (ESA) Letters (certify disability-related need)',
        'Gender-Affirming Surgery Letters (support medical transition)',
        'Therapy Verification (attendance/diagnosis for housing, academic, travel)'
      ]
    },
    {
      category: 'Child Welfare & Protection',
      reports: [
        'Child Abuse/Neglect Assessments (report to CPS, mandated reporting)',
        'Foster/Adoption Home Studies (evaluate caregiver suitability)'
      ]
    },
    {
      category: 'Internal Clinical Documentation',
      reports: [
        'Intake Assessments (initial diagnostics and treatment goals)',
        'Progress Notes (session-by-session records: SOAP, DAP)',
        'Treatment Plans (interventions and measurable objectives)'
      ]
    },
    {
      category: 'Consultation Reports',
      reports: [
        'Referral Summaries (share relevant info with other providers, with consent)',
        'Peer Review (case consults for clinical guidance)'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Upload and Generate Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Documents
            </CardTitle>
            <div className="flex gap-2">
              <div>
                <Input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload New Document'}
                </Button>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Generate Report
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80">
                  <DropdownMenuLabel>Select Report Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {reportCategories.map((category) => (
                    <DropdownMenuSub key={category.category}>
                      <DropdownMenuSubTrigger>
                        {category.category}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-96">
                        {category.reports.map((report) => (
                          <DropdownMenuItem 
                            key={report}
                            onClick={() => handleGenerateReport(report, category.category)}
                            className="text-sm whitespace-normal"
                          >
                            {report}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {documents && documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.document_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{doc.name}</h4>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {doc.document_type}
                        </span>
                        {doc.report_category && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            {doc.report_category}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Uploaded: {formatDate(doc.created_at)}</span>
                        <span>Size: {formatFileSize(doc.file_size)}</span>
                        <span>By: {doc.uploaded_by_name}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`privacy-${doc.document_id}`} className="text-sm">
                          Shared with client
                        </Label>
                        <Switch
                          id={`privacy-${doc.document_id}`}
                          checked={doc.is_shared_with_client}
                          onCheckedChange={(checked) => 
                            toggleDocumentPrivacy(doc.document_id, !checked)
                          }
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          {doc.is_private ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No documents uploaded yet</p>
              <p className="text-sm text-gray-400 mt-1">Upload documents or generate reports to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
