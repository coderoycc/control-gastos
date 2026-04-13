/**
 * Utility functions for swipe gesture calculations and validation
 */

import { SwipeDirection, SwipeConfig } from '../types/swipe';

/**
 * Default configuration values for swipe detection
 */
export const DEFAULT_SWIPE_CONFIG: Required<SwipeConfig> = {
  threshold: 50,
  velocityThreshold: 0.3,
  delta: 10,
  preventScrollOnSwipe: false,
  trackMouse: false
};

/**
 * Calculates the velocity of a gesture in pixels per millisecond
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
 * Validates if a gesture meets the minimum requirements for a swipe
 * 
 * @param distance - Horizontal distance traveled
 * @param velocity - Gesture velocity in pixels/ms
 * @param threshold - Minimum distance threshold
 * @param velocityThreshold - Minimum velocity threshold
 * @returns True if gesture is valid for swipe completion
 */
export function validateGesture(
  distance: number,
  velocity: number,
  threshold: number,
  velocityThreshold: number
): boolean {
  return Math.abs(distance) >= threshold || velocity >= velocityThreshold;
}

/**
 * Determines swipe direction based on horizontal movement
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
 * Normalizes touch and mouse event coordinates to a consistent format
 * 
 * @param event - Touch or mouse event
 * @returns Object with x and y coordinates
 */
export function normalizeEventCoordinates(
  event: TouchEvent | MouseEvent
): { x: number; y: number } {
  if ('touches' in event) {
    // Touch event - use first touch point
    const touch = event.touches[0] || event.changedTouches[0];
    return { x: touch.clientX, y: touch.clientY };
  } else {
    // Mouse event
    return { x: event.clientX, y: event.clientY };
  }
}

/**
 * Checks if vertical movement exceeds the allowed tolerance
 * 
 * @param deltaY - Change in Y coordinate
 * @param delta - Maximum allowed vertical movement
 * @returns True if vertical movement is within tolerance
 */
export function isWithinVerticalTolerance(deltaY: number, delta: number): boolean {
  return Math.abs(deltaY) <= delta;
}