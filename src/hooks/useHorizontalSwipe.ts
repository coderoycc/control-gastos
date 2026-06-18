/**
 * useHorizontalSwipe
 *
 * Custom React hook for horizontal swipe detection.
 *
 * Architecture:
 *   - Uses a finite state machine (IDLE → PENDING → SWIPE_CONFIRMED) to track
 *     gesture progression with clear semantics at each stage.
 *   - Touch detection uses the Touch Events API (touchstart / touchmove /
 *     touchend / touchcancel) with { passive: false } so preventDefault() can
 *     be called to suppress native horizontal gesture handling.
 *   - Mouse tracking uses Mouse Events on the document level so the gesture
 *     continues even when the pointer leaves the element.
 *   - Never calls preventDefault() until a horizontal gesture is confirmed,
 *     so inputs, focus, selection and native clicks are never disrupted.
 *   - Detects taps (distance < 10px && duration < 300ms) and fires onTap.
 *
 * @example
 * ```tsx
 * const swipeRef = useHorizontalSwipe(
 *   {
 *     onSwipeLeft:  () => console.log('left'),
 *     onSwipeRight: () => console.log('right'),
 *     onTap:        () => console.log('tap'),
 *   },
 *   { threshold: 40, lockThreshold: 15, velocityThreshold: 0.3 }
 * );
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
	DEFAULT_SWIPE_CONFIG,
} from "./swipeUtils";

// ---------------------------------------------------------------------------
// Finite State Machine
// ---------------------------------------------------------------------------

/**
 * Represents the three possible states of a gesture.
 *
 * IDLE            – No active interaction.
 * PENDING         – touch/mousedown received; intent not yet determined.
 * SWIPE_CONFIRMED – Movement is unambiguously horizontal; swipe is in progress.
 */
const enum GestureState {
	IDLE,
	PENDING,
	SWIPE_CONFIRMED,
}

// ---------------------------------------------------------------------------
// Internal gesture tracking shape
// ---------------------------------------------------------------------------

interface GestureData {
	state: GestureState;
	startX: number;
	startY: number;
	startTime: number;
	currentX: number;
	currentY: number;
}

const INITIAL_GESTURE: GestureData = {
	state: GestureState.IDLE,
	startX: 0,
	startY: 0,
	startTime: 0,
	currentX: 0,
	currentY: 0,
};

// ---------------------------------------------------------------------------
// Tap detection constants
// ---------------------------------------------------------------------------

