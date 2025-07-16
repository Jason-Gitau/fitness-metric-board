import React, { useState } from 'react';
import { ArrowLeft, Send, Users, MessageSquare, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Member = Tables<'members'>;

const Messaging = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'sms' | 'email'>('sms');
  const [isSending, setIsSending] = useState(false);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["all_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const handleMemberToggle = (memberId: number) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map(m => m.id));
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || selectedMembers.length === 0) {
      toast({
        title: "Error",
        description: "Please select members and enter a message",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Insert messages into the database
      const messageData = selectedMembers.map(memberId => ({
        member_id: memberId,
        content: message,
        type: messageType,
      }));

      const { error } = await supabase
        .from("messages")
        .insert(messageData);

      if (error) throw error;

      toast({
        title: "Messages Sent!",
        description: `Successfully sent ${messageType} to ${selectedMembers.length} member(s)`,
      });

      setMessage('');
      setSelectedMembers([]);
    } catch (error) {
      console.error('Error sending messages:', error);
      toast({
        title: "Error",
        description: "Failed to send messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Send Messages</h1>
              <p className="text-sm text-gray-500">Send SMS or email to your members</p>
            </div>
          </div>
          <MessageSquare className="h-6 w-6 text-blue-600" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Member Selection */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Select Members</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-sm"
                >
                  <Users className="h-4 w-4 mr-2" />
                  {selectedMembers.length === members.length ? 'Deselect All' : 'Select All'}
                </Button>
                <span className="text-sm text-gray-500">
                  {selectedMembers.length} of {members.length} selected
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading members...</div>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedMembers.includes(member.id)
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                    onClick={() => handleMemberToggle(member.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white ${
                        selectedMembers.includes(member.id) ? 'bg-blue-600' : 'bg-gray-400'
                      }`}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{member.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Mail className="h-3 w-3" />
                          <span>{member.email}</span>
                          {member.phone && (
                            <>
                              <Phone className="h-3 w-3 ml-2" />
                              <span>{member.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => handleMemberToggle(member.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Composition */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Compose Message</h2>
            
            <div className="space-y-4">
              {/* Message Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Message Type</label>
                <div className="flex space-x-2">
                  <Button
                    variant={messageType === 'sms' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMessageType('sms')}
                    className="flex-1"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    SMS
                  </Button>
                  <Button
                    variant={messageType === 'email' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMessageType('email')}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Message</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Enter your ${messageType} message here...`}
                  className="h-32 resize-none"
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {message.length} characters
                </div>
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                disabled={isSending || !message.trim() || selectedMembers.length === 0}
                className="w-full"
              >
                {isSending ? (
                  <div className="flex items-center">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send to {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messaging;