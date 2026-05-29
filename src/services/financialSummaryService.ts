export interface FinancialSummaryResponse {
	income: number;
	expenses: number;
	transfers: number;
	/** Período consultado (ISO strings) */
	period: {
		from: string;
		to: string;
	};
}

const MOCK_DATA: Record<string, Omit<FinancialSummaryResponse, "period">> = {
	"2026-01": { income: 4200, expenses: 2980, transfers: 300 },
	"2026-02": { income: 4200, expenses: 3150, transfers: 0 },
	"2026-03": { income: 3500, expenses: 230, transfers: 500 },
	"2026-04": { income: 5100, expenses: 4320, transfers: 200 },
	"2026-05": { income: 4800, expenses: 2650, transfers: 450 },
	"2026-06": { income: 4800, expenses: 5100, transfers: 100 },
};

const DEFAULT_MOCK: Omit<FinancialSummaryResponse, "period"> = {
	income: 0,
	expenses: 0,
	transfers: 0,
};

const SIMULATED_DELAY_MS = 600;

export async function fetchFinancialSummary(
	from: Date | string,
	to: Date | string,
): Promise<FinancialSummaryResponse> {
	const fromDate = from instanceof Date ? from : new Date(from);

	// Clave para buscar en el mock: año-mes del inicio del período
	const key = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, "0")}`;

	// Simula latencia de red
	await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

	const mock = MOCK_DATA[key] ?? DEFAULT_MOCK;

	return {
		...mock,
		period: {
			from: fromDate.toISOString(),
			to: to instanceof Date ? to.toISOString() : to,
		},
	};
}
