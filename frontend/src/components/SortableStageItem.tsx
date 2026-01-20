import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaTrash, FaGripVertical } from 'react-icons/fa6';
import type { IStageList } from '../types/stagelist';

interface Props {
  item: IStageList;
  isActive: boolean;
  onClick: (item: IStageList) => void;
  onDelete: (e: React.MouseEvent<HTMLDivElement>, id: string) => void;
}

export const SortableStageItem = ({
  item,
  isActive,
  onClick,
  onDelete,
}: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.Id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-300 text-gray-700 cursor-pointer px-2 py-1 rounded-md font-bold flex items-center justify-between ${
        isActive ? 'bg-gray-300' : ''
      } ${isDragging ? 'bg-blue-100 shadow-lg' : ''}`}
      onClick={() => onClick(item)}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        {/* Chỉ nắm vào đây mới kéo được */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab p-1 text-gray-400 hover:text-gray-600 outline-none touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <FaGripVertical />
        </div>
        <div className="truncate select-none" title={item.Name}>
          {item.Name}
        </div>
      </div>

      <div
        className="cursor-pointer p-2 hover:text-red-600"
        onClick={(e) => onDelete(e, item.Id)}
      >
        <FaTrash />
      </div>
    </div>
  );
};
