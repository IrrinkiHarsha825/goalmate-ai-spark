
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useAdminActions = (
  onDataUpdate: () => Promise<void>,
  updatePaymentStatus?: (id: string, status: string, notes?: string) => void,
  updateWithdrawalStatus?: (id: string, status: string, notes?: string) => void
) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePaymentAction = async (submissionId: string, action: 'approved' | 'rejected', notes?: string) => {
    setProcessingId(submissionId);
    
    // Optimistically update UI
    if (updatePaymentStatus) {
      updatePaymentStatus(submissionId, action, notes);
    }

    try {
      console.log(`Processing payment ${submissionId} with action: ${action}`);
      
      // Get the submission to access goal_id and other details
      const { data: submission, error: fetchError } = await supabase
        .from('payment_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (fetchError || !submission) {
        console.error('Submission not found:', submissionId);
        throw fetchError || new Error('Submission not found');
      }

      // Update payment submission status
      console.log('Updating payment submission status...');
      const { error: submissionError } = await supabase
        .from('payment_submissions')
        .update({
          status: action,
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', submissionId);

      if (submissionError) {
        console.error('Error updating payment submission:', submissionError);
        throw submissionError;
      }

      if (action === 'approved') {
        console.log('Payment approved, activating goal and updating wallet...');
        
        // Activate the goal when payment is approved (change from 'inactive' to 'active')
        const { error: goalError } = await supabase
          .from('goals')
          .update({ status: 'active' })
          .eq('id', submission.goal_id);

        if (goalError) {
          console.error('Error activating goal:', goalError);
          throw goalError;
        }

        // Update or create wallet with the investment amount
        const { data: existingWallet, error: walletFetchError } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', submission.user_id)
          .single();

        if (walletFetchError && walletFetchError.code !== 'PGRST116') {
          console.error('Error fetching wallet:', walletFetchError);
          throw walletFetchError;
        }

        if (existingWallet) {
          console.log('Updating existing wallet...');
          const { error: walletError } = await supabase
            .from('wallets')
            .update({
              balance: Number(existingWallet.balance) + Number(submission.amount),
              total_invested: Number(existingWallet.total_invested) + Number(submission.amount),
            })
            .eq('user_id', submission.user_id);

          if (walletError) {
            console.error('Error updating wallet:', walletError);
            throw walletError;
          }
        } else {
          console.log('Creating new wallet...');
          const { error: walletError } = await supabase
            .from('wallets')
            .insert({
              user_id: submission.user_id,
              balance: submission.amount,
              total_invested: submission.amount,
            });

          if (walletError) {
            console.error('Error creating wallet:', walletError);
            throw walletError;
          }
        }
      } else {
        console.log('Payment rejected, keeping goal inactive...');
        // If rejected, keep goal inactive or set it to rejected
        const { error: goalError } = await supabase
          .from('goals')
          .update({ status: 'inactive' })
          .eq('id', submission.goal_id);

        if (goalError) {
          console.error('Error updating goal status:', goalError);
          throw goalError;
        }
      }

      toast({
        title: action === 'approved' ? "Payment Approved ✅" : "Payment Rejected ❌",
        description: `Payment submission has been ${action}${action === 'approved' ? ' and goal activated' : ''}`,
      });

      console.log('Action completed, refreshing data...');
      // Refresh the data to show updated list
      await onDataUpdate();
    } catch (error) {
      console.error('Error processing payment:', error);
      
      // Revert optimistic update on error
      await onDataUpdate();
      
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleWithdrawalAction = async (requestId: string, action: 'approved' | 'rejected', notes?: string) => {
    setProcessingId(requestId);
    
    // Optimistically update UI
    if (updateWithdrawalStatus) {
      updateWithdrawalStatus(requestId, action, notes);
    }

    try {
      console.log(`Processing withdrawal ${requestId} with action: ${action}`);
      
      const { data: request, error: fetchError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !request) {
        console.error('Withdrawal request not found:', requestId);
        throw fetchError || new Error('Request not found');
      }

      // Update withdrawal request status
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: action,
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating withdrawal request:', updateError);
        throw updateError;
      }

      if (action === 'approved') {
        console.log('Withdrawal approved, updating wallet balance...');
        
        // Get current wallet balance
        const { data: wallet, error: walletError } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', request.user_id)
          .single();

        if (walletError) {
          console.error('Error fetching wallet:', walletError);
          throw walletError;
        }

        if (wallet) {
          const newBalance = Number(wallet.balance) - Number(request.amount);
          
          if (newBalance < 0) {
            throw new Error('Insufficient balance for withdrawal');
          }

          const { error: balanceUpdateError } = await supabase
            .from('wallets')
            .update({ balance: newBalance })
            .eq('user_id', request.user_id);

          if (balanceUpdateError) {
            console.error('Error updating wallet balance:', balanceUpdateError);
            throw balanceUpdateError;
          }
        }
      }

      toast({
        title: action === 'approved' ? "Withdrawal Approved ✅" : "Withdrawal Rejected ❌",
        description: `Withdrawal request has been ${action}${action === 'approved' ? ' and balance updated' : ''}`,
      });

      console.log('Withdrawal action completed, refreshing data...');
      await onDataUpdate();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      
      // Revert optimistic update on error
      await onDataUpdate();
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return {
    processingId,
    handlePaymentAction,
    handleWithdrawalAction
  };
};
