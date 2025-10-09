import { useRef } from 'react';
import { PlayerContext } from '../hooks/usePlayer';
import ControlPanel from './ControlPanel';
import HistoryPlayback from './HistoryPlayback';
import Player from './Player';
// import Player from './Player';
import StageList from './StageList';
import TableCT from './TableCT';
import type ReactPlayer from 'react-player';
// import TableCT from './TableCT';

const Main = () => {
  const playRef = useRef<ReactPlayer | null>(null);

  return (
    <PlayerContext.Provider value={{ playRef }}>
      <div className="flex relative">
        <div className="fixed top-[70px] left-0 bottom-0 z-50 w-sm overflow-y-auto grid grid-rows-4 gap-2 p-1">
          <StageList />
          <ControlPanel />
          <HistoryPlayback />
        </div>
        <div className=" ml-[384px] w-full p-1 overflow-auto">
          <Player />
          <TableCT />
        </div>
      </div>
    </PlayerContext.Provider>
  );
};

export default Main;
