
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ClientService } from '@/services/ClientService';
import { Client } from '@/models';
import { useToast } from '@/hooks/use-toast';
import { useBranding } from '@/hooks/useBranding';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
  emergency_contact: z.string().optional(),
  risk_score: z.number().min(0).max(10).optional(),
  risk_notes: z.string().optional(),
  // Referral fields
  referral_type: z.enum(['referred_to', 'referred_from']).optional(),
  referring_practitioner_name: z.string().optional(),
  referring_practitioner_email: z.string().optional(),
  referring_practitioner_phone: z.string().optional(),
  referring_practice_name: z.string().optional(),
  referral_reason: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onClientUpdated: () => void;
}

export function EditClientDialog({ 
  open, 
  onOpenChange, 
  client, 
  onClientUpdated 
}: EditClientDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { branding } = useBranding();

  const primaryColor = branding.primary_color || '#0f766e';

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      date_of_birth: '',
      emergency_contact: '',
      risk_score: 0,
      risk_notes: '',
      referral_type: undefined,
      referring_practitioner_name: '',
      referring_practitioner_email: '',
      referring_practitioner_phone: '',
      referring_practice_name: '',
      referral_reason: '',
    },
  });

  // Update form values when client changes
  useEffect(() => {
    if (client && open) {
      form.reset({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        date_of_birth: client.date_of_birth || '',
        emergency_contact: client.emergency_contact || '',
        risk_score: client.risk_score || 0,
        risk_notes: client.risk_notes || '',
        referral_type: undefined,
        referring_practitioner_name: '',
        referring_practitioner_email: '',
        referring_practitioner_phone: '',
        referring_practice_name: '',
        referral_reason: '',
      });
    }
  }, [client, open, form]);

  const onSubmit = async (data: FormData) => {
    if (!client) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        date_of_birth: data.date_of_birth || undefined,
        emergency_contact: data.emergency_contact || undefined,
        risk_score: data.risk_score || undefined,
        risk_notes: data.risk_notes || undefined,
      };

      const { error } = await ClientService.updateClient(client.id, updateData);

      if (error) {
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive',
        });
        return;
      }

      // TODO: Handle referral information separately when referrals API is implemented

      toast({
        title: 'Success',
        description: 'Client updated successfully',
      });

      onClientUpdated();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: 'Error',
        description: 'Failed to update client. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ color: primaryColor }}>
            Edit Client
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter client's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Enter email address" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergency_contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter emergency contact" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Risk Assessment Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Risk Assessment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="risk_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Score (0-10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="risk_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Assessment Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter risk assessment notes..." 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Referral Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Referral Information</h3>
              
              <FormField
                control={form.control}
                name="referral_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referral Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select referral type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="referred_to">Referred To</SelectItem>
                        <SelectItem value="referred_from">Referred From</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="referring_practitioner_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Practitioner Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter practitioner name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referring_practice_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Practice Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter practice name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="referring_practitioner_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Practitioner Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Enter practitioner email" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referring_practitioner_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Practitioner Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter practitioner phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="referral_reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referral Reason</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter reason for referral..." 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: primaryColor,
                  color: 'white'
                }}
                className="hover:opacity-90"
              >
                {isSubmitting ? 'Updating...' : 'Update Client'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
