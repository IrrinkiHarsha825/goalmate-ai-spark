
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } = "@/hooks/use-toast";
import { WithdrawalRequestModal } from "./WithdrawalRequestModal";

interface WalletData {
  balance: number;
  total_invested: number;
}

export const WalletDisplay = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWallet = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance, total_invested')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If wallet doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('wallets')
            .insert({
              user_id: user.id,
              balance: 0,
              total_invested: 0,
            });
          
          if (insertError) throw insertError;
          setWallet({ balance: 0, total_invested: 0 });
        } else {
          throw error;
        }
      } else {
        setWallet(data);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [user]);

  const handleWithdrawalRequested = () => {
    fetchWallet();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-600">Loading wallet...</div>
        </CardContent>
      </Card>
    );
  }

  if (!wallet) return null;

  return (
    <>
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Your Wallet</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CardDescription>Available Balance</CardDescription>
              <div className="text-2xl font-bold text-green-600">
                ₹{wallet.balance.toFixed(2)}
              </div>
            </div>
            <div>
              <CardDescription>Total Invested</CardDescription>
              <div className="text-2xl font-bold text-blue-600">
                ₹{wallet.total_invested.toFixed(2)}
              </div>
            </div>
          </div>
          
          {wallet.balance > 0 && (
            <div className="mt-4">
              <Button 
                onClick={() => setShowWithdrawalModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Request Withdrawal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <WithdrawalRequestModal
        open={showWithdrawalModal}
        onOpenChange={setShowWithdrawalModal}
        maxAmount={wallet.balance}
        onWithdrawalRequested={handleWithdrawalRequested}
      />
    </>
  );
};
