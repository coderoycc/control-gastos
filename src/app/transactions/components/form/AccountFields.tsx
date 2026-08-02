import { TransactionType, Account } from "../../../context";

interface AccountFieldsProps {
  type: TransactionType;
  accountId: string;
  toAccountId: string;
  accounts: Account[];
  setAccountId: (id: string) => void;
  setToAccountId: (id: string) => void;
}

export function AccountFields({
  type,
  accountId,
  toAccountId,
  accounts,
  setAccountId,
  setToAccountId,
}: AccountFieldsProps) {
  if (type === "transferencia") {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
            Cuenta Origen
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            required
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
            Cuenta Destino
          </label>
          <select
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            required
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
        Cuenta
      </label>
      <select
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
        required
      >
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </select>
    </div>
  );
}
