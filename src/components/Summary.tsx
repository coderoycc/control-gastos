interface SummaryProps {
  income: number;
  expense: number;
  advanced?: boolean;
}

export function Summary({ income, expense, advanced = false }: SummaryProps) {
  const balance = income - expense;

  return (
    <div className="px-3 py-1">
      <div className="flex gap-2">
        <div className="flex-1 rounded-xl border-l-4 border-green-500 bg-white dark:bg-transparent p-1.5 shadow-xs dark:shadow-gray-500/50">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">{advanced ? 'Ingresos' : 'Entradas'}</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            ${income.toLocaleString()}
          </p>
        </div>
        <div className="flex-1 rounded-xl border-l-4 border-red-500 bg-white dark:bg-transparent p-1.5 shadow-xs dark:shadow-gray-500/50">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">{advanced ? 'Egresos' : 'Gastos'}</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">
            ${expense.toLocaleString()}
          </p>
        </div>
        <div className="flex-1 rounded-xl border-l-4 border-blue-500 bg-white dark:bg-transparent p-1.5 shadow-xs dark:shadow-gray-500/50">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Balance</p>
          <p className={`text-lg font-bold ${
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
