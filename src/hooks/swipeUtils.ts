import { SwipeDirection, SwipeConfig } from "../types/swipe";

/**
 * Default configuration aligned with the new Pointer Events architecture.
 */
export const DEFAULT_SWIPE_CONFIG: Required<
	Pick<SwipeConfig, "threshold" | "velocityThreshold" | "lockThreshold" | "trackMouse">
> = {
	threshold: 40,
	lockThreshold: 15,
	velocityThreshold: 0.3,
	trackMouse: true,
};

/**
 * Calculates the velocity of a gesture in pixels per millisecond.
 *
 * @param distance - Total distance traveled in pixels
 * @param duration - Time duration in milliseconds
 * @returns Velocity in pixels per millisecond
 */
export function calculateVelocity(distance: number, duration: number): number {
	if (duration <= 0) return 0;
	return Math.abs(distance) / duration;
}

/**
 * Validates if a gesture meets the minimum requirements for a completed swipe.
 *
 * @param distance  - Absolute horizontal distance traveled
 * @param velocity  - Gesture velocity in pixels/ms
 * @param threshold - Minimum distance threshold
 * @param velocityThreshold - Minimum velocity threshold
 * @returns True if the gesture qualifies as a valid swipe
 */
export function validateGesture(
	distance: number,
	velocity: number,
	threshold: number,
	velocityThreshold: number,
): boolean {
	return Math.abs(distance) >= threshold && velocity >= velocityThreshold;
}

/**
 * Determines the swipe direction based on horizontal movement.
 *
 * @param deltaX - Change in X coordinate (positive = right, negative = left)
 * @returns SwipeDirection or null if no clear direction
 */
export function getSwipeDirection(deltaX: number): SwipeDirection | null {
	if (deltaX > 0) return SwipeDirection.RIGHT;
	if (deltaX < 0) return SwipeDirection.LEFT;
	return null;
}

/**
 * CSS selector string for all interactive elements that should not
 * trigger swipe detection when touched/clicked.
 */
export const INTERACTIVE_SELECTOR =
	"input, textarea, select, button, a, [contenteditable]";
