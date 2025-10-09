import ReactPlayer from 'react-player';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  setCurrentTime,
  setDuration,
} from '../features/controlpanel/controlpanelSlice';
import { usePlayer } from '../hooks/usePlayer';
import type { OnProgressProps } from 'react-player/base';

const Player = () => {
  const { path } = useAppSelector((state) => state.stagelist);
  const dispatch = useAppDispatch();
  const { isPlaying } = useAppSelector((state) => state.controlpanel);
  const { playRef } = usePlayer();

  return (
    <div className=" h-[550px] w-full border border-gray-500 bg-black">
      <ReactPlayer
        ref={playRef}
        url={path}
        muted
        // controls
        playing={isPlaying}
        onDuration={(duration: number) => dispatch(setDuration(duration))}
        onProgress={(state: OnProgressProps) => {
          dispatch(setCurrentTime(Number(state.playedSeconds.toFixed(2))));
        }}
        progressInterval={1}
        onPause={() =>
          dispatch(
            setCurrentTime(Number(playRef.current?.getCurrentTime().toFixed(2)))
          )
        }
        width={'100%'}
        height={'100%'}
        style={{
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

export default Player;
