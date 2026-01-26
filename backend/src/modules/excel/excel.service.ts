import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import {
  cellConfigurations,
  cellTimeStudy,
  defaultAlignment,
  defaultBorder,
  defaultFill,
  defaultFont,
} from './constants';
import { CTData, RowLSA, Section, SectionLSA, TimeStudyData } from './types';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { ITablectData, ITablectType } from 'src/types/tablect';
const QuickChart = require('quickchart-js');

@Injectable()
export class ExcelService {
  constructor(@Inject('IE') private readonly IE: Sequelize) {}

  //LSA
  // private applyCellConfigurations(worksheet: ExcelJS.Worksheet): void {
  //   const borderStyle = { style: 'thin' as ExcelJS.BorderStyle };

  //   cellConfigurations.forEach(({ cell, value, merge }) => {
  //     // Gộp ô nếu có merge
  //     if (merge) {
  //       worksheet.mergeCells(merge);

  //       // Xác định vùng gộp để áp dụng border
  //       const [startCell, endCell] = merge.split(':');
  //       const start = worksheet.getCell(startCell);
  //       const end = worksheet.getCell(endCell);
  //       const startRow = Number(start.row); // Ensure numeric type
  //       const endRow = Number(end.row); // Ensure numeric type
  //       const startCol = Number(start.col); // Ép kiểu
  //       const endCol = Number(end.col); // Ép kiểu

  //       // Áp dụng border cho tất cả ô trong vùng gộp
  //       for (let row = startRow; row <= endRow; row++) {
  //         for (let col = startCol; col <= endCol; col++) {
  //           worksheet.getCell(row, col).border = {
  //             top: borderStyle,
  //             right: borderStyle,
  //             bottom: borderStyle,
  //             left: borderStyle,
  //           };
  //           if (row === 5 || row === 6) {
  //             worksheet.getCell(row, col).fill = {
  //               type: 'pattern',
  //               pattern: 'solid',
  //               fgColor: { argb: 'ccffff' },
  //             };
  //           }
  //         }
  //       }
  //     }

  //     // Ghi giá trị và định dạng cho ô
  //     if (cell) {
  //       const targetCell = worksheet.getCell(cell);
  //       targetCell.value = value;
  //       targetCell.alignment = {
  //         wrapText: true,
  //         vertical: 'middle',
  //         horizontal: 'center',
  //       };
  //       targetCell.font = {
  //         name: 'Arial',
  //         family: 2,
  //         size: 10,
  //         bold: true,
  //       };

  //       // Áp dụng border cho ô đơn lẻ (nếu không thuộc vùng gộp)
  //       if (!merge) {
  //         targetCell.border = {
  //           top: borderStyle,
  //           right: borderStyle,
  //           bottom: borderStyle,
  //           left: borderStyle,
  //         };
  //         if (cell.includes('5') || cell.includes('6')) {
  //           worksheet.getCell(cell).fill = {
  //             type: 'pattern',
  //             pattern: 'solid',
  //             fgColor: { argb: 'ccffff' },
  //           };
  //         }
  //       }
  //     }
  //   });
  // }

  // async exportLSA(
  //   DateFrom: string,
  //   DateTo: string,
  //   Season: string,
  //   Stage: string,
  //   Area: string,
  //   Article: string,
  //   Account: string,
  // ) {
  //   let where = `WHERE 1=1`;
  //   const replacements: any[] = [];

  //   if (DateFrom && DateTo) {
  //     where += ` AND sl.[Date] BETWEEN ? AND ?`;
  //     replacements.push(DateFrom, DateTo);
  //   }

  //   if (Season) {
  //     where += ` AND sl.Season LIKE ?`;
  //     replacements.push(`%${Season}%`);
  //   }

  //   if (Stage) {
  //     where += ` AND sl.Stage LIKE ?`;
  //     replacements.push(`%${Stage}%`);
  //   }

  //   if (Area) {
  //     where += ` AND sl.Area LIKE ?`;
  //     replacements.push(`%${Area}%`);
  //   }

  //   if (Article) {
  //     where += ` AND sl.Article LIKE ?`;
  //     replacements.push(`%${Article}%`);
  //   }

  //   if (Account) {
  //     where += ` AND tb.CreatedBy LIKE ?`;
  //     replacements.push(`%${Account}%`);
  //   }

  //   const records: ITablectData[] = await this.IE.query(
  //     `SELECT tb.*
  //       FROM IE_TableCT AS tb
  //       LEFT JOIN IE_StageList AS sl ON sl.Id = tb.Id
  //       ${where}
  //       ORDER BY tb.CreatedAt`,
  //     {
  //       replacements,
  //       type: QueryTypes.SELECT,
  //     },
  //   );

  //   const groupedMap = new Map<string, Section>();

  //   for (const item of records) {
  //     const { No, ProgressStagePartName, Area, Nva, Va, Loss, MachineType } =
  //       item;

  //     const vaData = JSON.parse(Va) as ITablectType;
  //     const nvaData = JSON.parse(Nva) as ITablectType;

  //     const vaAvgCT = vaData.Average;
  //     const nvaAvgCT = nvaData.Average;
  //     const totalCT = vaAvgCT + nvaAvgCT;

  //     if (!groupedMap.has(Area)) {
  //       groupedMap.set(Area, {
  //         title: Area,
  //         rows: [],
  //         CT: 0,
  //         PP: 0,
  //       });
  //     }

  //     const section = groupedMap.get(Area)!;

  //     section.rows.push({
  //       no: No,
  //       operation: ProgressStagePartName,
  //       va: vaAvgCT,
  //       nvan: nvaAvgCT,
  //       ct: totalCT,
  //       loss: Loss,
  //       machineType: MachineType,
  //     });

  //     section.CT += totalCT;
  //     section.PP =
  //       section.CT === 0 ? 0 : Number((27000 / section.CT).toFixed(1));
  //   }

  //   const lsaData: Section[] = Array.from(groupedMap.values());

  //   const workbook = new ExcelJS.Workbook();
  //   const worksheet = workbook.addWorksheet('LSA');
  //   worksheet.properties.defaultRowHeight = 24;
  //   worksheet.getColumn('B').width = 67;
  //   worksheet.getColumn('E').width = 20;
  //   worksheet.getColumn('J').width = 30;

  //   worksheet.mergeCells('A1:K1');
  //   worksheet.getCell('A1').value =
  //     'LABOR STANDARD ADVICE (Sample) \nBẢNG ĐỊNH MỨC LAO ĐỘNG -工時定量表';
  //   worksheet.getCell('A1').style = {
  //     alignment: { wrapText: true, vertical: 'middle', horizontal: 'center' },
  //     font: { name: 'Arial', family: 2, bold: true, size: 14 },
  //     fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '99ccff' } },
  //   };
  //   for (let col = 1; col <= 10; col++) {
  //     const cell = worksheet.getCell(1, col);
  //     cell.border = {
  //       top: { style: 'thin' },
  //       right: { style: 'thin' },
  //       bottom: { style: 'thin' },
  //       left: { style: 'thin' },
  //     };
  //   }
  //   worksheet.getRow(1).height = 42;

  //   this.applyCellConfigurations(worksheet);

  //   let startRow = 7;

  //   lsaData.forEach((items) => {
  //     // Gộp ô A và B cho tiêu đề Section
  //     worksheet.mergeCells(`A${startRow}:B${startRow}`);
  //     worksheet.getCell(`A${startRow}`).value = items.title;
  //     worksheet.getCell(`A${startRow}`).style = {
  //       font: {
  //         name: 'Arial',
  //         family: 2,
  //         bold: true,
  //         size: 10,
  //         color: { argb: 'FF0000' },
  //       },
  //       alignment: { vertical: 'middle' },
  //     };

  //     worksheet.getRow(startRow).height = 24;
  //     startRow++;

  //     // Ghi từng row trong items.rows
  //     items.rows.forEach((item) => {
  //       worksheet.getCell(`A${startRow}`).value = item.no;
  //       worksheet.getCell(`B${startRow}`).value = item.operation;
  //       worksheet.getCell(`C${startRow}`).value = item.va;
  //       worksheet.getCell(`D${startRow}`).value = item.nvan;
  //       worksheet.getCell(`E${startRow}`).value = item.ct;
  //       worksheet.getCell(`F${startRow}`).value = item.loss;
  //       worksheet.getCell(`K${startRow}`).value = item.machineType;

