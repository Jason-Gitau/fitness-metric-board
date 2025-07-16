import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        toast({
          title: "Invalid Payment",
          description: "No payment session found.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId }
        });

        if (error) {
          throw error;
        }

        if (data.success) {
          setPaymentVerified(true);
          toast({
            title: "Payment Successful! 🎉",
            description: "Your membership has been activated.",
          });
        } else {
          throw new Error("Payment verification failed");
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        toast({
          title: "Verification Error",
          description: "Unable to verify payment. Please contact support.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, navigate, toast]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md mx-4">
          <div className="mb-6">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Payment
          </h1>
          <p className="text-gray-600">
            Please wait while we confirm your payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md mx-4">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your payment. Your gym membership has been activated and you can now access all facilities.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-1">What's Next?</h3>
          <p className="text-sm text-green-700">
            Your membership is now active. You can check in at the gym and start your fitness journey!
          </p>
        </div>

        <Button 
          onClick={() => navigate('/')}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Dashboard
        </Button>

        <p className="text-xs text-gray-500 mt-4">
          Session ID: {sessionId}
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;