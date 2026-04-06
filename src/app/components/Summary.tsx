interface SummaryProps {
  income: number;
  expense: number;
}

export function Summary({ income, expense }: SummaryProps) {
  const balance = income - expense;

  return (
    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-around text-center">
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">Ingresos</p>
          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
            ${income.toLocaleString()}
          </p>
        </div>
        <div className="w-px h-8 bg-gray-300 dark:bg-gray-700" />
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">Gastos</p>
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            ${expense.toLocaleString()}
          </p>
        </div>
        <div className="w-px h-8 bg-gray-300 dark:bg-gray-700" />
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
          <p className={`text-sm font-semibold ${
            balance >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            ${balance.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
