import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, DollarSign, User } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  member_id: string;
  payment_method: string;
  description: string | null;
  start_date: string;
  ending_date: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  member?: {
    name: string;
    email: string;
  };
}

interface DailyTransactionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  transactions: Transaction[];
}

const DailyTransactionsDialog: React.FC<DailyTransactionsDialogProps> = ({
  open,
  onOpenChange,
  date,
  transactions,
}) => {
  const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Transactions for {date && !isNaN(new Date(date).getTime()) ? format(new Date(date), 'MMMM d, yyyy') : 'Invalid Date'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Total Revenue</span>
              </div>
              <span className="text-xl font-bold text-blue-900">
                Ksh {totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-blue-700 mt-1">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions found for this date.
              </div>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Member ID: {transaction.member_id}
                        </h4>
                        <div className="text-sm text-gray-500 space-y-1">
                          <div>Amount: Ksh {Number(transaction.amount).toLocaleString()}</div>
                          <div>Method: {transaction.payment_method}</div>
                           {transaction.ending_date && !isNaN(new Date(transaction.ending_date).getTime()) && (
                             <div>
                               Expires: {format(new Date(transaction.ending_date), 'MMM d, yyyy')}
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'complete' 
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'incomplete'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.status || 'pending'}
                      </div>
                       <div className="text-xs text-gray-500 mt-1">
                         {transaction.start_date && !isNaN(new Date(transaction.start_date).getTime()) 
                           ? format(new Date(transaction.start_date), 'h:mm a')
                           : 'Invalid time'}
                       </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailyTransactionsDialog;