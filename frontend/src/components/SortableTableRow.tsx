import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Select from 'react-select';
import { FaGripVertical } from 'react-icons/fa6';
import type { ITableData } from '../types/tablect';

interface Props {
  item: ITableData;
  activeItemId: string | null;
  activeColId: string | null;
  machineTypes: any[];
  handleClickRow: (item: ITableData) => void;
  handleClickColumn: (
    e: any,
    colId: string,
    rowId: string,
    item: ITableData
  ) => void;
  handleCheckAction: (item: ITableData) => React.ReactNode;
  handleCheckDisabled: (item: ITableData) => boolean | undefined;
  handleChangeMachineType: (e: any, Id: string) => void;
}

export const SortableTableRow = ({
  item,
  activeItemId,
  activeColId,
  machineTypes,
  handleClickRow,
  handleClickColumn,
  handleCheckAction,
  handleCheckDisabled,
  handleChangeMachineType,
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
    position: 'relative' as const,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <React.Fragment>
      <tr
        ref={setNodeRef}
        style={style}
        className={`cursor-pointer ${
          item.Id === activeItemId ? 'bg-gray-300' : ''
        } ${isDragging ? 'bg-blue-100' : ''}`}
        onClick={() => handleClickRow(item)}
      >
        <td
          className="text-center border border-l-0 border-t-0 border-gray-400 relative"
          rowSpan={2}
        >
          {/* ICON KÉO THẢ */}
          <div
            {...attributes}
            {...listeners}
            className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab text-gray-400 hover:text-gray-600 p-1 touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            <FaGripVertical size={14} />
          </div>
          <span className="ml-3">{item.No}</span>
        </td>
        <td
          className="text-center border border-t-0 border-gray-400"
          rowSpan={2}
        >
          {item.ProgressStagePartName}
        </td>
        <td className="text-center border border-t-0 border-gray-400">
          {item.Nva.Type}
        </td>
        {item.Nva.Cts.map((ct, i) => (
          <td
            className={`text-center border border-t-0 border-gray-400 ${
              `${item.Id}_${i}` === activeColId ? 'bg-amber-200' : ''
            }`}
            key={i}
            onClick={(e) =>
              handleClickColumn(e, `${item.Id}_${i}`, item.Id, item)
            }
          >
            {Number(ct.toFixed(2))}
          </td>
        ))}
        <td className="text-center border border-t-0 border-gray-400">
          {item.Nva.Average}
        </td>
        <td
          className="text-center border border-t-0 border-gray-400 px-2"
          rowSpan={2}
        >
          {item.MachineType ? (
            item.MachineType
          ) : (
            <div onClick={(e) => e.stopPropagation()} className="min-w-[120px]">
              <Select
                isDisabled={handleCheckDisabled(item)}
                options={machineTypes}
                menuPlacement="auto"
                menuPortalTarget={document.body}
                menuPosition="absolute"
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                onChange={(e) => handleChangeMachineType(e, item.Id)}
              />
            </div>
          )}
        </td>
        <td
          className="text-center border border-t-0 border-gray-400"
          rowSpan={2}
        >
          {item.ConfirmId}
        </td>
        <td
          className="text-center border border-r-0 border-t-0 border-gray-400 p-2"
          rowSpan={2}
        >
          {handleCheckAction(item)}
        </td>
      </tr>

      <tr
        style={style} // Dòng 2 cũng cần style để bay theo
        className={`cursor-pointer ${
          item.Id === activeItemId ? 'bg-gray-300' : ''
        } ${isDragging ? 'bg-blue-100' : ''}`}
        onClick={() => handleClickRow(item)}
      >
        <td className="text-center border border-t-0 border-gray-400">
          {item.Va.Type}
        </td>
        {item.Va.Cts.map((ct, i) => (
          <td
            className={`text-center border border-t-0 border-gray-400 ${
              `${item.Id}_${i}` === activeColId ? 'bg-amber-200' : ''
            }`}
            key={i}
            onClick={(e) =>
              handleClickColumn(e, `${item.Id}_${i}`, item.Id, item)
            }
          >
            {Number(ct.toFixed(2))}
          </td>
        ))}
        <td className="text-center border border-t-0 border-gray-400">
          {item.Va.Average}
        </td>
      </tr>
    </React.Fragment>
  );
};
