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
	// Valores alineados con INITIAL_TRANSACTIONS del contexto
	"2026-01": { income: 5050,  expenses: 1115, transfers: 300  }, // Salario(4200) + Freelance(850)
	"2026-02": { income: 4800,  expenses: 1250, transfers: 0    }, // Salario(4200) + Bono(600)
	"2026-03": { income: 3700,  expenses: 481,  transfers: 500  }, // Salario(3500) + Venta(200)
	"2026-04": { income: 5850,  expenses: 1648, transfers: 200  }, // Salario(5100) + Freelance(750)
	"2026-05": { income: 5120,  expenses: 1599, transfers: 450  }, // Salario(4800) + Venta(320)
	"2026-06": { income: 4800,  expenses: 5100, transfers: 100  }, // Proyección futura
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
