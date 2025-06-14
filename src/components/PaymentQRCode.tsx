
import { QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PaymentQRCodeProps {
  amount: string;
  goalTitle: string;
}

export const PaymentQRCode = ({ amount, goalTitle }: PaymentQRCodeProps) => {
  // Static UPI payment string - replace with your actual UPI ID
  const upiId = "goalmate@paytm"; // Replace with your actual UPI ID
  const upiUrl = `upi://pay?pa=${upiId}&pn=GoalMate&am=${amount}&cu=INR&tn=Goal Commitment: ${goalTitle}`;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <QrCode className="h-5 w-5 text-purple-600" />
          <span>Scan to Pay</span>
        </CardTitle>
        <Badge variant="outline" className="mx-auto">
          ₹{amount}
        </Badge>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {/* QR Code placeholder - In production, you'd generate actual QR code */}
        <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">QR Code for ₹{amount}</p>
            <p className="text-xs text-gray-400 mt-1">Goal: {goalTitle}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">
            Scan with any UPI app to pay
          </p>
          <div className="flex justify-center space-x-2">
            <Badge variant="secondary" className="text-xs">Google Pay</Badge>
            <Badge variant="secondary" className="text-xs">PhonePe</Badge>
            <Badge variant="secondary" className="text-xs">Paytm</Badge>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            UPI ID: {upiId}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Or pay directly to this UPI ID
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
