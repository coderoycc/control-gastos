import { useEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  
  /** Umbral de distancia para cerrar (0.1 a 0.9 es porcentaje de la altura, > 1 es píxeles). Por defecto 0.3 (30%) */
  threshold?: number;
  
  /** Sensibilidad del gesto de swipe ('low' | 'medium' | 'high' | número personalizado de umbral de velocidad) */
  sensitivity?: 'low' | 'medium' | 'high' | number;
  
  /** Si permite cerrar al hacer clic en el fondo oscuro */
  dismissOnBackdropClick?: boolean;
  
  /** Mostrar u ocultar la barra de agarre superior */
  showDragHandle?: boolean;
  
  /** Altura máxima del bottom sheet (por defecto '90vh') */
  maxHeight?: string;

  /** Clase CSS adicional para el contenedor de la hoja */
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  threshold = 0.3,
  sensitivity = 'medium',
  dismissOnBackdropClick = true,
  showDragHandle = true,
  maxHeight = '90vh',
  className = '',
}: BottomSheetProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  
  const startY = useRef(0);
  const currentY = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const velocityY = useRef(0);
  
  const isDragging = useRef(false);
  const rafId = useRef<number | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollableTarget = useRef<HTMLElement | null>(null);
  
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  // Calcular umbral de velocidad según la sensibilidad
  const getVelocityThreshold = useCallback(() => {
    if (typeof sensitivity === 'number') return sensitivity;
    switch (sensitivity) {
      case 'low': return 0.65;
      case 'high': return 0.25;
      case 'medium':
      default: return 0.40;
    }
  }, [sensitivity]);

  // Manejo robusto del ciclo de vida de visibilidad sin bloqueos de eventos ni loops de timers
  useEffect(() => {
    if (isOpen) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setIsVisible(true);
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'contain';
    } else {
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';

      if (isVisible && !isClosing) {
        setIsClosing(true);
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
        }
        closeTimerRef.current = setTimeout(() => {
          setIsVisible(false);
          setIsClosing(false);
          closeTimerRef.current = null;
        }, 300);
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
    };
  }, [isOpen]);

  // Limpiar timer al desmontar el componente
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  // Manejo de tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Motor de gestos fluido
  useEffect(() => {
    const el = contentRef.current;
    const backdrop = backdropRef.current;
    if (!el || !isVisible) return;

    const findScrollableParent = (target: HTMLElement | null): HTMLElement | null => {
      let curr = target;
      while (curr && curr !== el) {
        const overflowY = window.getComputedStyle(curr).overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') && curr.scrollHeight > curr.clientHeight) {
          return curr;
        }
        curr = curr.parentElement;
      }
      return null;
    };

    const updateTransform = () => {
      if (!el) return;
      const diff = currentY.current - startY.current;

      // Efecto Rubber-band (resistencia de liga) al arrastrar hacia arriba (diff < 0)
      const dampedDiff = diff < 0 
        ? -Math.pow(Math.abs(diff), 0.75) * 0.7 
        : diff;

      el.style.transform = `translateY(${dampedDiff}px)`;

      // Transición sutil de opacidad del backdrop al deslizar hacia abajo
      if (backdrop && diff > 0) {
        const sheetHeight = el.clientHeight || 400;
        const opacityRatio = Math.max(0, 1 - (diff / (sheetHeight * 1.2)));
        backdrop.style.opacity = String(opacityRatio);
      } else if (backdrop) {
        backdrop.style.opacity = '1';
      }

      rafId.current = null;
    };

    const handleStart = (clientY: number, target: HTMLElement) => {
      startY.current = clientY;
      currentY.current = clientY;
      lastY.current = clientY;
      lastTime.current = performance.now();
      velocityY.current = 0;
      isDragging.current = true;
      scrollableTarget.current = findScrollableParent(target);

      el.style.transition = 'none';
      if (backdrop) backdrop.style.transition = 'none';
    };

    const handleMove = (clientY: number, e: Event) => {
      if (!isDragging.current) return;
      
      const now = performance.now();
      const dt = now - lastTime.current;
      const dy = clientY - lastY.current;

      if (dt > 0) {
        velocityY.current = dy / dt; // píxeles por milisegundo
      }

      lastY.current = clientY;
      lastTime.current = now;
      currentY.current = clientY;

      // Si hay scroll interno en el contenido y no está al inicio, permitir scroll nativo
      if (scrollableTarget.current && scrollableTarget.current.scrollTop > 0) {
        return;
      }

      const diff = currentY.current - startY.current;
      if (diff > 0) {
        e.preventDefault(); // Detener el pull-to-refresh nativo
      }

      if (!rafId.current) {
        rafId.current = requestAnimationFrame(updateTransform);
      }
    };

    const handleEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }

      const diff = currentY.current - startY.current;
      const sheetHeight = el.clientHeight || 400;

      // Calcular umbral dinámico de cierre
      const closeThresholdPx = threshold <= 1 ? sheetHeight * threshold : threshold;
      const velocityThreshold = getVelocityThreshold();
      
      // Cerrar si superó el umbral o si fue un swipe/flick rápido hacia abajo
      const isFlick = velocityY.current > velocityThreshold;
      const isPastThreshold = diff > closeThresholdPx;
      const canClose = (!scrollableTarget.current || scrollableTarget.current.scrollTop <= 0);

      el.style.transition = 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)';
      if (backdrop) backdrop.style.transition = 'opacity 300ms cubic-bezier(0.32, 0.72, 0, 1)';

      if ((isPastThreshold || isFlick) && canClose && diff > 0) {
        el.style.transform = `translateY(${sheetHeight}px)`;
        if (backdrop) backdrop.style.opacity = '0';
        onClose();
      } else {
        el.style.transform = 'translateY(0)';
        if (backdrop) backdrop.style.opacity = '1';
      }

      scrollableTarget.current = null;
    };

    // Listeners táctiles (Móviles)
    const onTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientY, e.target as HTMLElement);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientY, e);
    const onTouchEnd = () => handleEnd();

    // Listeners de ratón (Escritorio)
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Solo botón primario
      handleStart(e.clientY, e.target as HTMLElement);
      
      const onMouseMove = (me: MouseEvent) => handleMove(me.clientY, me);
      const onMouseUp = () => {
        handleEnd();
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('mousedown', onMouseDown);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('mousedown', onMouseDown);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isVisible, onClose, threshold, getVelocityThreshold]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-end overscroll-contain ${
      isClosing ? 'pointer-events-none' : 'pointer-events-auto'
    }`}>
      {/* Backdrop con opacidad animada */}
      <div 
        ref={backdropRef}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={() => dismissOnBackdropClick && !isClosing && onClose()}
      />
      
      {/* Contenedor del Bottom Sheet */}
      <div 
        ref={contentRef}
        style={{ 
          maxHeight,
          overscrollBehavior: 'contain',
          willChange: 'transform',
        }}
        className={`relative w-full bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl flex flex-col overscroll-contain transition-transform duration-300 ease-out transform ${
          isClosing ? 'translate-y-full' : 'translate-y-0'
        } ${className}`}
      >
        {/* Drag Handle opcional con respuesta visual */}
        {showDragHandle && (
          <div className="flex justify-center pt-2.5 pb-1.5 cursor-grab active:cursor-grabbing select-none group">
            <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full group-hover:bg-gray-400 dark:group-hover:bg-gray-600 transition-colors" />
          </div>
        )}

        {/* Encabezado opcional */}
        {title && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <h3 className="font-semibold text-base leading-tight text-gray-900 dark:text-gray-100">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex-shrink-0"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Contenido desplazable */}
        <div className="flex-1 overflow-auto overscroll-contain" style={{ overscrollBehavior: 'contain' }}>
          {children}
        </div>
      </div>
    </div>
  );
}



