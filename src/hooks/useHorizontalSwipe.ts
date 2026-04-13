/**
 * Custom React hook for horizontal swipe detection
 * 
 * This hook provides comprehensive horizontal swipe gesture detection for React components.
 * It supports both touch and mouse events, configurable sensitivity settings, and proper
 * gesture lifecycle management.
 * 
 * @example
 * ```tsx
 * const swipeRef = useHorizontalSwipe({
 *   onSwipeLeft: () => console.log('Swiped left'),
 *   onSwipeRight: () => console.log('Swiped right'),
 *   threshold: 75,
 *   preventScrollOnSwipe: true
 * });
 * 
 * return <div ref={swipeRef}>Swipeable content</div>;
 * ```
 */

import { useRef, useCallback, useEffect } from 'react';
import {
  SwipeConfig,
  SwipeHandlers,
  SwipeDirection,
  SwipeEvent,
  SwipingEvent
} from '../types/swipe';
import {
  calculateVelocity,
  validateGesture,
  getSwipeDirection,
  normalizeEventCoordinates,
  isWithinVerticalTolerance,
  DEFAULT_SWIPE_CONFIG
} from './swipeUtils';

/**
 * Hook for detecting horizontal swipe gestures on any HTML element
 * 
 * @param handlers - Object containing swipe event callback functions
 * @param config - Optional configuration for swipe sensitivity and behavior
 * @returns Ref object to attach to the target HTML element
 */
