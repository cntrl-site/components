import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef
} from 'react';

const INITIAL_STATE: DragState = {
  drag: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  pivotX: 0,
  pivotY: 0,
  lastX: 0,
  lastY: 0
};

export function useDraggable(
  data: {
    draggableRef: HTMLElement | null | undefined,
    isEnabled: boolean
  },
  dragHandler?: DragHandler,
  preventDragOnChildren: boolean = false,
) {
  const dragStateRef = useRef<DragState>(INITIAL_STATE);
  const prevDragStateRef = useRef<DragState | undefined>();
  const dragHandlerRef = useRef<DragHandler | undefined>();
  const untrackMouseMoveRef = useRef<(() => void) | undefined>();
  const animationFrameRef = useRef<number | undefined>();
  dragHandlerRef.current = dragHandler;

  const setDragState = useCallback<Dispatch<SetStateAction<DragState>>>(
    action => {
      const state = isStateGetter<DragState>(action)
        ? action(dragStateRef.current)
        : action;
      if (!prevDragStateRef.current) {
        prevDragStateRef.current = dragStateRef.current;
      }
      dragStateRef.current = state;
      if (animationFrameRef.current !== undefined) return;
      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = undefined;
        dragHandlerRef.current?.(
          dragStateRef.current,
          prevDragStateRef.current
        );
        prevDragStateRef.current = dragStateRef.current;
      });
    },
    []
  );

  const handleMouseMove = useCallback<EventHandler<MouseEvent>>(
    event => {
      event.stopPropagation();
      const el = event.target;
      if (!(el instanceof HTMLElement)) return;
      setDragState(state => {
        if (!state.drag) {
          const clientRect = el.getBoundingClientRect();
          return {
            drag: true,
            startX: event.clientX,
            startY: event.clientY,
            currentX: event.clientX,
            currentY: event.clientY,
            pivotX: event.clientX - clientRect.x,
            pivotY: event.clientY - clientRect.y,
            lastX: state.lastX,
            lastY: state.lastY
          };
        }
        return {
          ...state,
          currentX: state.currentX + event.movementX,
          currentY: state.currentY + event.movementY
        };
      });
    },
    [setDragState, data.draggableRef, preventDragOnChildren]
  );

  const handleMouseUp = useCallback<EventHandler<MouseEvent>>(
    event => {
      event.stopPropagation();
      setDragState(state => ({
        ...state,
        drag: false,
        lastX: state.currentX - state.startX + state.lastX,
        lastY: state.currentY - state.startY + state.lastY
      }));
      untrackMouseMoveRef.current?.();
    },
    [setDragState]
  );

  const handleScroll = useCallback<EventHandler<Event>>(() => {
    setDragState(state => state);
  }, [setDragState]);

  const trackMouseMove = useCallback(() => {
    window.addEventListener('mousemove', handleMouseMove, { capture: true });
    window.addEventListener('mouseup', handleMouseUp, { capture: true });
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove, { capture: true });
      window.removeEventListener('mouseup', handleMouseUp, { capture: true });
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [handleMouseMove, handleMouseUp, handleScroll]);

  const handleMouseDown = useCallback<EventHandler<MouseEvent>>(
    event => {
      event.stopPropagation();
      if (preventDragOnChildren && event.target instanceof Node && data.draggableRef instanceof Node) {
        if (event.target !== data.draggableRef && data.draggableRef.contains(event.target)) return;
      }
      if (event.button !== 0) return;
      untrackMouseMoveRef.current?.();
      untrackMouseMoveRef.current = trackMouseMove();
    },
    [trackMouseMove]
  );

  const handleTouchMove = useCallback<EventHandler<TouchEvent>>(
    event => {
      event.stopPropagation();
      event.preventDefault();
      const touch = event.touches[0];
      const el = event.target;
      if (!(el instanceof HTMLElement)) return;

      setDragState(state => {
        if (!state.drag) {
          const clientRect = el.getBoundingClientRect();
          return {
            drag: true,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY,
            pivotX: touch.clientX - clientRect.x,
            pivotY: touch.clientY - clientRect.y,
            lastX: state.lastX,
            lastY: state.lastY
          };
        }

        const movementX = touch.clientX - state.currentX;
        const movementY = touch.clientY - state.currentY;

        return {
          ...state,
          currentX: state.currentX + movementX,
          currentY: state.currentY + movementY
        };
      });
    },
    [setDragState]
  );

  const handleTouchEnd = useCallback<EventHandler<TouchEvent>>(
    event => {
      event.stopPropagation();
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      setDragState(state => ({
        ...state,
        drag: false,
        lastX: state.currentX - state.startX + state.lastX,
        lastY: state.currentY - state.startY + state.lastY
      }));
      untrackMouseMoveRef.current?.();
    },
    [setDragState]
  );

  const trackTouchMove = useCallback(() => {
    window.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
    window.addEventListener('touchend', handleTouchEnd, { capture: true });
    window.addEventListener('touchcancel', handleTouchEnd, { capture: true });
    return () => {
      window.removeEventListener('touchmove', handleTouchMove, { capture: true });
      window.removeEventListener('touchend', handleTouchEnd, { capture: true });
      window.removeEventListener('touchcancel', handleTouchEnd, { capture: true });
    };
  }, [handleTouchMove, handleTouchEnd]);

  const handleTouchStart = useCallback<EventHandler<TouchEvent>>(
    event => {
      event.stopPropagation();
      if (preventDragOnChildren && event.target instanceof Node && data.draggableRef instanceof Node) {
        if (event.target !== data.draggableRef && data.draggableRef.contains(event.target)) return;
      }
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      const selection = document.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
      untrackMouseMoveRef.current?.();
      untrackMouseMoveRef.current = trackTouchMove();
    },
    [trackTouchMove]
  );

  useEffect(() => {
    if (!data.draggableRef || !data.isEnabled) return;
    const mouseHandler = handleMouseDown;
    const touchHandler = handleTouchStart;

    data.draggableRef.addEventListener('mousedown', mouseHandler);
    data.draggableRef.addEventListener('touchstart', touchHandler);

    return () => {
      data.draggableRef?.removeEventListener('mousedown', mouseHandler);
      data.draggableRef?.removeEventListener('touchstart', touchHandler);
      untrackMouseMoveRef.current?.();
      if (animationFrameRef.current !== undefined) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [data.draggableRef, data.isEnabled, handleMouseDown, handleTouchStart]);
}

interface DragState {
  drag: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  pivotX: number;
  pivotY: number;
  lastX: number;
  lastY: number;
}

type EventHandler<E extends Event> = (event: E) => void;
type DragHandler = (state: DragState, prevState?: DragState) => void;

function isStateGetter<T>(
  action: SetStateAction<T>
): action is (prevState: T) => T {
  return typeof action === 'function';
}
