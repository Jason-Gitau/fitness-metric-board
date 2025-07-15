import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { User, Mail, Phone, UserCheck, Save, X, Sparkles } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Member = Tables<'members'>;

interface MemberEditDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberUpdated: () => void;
}

const genderOptions = ["male", "female", "rather not say"];

const MemberEditDialog: React.FC<MemberEditDialogProps> = ({
  member,
  open,
  onOpenChange,
  onMemberUpdated
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  // Reset form when member changes
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        gender: member.gender || 'male'
      });
    }
    setIsSuccess(false);
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setIsLoading(true);
    
    try {
      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        gender: formData.gender
      };

      const { error } = await supabase
        .from('members')
        .update(updateData)
        .eq('id', member.id);

      if (error) throw error;

      setIsSuccess(true);
      
      // Show success animation for a moment
      setTimeout(() => {
        toast({
          title: "Success! ✨",
          description: `${formData.name}'s information has been updated.`,
        });
        onMemberUpdated();
        onOpenChange(false);
      }, 1500);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update member information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenderChange = (value: string) => {
    setFormData(prev => ({ ...prev, gender: value }));
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[95vw] bg-gradient-to-br from-white via-blue-50 to-indigo-100 border-0 shadow-2xl">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Edit Member Profile
          </DialogTitle>
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg">
            {member.name.charAt(0).toUpperCase()}
          </div>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-green-600 mb-2">Profile Updated!</h3>
            <p className="text-sm sm:text-base text-gray-600">Changes have been saved successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center space-x-2 text-gray-700 font-medium text-sm sm:text-base">
                <User className="w-4 h-4 text-blue-500" />
                <span>Full Name</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="bg-white/70 border-blue-200 focus:border-blue-400 focus:bg-white transition-all duration-200 text-gray-800 text-sm sm:text-base"
                placeholder="Enter full name"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2 text-gray-700 font-medium text-sm sm:text-base">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>Email Address</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="bg-white/70 border-blue-200 focus:border-blue-400 focus:bg-white transition-all duration-200 text-gray-800 text-sm sm:text-base"
                placeholder="Enter email address"
              />
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center space-x-2 text-gray-700 font-medium text-sm sm:text-base">
                <Phone className="w-4 h-4 text-blue-500" />
                <span>Phone Number</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="bg-white/70 border-blue-200 focus:border-blue-400 focus:bg-white transition-all duration-200 text-gray-800 text-sm sm:text-base"
                placeholder="Enter phone number (optional)"
              />
            </div>

            {/* Gender Field */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-gray-700 font-medium text-sm sm:text-base">
                <UserCheck className="w-4 h-4 text-blue-500" />
                <span>Gender</span>
              </Label>
              <RadioGroup 
                value={formData.gender} 
                onValueChange={handleGenderChange}
                className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0"
              >
                {genderOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="text-sm capitalize cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 border-gray-300 hover:bg-gray-50 text-gray-700 text-sm sm:text-base"
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MemberEditDialog;