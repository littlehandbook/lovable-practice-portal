import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, MapPin, AlertTriangle, FileText, Calendar, Bot } from 'lucide-react';
import { Client } from '@/models';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ClientOverviewTabProps {
  client: Client;
  tenantId: string;
}

export const ClientOverviewTab: React.FC<ClientOverviewTabProps> = ({ 
  client, 
  tenantId 
}) => {
  const [isEditingRisk, setIsEditingRisk] = useState(false);
  const [riskScore, setRiskScore] = useState(client.risk_score || 0);
  const [riskNotes, setRiskNotes] = useState(client.risk_notes || '');
  const [practitionerRiskRating, setPractitionerRiskRating] = useState('Low');
  const [practitionerRiskReasoning, setPractitionerRiskReasoning] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Mock AI data - will be replaced with actual AI assessment later
  const aiRiskRating = 'Medium';
  const aiRiskReasoning = 'AI risk assessment will be implemented when the algorithm is ready.';

  const handleSaveRiskScore = async () => {
    setSaving(true);
    try {
      // TODO: Implement risk score update via service
      setIsEditingRisk(false);
      toast({
        title: 'Success',
        description: 'Risk assessment updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update risk assessment',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRiskScoreColor = (score: number) => {
    if (score <= 3) return 'text-green-600 bg-green-100';
    if (score <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Client Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Name
                </label>
                <p className="mt-1 text-lg">{client.name}</p>
              </div>
              
              {client.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </label>
                  <p className="mt-1">{client.email}</p>
                </div>
              )}
              
              {client.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Phone
                  </label>
                  <p className="mt-1">{client.phone}</p>
                </div>
              )}

              {client.date_of_birth && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Date of Birth
                  </label>
                  <p className="mt-1">{formatDate(client.date_of_birth)}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {client.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Address
                  </label>
                  <p className="mt-1">{client.address}</p>
                </div>
              )}

              {client.emergency_contact && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Emergency Contact
                  </label>
                  <p className="mt-1">{client.emergency_contact}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="mt-1">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Client Since</label>
                <p className="mt-1">{formatDate(client.created_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Risk Assessment Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            AI Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">AI Risk Rating</Label>
                <div className={`mt-1 px-3 py-2 rounded-md text-sm font-medium ${getRiskRatingColor(aiRiskRating)}`}>
                  {aiRiskRating}
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-500">AI Risk Reasoning</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                {aiRiskReasoning}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Practitioner Risk Assessment Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Practitioner Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditingRisk ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Risk Rating</Label>
                    <div className={`mt-1 px-3 py-2 rounded-md text-sm font-medium ${getRiskRatingColor(practitionerRiskRating)}`}>
                      {practitionerRiskRating}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Risk Score</Label>
                    <div className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${getRiskScoreColor(riskScore)}`}>
                      {riskScore}/10
                    </div>
                  </div>
                </div>
                
                <Button onClick={() => setIsEditingRisk(true)} variant="outline" size="sm">
                  Update Assessment
                </Button>
              </div>
              
              {practitionerRiskReasoning && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Risk Reasoning</Label>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded-md">{practitionerRiskReasoning}</p>
                </div>
              )}
              
              {riskNotes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Additional Risk Notes</Label>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded-md">{riskNotes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="practitionerRiskRating">Risk Rating</Label>
                  <Select value={practitionerRiskRating} onValueChange={setPractitionerRiskRating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="riskScore">Risk Score (0-10)</Label>
                  <Input
                    id="riskScore"
                    type="number"
                    min="0"
                    max="10"
                    value={riskScore}
                    onChange={(e) => setRiskScore(parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="practitionerRiskReasoning">Risk Reasoning</Label>
                <Textarea
                  id="practitionerRiskReasoning"
                  value={practitionerRiskReasoning}
                  onChange={(e) => setPractitionerRiskReasoning(e.target.value)}
                  placeholder="Enter reasoning for risk assessment..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="riskNotes">Additional Risk Notes</Label>
                <Textarea
                  id="riskNotes"
                  value={riskNotes}
                  onChange={(e) => setRiskNotes(e.target.value)}
                  placeholder="Enter additional risk assessment notes..."
                  className="mt-1"
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSaveRiskScore} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Assessment'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingRisk(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referrals Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Referrals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No referrals on record</p>
        </CardContent>
      </Card>
    </div>
  );
};
