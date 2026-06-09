/**
 * Custom React hook for horizontal swipe detection
 *
 * Retorna un **ref-callback** en lugar de un useRef, de modo que los
 * event listeners se registran exactamente cuando el elemento se monta
 * en el DOM y se limpian cuando se desmonta. Esto evita el problema de
 * que useEffect corra antes de que el ref sea asignado.
 *
 * @example
 * ```tsx
 * const swipeRef = useHorizontalSwipe({
 *   onSwipeLeft: () => console.log('Swiped left'),
 *   onSwipeRight: () => console.log('Swiped right'),
 *   threshold: 75,
 * });
 *
 * return <div ref={swipeRef}>Swipeable content</div>;
 * ```
 */

import { useRef, useCallback } from "react";
import {
	SwipeConfig,
	SwipeHandlers,
	SwipeDirection,
	SwipeEvent,
	SwipingEvent,
} from "../types/swipe";
import {
	calculateVelocity,
	validateGesture,
	getSwipeDirection,
	normalizeEventCoordinates,
	isWithinVerticalTolerance,
	DEFAULT_SWIPE_CONFIG,
} from "./swipeUtils";

/**
 * Hook for detecting horizontal swipe gestures on any HTML element.
 * Returns a ref-callback to attach to the target element.
 *
 * @param handlers - Object containing swipe event callback functions
 * @param config - Optional configuration for swipe sensitivity and behavior
 * @returns A ref-callback to attach to the target HTML element
 */