  //       ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'].forEach(
  //         (col) => {
  //           worksheet.getCell(`${col}${startRow}`).style = {
  //             ...worksheet.getCell(`${col}${startRow}`).style,
  //             border: {
  //               top: { style: 'thin' },
  //               left: { style: 'thin' },
  //               bottom: { style: 'thin' },
  //               right: { style: 'thin' },
  //             },
  //             font: { name: 'Arial', family: 2, size: 10, bold: true },
  //             alignment: {
  //               vertical: 'middle',
  //               horizontal: col.includes('B') ? 'left' : 'center',
  //             },
  //           };
  //         },
  //       );
  //       worksheet.getRow(startRow).height = 24;
  //       startRow++;
  //     });

  //     const columnK = worksheet.getColumn('K');
  //     let maxLength = 0;
  //     columnK.eachCell({ includeEmpty: true }, (cell) => {
  //       const cellValue = cell.value ? cell.value.toString() : '';
  //       maxLength = Math.max(maxLength, cellValue.length);
  //     });
  //     columnK.width = maxLength;

  //     // Ghi CT
  //     worksheet.getCell(`D${startRow}`).value = 'CT';
  //     worksheet.getCell(`E${startRow}`).value = items.CT;
  //     ['D', 'E'].forEach((col) => {
  //       worksheet.getCell(`${col}${startRow}`).style = {
  //         ...worksheet.getCell(`${col}${startRow}`).style,
  //         alignment: { vertical: 'middle', horizontal: 'center' },
  //         font: {
  //           name: 'Arial',
  //           family: 2,
  //           size: 9,
  //           bold: true,
  //           color: { argb: 'FF0000' },
  //         },
  //       };
  //       worksheet.getRow(startRow).height = 24;
  //     });
  //     startRow++;

  //     // Ghi PP
  //     worksheet.getCell(`D${startRow}`).value = 'PP';
  //     worksheet.getCell(`E${startRow}`).value = items.PP;
  //     ['D', 'E'].forEach((col) => {
  //       worksheet.getCell(`${col}${startRow}`).style = {
  //         ...worksheet.getCell(`${col}${startRow}`).style,
  //         alignment: { vertical: 'middle', horizontal: 'center' },
  //         font: {
  //           name: 'Arial',
  //           family: 2,
  //           size: 9,
  //           bold: true,
  //           color: { argb: 'FF0000' },
  //         },
  //       };
  //       worksheet.getRow(startRow).height = 24;
  //     });
  //     startRow++;
  //   });

  //   const total = lsaData.reduce((prev, curr) => prev + curr.CT, 0);
  //   worksheet.getCell(`D${startRow}`).value = 'TOTAL:';
  //   worksheet.getCell(`E${startRow}`).value = total;
  //   ['D', 'E'].forEach((col) => {
  //     worksheet.getCell(`${col}${startRow}`).style = {
  //       ...worksheet.getCell(`${col}${startRow}`).style,
  //       alignment: { vertical: 'middle', horizontal: 'center' },
  //       font: {
  //         name: 'Arial',
  //         family: 2,
  //         size: 9,
  //         bold: true,
  //         color: { argb: 'FF0000' },
  //       },
  //     };
  //     worksheet.getRow(startRow).height = 24;
  //   });
  //   startRow++;

  //   worksheet.getCell(`D${startRow}`).value = 'PP:';
  //   worksheet.getCell(`E${startRow}`).value =
  //     total === 0 ? 0 : Number((27000 / total).toFixed(1));
  //   ['D', 'E'].forEach((col) => {
  //     worksheet.getCell(`${col}${startRow}`).style = {
  //       ...worksheet.getCell(`${col}${startRow}`).style,
  //       alignment: { vertical: 'middle', horizontal: 'center' },
  //       font: {
  //         name: 'Arial',
  //         family: 2,
  //         size: 9,
  //         bold: true,
  //         color: { argb: 'FF0000' },
  //       },
  //     };
  //     worksheet.getRow(startRow).height = 24;
  //   });
  //   startRow++;

  //   worksheet.getCell(`B${startRow}`).value = 'Unit \n單位';
  //   worksheet.getCell(`B${startRow}`).style = {
  //     border: {
  //       top: { style: 'thin' },
  //       left: { style: 'thin' },
  //       bottom: { style: 'thin' },
  //       right: { style: 'thin' },
  //     },
  //     alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
  //     font: {
  //       name: 'Arial',
  //       family: 2,
  //       size: 10,
  //       bold: true,
  //     },
  //   };

  //   worksheet.mergeCells(`C${startRow}:D${startRow}`);
  //   worksheet.getCell(`C${startRow}`).value = 'Time(second) \n時間';
  //   ['C', 'D'].forEach((col) => {
  //     worksheet.getCell(`${col}${startRow}`).style = {
  //       ...worksheet.getCell(`${col}${startRow}`).style,
  //       alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
  //       font: {
  //         name: 'Arial',
  //         family: 2,
  //         size: 9,
  //         bold: true,
  //       },
  //       border: {
  //         top: { style: 'thin' },
  //         left: { style: 'thin' },
  //         bottom: { style: 'thin' },
  //         right: { style: 'thin' },
  //       },
  //     };
  //     worksheet.getRow(startRow).height = 24;
  //   });

  //   worksheet.mergeCells(`E${startRow}:F${startRow}`);
  //   worksheet.getCell(`E${startRow}`).value = 'Pair/Person/8h \n雙數/人/8h';
  //   ['E', 'F'].forEach((col) => {
  //     worksheet.getCell(`${col}${startRow}`).style = {
  //       ...worksheet.getCell(`${col}${startRow}`).style,
  //       alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
  //       font: {
  //         name: 'Arial',
  //         family: 2,
  //         size: 9,
  //         bold: true,
  //       },
  //       border: {
  //         top: { style: 'thin' },
  //         left: { style: 'thin' },
  //         bottom: { style: 'thin' },
  //         right: { style: 'thin' },
  //       },
  //     };
  //     worksheet.getRow(startRow).height = 24;
  //   });

  //   worksheet.mergeCells(`G${startRow}:I${startRow}`);
  //   worksheet.getCell(`G${startRow}`).value = 'LLER';
  //   ['G', 'H', 'I'].forEach((col) => {
  //     worksheet.getCell(`${col}${startRow}`).style = {
  //       ...worksheet.getCell(`${col}${startRow}`).style,
  //       alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
  //       font: {
  //         name: 'Arial',
  //         family: 2,
  //         size: 9,
  //         bold: true,
  //       },
  //       border: {
  //         top: { style: 'thin' },
  //         left: { style: 'thin' },
  //         bottom: { style: 'thin' },
  //         right: { style: 'thin' },
  //       },
  //     };
  //     worksheet.getRow(startRow).height = 24;
  //   });

  //   startRow++;

  //   const processes = [
  //     { name: '(Cutting)裁斷', time: 0.0, pairPerPerson: 0, ller: 0.0 },
  //     { name: '(Stitching)針車', time: 0.0, pairPerPerson: 0, ller: 0.0 },
  //     { name: '(F+A)成型+包裝', time: 0.0, pairPerPerson: 0, ller: 0.0 },
  //     {
  //       name: '(C2B)裁斷+針車+成型+包裝',
  //       time: 0.0,
  //       pairPerPerson: 0,
  //       ller: 0.0,
  //     },
  //   ];

  //   processes.forEach((process) => {
  //     worksheet.getCell(`B${startRow}`).value = process.name;
  //     worksheet.mergeCells(`C${startRow}:D${startRow}`);
  //     worksheet.getCell(`C${startRow}`).value = process.time;
  //     worksheet.mergeCells(`E${startRow}:F${startRow}`);
  //     worksheet.getCell(`E${startRow}`).value = process.pairPerPerson;
  //     worksheet.mergeCells(`G${startRow}:I${startRow}`);
  //     worksheet.getCell(`G${startRow}`).value = process.ller;

