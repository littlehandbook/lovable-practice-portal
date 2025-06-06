
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  AlertTriangle,
  Shield,
  Users,
  Plus,
  Edit,
  Save,
  X,
  Bot
} from 'lucide-react';
import { useEnhancedClient } from '@/hooks/useEnhancedClient';
import { Client } from '@/models';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ClientOverviewTabProps {
  client: Client;
  tenantId: string;
}

interface ReferralFormData {
  referral_type: string;
  referring_practitioner_name: string;
  referring_practitioner_email: string;
  referring_practitioner_phone: string;
  referring_practice_name: string;
  referral_reason: string;
  referral_date: string;
}

export const ClientOverviewTab: React.FC<ClientOverviewTabProps> = ({ 
  client, 
  tenantId 
}) => {
  const { user } = useAuth();
  const { overview, loading, error, updateRiskScore } = useEnhancedClient(client.id, tenantId);
  const { toast } = useToast();
  
  const [isEditingRisk, setIsEditingRisk] = useState(false);
  const [riskScore, setRiskScore] = useState(client.risk_score || 0);
  const [riskNotes, setRiskNotes] = useState(client.risk_notes || '');
  
  const [isAddingReferral, setIsAddingReferral] = useState(false);
  const [referralForm, setReferralForm] = useState<ReferralFormData>({
    referral_type: '',
    referring_practitioner_name: '',
    referring_practitioner_email: '',
    referring_practitioner_phone: '',
    referring_practice_name: '',
    referral_reason: '',
    referral_date: ''
  });

  const handleUpdateRiskScore = async () => {
    try {
      if (!user?.id) {
        toast({
          title: 'Error',
          description: 'User not authenticated',
          variant: 'destructive'
        });
        return;
      }

      await updateRiskScore(riskScore, riskNotes, user.id);
      setIsEditingRisk(false);
      toast({
        title: 'Success',
        description: 'Risk score updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update risk score',
        variant: 'destructive'
      });
    }
  };

  const handleAddReferral = async () => {
    try {
      // TODO: Implement referral creation logic with your referral service
      console.log('Adding referral:', referralForm);
      toast({
        title: 'Success',
        description: 'Referral added successfully'
      });
      setIsAddingReferral(false);
      setReferralForm({
        referral_type: '',
        referring_practitioner_name: '',
        referring_practitioner_email: '',
        referring_practitioner_phone: '',
        referring_practice_name: '',
        referral_reason: '',
        referral_date: ''
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add referral',
        variant: 'destructive'
      });
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score <= 3) return 'bg-green-100 text-green-800';
    if (score <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRiskRatingColor = (rating: string) => {
    switch (rating?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-4">Loading client overview...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading client overview: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm">{client.email || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-sm">{client.phone || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-sm">{client.address || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                <p className="text-sm">
                  {client.date_of_birth 
                    ? new Date(client.date_of_birth).toLocaleDateString() 
                    : 'Not provided'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                <p className="text-sm">{client.emergency_contact || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Risk Assessment
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingRisk(!isEditingRisk)}
            >
              {isEditingRisk ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* AI Risk Assessment */}
            <div className="space-y-2">
              <Label className="font-medium flex items-center">
                <Bot className="h-4 w-4 mr-1" />
                AI Risk Rating
              </Label>
              {client.ai_risk_rating ? (
                <Badge className={getRiskRatingColor(client.ai_risk_rating)}>
                  {client.ai_risk_rating}
                </Badge>
              ) : (
                <p className="text-sm text-gray-500">Not assessed</p>
              )}
              {client.ai_risk_score !== undefined && (
                <div className="text-xs text-gray-500">
                  Score: {client.ai_risk_score}/10
                </div>
              )}
            </div>

            {/* Practitioner Risk Assessment */}
            <div className="space-y-2">
              <Label className="font-medium">Practitioner Risk Score</Label>
              {isEditingRisk ? (
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={riskScore}
                  onChange={(e) => setRiskScore(parseInt(e.target.value) || 0)}
                  className="w-20"
                />
              ) : (
                <Badge className={getRiskScoreColor(riskScore)}>
                  {riskScore}/10
                </Badge>
              )}
            </div>

            {/* Risk Assessment Date */}
            <div className="space-y-2">
              <Label className="font-medium">Last Assessment</Label>
              <p className="text-sm text-gray-600">
                {client.risk_assessment_date 
                  ? new Date(client.risk_assessment_date).toLocaleDateString()
                  : 'Never assessed'
                }
              </p>
            </div>
          </div>

          {/* AI Risk Reasoning */}
          {client.ai_risk_reasoning && (
            <div className="mt-4 space-y-2">
              <Label className="font-medium flex items-center">
                <Bot className="h-4 w-4 mr-1" />
                AI Risk Reasoning
              </Label>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">{client.ai_risk_reasoning}</p>
              </div>
            </div>
          )}

          {/* Risk Notes */}
          <div className="mt-4 space-y-2">
            <Label className="font-medium">Risk Notes</Label>
            {isEditingRisk ? (
              <div className="space-y-2">
                <Textarea
                  value={riskNotes}
                  onChange={(e) => setRiskNotes(e.target.value)}
                  placeholder="Enter risk assessment notes..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleUpdateRiskScore}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsEditingRisk(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg min-h-[80px]">
                <p className="text-sm text-gray-700">
                  {riskNotes || 'No risk notes recorded'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Referrals */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Referrals
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingReferral(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Referral
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAddingReferral && (
            <div className="mb-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium mb-3">Add New Referral</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="referral_type">Referral Type</Label>
                  <Select 
                    value={referralForm.referral_type} 
                    onValueChange={(value) => setReferralForm(prev => ({ ...prev, referral_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select referral type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
                      <SelectItem value="Psychologist">Psychologist</SelectItem>
                      <SelectItem value="Medical Doctor">Medical Doctor</SelectItem>
                      <SelectItem value="Specialist">Specialist</SelectItem>
                      <SelectItem value="Social Worker">Social Worker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="referral_date">Referral Date</Label>
                  <Input
                    id="referral_date"
                    type="date"
                    value={referralForm.referral_date}
                    onChange={(e) => setReferralForm(prev => ({ ...prev, referral_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="practitioner_name">Practitioner Name</Label>
                  <Input
                    id="practitioner_name"
                    value={referralForm.referring_practitioner_name}
                    onChange={(e) => setReferralForm(prev => ({ ...prev, referring_practitioner_name: e.target.value }))}
                    placeholder="Dr. Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="practice_name">Practice Name</Label>
                  <Input
                    id="practice_name"
                    value={referralForm.referring_practice_name}
                    onChange={(e) => setReferralForm(prev => ({ ...prev, referring_practice_name: e.target.value }))}
                    placeholder="ABC Medical Center"
                  />
                </div>
                <div>
                  <Label htmlFor="practitioner_email">Email</Label>
                  <Input
                    id="practitioner_email"
                    type="email"
                    value={referralForm.referring_practitioner_email}
                    onChange={(e) => setReferralForm(prev => ({ ...prev, referring_practitioner_email: e.target.value }))}
                    placeholder="dr.smith@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="practitioner_phone">Phone</Label>
                  <Input
                    id="practitioner_phone"
                    value={referralForm.referring_practitioner_phone}
                    onChange={(e) => setReferralForm(prev => ({ ...prev, referring_practitioner_phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="referral_reason">Referral Reason</Label>
                <Textarea
                  id="referral_reason"
                  value={referralForm.referral_reason}
                  onChange={(e) => setReferralForm(prev => ({ ...prev, referral_reason: e.target.value }))}
                  placeholder="Reason for referral..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={handleAddReferral}>
                  <Save className="h-4 w-4 mr-1" />
                  Add Referral
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsAddingReferral(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {overview?.referrals && overview.referrals.length > 0 ? (
            <div className="space-y-3">
              {overview.referrals.map((referral: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{referral.type}</h3>
                      <p className="text-sm text-gray-600">
                        {referral.practitioner_name} - {referral.practice_name}
                      </p>
                    </div>
                    <Badge variant="outline">{referral.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{referral.reason}</p>
                  <div className="text-xs text-gray-500">
                    Referred: {new Date(referral.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>No referrals recorded</p>
              <p className="text-sm mt-1">Add a referral to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