export function useHorizontalSwipe(
	handlers: SwipeHandlers = {},
	config: SwipeConfig = {},
) {
	const finalConfig = { ...DEFAULT_SWIPE_CONFIG, ...config };

	// Store handlers in a ref to avoid stale closures
	const handlersRef = useRef<SwipeHandlers>(handlers);
	handlersRef.current = handlers;

	// Gesture state tracking
	const gestureState = useRef({
		isActive: false,
		direction: null as "horizontal" | "vertical" | null,
		startX: 0,
		startY: 0,
		startTime: 0,
		currentX: 0,
		currentY: 0,
	});

	const rafHandle = useRef<number | null>(null);

	const configRef = useRef(finalConfig);
	configRef.current = finalConfig;

	const cleanupRef = useRef<(() => void) | null>(null);

	const refCallback = useCallback((element: HTMLElement | null) => {
		if (cleanupRef.current) {
			cleanupRef.current();
			cleanupRef.current = null;
		}

		if (!element) return;

		const cfg = configRef.current;

		const handleGestureStart = (event: TouchEvent | MouseEvent) => {
			if (gestureState.current.isActive) return;
			if ("touches" in event && event.touches.length > 1) return;

			const coords = normalizeEventCoordinates(event);
			gestureState.current = {
				isActive: true,
				direction: null,
				startX: coords.x,
				startY: coords.y,
				startTime: Date.now(),
				currentX: coords.x,
				currentY: coords.y,
			};

			handlersRef.current.onSwipeStart?.();

			if ("button" in event && cfg.trackMouse) {
				event.preventDefault();
			}
		};

		const handleGestureMove = (event: TouchEvent | MouseEvent) => {
			if (!gestureState.current.isActive) return;

			const coords = normalizeEventCoordinates(event);
			const deltaX = coords.x - gestureState.current.startX;
			const deltaY = coords.y - gestureState.current.startY;
			const absX = Math.abs(deltaX);
			const absY = Math.abs(deltaY);

			if (gestureState.current.direction === null) {
				const intentThreshold = 8; // píxeles mínimos en cualquier eje para decidir
				if (absX < intentThreshold && absY < intentThreshold) {
					return; // Esperar más movimiento
				}

				if (absX > absY) {
					gestureState.current.direction = "horizontal";
				} else {
					gestureState.current.direction = "vertical";
					gestureState.current.isActive = false;
					handlersRef.current.onSwipeEnd?.();
					return;
				}
			}

			if (gestureState.current.direction === "vertical") {
				return;
			}

			gestureState.current.currentX = coords.x;
			gestureState.current.currentY = coords.y;

			if (event.cancelable) {
				event.preventDefault();
			}

			if (handlersRef.current.onSwiping) {
				if (rafHandle.current !== null) cancelAnimationFrame(rafHandle.current);
				const capturedCoords = { x: coords.x };
				const capturedDeltaX = deltaX;
				const capturedStartTime = gestureState.current.startTime;
				rafHandle.current = requestAnimationFrame(() => {
					rafHandle.current = null;
					if (!gestureState.current.isActive) return;
					const swipingEvent: SwipingEvent = {
						currentX: capturedCoords.x,
						deltaX: capturedDeltaX,
						direction: getSwipeDirection(capturedDeltaX),
						startTime: capturedStartTime,
					};
					handlersRef.current.onSwiping?.(swipingEvent);
				});
			}
		};

		const handleGestureEnd = (event: TouchEvent | MouseEvent) => {
			if (!gestureState.current.isActive) return;

			if (rafHandle.current !== null) {
				cancelAnimationFrame(rafHandle.current);
				rafHandle.current = null;
			}

			const coords = normalizeEventCoordinates(event);
			const deltaX = coords.x - gestureState.current.startX;
			const duration = Date.now() - gestureState.current.startTime;
			const distance = Math.abs(deltaX);
			const velocity = calculateVelocity(distance, duration);

			const wasHorizontal = gestureState.current.direction === "horizontal";

			gestureState.current.isActive = false;
			gestureState.current.direction = null;

			if (
				wasHorizontal &&
				validateGesture(deltaX, velocity, cfg.threshold, cfg.velocityThreshold)
			) {
				const direction = getSwipeDirection(deltaX);
				if (direction) {
					const swipeEvent: SwipeEvent = {
						direction,
						distance,
						velocity,
						duration,
					};
					if (direction === SwipeDirection.LEFT) {
						handlersRef.current.onSwipeLeft?.(swipeEvent);
					} else if (direction === SwipeDirection.RIGHT) {
						handlersRef.current.onSwipeRight?.(swipeEvent);
					}
				}
			}

			handlersRef.current.onSwipeEnd?.();
		};

		const handleGestureCancel = () => {
			if (gestureState.current.isActive) {
				gestureState.current.isActive = false;
				gestureState.current.direction = null;
				if (rafHandle.current !== null) {
					cancelAnimationFrame(rafHandle.current);
					rafHandle.current = null;
				}
				handlersRef.current.onSwipeEnd?.();
			}
		};

		element.addEventListener("touchstart", handleGestureStart, {
			passive: false,
		});
		element.addEventListener("touchmove", handleGestureMove, {
			passive: false,
		});
		element.addEventListener("touchend", handleGestureEnd, { passive: true });
		element.addEventListener("touchcancel", handleGestureCancel, {
			passive: true,
		});

		const mouseCleanups: Array<() => void> = [];

		if (cfg.trackMouse) {
			element.addEventListener("mousedown", handleGestureStart, {
				passive: false,
			});

			const onMouseMove = (e: MouseEvent) => handleGestureMove(e);
			const onMouseUp = (e: MouseEvent) => handleGestureEnd(e);
			const onMouseLeave = () => handleGestureCancel();
			const onContextMenu = (e: MouseEvent) => {
				if (gestureState.current.isActive) e.preventDefault();
			};
			const onSelectStart = (e: Event) => {
				if (gestureState.current.isActive) e.preventDefault();
			};

			document.addEventListener("mousemove", onMouseMove, { passive: false });
			document.addEventListener("mouseup", onMouseUp, { passive: true });
			element.addEventListener("mouseleave", onMouseLeave, { passive: true });
			element.addEventListener("contextmenu", onContextMenu);
			element.addEventListener("selectstart", onSelectStart);

			mouseCleanups.push(
				() => document.removeEventListener("mousemove", onMouseMove),
				() => document.removeEventListener("mouseup", onMouseUp),
				() => element.removeEventListener("mouseleave", onMouseLeave),
				() => element.removeEventListener("contextmenu", onContextMenu),
				() => element.removeEventListener("selectstart", onSelectStart),
				() => element.removeEventListener("mousedown", handleGestureStart),
			);
		}

		cleanupRef.current = () => {
			element.removeEventListener("touchstart", handleGestureStart);
			element.removeEventListener("touchmove", handleGestureMove);
			element.removeEventListener("touchend", handleGestureEnd);
			element.removeEventListener("touchcancel", handleGestureCancel);
			mouseCleanups.forEach((fn) => fn());
			if (rafHandle.current !== null) {
				cancelAnimationFrame(rafHandle.current);
				rafHandle.current = null;
			}
			gestureState.current.isActive = false;
			gestureState.current.direction = null;
		};
	}, []);

	return refCallback;
}

export default useHorizontalSwipe;
