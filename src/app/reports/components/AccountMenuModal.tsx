interface AccountMenuModalProps {
  accounts: { id: string; name: string; detail: string }[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export function AccountMenuModal({
  accounts,
  currentIndex,
  onSelect,
  onClose,
}: AccountMenuModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-sm max-h-[60vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-medium">Seleccionar Cuenta</h3>
        </div>
        <div className="p-2">
          {accounts.map((account, index) => (
            <button
              key={account.id}
              onClick={() => {
                onSelect(index);
                onClose();
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                index === currentIndex
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <p className="font-medium">{account.name}</p>
              {account.detail && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {account.detail}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