export function useHorizontalSwipe(
  handlers: SwipeHandlers = {},
  config: SwipeConfig = {}
) {
  // Merge provided config with defaults
  const finalConfig = { ...DEFAULT_SWIPE_CONFIG, ...config };

  // Ref for the target element
  const elementRef = useRef<HTMLElement>(null);

  // Store handlers in a ref to avoid stale closures and prevent unnecessary effect re-runs
  const handlersRef = useRef<SwipeHandlers>(handlers);
  handlersRef.current = handlers;

  // Gesture state tracking
  const gestureState = useRef({
    isActive: false,
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0
  });

  // RAF handle for debouncing onSwiping callbacks
  const rafHandle = useRef<number | null>(null);

  // Handle gesture start (touch/mouse down)
  const handleGestureStart = useCallback((event: TouchEvent | MouseEvent) => {
    // Ignore if gesture is already active
    if (gestureState.current.isActive) return;

    // Ignore multi-touch gestures (Task 6.2: multi-touch handling)
    if ('touches' in event && event.touches.length > 1) return;

    const coords = normalizeEventCoordinates(event);
    const now = Date.now();

    gestureState.current = {
      isActive: true,
      startX: coords.x,
      startY: coords.y,
      startTime: now,
      currentX: coords.x,
      currentY: coords.y
    };

    // Call onSwipeStart callback
    handlersRef.current.onSwipeStart?.();

    // Prevent default on mouse events to avoid text selection (Task 6.2)
    if ('button' in event && finalConfig.trackMouse) {
      event.preventDefault();
    }
  }, [finalConfig.trackMouse]);

  // Handle gesture move (touch/mouse move)
  const handleGestureMove = useCallback((event: TouchEvent | MouseEvent) => {
    if (!gestureState.current.isActive) return;

    const coords = normalizeEventCoordinates(event);
    const deltaX = coords.x - gestureState.current.startX;
    const deltaY = coords.y - gestureState.current.startY;

    // Check if vertical movement exceeds tolerance
    if (!isWithinVerticalTolerance(deltaY, finalConfig.delta)) {
      // Cancel gesture due to excessive vertical movement
      gestureState.current.isActive = false;
      // Cancel any pending RAF
      if (rafHandle.current !== null) {
        cancelAnimationFrame(rafHandle.current);
        rafHandle.current = null;
      }
      handlersRef.current.onSwipeEnd?.();
      return;
    }

    // Update current position
    gestureState.current.currentX = coords.x;
    gestureState.current.currentY = coords.y;

    // Prevent scroll if configured
    if (finalConfig.preventScrollOnSwipe && Math.abs(deltaX) > Math.abs(deltaY)) {
      event.preventDefault();
    }

    // Debounce onSwiping via requestAnimationFrame (Task 6.1)
    if (handlersRef.current.onSwiping) {
      if (rafHandle.current !== null) {
        cancelAnimationFrame(rafHandle.current);
      }
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
          startTime: capturedStartTime
        };
        handlersRef.current.onSwiping?.(swipingEvent);
      });
    }
  }, [finalConfig.delta, finalConfig.preventScrollOnSwipe]);

  // Handle gesture end (touch/mouse up)
  const handleGestureEnd = useCallback((event: TouchEvent | MouseEvent) => {
    if (!gestureState.current.isActive) return;

    // Cancel any pending RAF on gesture end
    if (rafHandle.current !== null) {
      cancelAnimationFrame(rafHandle.current);
      rafHandle.current = null;
    }

    const coords = normalizeEventCoordinates(event);
    const deltaX = coords.x - gestureState.current.startX;
    const deltaY = coords.y - gestureState.current.startY;
    const duration = Date.now() - gestureState.current.startTime;
    const distance = Math.abs(deltaX);
    const velocity = calculateVelocity(distance, duration);

    // Reset gesture state
    gestureState.current.isActive = false;

    // Check if gesture meets validation criteria
    if (
      isWithinVerticalTolerance(deltaY, finalConfig.delta) &&
      validateGesture(deltaX, velocity, finalConfig.threshold, finalConfig.velocityThreshold)
    ) {
      const direction = getSwipeDirection(deltaX);

      if (direction) {
        const swipeEvent: SwipeEvent = {
          direction,
          distance,
          velocity,
          duration
        };

        if (direction === SwipeDirection.LEFT) {
          handlersRef.current.onSwipeLeft?.(swipeEvent);
        } else if (direction === SwipeDirection.RIGHT) {
          handlersRef.current.onSwipeRight?.(swipeEvent);
        }
      }
    }

    handlersRef.current.onSwipeEnd?.();
  }, [
    finalConfig.threshold,
    finalConfig.velocityThreshold,
    finalConfig.delta
  ]);

  // Handle gesture cancel (touch cancel or mouse leave)
  const handleGestureCancel = useCallback(() => {
    if (gestureState.current.isActive) {
      gestureState.current.isActive = false;
      if (rafHandle.current !== null) {
        cancelAnimationFrame(rafHandle.current);
        rafHandle.current = null;
      }
      handlersRef.current.onSwipeEnd?.();
    }
  }, []);

  // Set up event listeners when element is attached
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Task 6.1: touchstart only needs to be non-passive when preventScrollOnSwipe is true,
    // since we only call preventDefault in touchmove. Using passive: true here improves scroll performance.
    const touchStartOptions = { passive: !finalConfig.preventScrollOnSwipe };
    const touchMoveOptions = { passive: !finalConfig.preventScrollOnSwipe };
    const touchEndOptions = { passive: true };

    element.addEventListener('touchstart', handleGestureStart, touchStartOptions);
    element.addEventListener('touchmove', handleGestureMove, touchMoveOptions);
    element.addEventListener('touchend', handleGestureEnd, touchEndOptions);
    element.addEventListener('touchcancel', handleGestureCancel, touchEndOptions);

    // Mouse event listeners (if enabled)
    let mouseEventListeners: (() => void)[] = [];

    if (finalConfig.trackMouse) {
      const mouseStartOptions = { passive: false };
      const mouseMoveOptions = { passive: !finalConfig.preventScrollOnSwipe };
      const mouseEndOptions = { passive: true };

      element.addEventListener('mousedown', handleGestureStart, mouseStartOptions);

      const handleMouseMove = (e: MouseEvent) => handleGestureMove(e);
      const handleMouseUp = (e: MouseEvent) => handleGestureEnd(e);
      const handleMouseLeave = () => handleGestureCancel();

      // Task 6.2: Prevent context menu during mouse swipes
      const handleContextMenu = (e: MouseEvent) => {
        if (gestureState.current.isActive) {
          e.preventDefault();
        }
      };

      // Task 6.2: Prevent text selection during mouse swipes
      const handleSelectStart = (e: Event) => {
        if (gestureState.current.isActive) {
          e.preventDefault();
        }
      };

      document.addEventListener('mousemove', handleMouseMove, mouseMoveOptions);
      document.addEventListener('mouseup', handleMouseUp, mouseEndOptions);
      element.addEventListener('mouseleave', handleMouseLeave, mouseEndOptions);
      element.addEventListener('contextmenu', handleContextMenu);
      element.addEventListener('selectstart', handleSelectStart);

      mouseEventListeners = [
        () => document.removeEventListener('mousemove', handleMouseMove),
        () => document.removeEventListener('mouseup', handleMouseUp),
        () => element.removeEventListener('mouseleave', handleMouseLeave),
        () => element.removeEventListener('contextmenu', handleContextMenu),
        () => element.removeEventListener('selectstart', handleSelectStart)
      ];
    }

    // Cleanup function
    return () => {
      element.removeEventListener('touchstart', handleGestureStart);
      element.removeEventListener('touchmove', handleGestureMove);
      element.removeEventListener('touchend', handleGestureEnd);
      element.removeEventListener('touchcancel', handleGestureCancel);

      if (finalConfig.trackMouse) {
        element.removeEventListener('mousedown', handleGestureStart);
        mouseEventListeners.forEach(cleanup => cleanup());
      }

      // Cancel any pending RAF on cleanup
      if (rafHandle.current !== null) {
        cancelAnimationFrame(rafHandle.current);
        rafHandle.current = null;
      }

      gestureState.current.isActive = false;
    };
  }, [
    handleGestureStart,
    handleGestureMove,
    handleGestureEnd,
    handleGestureCancel,
    finalConfig.trackMouse,
    finalConfig.preventScrollOnSwipe
  ]);

  return elementRef;
}

export default useHorizontalSwipe;
