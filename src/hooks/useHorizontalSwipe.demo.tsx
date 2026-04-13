/**
 * Demo component showing useHorizontalSwipe hook usage
 * This demonstrates the three main subtasks of task 3
 */

import React, { useState } from 'react';
import { useHorizontalSwipe } from './useHorizontalSwipe';
import { SwipeEvent, SwipingEvent } from '../types/swipe';

export function SwipeDemo() {
  const [lastSwipe, setLastSwipe] = useState<string>('None');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [swipeData, setSwipeData] = useState<SwipeEvent | null>(null);
  const [currentSwiping, setCurrentSwiping] = useState<SwipingEvent | null>(null);

  // Task 3.3: Implement callback system and event handling
  const swipeRef = useHorizontalSwipe(
    {
      // Task 3.3: onSwipeLeft and onSwipeRight callback invocation
      onSwipeLeft: (event: SwipeEvent) => {
        setLastSwipe('Left');
        setSwipeData(event);
        console.log('Swiped Left:', event);
      },
      onSwipeRight: (event: SwipeEvent) => {
        setLastSwipe('Right');
        setSwipeData(event);
        console.log('Swiped Right:', event);
      },
      
      // Task 3.3: onSwipeStart and onSwipeEnd lifecycle callbacks
      onSwipeStart: () => {
        setIsActive(true);
        setCurrentSwiping(null);
        console.log('Swipe started');
      },
      onSwipeEnd: () => {
        setIsActive(false);
        setCurrentSwiping(null);
        console.log('Swipe ended');
      },
      
      // Task 3.3: onSwiping real-time gesture updates
      onSwiping: (event: SwipingEvent) => {
        setCurrentSwiping(event);
        console.log('Swiping:', event);
      }
    },
    {
      // Task 3.2: Configurable thresholds and settings
      threshold: 50,           // Minimum distance for swipe
      velocityThreshold: 0.3,  // Minimum velocity for swipe
      delta: 10,               // Vertical movement tolerance
      preventScrollOnSwipe: true,  // Prevent scroll during swipe
      trackMouse: true         // Enable mouse events
    }
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>useHorizontalSwipe Hook Demo</h2>
      <p>This demo shows all three subtasks of Task 3:</p>
      <ul>
        <li><strong>3.1:</strong> Event listener management (ref-based attachment)</li>
        <li><strong>3.2:</strong> Gesture detection and validation logic</li>
        <li><strong>3.3:</strong> Callback system and event handling</li>
      </ul>
      
      {/* Task 3.1: Ref-based element attachment */}
      <div
        ref={swipeRef as React.RefObject<HTMLDivElement>}
        style={{
          width: '300px',
          height: '200px',
          border: '2px solid #ccc',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isActive ? '#e8f5e8' : '#f9f9f9',
          cursor: 'pointer',
          userSelect: 'none',
          margin: '20px 0'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            {isActive ? '👆 Swiping...' : '👋 Swipe me!'}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Try swiping left or right
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Swipe Status:</h3>
        <p><strong>Last Swipe:</strong> {lastSwipe}</p>
        <p><strong>Currently Active:</strong> {isActive ? 'Yes' : 'No'}</p>
        
        {swipeData && (
          <div>
            <h4>Last Swipe Data:</h4>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify(swipeData, null, 2)}
            </pre>
          </div>
        )}
        
        {currentSwiping && (
          <div>
            <h4>Current Swiping Data:</h4>
            <pre style={{ backgroundColor: '#fff3cd', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify(currentSwiping, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p><strong>Configuration:</strong></p>
        <ul>
          <li>Threshold: 50px (minimum distance)</li>
          <li>Velocity Threshold: 0.3px/ms (minimum speed)</li>
          <li>Delta: 10px (vertical tolerance)</li>
          <li>Prevent Scroll: Enabled</li>
          <li>Track Mouse: Enabled</li>
        </ul>
      </div>
    </div>
  );
}

export default SwipeDemo;