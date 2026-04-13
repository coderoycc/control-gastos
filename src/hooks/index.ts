/**
 * Main exports for the horizontal swipe detection system.
 *
 * @example
 * ```tsx
 * import { useHorizontalSwipe } from './hooks';
 *
 * const ref = useHorizontalSwipe({
 *   onSwipeLeft: () => console.log('left'),
 *   onSwipeRight: () => console.log('right'),
 * });
 * return <div ref={ref}>Swipe me</div>;
 * ```
 */

export { useHorizontalSwipe } from './useHorizontalSwipe';
export * from './swipeUtils';
export * from '../types/swipe';