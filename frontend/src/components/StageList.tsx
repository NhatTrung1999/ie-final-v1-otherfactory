import { FaPlus } from 'react-icons/fa6';
import { FaSyncAlt } from 'react-icons/fa';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TAB_STAGE_LIST, type IStageList } from '../types/stagelist';
import Modal from './Modal';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  reorderStagelist,
  setActiveItemId,
  setActiveTabId,
  setPath,
  stagelistDelete,
  stagelistList,
  stagelistUpdateOrder,
} from '../features/stagelist/stagelistSlice';
import type { ITableCtPayload } from '../types/tablect';
import {
  createData,
  deleteData,
  getData,
  setActiveColId,
} from '../features/tablect/tablectSlice';
import { toast } from 'react-toastify';
import {
  resetTypes,
  setCurrentTime,
  setDuration,
  setIsPlaying,
  setStartTime,
  setStopTime,
} from '../features/controlpanel/controlpanelSlice';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { SortableStageItem } from './SortableStageItem';
import { historyplaybackDeleteMultiple } from '../features/historyplayback/historyplaybackSlice';

const StageList = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef<boolean>(false);
  const startX = useRef<number>(0);
  const scrollLeftStart = useRef<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { stagelist, activeTabId, activeItemId, filter } = useAppSelector(
    (state) => state.stagelist,
  );
  const { isPlaying } = useAppSelector((state) => state.controlpanel);
  const { tablect } = useAppSelector((state) => state.tablect);
  const { auth } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(stagelistList({ ...filter }));
  }, [dispatch, filter]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement | null>) => {
    isDragging.current = true;
    startX.current = e.pageX;
    if (scrollRef.current) {
      scrollLeftStart.current = scrollRef.current.scrollLeft;
      scrollRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement | null>) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - startX.current) * 1.5;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
    }
  };

  const handleDelete = async (
    e: React.MouseEvent<HTMLDivElement>,
    id: string,
  ) => {
    e.stopPropagation();

    if (isPlaying) {
      toast.warn('The video is playing!');
      return;
    }
    const result = await dispatch(stagelistDelete(id));

    if (stagelistDelete.fulfilled.match(result)) {
      toast.success(result.payload.message || 'Delete successfully!');
      await dispatch(deleteData(id));
      await dispatch(historyplaybackDeleteMultiple(id));
      await dispatch(stagelistList({ ...filter }));
      dispatch(setPath(''));
      dispatch(setCurrentTime(0));
      dispatch(setDuration(0));
      dispatch(setStartTime(0));
      dispatch(setStopTime(0));
      dispatch(resetTypes());
    } else {
      toast.error(result.payload as string);
    }
  };

  const handleCreateRowData = (item: IStageList) => {
    const isDuplicate = tablect.some((row) => row.Id === item.Id);
    if (isDuplicate) {
      dispatch(setPath(item.Path));
      return;
    }
    const newData: ITableCtPayload = {
      Id: item.Id,
      // TablectId: item.Id,
      No: item.Name?.split('. ')[0] || 'Unknown',
      ProgressStagePartName:
        item.Name?.split('. ')[1]?.split('.')[0] || 'Unknown',
      Area: item.Area,
      Path: item.Path,
      Nva: JSON.stringify({
        Type: 'NVA',
        Cts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        Average: 0,
      }),
      Va: JSON.stringify({
        Type: 'VA',
        Cts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        Average: 0,
      }),
      MachineType: '',
      ConfirmId: '',
      IsSave: false,
      CreatedBy: auth?.UserID || '',
    };

    dispatch(setPath(item.Path));
    dispatch(createData(newData));
  };

  const handelClick = (item: IStageList) => {
    if (item.Id === activeItemId) {
      dispatch(setActiveItemId(null));
      dispatch(setPath(''));
      // dispatch(setActiveColId(null));
      dispatch(setCurrentTime(0));
      dispatch(setDuration(0));
    } else {
      dispatch(setActiveItemId(item.Id));
      dispatch(setPath(item.Path));
    }
    handleCreateRowData(item);
    dispatch(resetTypes());
    dispatch(setIsPlaying(false));
    dispatch(setActiveColId(null));
  };

  const handleRefresh = () => {
    dispatch(stagelistList({ ...filter, IsCompleted: true }));
    dispatch(getData({ ...filter, IsCompleted: true }));
  };

  const filteredStagelist = useMemo(() => {
    let data = stagelist
      .filter((item) => item.Area === activeTabId)
      .filter((item) => item.CreatedBy === auth?.UserID);

    return data;
  }, [stagelist, activeTabId, auth?.UserID]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      dispatch(
        reorderStagelist({
          activeId: active.id as string,
          overId: over.id as string,
        }),
      );

      const oldIndex = filteredStagelist.findIndex(
        (item) => item.Id === active.id,
      );
      const newIndex = filteredStagelist.findIndex(
        (item) => item.Id === over.id,
      );

      const newSortedList = arrayMove(filteredStagelist, oldIndex, newIndex);
      const idsToSend = newSortedList.map((item) => item.Id);

      dispatch(stagelistUpdateOrder(idsToSend));
    }
  };

  return (
    <>
      <div className="border border-gray-500 overflow-auto row-span-2 flex flex-col">
        <div>
          <div className="bg-gray-500 flex justify-between items-center px-2 py-2 text-white">
            <div className="font-bold">StageList</div>
            <div className="flex items-center gap-3">
              <div className="cursor-pointer p-1" onClick={handleRefresh}>
                <FaSyncAlt size={16} />
              </div>
              <div
                className="cursor-pointer p-1"
                onClick={() => setIsOpen(true)}
              >
                <FaPlus size={20} />
              </div>
            </div>
          </div>
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            className="bg-gray-300 overflow-x-hidden flex gap-3 items-center whitespace-nowrap px-2 py-2 cursor-grab select-none"
          >
            {TAB_STAGE_LIST.map((item, i) => (
              <div
                key={i}
                className={`px-2 py-1 rounded-lg font-bold ${
                  activeTabId === item ? 'bg-gray-900/50 text-white' : ''
                }`}
                onClick={() => {
                  dispatch(setActiveTabId(item));
                  dispatch(setActiveItemId(null));
                  dispatch(setPath(''));
                  dispatch(setActiveColId(null));
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className=" flex-1 overflow-y-auto flex flex-col gap-2 p-2">
          {/* {stagelist
            .filter((item) => item.Area === activeTabId)
            .filter((item) => item.CreatedBy === auth?.UserID)
            .map((item, i) => (
              <div
                key={i}
                className={`hover:bg-gray-300 text-gray-700 cursor-pointer px-2 py-1 rounded-md font-bold  flex items-center justify-between ${
                  item.Id === activeItemId ? 'bg-gray-300' : ''
                }`}
                onClick={() => handelClick(item)}
                title={item.Name}
              >
                <div className="truncate">{item.Name}</div>
                <div
                  className="cursor-pointer p-2"
                  onClick={(e) => handleDelete(e, item.Id)}
                >
                  <FaTrash />
                </div>
              </div>
            ))} */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredStagelist.map((item) => item.Id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredStagelist.map((item) => (
                <SortableStageItem
                  key={item.Id}
                  item={item}
                  isActive={item.Id === activeItemId}
                  onClick={handelClick}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
      {isOpen && <Modal setIsOpen={setIsOpen} />}
    </>
  );
};

export default StageList;
