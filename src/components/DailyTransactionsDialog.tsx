import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, DollarSign, User } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  id: number;
  amount: number;
  member_id: number;
  "start date": string;
  "ending date": string | null;
  status: string | null;
  period: string | null;
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
            <span>Transactions for {format(new Date(date), 'MMMM d, yyyy')}</span>
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
                          {transaction.period && (
                            <div>Period: {transaction.period}</div>
                          )}
                          {transaction["ending date"] && (
                            <div>
                              Expires: {format(new Date(transaction["ending date"]), 'MMM d, yyyy')}
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
                        {format(new Date(transaction["start date"]), 'h:mm a')}
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