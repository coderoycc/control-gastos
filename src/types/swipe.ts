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
  /**
   * Minimum horizontal distance in pixels to register as a completed swipe.
   * @default 40
   */
  threshold?: number;
  /**
   * Minimum velocity in pixels/ms to validate the swipe.
   * @default 0.3
   */
  velocityThreshold?: number;
  /**
   * Minimum movement (px) required in any axis before deciding intent.
   * Prevents reacting to micro-movements during a tap.
   * @default 15
   */
  lockThreshold?: number;
  /**
   * Whether to track mouse pointer events in addition to touch/stylus.
   * @default true
   */
  trackMouse?: boolean;
  /**
   * @deprecated Use lockThreshold instead. Kept for backward compatibility.
   */
  delta?: number;
  /**
   * @deprecated No longer needed; scroll prevention is automatic.
   */
  preventScrollOnSwipe?: boolean;
}

/**
 * Configuration for swipe animations
 */
export interface SwipeAnimationConfig {
  /** Activates or deactivates the animation — default: false */
  animated?: boolean;
  /** Type of animation — default: 'slide' */
  animationType?: 'slide' | 'fade' | 'slide-fade';
  /** Duration in ms — default: 300 */
  animationDuration?: number;
  /** Easing CSS — default: 'ease-out' */
  animationEasing?: string;
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
 * Callback function type for tap events
 */
export type TapCallback = () => void;

/**
 * Complete set of swipe event handlers
 */
export interface SwipeHandlers {
  /** Called when a swipe gesture starts (after SWIPE_CONFIRMED) */
  onSwipeStart?: SwipeStartCallback;
  /** Called when a swipe gesture ends (completed or canceled) */
  onSwipeEnd?: SwipeEndCallback;
  /** Called when a leftward swipe completes successfully */
  onSwipeLeft?: SwipeCallback;
  /** Called when a rightward swipe completes successfully */
  onSwipeRight?: SwipeCallback;
  /** Called continuously during an active swipe gesture */
  onSwiping?: SwipingCallback;
  /**
   * Called when the interaction is determined to be a tap
   * (distance < 10px and duration < 300ms).
   */
  onTap?: TapCallback;
}
