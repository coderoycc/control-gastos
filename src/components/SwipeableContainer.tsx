/**
 * SwipeableContainer - A wrapper component that adds horizontal swipe detection to any content
 *
 * This component provides an easy way to add swipe functionality without manually managing refs.
 * It internally uses the useHorizontalSwipe hook and forwards all swipe events to parent components.
 *
 * @example
 * ```tsx
 * <SwipeableContainer
 *   onSwipeLeft={() => console.log('Swiped left')}
 *   onSwipeRight={() => console.log('Swiped right')}
 *   threshold={75}
 *   className="my-swipeable-area"
 * >
 *   <div>Content that can be swiped</div>
 * </SwipeableContainer>
 * ```
 */

import React, { forwardRef, JSX, useState, useEffect, useRef } from 'react';
import { useHorizontalSwipe } from '../hooks/useHorizontalSwipe';
import { SwipeConfig, SwipeHandlers, SwipeAnimationConfig } from '../types/swipe';

/**
 * Props for the SwipeableContainer component.
 *
 * Extends both {@link SwipeHandlers} and {@link SwipeConfig} so all swipe
 * callbacks and configuration options can be passed directly as props.
 *
 * @example
 * ```tsx
 * <SwipeableContainer
 *   onSwipeLeft={() => goToPrevious()}
 *   onSwipeRight={() => goToNext()}
 *   threshold={75}
 *   preventScrollOnSwipe
 *   className="swipe-area"
 * >
 *   <MyContent />
 * </SwipeableContainer>
 * ```
 */
export interface SwipeableContainerProps extends SwipeHandlers, SwipeConfig, SwipeAnimationConfig {
  /** Child elements to render inside the swipeable container */
  children: React.ReactNode;
  /** Optional CSS class name for the container element */
  className?: string;
  /** Optional inline styles for the container element */
  style?: React.CSSProperties;
  /** HTML element type to render as the container (default: 'div') */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * A wrapper component that applies horizontal swipe detection to its children
 *
 * @param props - Component props including swipe handlers, config, and container props
 * @param ref - Optional ref to forward to the container element
 */
export const SwipeableContainer = forwardRef<HTMLElement, SwipeableContainerProps>(
  (
    {
      children,
      className,
      style: externalStyle,
      as: Component = 'div',
      onSwipeStart,
      onSwipeEnd,
      onSwipeLeft,
      onSwipeRight,
      onSwiping,
      threshold,
      velocityThreshold,
      delta,
      preventScrollOnSwipe,
      trackMouse,
      animated = false,
      animationType = 'slide',
      animationDuration = 300,
      animationEasing = 'ease-out',
      ...otherProps
    },
    forwardedRef
  ) => {
    // Animation state
    const [animationState, setAnimationState] = useState<{
      isAnimating: boolean;
      direction: 'left' | 'right' | null;
    }>({
      isAnimating: false,
      direction: null
    });

    const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Reset animation when children change (content update after swipe)
    useEffect(() => {
      if (animationState.isAnimating) {
        setAnimationState({ isAnimating: false, direction: null });
        if (animationTimerRef.current) {
          clearTimeout(animationTimerRef.current);
        }
      }
    }, [children]);

    // Handle swipe with animation
    const handleSwipeLeft = (event: { direction: string; distance: number; velocity: number; duration: number }) => {
      onSwipeLeft?.(event as never);
      if (animated) {
        setAnimationState({ isAnimating: true, direction: 'left' });
        animationTimerRef.current = setTimeout(() => {
          setAnimationState({ isAnimating: false, direction: null });
        }, animationDuration);
      }
    };

    const handleSwipeRight = (event: { direction: string; distance: number; velocity: number; duration: number }) => {
      onSwipeRight?.(event as never);
      if (animated) {
        setAnimationState({ isAnimating: true, direction: 'right' });
        animationTimerRef.current = setTimeout(() => {
          setAnimationState({ isAnimating: false, direction: null });
        }, animationDuration);
      }
    };

    // Cleanup timer on unmount
    useEffect(() => {
      return () => {
        if (animationTimerRef.current) {
          clearTimeout(animationTimerRef.current);
        }
      };
    }, []);

    // Build animation style for the inner content wrapper
    const getAnimationStyle = (): React.CSSProperties => {
      if (!animated || !animationState.isAnimating) {
        return {};
      }

      if (animationType === 'slide') {
        return {
          transform: animationState.direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)',
          opacity: 1
        };
      } else if (animationType === 'fade') {
        return {
          opacity: 0
        };
      } else if (animationType === 'slide-fade') {
        return {
          transform: animationState.direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)',
          opacity: 0
        };
      }
      return {};
    };

    // Get transition string
    const getTransition = (): string | undefined => {
      if (!animated) return undefined;
      return `transform ${animationDuration}ms ${animationEasing}, opacity ${animationDuration}ms ${animationEasing}`;
    };

    const animationStyle = getAnimationStyle();
    const transition = getTransition();

    // Merge styles for outer container
    const mergedStyle: React.CSSProperties = {
      overflowX: 'hidden',
      overflowY: 'auto',
      touchAction: 'pan-y',
      ...externalStyle
    };

    // Extract handlers to pass to hook
    const swipeHandlersWithAnimation: SwipeHandlers = {
      onSwipeStart,
      onSwipeEnd,
      onSwiping,
      onSwipeLeft: handleSwipeLeft,
      onSwipeRight: handleSwipeRight
    };

    // Get the swipe ref from the hook with animation handlers
    const swipeRef = useHorizontalSwipe(swipeHandlersWithAnimation, {
      threshold,
      velocityThreshold,
      delta,
      preventScrollOnSwipe,
      trackMouse
    });

    // Combine refs if forwardedRef is provided
    const combinedRef = React.useCallback(
      (element: HTMLElement | null) => {
        swipeRef(element);
        if (forwardedRef) {
          if (typeof forwardedRef === 'function') {
            forwardedRef(element);
          } else {
            (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = element;
          }
        }
      },
      [swipeRef, forwardedRef]
    );

    const innerStyle: React.CSSProperties = {
      transition: transition,
      willChange: animated ? 'transform, opacity' : undefined,
      ...animationStyle
    };

    return React.createElement(
      Component,
      {
        ref: combinedRef,
        className,
        style: mergedStyle,
        ...otherProps
      },
      React.createElement('div', { style: innerStyle }, children)
    );
  }
);

SwipeableContainer.displayName = 'SwipeableContainer';

export default SwipeableContainer;
