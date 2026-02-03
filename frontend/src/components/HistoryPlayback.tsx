import { useEffect, useMemo } from 'react';
import { FaTrash } from 'react-icons/fa6';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  historyplaybackDelete,
  historyplaybackList,
} from '../features/historyplayback/historyplaybackSlice';
import { formatDuration } from '../utils/formatDuration';
import { usePlayer } from '../hooks/usePlayer';
import type { IHistoryplaybackData } from '../types/historyplayback';
import { setDiffTypes } from '../features/controlpanel/controlpanelSlice';

const HistoryPlayback = () => {
  const { playRef } = usePlayer();
  const { historyplayback } = useAppSelector((state) => state.historyplayback);
  const { activeItemId } = useAppSelector((state) => state.stagelist);
  const { tablect } = useAppSelector((state) => state.tablect);
  const { auth } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(historyplaybackList());
  }, []);

  const filteredHistoryPlayback = useMemo(() => {
    let data = historyplayback
      .filter((item) => item.HistoryPlaybackId === activeItemId)
      .filter((item) => item.CreatedBy === auth?.UserID);
    return data;
  }, [historyplayback, activeItemId, auth?.UserID]);

  const handleSeek = (startTime: string) => {
    if (playRef.current) {
      playRef.current.seekTo(+startTime, 'seconds');
    }
  };

  const handleDelete = (
    e: React.MouseEvent<HTMLButtonElement>,
    item: IHistoryplaybackData
  ) => {
    e.stopPropagation();
    const { Id, Start, Stop, Type } = item;
    const diffValue = Number(Stop) - Number(Start);
    dispatch(
      setDiffTypes({ type: Type, valueTime: Number(diffValue.toFixed(2)) })
    );
    dispatch(historyplaybackDelete(Id));
  };

  const checkAvgValues = () => {
    const item = tablect.find((tc) => tc.Id === activeItemId);
    if (item) {
      return item.Nva.Average > 0 && item.Va.Average > 0;
    }
  };

  return (
    <div className="border border-gray-500 flex flex-col">
      <div className="bg-gray-500 text-white">
        <div className="px-2 py-2">
          <div className="font-bold">History Playback</div>
        </div>
      </div>
      <div className=" flex-1 overflow-y-auto p-1 flex flex-col gap-1">
        {filteredHistoryPlayback.map((item, i) => (
          <div
            key={i}
            className="bg-gray-400  rounded-md font-bold flex items-center justify-between p-1 cursor-pointer"
            onClick={() => handleSeek(item.Start)}
          >
            <div className="bg-gray-500 px-3 py-1 text-lg text-white rounded-md">
              {formatDuration(+item.Start)}
            </div>
            <div className="text-2xl text-white font-semibold">-</div>
            <div className="bg-gray-500 px-3 py-1 text-lg text-white rounded-md">
              {formatDuration(+item.Stop)}
            </div>
            <div className="bg-gray-500 px-3 py-1 text-lg text-white rounded-md">
              {item.Type}: {(+item.Stop - +item.Start).toFixed(2)}
            </div>
            <button
              className={`bg-gray-500 px-3 py-1.5 text-lg text-white rounded-md ${
                checkAvgValues() ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
              onClick={(e) => handleDelete(e, item)}
              disabled={checkAvgValues()}
            >
              <FaTrash size={24} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPlayback;
