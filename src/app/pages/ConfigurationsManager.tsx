import { useState } from "react";
import { Plus, Edit2, Trash2, X, Save, DollarSign, Moon, Sun, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import {
  useData,
  type Account,
  type Label,
  type SpendingLimit,
  type LabelType,
} from '../context';
import { BottomSheet } from "../components/BottomSheet";
import { useTheme } from "../context/ThemeContext";

const PRESET_COLORS = [
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
  "#a855f7",
];

export function ConfigurationsManager() {
  const { theme, toggleTheme } = useTheme();
  const {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    labels,
    addLabel,
    updateLabel,
    deleteLabel,
    spendingLimits,
    addSpendingLimit,
    updateSpendingLimit,
    deleteSpendingLimit,
  } = useData();

  const [activeTab, setActiveTab] = useState<
    "accounts" | "labels" | "limits"
  >("accounts");

  // Account states
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<
    string | null
  >(null);
  const [accountName, setAccountName] = useState("");
  const [accountDetail, setAccountDetail] = useState("");

  // Label states
  const [showLabelForm, setShowLabelForm] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState<
    string | null
  >(null);
  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState(
    PRESET_COLORS[0],
  );
  const [labelType, setLabelType] = useState<LabelType>("salida");

  // Spending Limit states
  const [showLimitForm, setShowLimitForm] = useState(false);
  const [editingLimitId, setEditingLimitId] = useState<
    string | null
  >(null);
  const [limitTitle, setLimitTitle] = useState("");
  const [limitAmount, setLimitAmount] = useState("");
  const [limitEnabled, setLimitEnabled] = useState(true);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    type: "account" | "label" | "limit";
    id: string;
  } | null>(null);

  // Account handlers
  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountName) {
      alert("Por favor ingresa el nombre de la cuenta");
      return;
    }

    if (editingAccountId) {
      updateAccount(editingAccountId, {
        name: accountName,
        detail: accountDetail,
        balance: accounts.find(a => a.id === editingAccountId)?.balance || 0,
      });
      setEditingAccountId(null);
    } else {
      addAccount({ name: accountName, detail: accountDetail, balance: 0 });
    }

    setAccountName("");
    setAccountDetail("");
    setShowAccountForm(false);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccountId(account.id);
    setAccountName(account.name);
    setAccountDetail(account.detail);
    setShowAccountForm(true);
  };

  const handleCancelAccount = () => {
    setShowAccountForm(false);
    setEditingAccountId(null);
    setAccountName("");
    setAccountDetail("");
  };

  // Label handlers
  const handleLabelSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!labelName) {
      alert("Por favor ingresa el nombre de la etiqueta");
      return;
    }

    if (editingLabelId) {
      updateLabel(editingLabelId, {
        name: labelName,
        color: labelColor,
        type: labelType,
      });
      setEditingLabelId(null);
    } else {
      addLabel({ name: labelName, color: labelColor, type: labelType });
    }

    setLabelName("");
    setLabelColor(PRESET_COLORS[0]);
    setLabelType("salida");
    setShowLabelForm(false);
  };

  const handleEditLabel = (label: Label) => {
    setEditingLabelId(label.id);
    setLabelName(label.name);
    setLabelColor(label.color);
    setLabelType(label.type);
    setShowLabelForm(true);
  };

  const handleCancelLabel = () => {
    setShowLabelForm(false);
    setEditingLabelId(null);
    setLabelName("");
    setLabelColor(PRESET_COLORS[0]);
    setLabelType("salida");
  };

  // Spending Limit handlers
  const handleLimitSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!limitTitle) {
      alert("Por favor ingresa el título del límite");
      return;
    }

    if (!limitAmount) {
      alert("Por favor ingresa el monto del límite");
      return;
    }

    const amount = parseFloat(limitAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Por favor ingresa un monto válido");
      return;
    }

    if (editingLimitId) {
      updateSpendingLimit(editingLimitId, {
        title: limitTitle,
        amount,
        enabled: limitEnabled,
      });
      setEditingLimitId(null);
    } else {
      addSpendingLimit({
        title: limitTitle,
        amount,
        enabled: limitEnabled,
      });
    }

    setLimitTitle("");
    setLimitAmount("");
    setLimitEnabled(true);
    setShowLimitForm(false);
  };

  const handleEditLimit = (limit: SpendingLimit) => {
    setEditingLimitId(limit.id);
    setLimitTitle(limit.title);
    setLimitAmount(limit.amount.toString());
    setLimitEnabled(limit.enabled);
    setShowLimitForm(true);
  };

  const handleCancelLimit = () => {
    setShowLimitForm(false);
    setEditingLimitId(null);
    setLimitTitle("");
    setLimitAmount("");
    setLimitEnabled(true);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      if (showDeleteConfirm.type === "account") {
        deleteAccount(showDeleteConfirm.id);
      } else if (showDeleteConfirm.type === "label") {
        deleteLabel(showDeleteConfirm.id);
      } else {
        deleteSpendingLimit(showDeleteConfirm.id);
      }
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Configuraciones</h2>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab("accounts")}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "accounts"
                ? "bg-blue-600 dark:bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Cuentas
          </button>
          <button
            onClick={() => setActiveTab("labels")}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "labels"
                ? "bg-blue-600 dark:bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Etiquetas
          </button>
          <button
            onClick={() => setActiveTab("limits")}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "limits"
                ? "bg-blue-600 dark:bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Límites
          </button>
        </div>
      </div>

      {/* Accounts Tab */}
      {activeTab === "accounts" && (
        <>
          {/* Add Account Button */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setShowAccountForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Cuenta
            </button>
          </div>

          {/* Accounts List */}
          <div className="flex-1 overflow-auto">
            {accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-4">
                <p>No hay cuentas registradas</p>
                <p className="text-sm mt-1">
                  Crea una nueva cuenta
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {account.name}
                      </p>
                      {account.detail && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {account.detail}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          handleEditAccount(account)
                        }
                        className="p-1.5 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setShowDeleteConfirm({
                            type: "account",
                            id: account.id,
                          })
                        }
                        className="p-1.5 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Labels Tab */}
      {activeTab === "labels" && (
        <>
          {/* Add Label Button */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setShowLabelForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Etiqueta
            </button>
          </div>

          {/* Labels List */}
          <div className="flex-1 overflow-auto px-4 py-3">
            {labels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                <p>No hay etiquetas registradas</p>
                <p className="text-sm mt-1">
                  Crea una nueva etiqueta
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800 ">
                {labels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center"
                        style={{
                          backgroundColor: label.color,
                        }}
                      >
                        {label.type === 'entrada' ? (
                          <TrendingUp className="w-3 h-3 text-white" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="min-w-0 ">
                        <p className="text-sm font-medium truncate py-none">
                          {label.name}
                        </p>
                        <span className={`text-[10px] ${
                          label.type === 'entrada' 
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }` }>
                          {label.type === 'entrada' ? 'Entrada' : 'Egreso'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditLabel(label)}
                        className="p-1.5 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {/* <button
                        onClick={() =>
                          setShowDeleteConfirm({
                            type: "label",
                            id: label.id,
                          })
                        }
                        className="p-1.5 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button> */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Spending Limits Tab */}
      {activeTab === "limits" && (
        <>
          {/* Add Limit Button */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setShowLimitForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              Nuevo Límite
            </button>
          </div>

          {/* Limits List */}
          <div className="flex-1 overflow-auto px-4 py-3">
            {spendingLimits.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-4">
                <DollarSign className="w-10 h-10 mb-2 opacity-50" />
                <p>No hay límites de gasto registrados</p>
                <p className="text-sm mt-1">
                  Crea un nuevo límite
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {spendingLimits.map((limit) => (
                  <div
                    key={limit.id}
                    className={`flex items-center justify-between py-2 px-2 ${
                      limit.enabled
                        ? "bg-orange-50/50 dark:bg-orange-950/20"
                        : "opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                          limit.enabled
                            ? "bg-gradient-to-r from-orange-500 to-pink-500"
                            : "bg-gray-400 dark:bg-gray-600"
                        }`}
                      >
                        <DollarSign className="w-3 h-3 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {limit.title}
                        </p>
                        <p
                          className={`text-xs ${
                            limit.enabled
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          ${limit.amount.toLocaleString()}/mes
                        </p>
                      </div>
                      {limit.enabled && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                          Activo
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditLimit(limit)}
                        className="p-1.5 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setShowDeleteConfirm({
                            type: "limit",
                            id: limit.id,
                          })
                        }
                        className="p-1.5 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm w-full">
            <h3 className="font-semibold mb-2">
              Eliminar{" "}
              {showDeleteConfirm.type === "account"
                ? "Cuenta"
                : showDeleteConfirm.type === "label"
                  ? "Etiqueta"
                  : "Límite de Gasto"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar? Esta acción
              no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Form BottomSheet */}
      <BottomSheet
        isOpen={showAccountForm}
        onClose={handleCancelAccount}
        title={
          editingAccountId ? "Editar Cuenta" : "Nueva Cuenta"
        }
      >
        <form
          onSubmit={handleAccountSubmit}
          className="p-4 space-y-4"
        >
          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Nombre de la Cuenta
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Ej: Cuenta Personal"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Detalle (opcional)
            </label>
            <input
              type="text"
              value={accountDetail}
              onChange={(e) => setAccountDetail(e.target.value)}
              placeholder="Descripción adicional"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancelAccount}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              {editingAccountId ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </BottomSheet>

      {/* Label Form BottomSheet */}
      <BottomSheet
        isOpen={showLabelForm}
        onClose={handleCancelLabel}
        title={
          editingLabelId ? "Editar Etiqueta" : "Nueva Etiqueta"
        }
      >
        <form
          onSubmit={handleLabelSubmit}
          className="p-4 space-y-4"
        >
          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Nombre de la Etiqueta
            </label>
            <input
              type="text"
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              placeholder="Ej: Alimentación"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setLabelColor(color)}
                  className={`w-12 h-12 rounded-lg transition-all ${
                    labelColor === color
                      ? "ring-4 ring-offset-2 ring-blue-600 dark:ring-blue-400 dark:ring-offset-gray-900 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              {" "}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Tipo
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLabelType("entrada")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                  labelType === "entrada"
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Ingreso
              </button>
              <button
                type="button"
                onClick={() => setLabelType("salida")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                  labelType === "salida"
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                    : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Egreso
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancelLabel}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              {editingLabelId ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </BottomSheet>

      {/* Limit Form BottomSheet */}
      <BottomSheet
        isOpen={showLimitForm}
        onClose={handleCancelLimit}
        title={
          editingLimitId
            ? "Editar Límite"
            : "Nuevo Límite de Gasto"
        }
      >
        <form
          onSubmit={handleLimitSubmit}
          className="p-4 space-y-4"
        >
          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Título
            </label>
            <input
              type="text"
              value={limitTitle}
              onChange={(e) => setLimitTitle(e.target.value)}
              placeholder="Ej: Límite Mensual"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Monto Mensual
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                placeholder="1000"
                step="0.01"
                min="0"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
            <input
              type="checkbox"
              checked={limitEnabled}
              onChange={(e) =>
                setLimitEnabled(e.target.checked)
              }
              className="w-5 h-5 rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-sm">Habilitado</span>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancelLimit}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 transition-all"
            >
              {editingLimitId ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}