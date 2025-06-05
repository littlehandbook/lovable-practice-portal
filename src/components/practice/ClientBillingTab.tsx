
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { CreditCard, DollarSign, FileText, Plus, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EnhancedClientService } from '@/services/EnhancedClientService';
import { useAuth } from '@/contexts/AuthContext';

interface ClientBillingTabProps {
  clientId: string;
  tenantId: string;
}

export const ClientBillingTab: React.FC<ClientBillingTabProps> = ({ 
  clientId, 
  tenantId 
}) => {
  const [showSuperbillDialog, setShowSuperbillDialog] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [services, setServices] = useState('');
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Mock invoice data - in real implementation, this would come from a service
  const invoices = [
    {
      id: '1',
      invoice_number: 'INV-2024-001',
      amount: 150.00,
      status: 'paid',
      issue_date: '2024-01-15',
      due_date: '2024-02-15',
      description: 'Therapy Session - Individual'
    },
    {
      id: '2',
      invoice_number: 'INV-2024-002',
      amount: 200.00,
      status: 'pending',
      issue_date: '2024-01-30',
      due_date: '2024-03-01',
      description: 'Therapy Session - Couples'
    },
    {
      id: '3',
      invoice_number: 'INV-2024-003',
      amount: 150.00,
      status: 'overdue',
      issue_date: '2024-02-15',
      due_date: '2024-03-15',
      description: 'Therapy Session - Individual'
    }
  ];

  const handleGenerateSuperbill = async () => {
    if (!user || !amount || !description) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setGenerating(true);
    try {
      const service = new EnhancedClientService();
      const parsedServices = services ? JSON.parse(services) : {};
      
      const invoiceId = await service.generateSuperbill(
        clientId,
        tenantId,
        parsedServices,
        parseFloat(amount),
        description,
        user.id
      );

      toast({
        title: 'Success',
        description: `Superbill generated successfully. Invoice ID: ${invoiceId}`
      });
      
      setShowSuperbillDialog(false);
      setAmount('');
      setDescription('');
      setServices('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate superbill',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidAmount = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingAmount = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const overdueAmount = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="space-y-6">
      {/* Billing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Billed</p>
                <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(overdueAmount)}</p>
              </div>
              <FileText className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Invoices & Payment Status
            </CardTitle>
            <Dialog open={showSuperbillDialog} onOpenChange={setShowSuperbillDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Generate Superbill/Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Generate Superbill/Invoice</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="150.00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Therapy Session - Individual"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="services">Services (JSON format)</Label>
                    <Textarea
                      id="services"
                      value={services}
                      onChange={(e) => setServices(e.target.value)}
                      placeholder='{"cpt_code": "90834", "duration": "45 minutes"}'
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleGenerateSuperbill} disabled={generating} className="flex-1">
                      {generating ? 'Generating...' : 'Generate Superbill'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSuperbillDialog(false)}
                      disabled={generating}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{invoice.invoice_number}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{invoice.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Amount: {formatCurrency(invoice.amount)}</span>
                        <span>Issued: {formatDate(invoice.issue_date)}</span>
                        <span>Due: {formatDate(invoice.due_date)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No invoices generated yet</p>
              <p className="text-sm text-gray-400 mt-1">Generate superbills and invoices to track billing</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
