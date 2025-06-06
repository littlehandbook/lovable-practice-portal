
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ClientService } from '@/services/ClientService';

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientAdded?: () => void;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  emergency_contact: string;
  ai_risk_rating: string;
  ai_risk_score: number;
  ai_risk_reasoning: string;
}

export function AddClientDialog({ open, onOpenChange, onClientAdded }: AddClientDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    emergency_contact: '',
    ai_risk_rating: '',
    ai_risk_score: 0,
    ai_risk_reasoning: ''
  });

  const handleInputChange = (field: keyof ClientFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name is required',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      const clientData = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        emergency_contact: formData.emergency_contact.trim() || undefined,
        ai_risk_rating: formData.ai_risk_rating || undefined,
        ai_risk_score: formData.ai_risk_score || 0,
        ai_risk_reasoning: formData.ai_risk_reasoning.trim() || undefined
      };

      const { data, error } = await ClientService.createClient(clientData);
      
      if (error) {
        console.error('Error creating client:', error);
        toast({
          title: 'Error',
          description: 'Failed to add client',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Client added successfully'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        date_of_birth: '',
        emergency_contact: '',
        ai_risk_rating: '',
        ai_risk_score: 0,
        ai_risk_reasoning: ''
      });
      onOpenChange(false);
      onClientAdded?.();
      
    } catch (error) {
      console.error('Unexpected error creating client:', error);
      toast({
        title: 'Error',
        description: 'Failed to add client',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter client's full name"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter client's email"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter client's phone number"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter client's address"
              disabled={loading}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact">Emergency Contact</Label>
            <Input
              id="emergency_contact"
              value={formData.emergency_contact}
              onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
              placeholder="Emergency contact information"
              disabled={loading}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-3">AI Risk Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ai_risk_rating">AI Risk Rating</Label>
                <Select value={formData.ai_risk_rating} onValueChange={(value) => handleInputChange('ai_risk_rating', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI risk rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai_risk_score">AI Risk Score (0-10)</Label>
                <Input
                  id="ai_risk_score"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.ai_risk_score}
                  onChange={(e) => handleInputChange('ai_risk_score', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="ai_risk_reasoning">AI Risk Reasoning</Label>
              <Textarea
                id="ai_risk_reasoning"
                value={formData.ai_risk_reasoning}
                onChange={(e) => handleInputChange('ai_risk_reasoning', e.target.value)}
                placeholder="Explain the reasoning behind the AI risk assessment"
                disabled={loading}
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
