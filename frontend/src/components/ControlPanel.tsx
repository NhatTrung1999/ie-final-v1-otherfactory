import { FaCircleCheck, FaPause, FaPlay } from 'react-icons/fa6';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  resetTypes,
  setIsPlaying,
  setStartTime,
  setStopTime,
  setTypes,
} from '../features/controlpanel/controlpanelSlice';
import { formatDuration } from '../utils/formatDuration';
import { usePlayer } from '../hooks/usePlayer';
import { toast } from 'react-toastify';
import { setUpdateValueRow } from '../features/tablect/tablectSlice';
import { historyplaybackCreate } from '../features/historyplayback/historyplaybackSlice';
import { v4 as uuidv4 } from 'uuid';
import type { IHistoryplaybackPayload } from '../types/historyplayback';
import { useEffect, useState } from 'react';
import ModalLSA from './ModalLSA';

const ControlPanel = () => {
  const { playRef } = usePlayer();
  const { activeColId } = useAppSelector((state) => state.tablect);
  const { activeItemId, activeTabId } = useAppSelector(
    (state) => state.stagelist
  );
  const { isPlaying, duration, currentTime, startTime, stopTime, types } =
    useAppSelector((state) => state.controlpanel);
  const { auth } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const category = localStorage.getItem('category');

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleStartStop = () => {
    dispatch(setIsPlaying(!isPlaying));
    if (!isPlaying) {
      dispatch(setStartTime(currentTime));
      console.log(currentTime);
      if (playRef.current) {
        playRef.current.seekTo(currentTime, 'seconds');
        playRef.current.getInternalPlayer().play();
      }
    } else {
      dispatch(setStopTime(currentTime));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPlaying) {
      return;
    }

    const newValue = Number(e.target.value);
    if (playRef.current) {
      playRef.current.seekTo(newValue, 'seconds');
    }
  };

  const handleDone = () => {
    if (activeColId && activeItemId) {
      if (isPlaying) {
        toast.warn('Cannot done while the video is playing!');
        return;
      }

      if (
        activeTabId.trim().toLowerCase() === 'CUTTING'.trim().toLowerCase() &&
        category?.trim().toLowerCase() === 'LSA'.trim().toLowerCase()
      ) {
        setIsOpen(true);
        return;
      }

      const [id, colId] = activeColId?.split('_').map(String);
      dispatch(
        setUpdateValueRow({
          id,
          colId: Number(colId),
          nvaTime: types.NVA,
          vaTime: types.VA,
        })
      );
      dispatch(resetTypes());
    }
  };

  const handleTypes = (type: string) => {
    if (isPlaying) {
      toast.warn('Cannot select status while the video is playing!');
      return;
    }
    const valueType = stopTime - startTime;

    const newData: IHistoryplaybackPayload = {
      Id: uuidv4(),
      HistoryPlaybackId: activeItemId as string,
      Type: type,
      Start: String(startTime),
      Stop: String(stopTime),
      CreatedBy: auth?.UserID || '',
      CreatedFactory: auth?.Factory || '',
    };

    dispatch(setTypes({ type, valueTime: Number(valueType.toFixed(2)) }));
    dispatch(historyplaybackCreate(newData));
  };

  useEffect(() => {
    if (!activeColId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleStartStop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleStartStop, activeColId]);

  return (
    <>
      <div className="border border-gray-500 flex flex-col overflow-y-auto">
        <div className="bg-gray-500 text-white sticky top-0 z-20">
          <div className="px-2 py-2">
            <div className="font-bold">Control Panel</div>
          </div>
        </div>
        <div className="flex-1  grid grid-rows-3 gap-2 p-1">
          <div className=" grid grid-cols-3 gap-2">
            <div
              className={`flex justify-center items-center text-xl font-semibold rounded-md bg-gray-500 text-white ${
                activeColId === null ? 'opacity-80' : ''
              }`}
            >
              {formatDuration(currentTime)}
            </div>
            {isPlaying ? (
              <button
                className={`flex justify-center items-center gap-1 bg-red-500 text-white rounded-md  ${
                  activeColId === null
                    ? 'cursor-not-allowed opacity-80'
                    : 'cursor-pointer'
                }`}
                onClick={handleStartStop}
                disabled={activeColId === null ? true : false}
              >
                <div>
                  <FaPause size={20} />
                </div>
                <div className="font-semibold">Stop</div>
              </button>
            ) : (
              <button
                className={`flex justify-center items-center gap-1 bg-blue-500 text-white rounded-md  ${
                  activeColId === null
                    ? 'cursor-not-allowed opacity-80'
                    : 'cursor-pointer'
                }`}
                onClick={handleStartStop}
                disabled={activeColId === null ? true : false}
              >
                <div>
                  <FaPlay size={20} />
                </div>
                <div className="font-semibold">Start</div>
              </button>
            )}
            <button
              className={`flex justify-center items-center gap-1 bg-green-500 text-white rounded-md ${
                activeColId === null
                  ? 'cursor-not-allowed opacity-80'
                  : 'cursor-pointer'
              }`}
              onClick={handleDone}
              disabled={activeColId === null ? true : false}
            >
              <div>
                <FaCircleCheck size={18} />
              </div>
              <div className="font-semibold">Done</div>
            </button>
          </div>
          <div className=" grid grid-cols-3 gap-2">
            <button
              className={`flex justify-center items-center bg-gray-500 text-white rounded-md p-1 ${
                activeColId === null
                  ? 'cursor-not-allowed opacity-80'
                  : 'cursor-pointer'
              }`}
              disabled={activeColId === null ? true : false}
              onClick={() => handleTypes('NVA')}
            >
              <div className="font-semibold flex-1 h-full flex justify-center items-center">
                NVA
              </div>
              <div className="font-semibold flex-1 h-full flex justify-center items-center bg-white text-gray-500 rounded-md text-lg">
                {types.NVA.toFixed(2)}
              </div>
            </button>
            <button
              className={`flex justify-center items-center bg-gray-500 text-white rounded-md p-1 ${
                activeColId === null
                  ? 'cursor-not-allowed opacity-80'
                  : 'cursor-pointer'
              }`}
              disabled={activeColId === null ? true : false}
              onClick={() => handleTypes('VA')}
            >
              <div className="font-semibold flex-1 h-full flex justify-center items-center">
                VA
              </div>
              <div className="font-semibold flex-1 h-full flex justify-center items-center bg-white text-gray-500 rounded-md text-lg">
                {types.VA.toFixed(2)}
              </div>
            </button>
            <button
              className={`flex justify-center items-center bg-gray-500 text-white rounded-md p-1 ${
                activeColId === null
                  ? 'cursor-not-allowed opacity-80'
                  : 'cursor-pointer'
              }`}
              disabled={activeColId === null ? true : false}
              onClick={() => handleTypes('SKIP')}
            >
              <div className="font-semibold flex-1 h-full flex justify-center items-center">
                SKIP
              </div>
              <div className="font-semibold flex-1 h-full flex justify-center items-center bg-white text-gray-500 rounded-md text-lg">
                {types.SKIP.toFixed(2)}
              </div>
            </button>
          </div>
          <div
            className={`grid grid-cols-6 bg-gray-500 text-white font-semibold rounded-lg ${
              activeColId === null
                ? 'cursor-not-allowed opacity-70'
                : 'cursor-pointer'
            }`}
          >
            <div className=" flex justify-center items-center">
              {formatDuration(currentTime)}
            </div>
            <div className=" col-span-4 flex justify-center items-center">
              <input
                type="range"
                className="w-full accent-amber-200"
                disabled={activeColId === null ? true : false}
                value={currentTime}
                step={0.1}
                max={duration}
                onChange={handleChange}
              />
            </div>
            <div className=" flex justify-center items-center">
              {formatDuration(duration)}
            </div>
          </div>
        </div>
      </div>
      {isOpen && <ModalLSA setIsOpen={setIsOpen} activeColId={activeColId} />}
    </>
  );
};

export default ControlPanel;