  //     // Thêm border cho các ô
  //     ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach((col) => {
  //       worksheet.getCell(`${col}${startRow}`).style = {
  //         ...worksheet.getCell(`${col}${startRow}`).style,
  //         border: {
  //           top: { style: 'thin' },
  //           left: { style: 'thin' },
  //           bottom: { style: 'thin' },
  //           right: { style: 'thin' },
  //         },
  //         alignment: {
  //           vertical: 'middle',
  //           horizontal: 'center',
  //         },
  //         font: {
  //           name: 'Arial',
  //           family: 2,
  //           size: 10,
  //           bold: true,
  //         },
  //         numFmt: col === 'G' ? '0.00%' : '',
  //       };
  //       worksheet.getRow(startRow).height = 24;
  //     });

  //     startRow++;
  //   });

  //   worksheet.getCell(`B${startRow}`).value = 'Chủ quản xưởng vụ 廠務主管';
  //   worksheet.mergeCells(`C${startRow}:E${startRow}`);
  //   worksheet.getCell(`C${startRow}`).value = 'Chủ quản hiện trường 現場主管';
  //   worksheet.mergeCells(`F${startRow}:I${startRow}`);
  //   worksheet.getCell(`F${startRow}`).value = 'Chủ quản định mức 企劃主管';
  //   worksheet.mergeCells(`J${startRow}:K${startRow}`);
  //   worksheet.getCell(`J${startRow}`).value = 'Lập biểu 制表';
  //   ['B', 'C', 'E', 'F', 'G', 'I', 'J', 'K'].forEach((col) => {
  //     worksheet.getCell(`${col}${startRow}`).style = {
  //       ...worksheet.getCell(`${col}${startRow}`).style,
  //       alignment: {
  //         vertical: 'middle',
  //         horizontal: 'center',
  //       },
  //       font: {
  //         name: 'Arial',
  //         family: 2,
  //         size: 10,
  //         bold: true,
  //       },
  //     };
  //     worksheet.getRow(startRow).height = 24;
  //   });
  //   startRow++;

  //   return await workbook.xlsx.writeBuffer();
  // }

  //Time Study
  private setMergedCell = (
    worksheet: ExcelJS.Worksheet,
    range: string,
    value?: string,
    style?: Partial<ExcelJS.Style>,
  ): void => {
    if (range.includes(':')) {
      // Vùng ô: gộp và áp dụng style cho tất cả các ô trong vùng
      worksheet.mergeCells(range);
      const [startCell, endCell] = range.split(':');
      const start = worksheet.getCell(startCell);
      const end = worksheet.getCell(endCell);

      // Lấy tọa độ cột và hàng
      const startCol = Number(start.col);
      const startRow = Number(start.row);
      const endCol = Number(end.col);
      const endRow = Number(end.row);

      // Áp dụng value cho ô đầu tiên (nếu có)
      if (value) {
        start.value = value;
      }

      // Áp dụng style cho tất cả các ô trong vùng
      if (style) {
        for (let row = startRow; row <= endRow; row++) {
          for (let col = startCol; col <= endCol; col++) {
            worksheet.getCell(row, col).style = style;
          }
        }
      }
    } else {
      // Ô đơn: không gộp, chỉ áp dụng value và style
      const cell = worksheet.getCell(range);
      if (value) {
        cell.value = value;
      }
      if (style) {
        cell.style = style;
      }
    }
  };

