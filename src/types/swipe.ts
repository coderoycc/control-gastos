/**
 * TypeScript interfaces, enums, and callback types for the horizontal swipe detection system.
 *
 * @module swipe
 */

/**
 * Enum representing swipe directions
 */
export enum SwipeDirection {
  LEFT = 'left',
  RIGHT = 'right'
}

/**
 * Interface for completed swipe event data
 */
export interface SwipeEvent {
  /** Direction of the swipe gesture */
  direction: SwipeDirection;
  /** Total distance of the swipe in pixels */
  distance: number;
  /** Velocity of the swipe in pixels per millisecond */
  velocity: number;
  /** Duration of the swipe gesture in milliseconds */
  duration: number;
}

/**
 * Interface for real-time swiping event data during gesture
 */
export interface SwipingEvent {
  /** Current X coordinate of the gesture */
  currentX: number;
  /** Change in X coordinate from start position */
  deltaX: number;
  /** Current direction of the gesture */
  direction: SwipeDirection | null;
  /** Timestamp when the gesture started */
  startTime: number;
}

/**
 * Configuration options for swipe detection
 */
export interface SwipeConfig {
  /** Minimum distance in pixels to register as a swipe (default: 50) */
  threshold?: number;
  /** Minimum velocity in pixels/ms to register as a swipe (default: 0.3) */
  velocityThreshold?: number;
  /** Maximum vertical movement allowed in pixels (default: 10) */
  delta?: number;
  /** Whether to prevent default scroll behavior during swipes (default: false) */
  preventScrollOnSwipe?: boolean;
  /** Whether to track mouse events in addition to touch events (default: false) */
  trackMouse?: boolean;
}

/**
 * Callback function type for swipe start events
 */
export type SwipeStartCallback = () => void;

/**
 * Callback function type for swipe end events
 */
export type SwipeEndCallback = () => void;

/**
 * Callback function type for completed swipe events
 */
export type SwipeCallback = (event: SwipeEvent) => void;

/**
 * Callback function type for real-time swiping events
 */
export type SwipingCallback = (event: SwipingEvent) => void;

/**
 * Complete set of swipe event handlers
 */
export interface SwipeHandlers {
  /** Called when a swipe gesture starts */
  onSwipeStart?: SwipeStartCallback;
  /** Called when a swipe gesture ends (completed or canceled) */
  onSwipeEnd?: SwipeEndCallback;
  /** Called when a leftward swipe completes successfully */
  onSwipeLeft?: SwipeCallback;
  /** Called when a rightward swipe completes successfully */
  onSwipeRight?: SwipeCallback;
  /** Called continuously during an active swipe gesture */
  onSwiping?: SwipingCallback;
}