const TAP_MAX_DISTANCE_PX = 10;
const TAP_MAX_DURATION_MS = 300;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCoordinates(event: TouchEvent | MouseEvent): { x: number; y: number } {
	if ("touches" in event && event.touches.length > 0) {
		return { x: event.touches[0].clientX, y: event.touches[0].clientY };
	}
	if ("changedTouches" in event && event.changedTouches.length > 0) {
		return { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
	}
	return { x: (event as MouseEvent).clientX, y: (event as MouseEvent).clientY };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook for detecting horizontal swipe gestures on any HTML element.
 * Returns a ref-callback to attach to the target element.
 *
 * @param handlers - Swipe and tap event callbacks
 * @param config   - Optional configuration (threshold, lockThreshold, velocityThreshold, trackMouse)
 * @returns        A ref-callback to assign to the target element via `ref`
 */
export function useHorizontalSwipe(
	handlers: SwipeHandlers = {},
	config: SwipeConfig = {},
) {
	// Merge provided config with defaults.
	// Filter out undefined values so they don't overwrite defaults.
	const defined = Object.fromEntries(
		Object.entries(config).filter(([, v]) => v !== undefined),
	) as Partial<SwipeConfig>;

	const cfg = {
		...DEFAULT_SWIPE_CONFIG,
		// Back-compat: delta was the old name for lockThreshold
		...(defined.delta !== undefined && defined.lockThreshold === undefined
			? { lockThreshold: defined.delta }
			: {}),
		...defined,
	};

	// Keep handlers up-to-date without re-registering event listeners
	const handlersRef = useRef<SwipeHandlers>(handlers);
	handlersRef.current = handlers;

	// Keep config up-to-date without re-registering event listeners
	const cfgRef = useRef(cfg);
	cfgRef.current = cfg;

	// Gesture state machine (single mutable ref, never triggers re-renders)
	const gesture = useRef<GestureData>({ ...INITIAL_GESTURE });

	// requestAnimationFrame handle for onSwiping throttling
	const rafHandle = useRef<number | null>(null);

	// Cleanup function stored so the ref-callback can remove listeners on unmount
	const cleanupRef = useRef<(() => void) | null>(null);

	// -------------------------------------------------------------------------
	// Ref callback
	// -------------------------------------------------------------------------

	const refCallback = useCallback((element: HTMLElement | null) => {
		// Always clean up previous listeners first
		if (cleanupRef.current) {
			cleanupRef.current();
			cleanupRef.current = null;
		}

		if (!element) return;

		// -------------------------------------------------------------------
		// Helpers
		// -------------------------------------------------------------------

		function resetGesture() {
			if (rafHandle.current !== null) {
				cancelAnimationFrame(rafHandle.current);
				rafHandle.current = null;
			}
			gesture.current = { ...INITIAL_GESTURE };
		}

		function cancelGesture() {
			if (gesture.current.state === GestureState.SWIPE_CONFIRMED) {
				handlersRef.current.onSwipeEnd?.();
			}
			resetGesture();
		}

		// -------------------------------------------------------------------
		// Shared gesture handlers (work for both touch and mouse)
		// -------------------------------------------------------------------

		function handleGestureStart(event: TouchEvent | MouseEvent) {
			// Ignore multi-touch
			if ("touches" in event && event.touches.length > 1) return;

			// Ignore if a gesture is already in progress
			if (gesture.current.state !== GestureState.IDLE) return;

			// For mouse, only respond to left button
			if ("button" in event && event.button !== 0) return;

			const coords = getCoordinates(event);

			gesture.current = {
				state: GestureState.PENDING,
				startX: coords.x,
				startY: coords.y,
				startTime: Date.now(),
				currentX: coords.x,
				currentY: coords.y,
			};
		}

		function handleGestureMove(event: TouchEvent | MouseEvent) {
			if (gesture.current.state === GestureState.IDLE) return;

			const coords = getCoordinates(event);
			const deltaX = coords.x - gesture.current.startX;
			const deltaY = coords.y - gesture.current.startY;
			const absX = Math.abs(deltaX);
			const absY = Math.abs(deltaY);
			const { lockThreshold, threshold } = cfgRef.current;

			// ----------------------------------------------------------------
			// PENDING state: determine intent
			// ----------------------------------------------------------------
			if (gesture.current.state === GestureState.PENDING) {
				// Wait until movement exceeds lockThreshold in any axis
				if (absX < lockThreshold && absY < lockThreshold) return;

				// Vertical intent → cancel; let native scroll proceed
				if (absY > absX * 1.5) {
					resetGesture();
					return;
				}

				// Indeterminate → keep waiting
				if (absX <= absY * 1.5) return;

				// Horizontal intent detected. Only confirm once threshold is reached.
				if (absX >= threshold) {
					gesture.current.state = GestureState.SWIPE_CONFIRMED;
					handlersRef.current.onSwipeStart?.();
				}
				// Still below threshold: keep state as PENDING and track position
				gesture.current.currentX = coords.x;
				gesture.current.currentY = coords.y;

				// Prevent native scroll once horizontal intent is clear
				if (event.cancelable) {
					event.preventDefault();
				}
				return;
			}

			// ----------------------------------------------------------------
			// SWIPE_CONFIRMED state: track movement and fire onSwiping via RAF
			// ----------------------------------------------------------------
			if (gesture.current.state === GestureState.SWIPE_CONFIRMED) {
				gesture.current.currentX = coords.x;
				gesture.current.currentY = coords.y;

				// Prevent native scroll now that a real swipe is confirmed
				if (event.cancelable) {
					event.preventDefault();
				}

				if (handlersRef.current.onSwiping) {
					if (rafHandle.current !== null)
						cancelAnimationFrame(rafHandle.current);

					const capturedX = coords.x;
					const capturedDeltaX = deltaX;
					const capturedStartTime = gesture.current.startTime;

					rafHandle.current = requestAnimationFrame(() => {
						rafHandle.current = null;
						if (gesture.current.state !== GestureState.SWIPE_CONFIRMED) return;
						const swipingEvent: SwipingEvent = {
							currentX: capturedX,
							deltaX: capturedDeltaX,
							direction: getSwipeDirection(capturedDeltaX),
							startTime: capturedStartTime,
						};
						handlersRef.current.onSwiping?.(swipingEvent);
					});
				}
			}
		}

		function handleGestureEnd(event: TouchEvent | MouseEvent) {
			if (gesture.current.state === GestureState.IDLE) return;

			if (rafHandle.current !== null) {
				cancelAnimationFrame(rafHandle.current);
				rafHandle.current = null;
			}

			const coords = getCoordinates(event);
			const { startX, startTime, state } = gesture.current;
			const deltaX = coords.x - startX;
			const distance = Math.abs(deltaX);
			const duration = Date.now() - startTime;
			const velocity = calculateVelocity(distance, duration);
			const currentState = state;

			// Reset before firing callbacks so handlers see clean state
			resetGesture();

			if (currentState === GestureState.SWIPE_CONFIRMED) {
				// Validate and dispatch swipe
				if (
					validateGesture(
						distance,
						velocity,
						cfgRef.current.threshold,
						cfgRef.current.velocityThreshold,
					)
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
						} else {
							handlersRef.current.onSwipeRight?.(swipeEvent);
						}
					}
				}
				handlersRef.current.onSwipeEnd?.();
			} else if (currentState === GestureState.PENDING) {
				// The gesture never confirmed as a swipe → check for tap
				if (distance < TAP_MAX_DISTANCE_PX && duration < TAP_MAX_DURATION_MS) {
					handlersRef.current.onTap?.();
				}
			}
		}

		// -------------------------------------------------------------------
		// Register listeners
		// -------------------------------------------------------------------

		// Touch events on the element (bubbles from children)
		element.addEventListener("touchstart", handleGestureStart, { passive: false });
		element.addEventListener("touchmove", handleGestureMove, { passive: false });
		element.addEventListener("touchend", handleGestureEnd, { passive: true });
		element.addEventListener("touchcancel", handleGestureEnd, { passive: true });

		// Mouse events: mousedown on element, move/up on document
		// so we track the gesture even when the pointer leaves the element
		const mouseCleanups: Array<() => void> = [];

		if (cfg.trackMouse) {
			element.addEventListener("mousedown", handleGestureStart);

			const onMouseMove = (e: MouseEvent) => handleGestureMove(e);
			const onMouseUp = (e: MouseEvent) => handleGestureEnd(e);
			const onMouseLeave = () => cancelGesture();

			document.addEventListener("mousemove", onMouseMove, { passive: false });
			document.addEventListener("mouseup", onMouseUp, { passive: true });
			element.addEventListener("mouseleave", onMouseLeave);

			mouseCleanups.push(
				() => element.removeEventListener("mousedown", handleGestureStart),
				() => document.removeEventListener("mousemove", onMouseMove),
				() => document.removeEventListener("mouseup", onMouseUp),
				() => element.removeEventListener("mouseleave", onMouseLeave),
			);
		}

		// -------------------------------------------------------------------
		// Cleanup
		// -------------------------------------------------------------------

		cleanupRef.current = () => {
			element.removeEventListener("touchstart", handleGestureStart);
			element.removeEventListener("touchmove", handleGestureMove);
			element.removeEventListener("touchend", handleGestureEnd);
			element.removeEventListener("touchcancel", handleGestureEnd);

			mouseCleanups.forEach((fn) => fn());

			if (rafHandle.current !== null) {
				cancelAnimationFrame(rafHandle.current);
				rafHandle.current = null;
			}

			resetGesture();
		};
	}, []);

	return refCallback;
}

export default useHorizontalSwipe;