  async exportTimeStudy(
    DateFrom: string,
    DateTo: string,
    Season: string,
    Stage: string,
    Area: string,
    Article: string,
    Account: string,
  ) {
    let where = 'WHERE 1=1';
    const replacements: any[] = [];

    if (DateFrom && DateTo) {
      where += ` AND sl.[Date] BETWEEN ? AND ?`;
      replacements.push(DateFrom, DateTo);
    }

    if (Season) {
      where += ` AND sl.Season LIKE ?`;
      replacements.push(`%${Season}%`);
    }

    if (Stage) {
      where += ` AND sl.Stage LIKE ?`;
      replacements.push(`%${Stage}%`);
    }

    if (Area) {
      where += ` AND sl.Area LIKE ?`;
      replacements.push(`%${Area}%`);
    }

    if (Article) {
      where += ` AND sl.Article LIKE ?`;
      replacements.push(`%${Article}%`);
    }

    if (Account) {
      where += ` AND tb.CreatedBy LIKE ?`;
      replacements.push(`%${Account}%`);
    }

    const records: ITablectData[] = await this.IE.query(
      `SELECT tb.*, sl.Season, sl.Article, sl.CreatedFactory
        FROM IE_TableCT as tb
        LEFT JOIN IE_StageList as sl ON sl.Id = tb.Id
        ${where}`,
      { replacements, type: QueryTypes.SELECT },
    );

    const timeStudyData: ITablectData[] = records;

    const imagePath = path.join(process.cwd(), '/assets/image/adidas.png');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Time Study');
    worksheet.properties.defaultRowHeight = 24;
    worksheet.getColumn('W').width = 14;
    worksheet.views = [{ showGridLines: false }];

    worksheet.mergeCells('A1:W1');
    worksheet.getCell('A1').value =
      'FW COSTING EXCEPTIONAL ADJUSTMENT TIME STUDY TEMPLATE:';
    for (let col = 1; col <= 23; col++) {
      worksheet.getCell(1, col).style = {
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'medium' },
        },
        font: { name: 'adineue PRO TT Black', size: 14, bold: true },
        alignment: { vertical: 'middle' },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'ccfffff' },
        },
      };
    }
    const image = fs.readFileSync(imagePath);
    const imageId = workbook.addImage({
      buffer: image as any,
      extension: 'png',
    });
    worksheet.addImage(imageId, 'V1:W1');

    cellTimeStudy.forEach((item) => {
      this.setMergedCell(worksheet, item.range, item.value, item.style);
    });

    if (records.length !== 0) {
      worksheet.getCell('C3').value = records[0].Season;
      worksheet.getCell('C3').style = {
        border: { ...defaultBorder },
        alignment: { ...defaultAlignment },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'fff9e7' },
        },
      };
      worksheet.getCell('C4').value = records[0].CreatedFactory;
      worksheet.getCell('C4').style = {
        border: { ...defaultBorder },
        alignment: { ...defaultAlignment },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'fff9e7' },
        },
      };
      worksheet.getCell('I4').value = records[0].Article;
      worksheet.getCell('I4').style = {
        border: { ...defaultBorder },
        alignment: { ...defaultAlignment },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'fff9e7' },
        },
      };
    }

    let startRow = 13;
    const totalCT: CTData = {
      CT1: 0,
      CT2: 0,
      CT3: 0,
      CT4: 0,
      CT5: 0,
      CT6: 0,
      CT7: 0,
      CT8: 0,
      CT9: 0,
      CT10: 0,
      AvgCT: 0,
    };

    timeStudyData.map((item) => {
      worksheet.mergeCells(`A${startRow}:B${startRow}`);
      worksheet.getCell(`A${startRow}`).value = item.No;
      worksheet.mergeCells(`C${startRow}:G${startRow}`);
      worksheet.getCell(`C${startRow}`).value = item.ProgressStagePartName;
      worksheet.mergeCells(`H${startRow}:L${startRow}`);
      const nva = JSON.parse(item.Nva) as ITablectType;
      worksheet.getCell(`H${startRow}`).value = nva.Type;
      worksheet.getCell(`M${startRow}`).value = nva.Cts[0];
      worksheet.getCell(`N${startRow}`).value = nva.Cts[1];
      worksheet.getCell(`O${startRow}`).value = nva.Cts[2];
      worksheet.getCell(`P${startRow}`).value = nva.Cts[3];
      worksheet.getCell(`Q${startRow}`).value = nva.Cts[4];
      worksheet.getCell(`R${startRow}`).value = nva.Cts[5];
      worksheet.getCell(`S${startRow}`).value = nva.Cts[6];
      worksheet.getCell(`T${startRow}`).value = nva.Cts[7];
      worksheet.getCell(`U${startRow}`).value = nva.Cts[8];
      worksheet.getCell(`V${startRow}`).value = nva.Cts[9];
      worksheet.getCell(`W${startRow}`).value = nva.Average;

      [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
      ].map((item) => {
        worksheet.getCell(`${item}${startRow}`).style = {
          border: {
            ...defaultBorder,
            right: { style: item === 'W' ? 'medium' : 'thin' },
          },
          font: {
            ...defaultFont,
            name: 'Arial',
            size: 10,
            bold: item === 'W' ? true : false,
          },
          alignment: {
            ...defaultAlignment,
            horizontal:
              item === 'W'
                ? 'center'
                : item === 'A' || item === 'C' || item === 'H'
                  ? 'left'
                  : 'right',
          },
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: item === 'W' ? 'ccffff' : 'fff9e7' },
          },
        };
      });

      totalCT.CT1 += nva.Cts[0];
      totalCT.CT2 += nva.Cts[1];
      totalCT.CT3 += nva.Cts[2];
      totalCT.CT4 += nva.Cts[3];
      totalCT.CT5 += nva.Cts[4];
      totalCT.CT6 += nva.Cts[5];
      totalCT.CT7 += nva.Cts[6];
      totalCT.CT8 += nva.Cts[7];
      totalCT.CT9 += nva.Cts[8];
      totalCT.CT10 += nva.Cts[9];
      totalCT.AvgCT += nva.Average;
      startRow++;

      worksheet.mergeCells(`A${startRow}:B${startRow}`);
      worksheet.getCell(`A${startRow}`).value = '';
      worksheet.mergeCells(`C${startRow}:G${startRow}`);
      worksheet.getCell(`C${startRow}`).value = '';
      worksheet.mergeCells(`H${startRow}:L${startRow}`);
      const va = JSON.parse(item.Va) as ITablectType;
      worksheet.getCell(`H${startRow}`).value = va.Type;
      worksheet.getCell(`M${startRow}`).value = va.Cts[0];
      worksheet.getCell(`N${startRow}`).value = va.Cts[1];
      worksheet.getCell(`O${startRow}`).value = va.Cts[2];
      worksheet.getCell(`P${startRow}`).value = va.Cts[3];
      worksheet.getCell(`Q${startRow}`).value = va.Cts[4];
      worksheet.getCell(`R${startRow}`).value = va.Cts[5];
      worksheet.getCell(`S${startRow}`).value = va.Cts[6];
      worksheet.getCell(`T${startRow}`).value = va.Cts[7];
      worksheet.getCell(`U${startRow}`).value = va.Cts[8];
      worksheet.getCell(`V${startRow}`).value = va.Cts[9];
      worksheet.getCell(`W${startRow}`).value = va.Average;

      [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
      ].map((item) => {
        worksheet.getCell(`${item}${startRow}`).style = {
          border: {
            ...defaultBorder,
            right: { style: item === 'W' ? 'medium' : 'thin' },
          },
          font: {
            ...defaultFont,
            name: 'Arial',
            size: 10,
            bold: item === 'W' ? true : false,
          },
          alignment: {
            ...defaultAlignment,
            horizontal:
              item === 'W'
                ? 'center'
                : item === 'A' || item === 'C' || item === 'H'
                  ? 'left'
                  : 'right',
          },
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: item === 'W' ? 'ccffff' : 'fff9e7' },
          },
        };
      });
      totalCT.CT1 += va.Cts[0];
      totalCT.CT2 += va.Cts[1];
      totalCT.CT3 += va.Cts[2];
      totalCT.CT4 += va.Cts[3];
      totalCT.CT5 += va.Cts[4];
      totalCT.CT6 += va.Cts[5];
      totalCT.CT7 += va.Cts[6];
      totalCT.CT8 += va.Cts[7];
      totalCT.CT9 += va.Cts[8];
      totalCT.CT10 += va.Cts[9];
      totalCT.AvgCT += va.Average;
      startRow++;
    });

    worksheet.mergeCells(`A${startRow}:L${startRow}`);
    worksheet.getCell(`A${startRow}`).value = 'Total';
    for (let col = 1; col <= 12; col++) {
      worksheet.getCell(startRow, col).style = {
        border: { ...defaultBorder, bottom: { style: 'medium' } },
        alignment: { ...defaultAlignment, horizontal: 'center' },
        font: { ...defaultFont, name: 'Arial', size: 10 },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'ccffff' },
        },
      };
    }
    let startCol: number = 13;
    Object.values(totalCT).forEach((item: number) => {
      worksheet.getCell(startRow, startCol).value = item;
      worksheet.getCell(startRow, startCol).style = {
        border: {
          ...defaultBorder,
          right: { style: startCol === 23 ? 'medium' : 'thin' },
          bottom: { style: 'medium' },
        },
        font: {
          ...defaultFont,
          name: 'Arial',
          size: startCol === 23 ? 12 : 10,
        },
        alignment: {
          ...defaultAlignment,
          horizontal: startCol === 23 ? 'center' : 'right',
        },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'ccffff' },
        },
      };
      startCol++;
    });
    startRow += 2;

    worksheet.mergeCells(`A${startRow}:W${startRow}`);
    worksheet.getCell(`A${startRow}`).value =
      'OTHER OBSERVATIONS:  if any/ if needed';
    for (let col = 1; col <= 23; col++) {
      worksheet.getCell(startRow, col).style = {
        border: {
          ...defaultBorder,
          top: { style: 'medium' },
          left: { style: 'medium' },
          bottom: { style: 'medium' },
          right: { style: 'medium' },
        },
        font: { ...defaultFont, size: 14 },
        alignment: { ...defaultAlignment },
        fill: { ...defaultFill },
      };
    }
    startRow++;

    worksheet.mergeCells(`A${startRow}:C${startRow}`);
    worksheet.getCell(`A${startRow}`).value = 'Type of Machine';
    worksheet.mergeCells(`D${startRow}:H${startRow}`);
    worksheet.getCell(`D${startRow}`).value = 'Process';
    worksheet.mergeCells(`I${startRow}:J${startRow}`);
    worksheet.getCell(`I${startRow}`).value = 'No. of Machines';
    worksheet.mergeCells(`K${startRow}:L${startRow}`);
    worksheet.getCell(`K${startRow}`).value = 'CT (in sec)';
    worksheet.mergeCells(`M${startRow}:W${startRow}`);
    worksheet.getCell(`M${startRow}`).value = 'Photo of Finished Components';
    [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
    ].forEach((item) => {
      worksheet.getCell(`${item}${startRow}`).style = {
        border: {
          ...defaultBorder,
          left: { style: item === 'M' ? 'medium' : 'thin' },
          right: { style: item === 'W' ? 'medium' : 'thin' },
        },
        font: { ...defaultFont, name: 'Arial', size: 8 },
        alignment: {
          ...defaultAlignment,
          horizontal: item === 'M' ? 'left' : 'center',
        },
        fill: { ...defaultFill },
      };
    });
    startRow++;

    for (let i = startRow; i <= startRow + 6; i++) {
      worksheet.mergeCells(`A${i}:C${i}`);
      worksheet.mergeCells(`D${i}:H${i}`);
      worksheet.mergeCells(`I${i}:J${i}`);
      worksheet.mergeCells(`K${i}:L${i}`);
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].forEach(
        (item) => {
          worksheet.getCell(`${item}${i}`).style = {
            border: {
              ...defaultBorder,
              bottom: { style: i === startRow + 6 ? 'medium' : 'thin' },
            },
            fill: {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'fff9e7' },
            },
          };
        },
      );
    }

    worksheet.mergeCells(`M${startRow}:W${startRow + 6}`);
    for (let row = startRow; row <= startRow + 6; row++) {
      for (let col = 13; col <= 23; col++) {
        worksheet.getCell(row, col).style = {
          border: {
            ...defaultBorder,
            left: { style: col === 13 ? 'medium' : 'thin' },
            right: { style: col === 23 ? 'medium' : 'thin' },
            bottom: { style: 'medium' },
          },
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'fff9e7' },
          },
        };
      }
    }
    startRow += 8;

    worksheet.mergeCells(`A${startRow}:W${startRow}`);
    worksheet.getCell(`A${startRow}`).value =
      'ADDITIONAL NOTES/ RECOMMENDATION:';
    for (let col = 1; col <= 23; col++) {
      worksheet.getCell(startRow, col).style = {
        border: {
          ...defaultBorder,
          top: { style: 'medium' },
          left: { style: 'medium' },
          bottom: { style: 'medium' },
          right: { style: 'medium' },
        },
        font: { ...defaultFont, size: 14 },
        alignment: { ...defaultAlignment },
        fill: { ...defaultFill },
      };
    }
    startRow++;

    worksheet.mergeCells(`A${startRow}:W${startRow + 6}`);
    for (let row = startRow; row <= startRow + 6; row++) {
      for (let col = 1; col <= 23; col++) {
        worksheet.getCell(row, col).style = {
          border: {
            ...defaultBorder,
            right: { style: col === 23 ? 'medium' : 'thin' },
            bottom: { style: 'medium' },
          },
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'fff9e7' },
          },
        };
      }
    }
    startRow += 8;

    worksheet.mergeCells(`A${startRow}:W${startRow}`);
    worksheet.getCell(`A${startRow}`).value = 'DETAILED PROCESS ILLUSTRATIONS:';
    for (let col = 1; col <= 23; col++) {
      worksheet.getCell(startRow, col).style = {
        border: {
          ...defaultBorder,
          top: { style: 'medium' },
          left: { style: 'medium' },
          bottom: { style: 'medium' },
          right: { style: 'medium' },
        },
        font: { ...defaultFont, size: 14 },
        alignment: { ...defaultAlignment },
        fill: { ...defaultFill },
      };
    }
    startRow++;

    worksheet.mergeCells(`A${startRow}:W${startRow + 45}`);
    worksheet.getCell(`A${startRow}`).value =
      'VIDEO and Pictures with detailed descriptions';
    for (let row = startRow; row <= startRow + 45; row++) {
      for (let col = 1; col <= 23; col++) {
        worksheet.getCell(row, col).style = {
          border: {
            ...defaultBorder,
            right: { style: col === 23 ? 'medium' : 'thin' },
            bottom: { style: 'medium' },
          },
          font: {
            ...defaultFont,
            name: 'Arial',
            size: 14,
            color: { argb: 'FF0000' },
          },
          alignment: { ...defaultAlignment, vertical: 'top' },
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'fff9e7' },
          },
        };
      }
    }
    return await workbook.xlsx.writeBuffer();
  }

  //Test LSA
  async exportLSA(
    DateFrom: string,
    DateTo: string,
    Season: string,
    Stage: string,
    Area: string,
    Article: string,
    Account: string,
    EstimateOutput: number = 200,
    TatkTime: number = 18,
  ) {
    let where = `WHERE 1=1`;
    const replacements: any[] = [];

    if (DateFrom && DateTo) {
      where += ` AND sl.[Date] BETWEEN ? AND ?`;
      replacements.push(DateFrom, DateTo);
    }

    if (Season) {
      where += ` AND sl.Season LIKE ?`;
      replacements.push(`%${Season}%`);
    }

    if (Stage) {
      where += ` AND sl.Stage LIKE ?`;
      replacements.push(`%${Stage}%`);
    }

    if (Area) {
      where += ` AND sl.Area LIKE ?`;
      replacements.push(`%${Area}%`);
    }

    if (Article) {
      where += ` AND sl.Article LIKE ?`;
      replacements.push(`%${Article}%`);
    }

    if (Account) {
      where += ` AND tb.CreatedBy LIKE ?`;
      replacements.push(`%${Account}%`);
    }

    const records: ITablectData[] = await this.IE.query(
      `SELECT tb.*, sl.Article, sl.CutDie
        FROM IE_TableCT AS tb
        LEFT JOIN IE_StageList AS sl ON sl.Id = tb.Id
        ${where}
        ORDER BY 
          CASE WHEN tb.OrderIndex IS NULL THEN 1 ELSE 0 END, 
          tb.OrderIndex ASC,
          tb.CreatedAt`,
      {
        replacements,
        type: QueryTypes.SELECT,
      },
    );

    if (records.length === 0) {
      throw new InternalServerErrorException('No data to export');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('LSA');
    worksheet.views = [{ state: 'normal', zoomScale: 85 }];

    worksheet.getColumn('B').width = 40;
    worksheet.getColumn('M').width = 25;
    worksheet.getRow(7).height = 48;

    worksheet.mergeCells('A1:M1');
    worksheet.getCell('A1').value =
      'LABOR STANDARD ADVICE \nBẢNG ĐỊNH MỨC LAO ĐỘNG - 工時定量表';
    worksheet.properties.defaultRowHeight = 24;

    worksheet.getCell('A1').style = {
      alignment: { wrapText: true, vertical: 'middle', horizontal: 'center' },
      font: { name: 'Times New Roman', family: 2, bold: true, size: 14 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'ffd966' },
      },
    };
    for (let col = 1; col <= 13; col++) {
      const cell = worksheet.getCell(1, col);
      cell.border = {
        top: { style: 'thin' },
        right: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
      };
    }

    worksheet.getRow(1).height = 50;

    worksheet.getCell('A2').value = 'Model /\nArticle';
    worksheet.getCell('B2').value = records[0].Article || '';
    worksheet.mergeCells('C2:F2');
    worksheet.mergeCells('G2:M2');
    worksheet.getCell('C2').value = 'Date-測時日期 \nNgày kiểm';

    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].forEach(
      (item) => {
        worksheet.getCell(`${item}2`).style = {
          alignment: {
            wrapText: true,
            vertical: 'middle',
            horizontal: 'left',
          },
          font: { name: 'Times New Roman', bold: true, size: 11 },
          border: {
            top: { style: 'thin' },
            right: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
          },
        };
      },
    );

    worksheet.getCell('A3').value = 'Cut die:\n斬刀';
    worksheet.getCell('B3').value = records[0].CutDie || '';
    worksheet.mergeCells('C3:F3');
    worksheet.mergeCells('G3:M3');
    worksheet.getCell('C3').value =
      'Estimate output:\n預計產量 \nSản lương dư tinh';
    worksheet.getCell('G3').value = `${EstimateOutput} Pairs` || '';

    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].forEach(
      (item) => {
        worksheet.getCell(`${item}3`).style = {
          alignment: {
            wrapText: true,
            vertical: 'middle',
            horizontal: 'left',
          },
          font: { name: 'Times New Roman', bold: true, size: 11 },
          border: {
            top: { style: 'thin' },
            right: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
          },
        };
      },
    );

    worksheet.getCell('A4').value = 'Block/ \nLine: \n測時組別:';
    worksheet.mergeCells('C4:F4');
    worksheet.mergeCells('G4:M4');
    worksheet.getCell('C4').value = 'Working time: 工作時間 \nTgian làm việc';
    worksheet.getCell('G4').value = '8 hours';

    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].forEach(
      (item) => {
        worksheet.getCell(`${item}4`).style = {
          alignment: {
            wrapText: true,
            vertical: 'middle',
            horizontal: 'left',
          },
          font: { name: 'Times New Roman', bold: true, size: 11 },
          border: {
            top: { style: 'thin' },
            right: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
          },
        };
      },
    );

    worksheet.getCell('A5').value = 'PPH';
    worksheet.mergeCells('C5:F5');
    worksheet.mergeCells('G5:M5');
    worksheet.getCell('C5').value = 'Tatk time';
    worksheet.getCell('G5').value = `${TatkTime} sec` || '';
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].forEach(
      (item) => {
        worksheet.getCell(`${item}5`).style = {
          alignment: {
            wrapText: true,
            vertical: 'middle',
            horizontal: 'left',
          },
          font: { name: 'Times New Roman', bold: true, size: 11 },
          border: {
            top: { style: 'thin' },
            right: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
          },
        };
      },
    );

    worksheet.mergeCells('A6:A7');
    worksheet.mergeCells('B6:B7');
    worksheet.mergeCells('G6:G7');
    worksheet.mergeCells('H6:H7');
    worksheet.mergeCells('I6:I7');
    worksheet.mergeCells('J6:J7');
    worksheet.mergeCells('K6:K7');
    worksheet.mergeCells('L6:L7');
    worksheet.mergeCells('M6:M7');
    worksheet.mergeCells('C6:F6');

    worksheet.getCell('A6').value = 'No \n序號';
    worksheet.getCell('B6').value = 'Operation-操作名稱 \n(Tên công đoạn)';
    worksheet.getCell('C6').value = 'Standard \n標準工時 \nTgian chuẩn';
    worksheet.getCell('G6').value = 'Standard Labor \n需求人力 \nSố LĐ chuẩn';
    worksheet.getCell('H6').value =
      'Allocated Labor \n分配勞動人數 \nSố LĐ phân bổ';
    worksheet.getCell('I6').value = 'Line balance \n人均工時';
    worksheet.getCell('J6').value = 'Multi-skill';
    worksheet.getCell('K6').value = 'Capacity \n標產(雙) \nSản lượng 1H';
    worksheet.getCell('L6').value = 'Actual  Labor \n實際人力 \nSố LĐ t.tế';
    worksheet.getCell('M6').value = 'Remark \n備註 \nChi chú';
    ['A', 'B', 'C', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].forEach((item) => {
      worksheet.getCell(`${item}6`).style = {
        alignment: { wrapText: true, vertical: 'middle', horizontal: 'center' },
        font: { name: 'Times New Roman', bold: true, size: 11 },
        border: {
          top: { style: 'thin' },
          right: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
        },
      };
    });

    worksheet.getCell('C7').value = 'VA';
    worksheet.getCell('D7').value = 'NVA';
    worksheet.getCell('E7').value = 'LOSS';
    worksheet.getCell('F7').value = 'CT';

    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].forEach(
      (item) => {
        worksheet.getCell(`${item}7`).style = {
          alignment: {
            wrapText: true,
            vertical: 'middle',
            horizontal: 'center',
          },
          font: { name: 'Times New Roman', bold: true, size: 11, family: 2 },
          border: {
            top: { style: 'thin' },
            right: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
          },
        };
      },
    );

    const groupedMap = new Map<string, SectionLSA>();

    for (const item of records) {
      const { No, ProgressStagePartName, Area, Nva, Va, Loss, MachineType } =
        item;

      const vaData = JSON.parse(Va) as ITablectType;
      const nvaData = JSON.parse(Nva) as ITablectType;

      const lossValue = Loss ? parseFloat(Loss) : 0;

      const vaAvgCT = vaData.Average;
      const nvaAvgCT = nvaData.Average;
      const totalCT = Number((vaAvgCT + nvaAvgCT) * (1 + lossValue / 100));

      const standardLabor = Number((totalCT / TatkTime).toFixed(1));
      const allocatedLabor = Number(standardLabor.toFixed(1));
      const capacity = Number((3600 / totalCT).toFixed(0));
      const actualLabor =
        Math.abs(allocatedLabor - Math.trunc(allocatedLabor)) >= 0.25
          ? Math.ceil(allocatedLabor)
          : Math.round(allocatedLabor) || 0;
      const lineBalance =
        actualLabor > 0 ? Number((totalCT / actualLabor).toFixed(1)) : 0;

      if (!groupedMap.has(Area)) {
        groupedMap.set(Area, {
          title: Area,
          rows: [],
          TotalVA: 0,
          CT: 0,
          PP: 0,
          TotalLineBalance: 0,
          TotalActualLabor: 0,
        });
      }

      const section = groupedMap.get(Area)!;

      section.rows.push({
        no: No,
        operation: ProgressStagePartName,
        va: vaAvgCT,
        nvan: nvaAvgCT,
        ct: Number(totalCT.toFixed(2)),
        standardLabor,
        allocatedLabor,
        capacity,
        actualLabor,
        lineBalance,
        loss: lossValue.toString(),
        machineType: MachineType,
      });
      section.TotalVA += vaAvgCT;
      section.CT += totalCT;
      section.PP =
        section.CT === 0 ? 0 : Number((27000 / section.CT).toFixed(1));
      section.TotalLineBalance += allocatedLabor;
      section.TotalActualLabor += actualLabor;
    }

    const lsaData: SectionLSA[] = Array.from(groupedMap.values());

    let startRow = 8;
    let machineRow = startRow;

    lsaData.forEach((items) => {
      let titleArea = '';
      let machineName = '';
      switch (items.title.trim().toLowerCase()) {
        case 'cutting':
          titleArea = 'VA CHẶT';
          machineName = 'CHẶT';
          break;
        case 'stitching':
          titleArea = 'TỔNG VA MAY';
          machineName = 'TÊN MÁY MAY';
          break;
        case 'assembly':
          titleArea = 'TỔNG VA GÒ';
          machineName = 'TÊN MÁY BÊN GÒ';
          break;
        default:
          titleArea = '';
          machineName = '';
          break;
      }
      worksheet.mergeCells(`A${startRow}:M${startRow}`);
      worksheet.getCell(`A${startRow}`).value = items.title;
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].forEach(
        (item) => {
          worksheet.getCell(`${item}${startRow}`).style = {
            alignment: {
              wrapText: true,
              vertical: 'middle',
              horizontal: 'center',
            },
            font: {
              name: 'Times New Roman',
              bold: true,
              size: item === 'A' ? 12 : 11,
            },
            fill: {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'ffd966' },
            },
            border: {
              top: { style: 'thin' },
              right: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
            },
          };
        },
      );

      worksheet.mergeCells(`O${machineRow}:P${machineRow}`);
      worksheet.getCell(`O${machineRow}`).value = machineName;
      worksheet.getCell(`Q${machineRow}`).value = 'SỐ LƯỢNG';
      ['O', 'P', 'Q'].forEach((item) => {
        worksheet.getCell(`${item}${machineRow}`).style = {
          alignment: {
            wrapText: true,
            vertical: 'middle',
            horizontal: 'center',
          },
          font: {
            name: 'Times New Roman',
            bold: true,
            size: item === 'A' ? 12 : 11,
          },
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'ffd966' },
          },
          border: {
            top: { style: 'thin' },
            right: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
          },
        };
      });

      const machineSummary: Record<string, number> = {};

      items.rows.forEach((r: RowLSA) => {
        if (typeof r.machineType === 'string' && r.machineType) {
          machineSummary[r.machineType] =
            (machineSummary[r.machineType] || 0) + 1;
        }
      });
      startRow++;
      machineRow++;

      Object.entries(machineSummary).forEach(([machine, qty]) => {
        worksheet.mergeCells(`O${machineRow}:P${machineRow}`);
        worksheet.getCell(`O${machineRow}`).value = machine;
        worksheet.getCell(`Q${machineRow}`).value = qty;

        (['O', 'P', 'Q'] as const).forEach((col) => {
          worksheet.getCell(`${col}${machineRow}`).style = {
            alignment: {
              wrapText: true,
              vertical: 'middle',
              horizontal: 'center',
            },
            font: {
              name: 'Times New Roman',
              bold: true,
              size: 11,
            },
            border: {
              top: { style: 'thin' },
              right: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
            },
          };
        });

        machineRow++;
      });

      worksheet.mergeCells(`O${machineRow}:P${machineRow}`);
      worksheet.getCell(`O${machineRow}`).value = 'TOTAL';
      worksheet.getCell(`Q${machineRow}`).value = Object.values(
        machineSummary,
      ).reduce((s, v) => s + v, 0);
      ['O', 'P', 'Q'].forEach((item) => {
        worksheet.getCell(`${item}${machineRow}`).style = {
          alignment: {
            wrapText: true,
            vertical: 'middle',
            horizontal: 'center',
          },
          font: {
            name: 'Times New Roman',
            bold: true,
            size: 11,
          },
          border: {
            top: { style: 'thin' },
            right: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
          },
        };
      });
      machineRow += 3;

      items.rows.forEach((item) => {
        worksheet.getCell(`A${startRow}`).value = item.no;
        worksheet.getCell(`B${startRow}`).value = item.operation;
        worksheet.getCell(`C${startRow}`).value = item.va;
        worksheet.getCell(`D${startRow}`).value = item.nvan;
        worksheet.getCell(`E${startRow}`).value = parseFloat(item.loss) / 100;
        worksheet.getCell(`F${startRow}`).value = item.ct;
        worksheet.getCell(`G${startRow}`).value = item.standardLabor;
        worksheet.getCell(`H${startRow}`).value = item.allocatedLabor;
        worksheet.getCell(`I${startRow}`).value = item.lineBalance;
        worksheet.getCell(`K${startRow}`).value = item.capacity;
        worksheet.getCell(`L${startRow}`).value = item.actualLabor;
        worksheet.getCell(`M${startRow}`).value = item.machineType;

        [
          'A',
          'B',
          'C',
          'D',
          'E',
          'F',
          'G',
          'H',
          'I',
          'J',
          'K',
          'L',
          'M',
        ].forEach((col) => {
          worksheet.getCell(`${col}${startRow}`).style = {
            alignment: {
              wrapText: true,
              vertical: 'middle',
              horizontal: 'center',
            },
            font: { name: 'Times New Roman', bold: true, size: 11 },
            border: {
              top: { style: 'thin' },
              right: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
            },
          };
        });
        worksheet.getRow(startRow).height = 24;
        startRow++;
      });
      // console.log(startRow);

      worksheet.getCell(`B${startRow}`).value = titleArea;
      worksheet.getCell(`C${startRow}`).value = items.TotalVA;
      worksheet.getCell(`F${startRow}`).value = items.CT.toFixed(2);
      worksheet.getCell(`G${startRow}`).value = 'CT';
      worksheet.getCell(`I${startRow}`).value = items.TotalLineBalance;
      worksheet.getCell(`J${startRow}`).value =
        items.title.trim().toLowerCase() !== 'cutting' ? 0.0 : '';
      worksheet.getCell(`L${startRow}`).value = items.TotalActualLabor;
      ['B', 'C', 'F', 'G', 'I', 'J', 'L'].forEach((col) => {
        const cell = worksheet.getCell(`${col}${startRow}`);
        cell.alignment = {
          wrapText: true,
          vertical: 'middle',
          horizontal: 'center',
        };
        cell.font = {
          name: 'Times New Roman',
          bold: true,
          size: 11,
          color: { argb: 'ff0000' },
        };
        const shouldFill =
          col === 'C' ||
          col === 'I' ||
          (col === 'J' && items.title.trim().toLowerCase() !== 'cutting') ||
          col === 'L';
        if (shouldFill) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'ffe699' },
          };
        }
      });
      startRow++;

      worksheet.getCell(`F${startRow}`).value = items.PP;
      worksheet.getCell(`G${startRow}`).value = 'PP';
      ['F', 'G'].forEach((col) => {
        worksheet.getCell(`${col}${startRow}`).style = {
          alignment: {
            wrapText: true,
            vertical: 'middle',
            horizontal: 'center',
          },
          font: {
            name: 'Times New Roman',
            bold: true,
            size: 11,
            color: { argb: 'ff0000' },
          },
        };
      });
      startRow++;
    });

    const totalAllVA = lsaData.reduce((prev, curr) => prev + curr.TotalVA, 0);
    const totalAllCT = lsaData.reduce((prev, curr) => prev + curr.CT, 0);
    const totalAllLineBalance = lsaData.reduce(
      (prev, curr) => prev + curr.TotalLineBalance,
      0,
    );
    const totalAllActualLabor = lsaData.reduce(
      (prev, curr) => prev + curr.TotalActualLabor,
      0,
    );

    worksheet.getCell(`B${startRow}`).value = 'TỔNG VA CHẶT+MAY+GÒ';
    worksheet.getCell(`C${startRow}`).value = totalAllVA;
    worksheet.getCell(`F${startRow}`).value = totalAllCT.toFixed(2);
    worksheet.getCell(`G${startRow}`).value = 'Total';
    worksheet.getCell(`I${startRow}`).value = totalAllLineBalance;
    worksheet.getCell(`J${startRow}`).value = 0;
    worksheet.getCell(`L${startRow}`).value = totalAllActualLabor;
    ['B', 'C', 'F', 'G', 'I', 'J', 'L'].forEach((col) => {
      const cell = worksheet.getCell(`${col}${startRow}`);
      cell.alignment = {
        wrapText: true,
        vertical: 'middle',
        horizontal: 'center',
      };
      cell.font = {
        name: 'Times New Roman',
        bold: true,
        size: 11,
        color: { argb: 'ff0000' },
      };
      const shouldFill =
        col === 'C' || col === 'I' || col === 'J' || col === 'L';
      if (shouldFill) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'ffe699' },
        };
      }
    });
    startRow++;

    const totalPair =
      totalAllCT === 0 ? 0 : Number((27000 / totalAllCT).toFixed(2));

    worksheet.getCell(`B5`).value = +Number(totalPair / 7.5).toFixed(2);

    worksheet.getCell(`F${startRow}`).value = totalPair.toFixed(1);
    worksheet.getCell(`G${startRow}`).value = 'Pair';
    ['F', 'G'].forEach((col) => {
      worksheet.getCell(`${col}${startRow}`).style = {
        alignment: {
          wrapText: true,
          vertical: 'middle',
          horizontal: 'center',
        },
        font: {
          name: 'Times New Roman',
          bold: true,
          size: 11,
          color: { argb: 'ff0000' },
        },
      };
    });
    startRow += 2;

    worksheet.getCell(`B${startRow}`).value = 'Chủ quản xưởng vụ \n廠務主管';
    worksheet.mergeCells(`C${startRow}:G${startRow}`);
    worksheet.getCell(`C${startRow}`).value = 'Chủ quản hiện trường \n現場主管';
    worksheet.mergeCells(`I${startRow}:K${startRow}`);
    worksheet.getCell(`I${startRow}`).value = 'Chủ quản định mức \n企劃主管';
    worksheet.getCell(`M${startRow}`).value = 'Lập biểu \n制表';
    ['B', 'C', 'G', 'I', 'K', 'M'].forEach((item) => {
      worksheet.getCell(`${item}${startRow}`).style = {
        alignment: { wrapText: true, vertical: 'middle', horizontal: 'center' },
        font: { name: 'Times New Roman', bold: true, size: 12 },
      };
    });

    worksheet.getCell('O1').value = 'Unit \n單位';
    worksheet.getCell('P1').value = 'Time (second) 時間';
    worksheet.getCell('Q1').value = 'Pair/Person/8h 雙數/人/8h';
    worksheet.getCell('R1').value = 'Manpower Standard labor';
    worksheet.getCell('S1').value = 'Manpower Actual labor';
    worksheet.getCell('T1').value = 'LLER% C2B';
    ['O', 'P', 'Q', 'R', 'S', 'T'].forEach((item) => {
      worksheet.getColumn(item).width = 12;
      worksheet.getCell(`${item}1`).style = {
        alignment: { wrapText: true, vertical: 'middle', horizontal: 'center' },
        font: { name: 'Times New Roman', bold: true, size: 11 },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'ffd966' },
        },
        border: {
          top: { style: 'thin' },
          right: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
        },
      };
    });

    const getItem = (lsaData, title) =>
      lsaData.find((item) => item.title?.trim().toLowerCase() === title) || {
        CT: 0,
        PP: 0,
        TotalLineBalance: 0,
        TotalActualLabor: 0,
      };

    const setCell = (worksheet, cell, value) => {
      worksheet.getCell(cell).value = value;
    };

    const setPercentCell = (worksheet, cell, value) => {
      worksheet.getCell(cell).value = `${(Number(value) * 100).toFixed(0)}%`;
    };
    const round2 = (value) =>
      Number.isFinite(value) ? Math.round(value * 100) / 100 : 0;

    const cutting = getItem(lsaData, 'cutting');
    const stitching = getItem(lsaData, 'stitching');
    const assembly = getItem(lsaData, 'assembly');

    setCell(worksheet, 'O2', '(Cutting)裁斷 - Chặt');
    setCell(worksheet, 'P2', cutting.CT.toFixed(2));
    setCell(worksheet, 'Q2', cutting.PP.toFixed(1));
    setCell(worksheet, 'R2', cutting.TotalLineBalance);
    setCell(worksheet, 'S2', cutting.TotalActualLabor);
    setPercentCell(
      worksheet,
      'T2',
      round2(
        cutting.TotalActualLabor
          ? cutting.TotalLineBalance / cutting.TotalActualLabor
          : 0,
      ),
    );

    setCell(worksheet, 'O3', '(Stitching)針車 - May');
    setCell(worksheet, 'P3', stitching.CT.toFixed(2));
    setCell(worksheet, 'Q3', stitching.PP.toFixed(1));
    setCell(worksheet, 'R3', stitching.TotalLineBalance);
    setCell(worksheet, 'S3', stitching.TotalActualLabor);
    setPercentCell(
      worksheet,
      'T3',
      round2(
        stitching.TotalActualLabor
          ? stitching.TotalLineBalance / stitching.TotalActualLabor
          : 0,
      ),
    );

    const csCT = cutting.CT + stitching.CT;
    const csLB = cutting.TotalLineBalance + stitching.TotalLineBalance;
    const csLabor = cutting.TotalActualLabor + stitching.TotalActualLabor;

    setCell(worksheet, 'O4', '(C+S)裁斷+針車 - Chặt + May');
    setCell(worksheet, 'P4', csCT.toFixed(2));
    setCell(worksheet, 'Q4', round2(csCT ? 27000 / csCT : 0).toFixed(1));
    setCell(worksheet, 'R4', csLB);
    setCell(worksheet, 'S4', csLabor);
    setPercentCell(worksheet, 'T4', round2(csLabor ? csLB / csLabor : 0));

    setCell(worksheet, 'O5', '(F+A)成型+包裝 - Gò+ Bao bì');
    setCell(worksheet, 'P5', assembly.CT.toFixed(2));
    setCell(worksheet, 'Q5', assembly.PP.toFixed(1));
    setCell(worksheet, 'R5', assembly.TotalLineBalance);
    setCell(worksheet, 'S5', assembly.TotalActualLabor);
    setPercentCell(
      worksheet,
      'T5',
      round2(
        assembly.TotalActualLabor
          ? assembly.TotalLineBalance / assembly.TotalActualLabor
          : 0,
      ),
    );

    const totalCT = csCT + assembly.CT;
    const totalLB = csLB + assembly.TotalLineBalance;
    const totalLabor = csLabor + assembly.TotalActualLabor;

    setCell(worksheet, 'O6', '(C2B)裁斷+針車+成型+包裝 - C+M+G+BB');
    setCell(worksheet, 'P6', totalCT.toFixed(2));
    setCell(worksheet, 'Q6', round2(totalCT ? 27000 / totalCT : 0).toFixed(1));
    setCell(worksheet, 'R6', totalLB);
    setCell(worksheet, 'S6', totalLabor);
    setPercentCell(
      worksheet,
      'T6',
      round2(totalLabor ? totalLB / totalLabor : 0),
    );

    worksheet.mergeCells('O7:Q7');
    worksheet.mergeCells('R7:T7');
    worksheet.getCell('O7').value = 'LC (C2B)';

    for (let row = 2; row <= 7; row++) {
      for (let col = 15; col <= 20; col++) {
        worksheet.getRow(row).height = 40;
        worksheet.getCell(row, col).style = {
          alignment: {
            wrapText: true,
            vertical: 'middle',
            horizontal: 'center',
          },
          font: { name: 'Times New Roman', bold: true, size: 11 },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          },
        };
      }
    }

    // const chartLabels = ['Cutting (Chặt)', 'Stitching (May)', 'Assembly (Gò)'];
    // const dataStandard = [
    //   cutting.TotalLineBalance,
    //   stitching.TotalLineBalance,
    //   assembly.TotalLineBalance,
    // ];
    // const dataActual = [
    //   cutting.TotalActualLabor,
    //   stitching.TotalActualLabor,
    //   assembly.TotalActualLabor,
    // ];

    // const myChart = new QuickChart();

    // myChart.setConfig({
    //   type: 'line',
    //   data: {
    //     labels: chartLabels,
    //     datasets: [
    //       {
    //         label: 'Standard Labor (LĐ Chuẩn)',
    //         data: dataStandard,
    //         borderColor: 'rgb(54, 162, 235)',
    //         backgroundColor: 'rgb(54, 162, 235)',
    //         borderWidth: 2,
    //         fill: false,
    //         tension: 0.1,
    //         pointRadius: 4,
    //         pointHoverRadius: 6,
    //       },
    //       {
    //         label: 'Actual Labor (LĐ Thực tế)',
    //         data: dataActual,
    //         borderColor: 'rgb(255, 99, 132)',
    //         backgroundColor: 'rgb(255, 99, 132)',
    //         borderWidth: 2,
    //         fill: false,
    //         tension: 0.1,
    //         pointRadius: 4,
    //         pointHoverRadius: 6,
    //       },
    //     ],
    //   },
    //   options: {
    //     title: {
    //       display: true,
    //       text: 'MANPOWER COMPARISON (SO SÁNH NHÂN LỰC)',
    //       fontSize: 18,
    //     },
    //     legend: { position: 'bottom' },
    //     scales: {
    //       yAxes: [
    //         {
    //           ticks: {
    //             beginAtZero: true,
    //             stepSize: 1,
    //             padding: 10,
    //           },
    //           scaleLabel: { display: true, labelString: 'Persons (Người)' },
    //           gridLines: {
    //             drawBorder: true,
    //             color: 'rgba(200, 200, 200, 0.3)',
    //           },
    //         },
    //       ],
    //       xAxes: [
    //         {
    //           gridLines: {
    //             display: false,
    //           },
    //         },
    //       ],
    //     },
    //     plugins: {
    //       datalabels: {
    //         anchor: 'end',
    //         align: 'top',
    //         backgroundColor: 'rgba(255, 255, 255, 0.7)',
    //         borderRadius: 4,
    //         font: { weight: 'bold' },
    //         offset: 4,
    //       },
    //     },
    //   },
    // });

    // myChart.setWidth(800);
    // myChart.setHeight(500);
    // myChart.setBackgroundColor('white');

    // const imageBuffer = await myChart.toBinary();

    // const imageId = workbook.addImage({
    //   buffer: imageBuffer as any,
    //   extension: 'png',
    // });

    // const chartSheet = workbook.addWorksheet('Line Balance');
    // chartSheet.views = [
    //   { showGridLines: false, state: 'normal', zoomScale: 100 },
    // ];

    // chartSheet.addImage(imageId, {
    //   tl: { col: 1, row: 1 } as any,
    //   br: { col: 12, row: 25 } as any,
    // });
    const chartSheet = workbook.addWorksheet('Line Balance');
    chartSheet.views = [
      { showGridLines: false, state: 'normal', zoomScale: 100 },
    ];

    let currentRow = 1;

    const allowedSections = ['cutting', 'stitching', 'assembly'];

    for (const section of lsaData) {
      const sectionName = section.title.trim().toLowerCase();
      if (!allowedSections.includes(sectionName)) continue;

      const chartLabels = section.rows.map((r) => r.no);
      const dataLineBalance = section.rows.map((r) => r.lineBalance);

      const dataTaktTime = new Array(chartLabels.length).fill(TatkTime);

      const myChart = new QuickChart();

      myChart.setConfig({
        type: 'line',
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: 'Takt Time',
              data: dataTaktTime,
              borderColor: '#C65911',
              borderWidth: 3,
              pointRadius: 0,
              fill: false,
              tension: 0,
              datalabels: { display: false },
              order: 1,
            },
            {
              label: 'CT combined/Labor',
              data: dataLineBalance,
              borderColor: '#548235',
              backgroundColor: '#548235',
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: false,
              tension: 0,
              order: 2,
              datalabels: {
                align: 'end',
                anchor: 'end',
                color: 'black',
                font: { weight: 'bold', size: 10 },
                formatter: (value) => Number(value).toFixed(1),
              },
            },
          ],
        },
        options: {
          layout: {
            padding: { top: 30, right: 20, left: 10, bottom: 10 },
          },
          title: {
            display: true,
            text: `LINE BALANCING CHART ${section.title.toUpperCase()}`,
            fontSize: 20,
            fontColor: 'black',
            fontStyle: 'bold',
            padding: 20,
          },
          legend: {
            position: 'bottom',
            labels: { boxWidth: 40, usePointStyle: false },
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  padding: 10,
                  fontSize: 12,
                },
                scaleLabel: { display: false },
                gridLines: {
                  drawBorder: true,
                  color: '#E0E0E0',
                  borderDash: [5, 5],
                },
              },
            ],
            xAxes: [
              {
                gridLines: { display: false },
                ticks: {
                  autoSkip: false,
                  maxRotation: 90,
                  minRotation: 90,
                  fontSize: 10,
                  fontStyle: 'bold',
                },
              },
            ],
          },
          plugins: {
            datalabels: {
              display: true,
            },
          },
        },
      });

      const chartWidth = Math.max(1000, chartLabels.length * 30);
      myChart.setWidth(chartWidth);
      myChart.setHeight(500);
      myChart.setBackgroundColor('white');

      const imageBuffer = await myChart.toBinary();
      const imageId = workbook.addImage({
        buffer: imageBuffer as any,
        extension: 'png',
      });

      const chartHeightRows = 25;

      chartSheet.addImage(imageId, {
        tl: { col: 1, row: currentRow } as any,
        br: { col: 18, row: currentRow + chartHeightRows } as any,
      });

      currentRow += chartHeightRows + 2;
    }

    return await workbook.xlsx.writeBuffer();
  }
}
