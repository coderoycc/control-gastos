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

const MOCK_DATA: Record<string, Omit<FinancialSummaryResponse, "period">> = {};

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

	const key = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, "0")}`;

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
