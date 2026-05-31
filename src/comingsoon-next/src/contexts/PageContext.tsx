'use client';

import { createContext, useContext, ReactNode } from 'react';

interface PageContextType {
  isWhiteBackground: boolean;
}

const PageContext = createContext<PageContextType>({
  isWhiteBackground: false,
});

export function PageProvider({ 
  children, 
  isWhiteBackground = false 
}: { 
  children: ReactNode; 
  isWhiteBackground?: boolean;
}) {
  return (
    <PageContext.Provider value={{ isWhiteBackground }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePageContext() {
  return useContext(PageContext);
}
