import { type ReactNode } from 'react';
import { DataContext, type Video } from '../hooks/useData';
import data from '../data.json';

export function DataProvider({ children }: { children: ReactNode }) {
  const videos = data as Video[];

  return (
    <DataContext.Provider value={{ videos }}>
      {children}
    </DataContext.Provider>
  );
}
