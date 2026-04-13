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

import React, { forwardRef, JSX } from 'react';
import { useHorizontalSwipe } from '../hooks/useHorizontalSwipe';
import { SwipeConfig, SwipeHandlers } from '../types/swipe';

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
export interface SwipeableContainerProps extends SwipeHandlers, SwipeConfig {
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
      style,
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
      ...otherProps
    },
    forwardedRef
  ) => {
    // Extract swipe handlers
    const handlers: SwipeHandlers = {
      onSwipeStart,
      onSwipeEnd,
      onSwipeLeft,
      onSwipeRight,
      onSwiping
    };

    // Extract swipe configuration
    const config: SwipeConfig = {
      threshold,
      velocityThreshold,
      delta,
      preventScrollOnSwipe,
      trackMouse
    };

    // Get the swipe ref from the hook
    const swipeRef = useHorizontalSwipe(handlers, config);

    // Combine refs if forwardedRef is provided
    const combinedRef = React.useCallback(
      (element: HTMLElement | null) => {
        // Set the swipe ref
        if (swipeRef.current !== element) {
          (swipeRef as React.MutableRefObject<HTMLElement | null>).current = element;
        }
        
        // Forward the ref if provided
        if (forwardedRef) {
          if (typeof forwardedRef === 'function') {
            forwardedRef(element);
          } else {
            forwardedRef.current = element;
          }
        }
      },
      [swipeRef, forwardedRef]
    );

    return React.createElement(
      Component,
      {
        ref: combinedRef,
        className,
        style,
        ...otherProps
      },
      children
    );
  }
);

SwipeableContainer.displayName = 'SwipeableContainer';

export default SwipeableContainer;