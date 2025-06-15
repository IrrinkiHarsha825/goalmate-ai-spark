
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowUpRight, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { WithdrawalRequestModal } from "./WithdrawalRequestModal";

interface WalletData {
  balance: number;
  total_invested: number;
}

export const WalletDisplay = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWallet = async () => {
    if (!user) return;

    try {
      console.log('Fetching wallet for user:', user.id);
      
      const { data, error } = await supabase
        .from('wallets')
        .select('balance, total_invested')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If wallet doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('Creating new wallet for user:', user.id);
          const { error: insertError } = await supabase
            .from('wallets')
            .insert({
              user_id: user.id,
              balance: 0,
              total_invested: 0,
            });
          
          if (insertError) {
            console.error('Error creating wallet:', insertError);
            throw insertError;
          }
          setWallet({ balance: 0, total_invested: 0 });
        } else {
          console.error('Error fetching wallet:', error);
          throw error;
        }
      } else {
        console.log('Wallet data fetched:', data);
        setWallet(data);
      }
    } catch (error) {
      console.error('Error in fetchWallet:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWallet();
  };

  useEffect(() => {
    fetchWallet();
  }, [user]);

  const handleWithdrawalRequested = () => {
    toast({
      title: "Withdrawal Request Submitted",
      description: "Your withdrawal request has been submitted for admin approval",
    });
    fetchWallet(); // Refresh wallet data
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-600 flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading wallet...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!wallet) return null;

  const canWithdraw = wallet.balance > 0;

  return (
    <>
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Your Wallet</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
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
          
          {!canWithdraw && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  No funds available for withdrawal. Complete goals to earn rewards!
                </span>
              </div>
            </div>
          )}
          
          {canWithdraw && (
            <div className="mt-4">
              <Button 
                onClick={() => setShowWithdrawalModal(true)}
                className="bg-green-600 hover:bg-green-700"
                disabled={!canWithdraw}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Request Withdrawal
              </Button>
            </div>
          )}
          
          <div className="mt-3 text-xs text-gray-500">
            * Withdrawal requests require admin approval
          </div>
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
