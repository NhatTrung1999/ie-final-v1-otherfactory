import React, { Fragment, useEffect, useState, type MouseEvent } from 'react';
import Select, { type SingleValue } from 'react-select';
import {
  TABLE_HEADER,
  type ITableCtPayload,
  type ITableData,
} from '../types/tablect';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setActiveItemId, setPath } from '../features/stagelist/stagelistSlice';
import {
  confirmData,
  deleteData,
  getData,
  getDepartmentMachineType,
  saveData,
  setActiveColId,
  setMachineType,
  setUpdateAverage,
  setUpdateMachineType,
} from '../features/tablect/tablectSlice';
import {
  resetTypes,
  setCurrentTime,
  setDuration,
  setIsPlaying,
  setStopTime,
} from '../features/controlpanel/controlpanelSlice';
import excelApi from '../api/excelApi';
import { toast } from 'react-toastify';
import { historyplaybackDeleteMultiple } from '../features/historyplayback/historyplaybackSlice';
import ModalEstimateOutput from './ModalEstimateOutput';

const TableCT = () => {
  const { tablect, activeColId, machineTypes, selectedMachineType } =
    useAppSelector((state) => state.tablect);
  const { activeItemId, activeTabId, filter } = useAppSelector(
    (state) => state.stagelist
  );
  const { currentTime } = useAppSelector((state) => state.controlpanel);
  const { auth } = useAppSelector((state) => state.auth);
  const category = localStorage.getItem('category');
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    dispatch(getData({ ...filter }));
    dispatch(getDepartmentMachineType());
  }, [filter, dispatch]);

  const handleClickRow = (item: ITableData) => {
    const rowId = item.Id;
    if (rowId === activeItemId) {
      dispatch(setPath('null'));
      dispatch(setActiveItemId(null));
      dispatch(setCurrentTime(0));
      dispatch(setDuration(0));
    } else {
      dispatch(setPath(item.Path));
      dispatch(setActiveItemId(rowId));
    }
    dispatch(resetTypes());
    dispatch(setIsPlaying(false));
    dispatch(setActiveColId(null));
  };

  const handleClickColumn = (
    e: MouseEvent<HTMLDivElement>,
    colId: string,
    rowId: string,
    item: ITableData
  ) => {
    e.stopPropagation();
    const { Nva, Va } = item;
    const avgNva = Nva.Average;
    const avgVa = Va.Average;
    // console.log(activeColId, colId);
    if (!activeItemId) return;
    if (rowId !== activeItemId) return;
    if (avgNva && avgVa) return;
    if (activeColId === colId) {
      dispatch(setIsPlaying(false));
      dispatch(setStopTime(currentTime));
      // return;
    }

    dispatch(setActiveColId(colId));
  };

  const handleDone = (
    e: React.MouseEvent<HTMLButtonElement>,
    item: ITableData
  ) => {
    e.stopPropagation();
    dispatch(
      setUpdateAverage({
        category,
        payload: item,
      })
    );
    dispatch(setUpdateMachineType({ ...selectedMachineType }));
    dispatch(setActiveColId(null));
    dispatch(setCurrentTime(0));
    dispatch(setDuration(0));
  };

  const handleSync = () => {
    dispatch(getData({ ...filter }));
  };

  const handleConfirm = async () => {
    // console.log(activeTabId);
    const newTablect: ITableCtPayload[] = tablect
      .filter((item) => item.Area.toLowerCase() === activeTabId.toLowerCase())
      .filter((item) => item.ConfirmId === null)
      .map((item) => ({
        ...item,
        Nva: JSON.stringify(item.Nva),
        Va: JSON.stringify(item.Va),
        ConfirmId: auth?.UserID || '',
      }));
    // console.log(newTablect);
    let result = await dispatch(confirmData(newTablect));
    if (confirmData.fulfilled.match(result)) {
      await dispatch(getData({ ...filter }));
      const checkConfirmId = tablect
        .filter((item) => item.Area.toLowerCase() === activeTabId.toLowerCase())
        .every((item) => item.ConfirmId !== null);
      console.log(checkConfirmId);

      if (checkConfirmId) {
        toast.warn('You have already confirmed!');
        return;
      }
      toast.success('Confirm success!');
    }
  };

  const handleExcelLSA = async () => {
    setIsOpen(true);
    // const isConfirm = tablect.every((item) => item.ConfirmId !== null);

    // if (isConfirm) {
    //   try {
    //     const res = await excelApi.exportLSA({
    //       ...filter,
    //       Account: auth?.UserID,
    //     });
    //     const url = URL.createObjectURL(new Blob([res]));

    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.setAttribute('download', 'Excel LSA.xlsx');
    //     document.body.appendChild(link);
    //     link.click();

    //     document.body.removeChild(link);
    //     window.URL.revokeObjectURL(url);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // } else {
    //   toast.warn('Please confirm your userId before export excel!');
    // }
  };

  const handleExcelTimeStudy = async () => {
    const isConfirm = tablect.every((item) => item.ConfirmId !== null);
    if (isConfirm) {
      try {
        const res = await excelApi.exportTimeStudy({
          ...filter,
          Account: auth?.UserID,
        });
        const url = URL.createObjectURL(new Blob([res]));

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Excel TimeStudy.xlsx');
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.log(error);
      }
    } else {
      toast.warn('Please confirm your userId before export excel!');
    }
  };

  const handleSave = async (
    e: React.MouseEvent<HTMLButtonElement>,
    item: ITableData
  ) => {
    e.stopPropagation();
    // console.log(item);
    const result = await dispatch(
      saveData({
        Id: item.Id,
        No: item.No,
        ProgressStagePartName: item.ProgressStagePartName,
        Area: item.Area,
        Path: item.Path,
        Nva: JSON.stringify(item.Nva),
        Va: JSON.stringify(item.Va),
        MachineType: item.MachineType,
        Loss: item.Loss,
        IsSave: true,
        CreatedBy: 'admin',
      })
    );
    if (saveData.fulfilled.match(result)) {
      dispatch(getData({ ...filter }));
    }
    dispatch(setActiveItemId(null));
    dispatch(setPath(''));
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>, Id: string) => {
    e.stopPropagation();
    dispatch(deleteData(Id));
    dispatch(historyplaybackDeleteMultiple(Id));
    dispatch(setActiveItemId(null));
    dispatch(setActiveColId(null));
  };

  const handleCheckAction = (item: ITableData) => {
    // console.log(item);
    const avgNva = item.Nva.Average;
    const avgVa = item.Va.Average;
    if (avgNva > 0 && avgVa > 0) {
      if (item.IsSave) {
        return (
          <button
            className={`bg-red-500 px-2 py-1 text-white font-medium rounded-md ${
              item.ConfirmId !== null
                ? 'cursor-not-allowed opacity-70'
                : 'cursor-pointer'
            }`}
            onClick={(e) => handleDelete(e, item.Id)}
            disabled={item.ConfirmId !== null ? true : false}
          >
            Delete
          </button>
        );
      }
      return (
        <button
          className={`bg-blue-500 px-2 py-1 text-white font-medium rounded-md`}
          onClick={(e) => handleSave(e, item)}
        >
          Save
        </button>
      );
    }
    return (
      <button
        className={`bg-green-500 px-2 py-1 text-white font-medium rounded-md`}
        onClick={(e) => handleDone(e, item)}
      >
        Done
      </button>
    );
  };

  const handleChangeMachineType = (
    e: SingleValue<{ value: string; label: string }>,
    Id: string
  ) => {
    dispatch(setMachineType({ machineTypeValue: e?.value as string, Id }));
  };

  const handleCheckDisabled = (item: ITableData): boolean | undefined => {
    if (item.Nva.Average > 0 && item.Va.Average > 0) return true;
    if (item.ConfirmId !== null) return true;
    return item.Id === activeItemId ? false : true;
  };

  return (
    <>
      <div className="mt-2 border border-gray-500">
        <div className="bg-gray-500 text-white">
          <div className="px-2 py-2 flex items-center justify-between">
            <div className="font-bold">TableCT</div>
            <div className="flex items-center gap-2">
              <button
                className={`bg-red-500 px-2 py-1 font-semibold rounded-md hover:opacity-70 ${
                  tablect
                    .filter((item) => item.Area === activeTabId)
                    .filter((item) => item.CreatedBy === auth?.UserID)
                    .length === 0
                    ? 'cursor-not-allowed opacity-70'
                    : 'cursor-pointer hover:opacity-70'
                }`}
                onClick={handleSync}
                disabled={
                  tablect
                    .filter((item) => item.Area === activeTabId)
                    .filter((item) => item.CreatedBy === auth?.UserID)
                    .length === 0
                    ? true
                    : false
                }
              >
                Refresh
              </button>
              <button
                className={`bg-blue-500 px-2 py-1 font-semibold rounded-md  ${
                  tablect
                    .filter((item) => item.Area === activeTabId)
                    .filter((item) => item.CreatedBy === auth?.UserID)
                    .length === 0
                    ? 'cursor-not-allowed opacity-70'
                    : 'cursor-pointer hover:opacity-70'
                }`}
                onClick={handleConfirm}
                disabled={
                  tablect
                    .filter((item) => item.Area === activeTabId)
                    .filter((item) => item.CreatedBy === auth?.UserID)
                    .length === 0
                    ? true
                    : false
                }
              >
                Confirm
              </button>
              <button
                className={`bg-green-500 px-2 py-1 font-semibold rounded-md hover:opacity-70 ${
                  tablect
                    .filter((item) => item.Area === activeTabId)
                    .filter((item) => item.CreatedBy === auth?.UserID)
                    .length === 0
                    ? 'cursor-not-allowed opacity-70'
                    : 'cursor-pointer hover:opacity-70'
                }`}
                onClick={handleExcelLSA}
                disabled={
                  tablect
                    .filter((item) => item.Area === activeTabId)
                    .filter((item) => item.CreatedBy === auth?.UserID)
                    .length === 0
                    ? true
                    : false
                }
              >
                Excel LSA
              </button>
              <button
                className={`bg-green-500 px-2 py-1 font-semibold rounded-md hover:opacity-70 ${
                  tablect
                    .filter((item) => item.Area === activeTabId)
                    .filter((item) => item.CreatedBy === auth?.UserID)
                    .length === 0
                    ? 'cursor-not-allowed opacity-70'
                    : 'cursor-pointer hover:opacity-70'
                }`}
                onClick={handleExcelTimeStudy}
                disabled={
                  tablect
                    .filter((item) => item.Area === activeTabId)
                    .filter((item) => item.CreatedBy === auth?.UserID)
                    .length === 0
                    ? true
                    : false
                }
              >
                Excel Time Study
              </button>
            </div>
          </div>
        </div>
        <div className="w-full overflow-x-auto max-h-[450px]">
          <table className="w-full min-w-max">
            <thead className=" bg-gray-400 sticky top-0 text-white z-10">
              {TABLE_HEADER.map((item, i) => (
                <tr key={i}>
                  <th className="px-4 py-4">{item.No}</th>
                  <th className="px-4 py-4">{item.ProgressStagePartName}</th>
                  <th className="px-4 py-4">{item.Type}</th>
                  {Array.from({ length: item.Cts }).map((_, i) => (
                    <th key={i} className="px-4 py-4">
                      CT{i + 1}
                    </th>
                  ))}
                  <th className="px-4 py-4">{item.Average}</th>
                  <th className="px-4 py-4">{item.MachineType}</th>
                  <th className="px-4 py-4">{item.Confirm}</th>
                  <th className="px-4 py-4">{item.Action}</th>
                </tr>
              ))}
            </thead>
            <tbody>
              {tablect
                .filter((item) => item.Area === activeTabId)
                .filter((item) => item.CreatedBy === auth?.UserID)
                .map((item) => (
                  <Fragment key={item.Id}>
                    <tr
                      className={`cursor-pointer ${
                        item.Id === activeItemId ? 'bg-gray-300' : ''
                      }`}
                      onClick={() => handleClickRow(item)}
                    >
                      <td
                        className="text-center border border-l-0 border-t-0 border-gray-400"
                        rowSpan={2}
                      >
                        {item.No}
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
                            `${item.Id}_${i}` === activeColId
                              ? 'bg-amber-200'
                              : ''
                          }`}
                          key={i}
                          onClick={(e) =>
                            handleClickColumn(
                              e,
                              `${item.Id}_${i}`,
                              item.Id,
                              item
                            )
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
                          <div onClick={(e) => e.stopPropagation()}>
                            <Select
                              isDisabled={handleCheckDisabled(item)}
                              options={machineTypes}
                              menuPlacement="auto"
                              menuPortalTarget={document.body}
                              menuPosition="absolute"
                              styles={{
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 9999,
                                }),
                              }}
                              onChange={(e) =>
                                handleChangeMachineType(e, item.Id)
                              }
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
                      className={`cursor-pointer ${
                        item.Id === activeItemId ? 'bg-gray-300' : ''
                      }`}
                      onClick={() => handleClickRow(item)}
                    >
                      <td className="text-center border border-t-0 border-gray-400">
                        {item.Va.Type}
                      </td>
                      {item.Va.Cts.map((ct, i) => (
                        <td
                          className={`text-center border border-t-0 border-gray-400 ${
                            `${item.Id}_${i}` === activeColId
                              ? 'bg-amber-200'
                              : ''
                          }`}
                          key={i}
                          onClick={(e) =>
                            handleClickColumn(
                              e,
                              `${item.Id}_${i}`,
                              item.Id,
                              item
                            )
                          }
                        >
                          {Number(ct.toFixed(2))}
                        </td>
                      ))}
                      <td className="text-center border border-t-0 border-gray-400">
                        {item.Va.Average}
                      </td>
                    </tr>
                  </Fragment>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      {isOpen && <ModalEstimateOutput setIsOpen={setIsOpen} />}
    </>
  );
};

export default TableCT;
