import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { AlertTriangle, Trash2, Shield, X, CheckCircle } from 'lucide-react';

type Member = Tables<'members'>;

interface MemberDeleteDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberDeleted: () => void;
}

const MemberDeleteDialog: React.FC<MemberDeleteDialogProps> = ({
  member,
  open,
  onOpenChange,
  onMemberDeleted
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const expectedText = member ? `DELETE ${member.name.toUpperCase()}` : '';
  const isConfirmed = confirmationText === expectedText;

  const handleDelete = async () => {
    if (!member || !isConfirmed) return;

    setIsLoading(true);
    
    try {
      // Delete related records first (check_ins, messages, transactions, bookings)
      await Promise.all([
        supabase.from('check_ins').delete().eq('member_id', member.id),
        supabase.from('messages').delete().contains('recipient_ids', [member.id]),
        supabase.from('transactions').delete().eq('member_id', member.id)
      ]);

      // Then delete the member
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', member.id);

      if (error) throw error;

      setIsSuccess(true);
      
      // Show success animation for a moment
      setTimeout(() => {
        toast({
          title: "Member Deleted",
          description: `${member.name} has been permanently removed from the system.`,
        });
        onMemberDeleted();
        onOpenChange(false);
        setConfirmationText('');
        setIsSuccess(false);
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete member.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      setConfirmationText('');
      setIsSuccess(false);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white via-red-50 to-orange-100 border-0 shadow-2xl">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="text-2xl font-bold text-red-600 flex items-center justify-center space-x-2">
            <AlertTriangle className="w-6 h-6" />
            <span>Delete Member</span>
          </DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-green-600 mb-2">Member Deleted</h3>
            <p className="text-gray-600">All data has been safely removed.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Warning Section */}
            <div className="bg-red-100 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">
                    This action cannot be undone
                  </h4>
                  <p className="text-sm text-red-700 mb-3">
                    You are about to permanently delete <strong>{member.name}</strong> and all associated data including:
                  </p>
                  <ul className="text-xs text-red-600 space-y-1 ml-4">
                    <li>• Check-in history</li>
                    <li>• Payment transactions</li>
                    <li>• Messages and communications</li>
                    <li>• Class bookings</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Member Info */}
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  {member.phone && (
                    <p className="text-sm text-gray-600">{member.phone}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Member since {new Date(member.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="space-y-3">
              <Label className="text-gray-700 font-medium">
                To confirm deletion, type: <code className="bg-gray-200 px-2 py-1 rounded text-red-600 font-mono text-sm">{expectedText}</code>
              </Label>
              <Input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Type the confirmation text..."
                className={`bg-white border-2 transition-all duration-200 ${
                  confirmationText && !isConfirmed
                    ? 'border-red-300 focus:border-red-400'
                    : isConfirmed
                    ? 'border-green-300 focus:border-green-400'
                    : 'border-gray-200 focus:border-gray-400'
                }`}
                disabled={isLoading}
              />
              {confirmationText && (
                <p className={`text-sm ${isConfirmed ? 'text-green-600' : 'text-red-600'}`}>
                  {isConfirmed ? '✓ Confirmation text matches' : '✗ Confirmation text does not match'}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-gray-300 hover:bg-gray-50 text-gray-700"
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={!isConfirmed || isLoading}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Deleting...</span>
                  </div>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Forever
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MemberDeleteDialog;