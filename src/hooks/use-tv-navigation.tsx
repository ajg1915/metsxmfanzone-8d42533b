import * as React from "react";

interface FocusableElement {
  id: string;
  ref: React.RefObject<HTMLElement>;
  row?: number;
  col?: number;
}

interface TVNavigationContextType {
  registerElement: (element: FocusableElement) => void;
  unregisterElement: (id: string) => void;
  focusedId: string | null;
  setFocusedId: (id: string) => void;
  handleKeyDown: (e: KeyboardEvent) => void;
}

const TVNavigationContext = React.createContext<TVNavigationContextType | null>(null);

export function TVNavigationProvider({ children }: { children: React.ReactNode }) {
  const [elements, setElements] = React.useState<FocusableElement[]>([]);
  const [focusedId, setFocusedId] = React.useState<string | null>(null);

  const registerElement = React.useCallback((element: FocusableElement) => {
    setElements(prev => {
      const exists = prev.find(e => e.id === element.id);
      if (exists) return prev;
      return [...prev, element];
    });
  }, []);

  const unregisterElement = React.useCallback((id: string) => {
    setElements(prev => prev.filter(e => e.id !== id));
  }, []);

  const findNextElement = React.useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!focusedId || elements.length === 0) {
      return elements[0]?.id || null;
    }

    const currentIndex = elements.findIndex(e => e.id === focusedId);
    if (currentIndex === -1) return elements[0]?.id || null;

    const current = elements[currentIndex];
    
    // Simple linear navigation for non-grid layouts
    if (current.row === undefined || current.col === undefined) {
      if (direction === 'left' || direction === 'up') {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : elements.length - 1;
        return elements[prevIndex].id;
      } else {
        const nextIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : 0;
        return elements[nextIndex].id;
      }
    }

    // Grid-based navigation
    const { row, col } = current;
    let targetRow = row;
    let targetCol = col;

    switch (direction) {
      case 'up':
        targetRow = row - 1;
        break;
      case 'down':
        targetRow = row + 1;
        break;
      case 'left':
        targetCol = col - 1;
        break;
      case 'right':
        targetCol = col + 1;
        break;
    }

    // Find element at target position
    const target = elements.find(e => e.row === targetRow && e.col === targetCol);
    if (target) return target.id;

    // If no exact match, find closest in same row/column
    if (direction === 'up' || direction === 'down') {
      const sameRowElements = elements.filter(e => e.row === targetRow);
      if (sameRowElements.length > 0) {
        const closest = sameRowElements.reduce((prev, curr) => {
          const prevDist = Math.abs((prev.col || 0) - col);
          const currDist = Math.abs((curr.col || 0) - col);
          return currDist < prevDist ? curr : prev;
        });
        return closest.id;
      }
    }

    return focusedId;
  }, [elements, focusedId]);

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    let nextId: string | null = null;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        nextId = findNextElement('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        nextId = findNextElement('down');
        break;
      case 'ArrowLeft':
        e.preventDefault();
        nextId = findNextElement('left');
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextId = findNextElement('right');
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        // Trigger click on focused element
        if (focusedId) {
          const element = elements.find(e => e.id === focusedId);
          if (element?.ref.current) {
            element.ref.current.click();
          }
        }
        return;
      case 'Escape':
      case 'Backspace':
        // Handle back navigation - can be extended
        return;
    }

    if (nextId && nextId !== focusedId) {
      setFocusedId(nextId);
      const element = elements.find(e => e.id === nextId);
      if (element?.ref.current) {
        element.ref.current.focus();
        element.ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [elements, focusedId, findNextElement]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Auto-focus first element if none focused
  React.useEffect(() => {
    if (!focusedId && elements.length > 0) {
      setFocusedId(elements[0].id);
    }
  }, [elements, focusedId]);

  return (
    <TVNavigationContext.Provider value={{
      registerElement,
      unregisterElement,
      focusedId,
      setFocusedId,
      handleKeyDown
    }}>
      {children}
    </TVNavigationContext.Provider>
  );
}

export function useTVNavigation() {
  const context = React.useContext(TVNavigationContext);
  if (!context) {
    throw new Error('useTVNavigation must be used within a TVNavigationProvider');
  }
  return context;
}

export function useTVFocusable(id: string, row?: number, col?: number) {
  const ref = React.useRef<HTMLElement>(null);
  const context = React.useContext(TVNavigationContext);
  
  React.useEffect(() => {
    if (context) {
      context.registerElement({ id, ref, row, col });
      return () => context.unregisterElement(id);
    }
  }, [context, id, row, col]);

  const isFocused = context?.focusedId === id;

  return {
    ref,
    isFocused,
    tabIndex: 0,
    onFocus: () => context?.setFocusedId(id),
  };
}
