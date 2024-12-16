import { Card } from "@/components/ui/card"

interface Transaction {
  amount: string
  recipient: string
  date: string
}

export function TransactionPreview({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="space-y-2">
      {transactions.map((tx, index) => (
        <Card key={index} className="p-4 bg-gray-900/50 border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
              <span className="text-xs font-medium text-purple-400">SOL</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-200">
                  Sent {tx.amount} SOL To {tx.recipient}
                </p>
                <span className="text-xs text-gray-400">{tx.date}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

