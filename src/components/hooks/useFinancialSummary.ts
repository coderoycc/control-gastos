import { useState, useEffect } from "react";
import {
	fetchFinancialSummary,
	type FinancialSummaryResponse,
} from "../../services/financialSummaryService";

export interface UseFinancialSummaryResult {
	data: FinancialSummaryResponse | null;
	loading: boolean;
	error: string | null;
	refetch: () => void;
}

/**
 * Obtiene el resumen financiero para el rango de fechas indicado.
 * Se re-ejecuta automáticamente cuando cambia `startDate` o `endDate`.
 *
 * @param startDate  Inicio del período
 * @param endDate    Fin del período
 */
export function useFinancialSummary(
	startDate: Date | null,
	endDate: Date | null,
): UseFinancialSummaryResult {
	const [data, setData] = useState<FinancialSummaryResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [tick, setTick] = useState(0);

	const refetch = () => setTick((t) => t + 1);

	useEffect(() => {
		if (!startDate || !endDate) return;

		let cancelled = false;

		const load = async () => {
			setLoading(true);
			setError(null);
			try {
				const result = await fetchFinancialSummary(startDate, endDate);
				if (!cancelled) setData(result);
			} catch (err) {
				if (!cancelled) {
					setError(
						err instanceof Error
							? err.message
							: "Error al obtener el resumen financiero",
					);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		load();

		return () => {
			cancelled = true;
		};
	}, [startDate, endDate, tick]);

	return { data, loading, error, refetch };
}
