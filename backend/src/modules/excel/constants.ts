import * as ExcelJS from 'exceljs';
import { CellConfig, CellConfigTimeStudy } from './types';
// import { CellConfig, CellConfigTimeStudy } from './types';

export const defaultBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
};

export const defaultAlignment: Partial<ExcelJS.Alignment> = {
  vertical: 'middle',
};

export const defaultFont: Partial<ExcelJS.Font> = {
  name: 'adineue PRO TT Black',
  size: 11,
  bold: true,
};

export const defaultFill: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'ccffff' },
};

export const cellTimeStudy: CellConfigTimeStudy[] = [
  {
    range: 'A2:L2',
    value: 'PRODUCT DETAILS',
    style: {
      border: defaultBorder,
      alignment: defaultAlignment,
      font: defaultFont,
      fill: defaultFill,
    },
  },
  {
    range: 'M2:W2',
    value: 'CONCERN/ PROCESS Out-SCOPE DESCRIPTION',
    style: {
      border: { ...defaultBorder, right: { style: 'medium' } },
      alignment: { ...defaultAlignment, horizontal: 'center' },
      font: { ...defaultFont, color: { argb: 'FF0000' } },
      fill: defaultFill,
    },
  },
  {
    range: 'A3:B3',
    value: 'Season',
    style: {
      border: defaultBorder,
      alignment: defaultAlignment,
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'C3:E3',
    style: {
      border: defaultBorder,
      fill: { ...defaultFill, fgColor: { argb: 'fff9e7' } },
    },
  },
  {
    range: 'F3:H3',
    value: 'Model Name',
    style: {
      border: defaultBorder,
      alignment: defaultAlignment,
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'I3:L3',
    style: {
      border: defaultBorder,
      fill: { ...defaultFill, fgColor: { argb: 'fff9e7' } },
    },
  },
  {
    range: 'A4:B4',
    value: 'Factory',
    style: {
      border: defaultBorder,
      alignment: defaultAlignment,
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'C4:E4',
    style: {
      border: defaultBorder,
      fill: { ...defaultFill, fgColor: { argb: 'fff9e7' } },
    },
  },
  {
    range: 'F4:H4',
    value: 'Model Number/ Art. Number',
    style: {
      border: defaultBorder,
      alignment: defaultAlignment,
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'I4:L4',
    style: {
      border: defaultBorder,
      fill: { ...defaultFill, fgColor: { argb: 'fff9e7' } },
    },
  },
  {
    range: 'A5:B5',
    value: 'BU Name',
    style: {
      border: { ...defaultBorder, bottom: { style: 'medium' } },
      alignment: defaultAlignment,
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'C5:E5',
    style: {
      border: { ...defaultBorder, bottom: { style: 'medium' } },
      fill: { ...defaultFill, fgColor: { argb: 'fff9e7' } },
    },
  },
  {
    range: 'F5:H5',
    value: 'Age Group/ Gender',
    style: {
      border: { ...defaultBorder, bottom: { style: 'medium' } },
      alignment: defaultAlignment,
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'I5:L5',
    style: {
      border: { ...defaultBorder, bottom: { style: 'medium' } },
      fill: { ...defaultFill, fgColor: { argb: 'fff9e7' } },
    },
  },
  {
    range: 'M3:W5',
    style: {
      border: {
        ...defaultBorder,
        right: { style: 'medium' },
        bottom: { style: 'medium' },
      },
      fill: { ...defaultFill, fgColor: { argb: 'fff9e7' } },
    },
  },
  {
    range: 'A7:W7',
    value: 'ACTUAL TIME STUDY RESULT:',
    style: {
      border: {
        ...defaultBorder,
        top: { style: 'medium' },
        right: { style: 'medium' },
      },
      alignment: defaultAlignment,
      font: defaultFont,
      fill: defaultFill,
    },
  },
  {
    range: 'A8:B8',
    value: 'Conducted by:',
    style: {
      border: { ...defaultBorder },
      alignment: defaultAlignment,
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'C8:E8',
    style: {
      border: defaultBorder,
      fill: { ...defaultFill, fgColor: { argb: 'fff9e7' } },
    },
  },
  {
    range: 'F8:G8',
    value: 'Validate by: LO ME',
    style: {
      border: { ...defaultBorder },
      alignment: { ...defaultAlignment, horizontal: 'center' },
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'H8:J8',
    style: {
      border: defaultBorder,
      fill: { ...defaultFill, fgColor: { argb: 'fff9e7' } },
    },
  },
  {
    range: 'K8:L8',
    value: 'LOH Rate¹',
    style: {
      border: { ...defaultBorder },
      alignment: { ...defaultAlignment, horizontal: 'center' },
      font: { ...defaultFont, name: 'Arial', size: 11 },
      fill: defaultFill,
    },
  },
  {
    range: 'M8:N8',
    value: "Forecast in '000",
    style: {
      border: { ...defaultBorder },
      alignment: { ...defaultAlignment, horizontal: 'center' },
      font: { ...defaultFont, name: 'Arial', size: 11 },
      fill: defaultFill,
    },
  },
  {
    range: 'O8:P8',
    value: 'Prodvty PRS/HR',
    style: {
      border: { ...defaultBorder },
      alignment: { ...defaultAlignment, horizontal: 'center' },
      font: { ...defaultFont, name: 'Arial', size: 11 },
      fill: defaultFill,
    },
  },
  {
    range: 'Q8:R8',
    value: 'Estimated LC',
    style: {
      border: {
        ...defaultBorder,
        left: { style: 'medium' },
        top: { style: 'medium' },
      },
      alignment: { ...defaultAlignment, horizontal: 'center' },
      font: { ...defaultFont, name: 'Arial', size: 11 },
      fill: { ...defaultFill, fgColor: { argb: 'f4b084' } },
    },
  },
  {
    range: 'S8:T8',
    value: 'Est. Cost/Pair',
    style: {
      border: { ...defaultBorder, top: { style: 'medium' } },
      alignment: { ...defaultAlignment, horizontal: 'center' },
      font: { ...defaultFont, name: 'Arial', size: 11 },
      fill: { ...defaultFill, fgColor: { argb: 'f4b084' } },
    },
  },
  {
    range: 'U8:W8',
    value: 'Total Cost Impact',
    style: {
      border: {
        ...defaultBorder,
        top: { style: 'medium' },
        right: { style: 'medium' },
      },
      alignment: { ...defaultAlignment, horizontal: 'center' },
      font: { ...defaultFont, name: 'Arial', size: 11 },
      fill: { ...defaultFill, fgColor: { argb: 'f4b084' } },
    },
  },
  {
    range: 'A9:B9',
    value: 'Checked by: LOD',
    style: {
      border: { ...defaultBorder, bottom: { style: 'medium' } },
      alignment: defaultAlignment,
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'C9:E9',
    style: {
      border: { ...defaultBorder, bottom: { style: 'medium' } },
      fill: { ...defaultFill, fgColor: { argb: 'fff9e7' } },
    },
  },
  {
    range: 'F9:G9',
    value: 'Submitted toL LOC',
    style: {
      border: { ...defaultBorder, bottom: { style: 'medium' } },
      alignment: { ...defaultAlignment, horizontal: 'center' },
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'H9:J9',
    style: {
      border: { ...defaultBorder, bottom: { style: 'medium' } },
      fill: { ...defaultFill, fgColor: { argb: 'fff9e7' } },
    },
  },
  {
    range: 'K9:L9',
    style: {
      border: { ...defaultBorder, bottom: { style: 'medium' } },
      fill: { ...defaultFill, fgColor: { argb: 'fff9e7' } },
    },
  },
  {
    range: 'M9:N9',
    style: {
      border: { ...defaultBorder, bottom: { style: 'medium' } },
      fill: { ...defaultFill, fgColor: { argb: 'fff9e7' } },
    },
  },
  {
    range: 'O9:P9',
    style: {
      border: { ...defaultBorder, bottom: { style: 'medium' } },
      fill: defaultFill,
    },
  },
  {
    range: 'Q9:R9',
    style: {
      border: {
        ...defaultBorder,
        left: { style: 'medium' },
        bottom: { style: 'medium' },
      },
      fill: { ...defaultFill, fgColor: { argb: 'f4b084' } },
    },
  },
  {
    range: 'S9:T9',
    style: {
      border: { ...defaultBorder, bottom: { style: 'medium' } },
      fill: { ...defaultFill, fgColor: { argb: 'f4b084' } },
    },
  },
  {
    range: 'U9:W9',
    style: {
      border: {
        ...defaultBorder,
        right: { style: 'medium' },
        bottom: { style: 'medium' },
      },
      fill: { ...defaultFill, fgColor: { argb: 'f4b084' } },
    },
  },
  {
    range: 'A10:W10',
    value:
      'Calculation:   LC = Cycle Time in SEC.+ 15% allowance * 233/ (60x60)',
    style: {
      alignment: defaultAlignment,
      font: {
        ...defaultFont,
        name: 'Arial',
        size: 9,
        color: { argb: 'FF0000' },
      },
    },
  },
  {
    range: 'A11:W11',
    value:
      'ACTUAL TIME STUDY: CYCLE TIME RELATED TO WORKERS MANUAL OPERATIONS ONLY. Machine cycle time should not be considered.',
    style: {
      border: {
        ...defaultBorder,
        top: { style: 'medium' },
        right: { style: 'medium' },
      },
      alignment: defaultAlignment,
      font: defaultFont,
      fill: defaultFill,
    },
  },
  {
    range: 'A12:B12',
    value: 'Progress',
    style: {
      border: defaultBorder,
      alignment: { ...defaultAlignment, horizontal: 'center' },
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'C12:G12',
    value: 'Part Name/ Process description',
    style: {
      border: defaultBorder,
      alignment: { ...defaultAlignment, horizontal: 'center' },
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'H12:L12',
    value: 'Part Name/ Process description',
    style: {
      border: defaultBorder,
      alignment: { ...defaultAlignment, horizontal: 'center' },
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'M12',
    value: 'CT1 \n(in sec)',
    style: {
      border: defaultBorder,
      alignment: { ...defaultAlignment, horizontal: 'center', wrapText: true },
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'N12',
    value: 'CT2 \n(in sec)',
    style: {
      border: defaultBorder,
      alignment: { ...defaultAlignment, horizontal: 'center', wrapText: true },
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'O12',
    value: 'CT3 \n(in sec)',
    style: {
      border: defaultBorder,
      alignment: { ...defaultAlignment, horizontal: 'center', wrapText: true },
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'P12',
    value: 'CT4 \n(in sec)',
    style: {
      border: defaultBorder,
      alignment: { ...defaultAlignment, horizontal: 'center', wrapText: true },
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'Q12',
    value: 'CT5 \n(in sec)',
    style: {
      border: defaultBorder,
      alignment: { ...defaultAlignment, horizontal: 'center', wrapText: true },
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'R12',
    value: 'CT6 \n(in sec)',
    style: {
      border: defaultBorder,
      alignment: { ...defaultAlignment, horizontal: 'center', wrapText: true },
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'S12',
    value: 'CT7 \n(in sec)',
    style: {
      border: defaultBorder,
      alignment: { ...defaultAlignment, horizontal: 'center', wrapText: true },
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'T12',
    value: 'CT8 \n(in sec)',
    style: {
      border: defaultBorder,
      alignment: { ...defaultAlignment, horizontal: 'center', wrapText: true },
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'U12',
    value: 'CT9 \n(in sec)',
    style: {
      border: defaultBorder,
      alignment: { ...defaultAlignment, horizontal: 'center', wrapText: true },
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'V12',
    value: 'CT10 \n(in sec)',
    style: {
      border: defaultBorder,
      alignment: { ...defaultAlignment, horizontal: 'center', wrapText: true },
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
  {
    range: 'W12',
    value: 'Average CT',
    style: {
      border: { ...defaultBorder, right: { style: 'medium' } },
      alignment: { ...defaultAlignment, horizontal: 'center' },
      font: { ...defaultFont, name: 'Arial', size: 8 },
      fill: defaultFill,
    },
  },
];

// Define all cell configurations
export const cellConfigurations: CellConfig[] = [
  // Row 2
  { cell: 'A2', value: 'Model \n/Article' },
  { merge: 'C2:D2', cell: 'C2', value: 'Date-測時日期 \nNgày kiểm' },
  { merge: 'F2:G2', cell: 'F2', value: 'Block/Line: \n測時組別:' },
  { merge: 'H2:I2' },
  { merge: 'J2:K4' },

  // Row 3
  { cell: 'A3', value: 'Cut die: \n斬刀 \nDang dao' },
  { cell: 'B3' },
  {
    merge: 'C3:D3',
    cell: 'C3',
    value: 'Target output: \n标准產量(雙/小時) \nSản lượng 1 giờ',
  },
  {
    merge: 'F3:G3',
    cell: 'F3',
    value: 'Target Person \n目標人數(人) \nSố người tiêu chuẩn',
  },
  { merge: 'H3:I3' },

  // Row 4
  { cell: 'A4', value: '\nPPH\n' },
  {
    merge: 'C4:D4',
    cell: 'C4',
    value: 'Working time: \n工作時間 \nTgian làm việc',
  },
  { cell: 'E3' },
  { merge: 'F4:G4', cell: 'F4', value: 'TT' },
  { merge: 'H4:I4' },

  // Rows 5-6
  { merge: 'A5:A6', cell: 'A5', value: 'No \n(stt)序號' },
  { merge: 'B5:B6', cell: 'B5', value: 'Operation-操作名称 \n(Tên công đoạn)' },
  { merge: 'C5:F5', cell: 'C5', value: 'Standard \n標准工時 \nTgian chuẩn' },
  { cell: 'C6', value: '\nVA\n' },
  { cell: 'D6', value: '\nNVAN\n' },
  { cell: 'E6', value: '\nCT\n' },
  { cell: 'F6', value: '\nLoss\n' },
  {
    merge: 'G5:G6',
    cell: 'G5',
    value: 'Standard labor \n需求人力 \nSố LĐ chuẩn',
  },
  {
    merge: 'H5:H6',
    cell: 'H5',
    value: 'Alloted labor \n分配勞動人數 \nSố LĐ phân bổ',
  },
  { merge: 'I5:I6', cell: 'I5', value: 'Line balance \n人均工時' },
  { merge: 'J5:J6', cell: 'J5', value: 'Capacity \n標產(雙) \nSản lượng 1H' },
  { cell: 'K5', value: 'Remark \n备注 \nGhi chú' },
  { cell: 'K6', value: 'Manually' },
];
