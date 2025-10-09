import { createContext, useContext, type RefObject } from 'react';
import type ReactPlayer from 'react-player';

interface PlayerContextType {
  playRef: RefObject<ReactPlayer | null>;
}

export const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }

  return context;
};
