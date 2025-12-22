import { Inject, Injectable } from '@nestjs/common';
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
import { CTData, Section, TimeStudyData } from './types';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { ITablectData, ITablectType } from 'src/types/tablect';

@Injectable()
export class ExcelService {
  constructor(@Inject('IE') private readonly IE: Sequelize) {}

  //LSA
  private applyCellConfigurations(worksheet: ExcelJS.Worksheet): void {
    const borderStyle = { style: 'thin' as ExcelJS.BorderStyle };

    cellConfigurations.forEach(({ cell, value, merge }) => {
      // Gộp ô nếu có merge
      if (merge) {
        worksheet.mergeCells(merge);

        // Xác định vùng gộp để áp dụng border
        const [startCell, endCell] = merge.split(':');
        const start = worksheet.getCell(startCell);
        const end = worksheet.getCell(endCell);
        const startRow = Number(start.row); // Ensure numeric type
        const endRow = Number(end.row); // Ensure numeric type
        const startCol = Number(start.col); // Ép kiểu
        const endCol = Number(end.col); // Ép kiểu

        // Áp dụng border cho tất cả ô trong vùng gộp
        for (let row = startRow; row <= endRow; row++) {
          for (let col = startCol; col <= endCol; col++) {
            worksheet.getCell(row, col).border = {
              top: borderStyle,
              right: borderStyle,
              bottom: borderStyle,
              left: borderStyle,
            };
            if (row === 5 || row === 6) {
              worksheet.getCell(row, col).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'ccffff' },
              };
            }
          }
        }
      }

      // Ghi giá trị và định dạng cho ô
      if (cell) {
        const targetCell = worksheet.getCell(cell);
        targetCell.value = value;
        targetCell.alignment = {
          wrapText: true,
          vertical: 'middle',
          horizontal: 'center',
        };
        targetCell.font = {
          name: 'Arial',
          family: 2,
          size: 10,
          bold: true,
        };

        // Áp dụng border cho ô đơn lẻ (nếu không thuộc vùng gộp)
        if (!merge) {
          targetCell.border = {
            top: borderStyle,
            right: borderStyle,
            bottom: borderStyle,
            left: borderStyle,
          };
          if (cell.includes('5') || cell.includes('6')) {
            worksheet.getCell(cell).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'ccffff' },
            };
          }
        }
      }
    });
  }

  async exportLSA(
    DateFrom: string,
    DateTo: string,
    Season: string,
    Stage: string,
    Area: string,
    Article: string,
    Account: string,
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
      `SELECT tb.*
        FROM IE_TableCT AS tb
        LEFT JOIN IE_StageList AS sl ON sl.Id = tb.Id
        ${where}
        ORDER BY tb.CreatedAt`,
      {
        replacements,
        type: QueryTypes.SELECT,
      },
    );

    const groupedMap = new Map<string, Section>();

    for (const item of records) {
      const { No, ProgressStagePartName, Area, Nva, Va, Loss, MachineType } =
        item;

      const vaData = JSON.parse(Va) as ITablectType;
      const nvaData = JSON.parse(Nva) as ITablectType;

      const vaAvgCT = vaData.Average;
      const nvaAvgCT = nvaData.Average;
      const totalCT = vaAvgCT + nvaAvgCT;

      if (!groupedMap.has(Area)) {
        groupedMap.set(Area, {
          title: Area,
          rows: [],
          CT: 0,
          PP: 0,
        });
      }

      const section = groupedMap.get(Area)!;

      section.rows.push({
        no: No,
        operation: ProgressStagePartName,
        va: vaAvgCT,
        nvan: nvaAvgCT,
        ct: totalCT,
        loss: Loss,
        machineType: MachineType,
      });

      section.CT += totalCT;
      section.PP =
        section.CT === 0 ? 0 : Number((27000 / section.CT).toFixed(1));
    }

    const lsaData: Section[] = Array.from(groupedMap.values());

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('LSA');
    worksheet.properties.defaultRowHeight = 24;
    worksheet.getColumn('B').width = 67;
    worksheet.getColumn('E').width = 20;
    worksheet.getColumn('J').width = 30;

    worksheet.mergeCells('A1:K1');
    worksheet.getCell('A1').value =
      'LABOR STANDARD ADVICE (Sample) \nBẢNG ĐỊNH MỨC LAO ĐỘNG -工時定量表';
    worksheet.getCell('A1').style = {
      alignment: { wrapText: true, vertical: 'middle', horizontal: 'center' },
      font: { name: 'Arial', family: 2, bold: true, size: 14 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '99ccff' } },
    };
    for (let col = 1; col <= 10; col++) {
      const cell = worksheet.getCell(1, col);
      cell.border = {
        top: { style: 'thin' },
        right: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
      };
    }
    worksheet.getRow(1).height = 42;

    this.applyCellConfigurations(worksheet);

    let startRow = 7;

    lsaData.forEach((items) => {
      // Gộp ô A và B cho tiêu đề Section
      worksheet.mergeCells(`A${startRow}:B${startRow}`);
      worksheet.getCell(`A${startRow}`).value = items.title;
      worksheet.getCell(`A${startRow}`).style = {
        font: {
          name: 'Arial',
          family: 2,
          bold: true,
          size: 10,
          color: { argb: 'FF0000' },
        },
        alignment: { vertical: 'middle' },
      };

      worksheet.getRow(startRow).height = 24;
      startRow++;

      // Ghi từng row trong items.rows
      items.rows.forEach((item) => {
        worksheet.getCell(`A${startRow}`).value = item.no;
        worksheet.getCell(`B${startRow}`).value = item.operation;
        worksheet.getCell(`C${startRow}`).value = item.va;
        worksheet.getCell(`D${startRow}`).value = item.nvan;
        worksheet.getCell(`E${startRow}`).value = item.ct;
        worksheet.getCell(`F${startRow}`).value = item.loss;
        worksheet.getCell(`K${startRow}`).value = item.machineType;

        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'].forEach(
          (col) => {
            worksheet.getCell(`${col}${startRow}`).style = {
              ...worksheet.getCell(`${col}${startRow}`).style,
              border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
              },
              font: { name: 'Arial', family: 2, size: 10, bold: true },
              alignment: {
                vertical: 'middle',
                horizontal: col.includes('B') ? 'left' : 'center',
              },
            };
          },
        );
        worksheet.getRow(startRow).height = 24;
        startRow++;
      });

      const columnK = worksheet.getColumn('K');
      let maxLength = 0;
      columnK.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, cellValue.length);
      });
      columnK.width = maxLength;

      // Ghi CT
      worksheet.getCell(`D${startRow}`).value = 'CT';
      worksheet.getCell(`E${startRow}`).value = items.CT;
      ['D', 'E'].forEach((col) => {
        worksheet.getCell(`${col}${startRow}`).style = {
          ...worksheet.getCell(`${col}${startRow}`).style,
          alignment: { vertical: 'middle', horizontal: 'center' },
          font: {
            name: 'Arial',
            family: 2,
            size: 9,
            bold: true,
            color: { argb: 'FF0000' },
          },
        };
        worksheet.getRow(startRow).height = 24;
      });
      startRow++;

      // Ghi PP
      worksheet.getCell(`D${startRow}`).value = 'PP';
      worksheet.getCell(`E${startRow}`).value = items.PP;
      ['D', 'E'].forEach((col) => {
        worksheet.getCell(`${col}${startRow}`).style = {
          ...worksheet.getCell(`${col}${startRow}`).style,
          alignment: { vertical: 'middle', horizontal: 'center' },
          font: {
            name: 'Arial',
            family: 2,
            size: 9,
            bold: true,
            color: { argb: 'FF0000' },
          },
        };
        worksheet.getRow(startRow).height = 24;
      });
      startRow++;
    });

    const total = lsaData.reduce((prev, curr) => prev + curr.CT, 0);
    worksheet.getCell(`D${startRow}`).value = 'TOTAL:';
    worksheet.getCell(`E${startRow}`).value = total;
    ['D', 'E'].forEach((col) => {
      worksheet.getCell(`${col}${startRow}`).style = {
        ...worksheet.getCell(`${col}${startRow}`).style,
        alignment: { vertical: 'middle', horizontal: 'center' },
        font: {
          name: 'Arial',
          family: 2,
          size: 9,
          bold: true,
          color: { argb: 'FF0000' },
        },
      };
      worksheet.getRow(startRow).height = 24;
    });
    startRow++;

    worksheet.getCell(`D${startRow}`).value = 'PP:';
    worksheet.getCell(`E${startRow}`).value =
      total === 0 ? 0 : Number((27000 / total).toFixed(1));
    ['D', 'E'].forEach((col) => {
      worksheet.getCell(`${col}${startRow}`).style = {
        ...worksheet.getCell(`${col}${startRow}`).style,
        alignment: { vertical: 'middle', horizontal: 'center' },
        font: {
          name: 'Arial',
          family: 2,
          size: 9,
          bold: true,
          color: { argb: 'FF0000' },
        },
      };
      worksheet.getRow(startRow).height = 24;
    });
    startRow++;

    worksheet.getCell(`B${startRow}`).value = 'Unit \n單位';
    worksheet.getCell(`B${startRow}`).style = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
      font: {
        name: 'Arial',
        family: 2,
        size: 10,
        bold: true,
      },
    };

    worksheet.mergeCells(`C${startRow}:D${startRow}`);
    worksheet.getCell(`C${startRow}`).value = 'Time(second) \n時間';
    ['C', 'D'].forEach((col) => {
      worksheet.getCell(`${col}${startRow}`).style = {
        ...worksheet.getCell(`${col}${startRow}`).style,
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        font: {
          name: 'Arial',
          family: 2,
          size: 9,
          bold: true,
        },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        },
      };
      worksheet.getRow(startRow).height = 24;
    });

    worksheet.mergeCells(`E${startRow}:F${startRow}`);
    worksheet.getCell(`E${startRow}`).value = 'Pair/Person/8h \n雙數/人/8h';
    ['E', 'F'].forEach((col) => {
      worksheet.getCell(`${col}${startRow}`).style = {
        ...worksheet.getCell(`${col}${startRow}`).style,
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        font: {
          name: 'Arial',
          family: 2,
          size: 9,
          bold: true,
        },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        },
      };
      worksheet.getRow(startRow).height = 24;
    });

    worksheet.mergeCells(`G${startRow}:I${startRow}`);
    worksheet.getCell(`G${startRow}`).value = 'LLER';
    ['G', 'H', 'I'].forEach((col) => {
      worksheet.getCell(`${col}${startRow}`).style = {
        ...worksheet.getCell(`${col}${startRow}`).style,
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        font: {
          name: 'Arial',
          family: 2,
          size: 9,
          bold: true,
        },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        },
      };
      worksheet.getRow(startRow).height = 24;
    });

    startRow++;

    const processes = [
      { name: '(Cutting)裁斷', time: 0.0, pairPerPerson: 0, ller: 0.0 },
      { name: '(Stitching)針車', time: 0.0, pairPerPerson: 0, ller: 0.0 },
      { name: '(F+A)成型+包裝', time: 0.0, pairPerPerson: 0, ller: 0.0 },
      {
        name: '(C2B)裁斷+針車+成型+包裝',
        time: 0.0,
        pairPerPerson: 0,
        ller: 0.0,
      },
    ];

    processes.forEach((process) => {
      worksheet.getCell(`B${startRow}`).value = process.name;
      worksheet.mergeCells(`C${startRow}:D${startRow}`);
      worksheet.getCell(`C${startRow}`).value = process.time;
      worksheet.mergeCells(`E${startRow}:F${startRow}`);
      worksheet.getCell(`E${startRow}`).value = process.pairPerPerson;
      worksheet.mergeCells(`G${startRow}:I${startRow}`);
      worksheet.getCell(`G${startRow}`).value = process.ller;

      // Thêm border cho các ô
      ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach((col) => {
        worksheet.getCell(`${col}${startRow}`).style = {
          ...worksheet.getCell(`${col}${startRow}`).style,
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          },
          alignment: {
            vertical: 'middle',
            horizontal: 'center',
          },
          font: {
            name: 'Arial',
            family: 2,
            size: 10,
            bold: true,
          },
          numFmt: col === 'G' ? '0.00%' : '',
        };
        worksheet.getRow(startRow).height = 24;
      });

      startRow++;
    });

    worksheet.getCell(`B${startRow}`).value = 'Chủ quản xưởng vụ 廠務主管';
    worksheet.mergeCells(`C${startRow}:E${startRow}`);
    worksheet.getCell(`C${startRow}`).value = 'Chủ quản hiện trường 現場主管';
    worksheet.mergeCells(`F${startRow}:I${startRow}`);
    worksheet.getCell(`F${startRow}`).value = 'Chủ quản định mức 企劃主管';
    worksheet.mergeCells(`J${startRow}:K${startRow}`);
    worksheet.getCell(`J${startRow}`).value = 'Lập biểu 制表';
    ['B', 'C', 'E', 'F', 'G', 'I', 'J', 'K'].forEach((col) => {
      worksheet.getCell(`${col}${startRow}`).style = {
        ...worksheet.getCell(`${col}${startRow}`).style,
        alignment: {
          vertical: 'middle',
          horizontal: 'center',
        },
        font: {
          name: 'Arial',
          family: 2,
          size: 10,
          bold: true,
        },
      };
      worksheet.getRow(startRow).height = 24;
    });
    startRow++;

    return await workbook.xlsx.writeBuffer();
  }

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
  async exportLSATest(
    DateFrom: string,
    DateTo: string,
    Season: string,
    Stage: string,
    Area: string,
    Article: string,
    Account: string,
  ) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('LSA Test');

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
    worksheet.getCell('O1').value = 'Unit 單位';
    worksheet.getCell('P1').value = 'Time (second) 時間';
    worksheet.getCell('Q1').value = 'Pair/Person/8h 雙數/人/8h';
    worksheet.getCell('R1').value = 'Manpower Standard labor';
    worksheet.getCell('S1').value = 'Manpower Actual labor';
    worksheet.getCell('T1').value = 'LLER% C2B';

    worksheet.getRow(1).height = 42;

    worksheet.getCell('A2').value = 'Model /Article';
    worksheet.mergeCells('C2:F2');
    worksheet.mergeCells('G2:M2');
    worksheet.getCell('C2').value = 'Date-測時日期 Ngày kiểm';
    worksheet.getCell('O2').value = '(Cutting)裁斷 - Chặt';

    worksheet.getCell('A3').value = 'Cut die:斬刀';
    worksheet.mergeCells('C3:F3');
    worksheet.mergeCells('G3:M3');
    worksheet.getCell('C3').value =
      'Estimate output:預計產量 Sản lương dư tinh';
    worksheet.getCell('O3').value = '(Stitching)針車 - May';

    worksheet.getCell('A4').value = 'Block/ Line: 測時組別:';
    worksheet.mergeCells('C4:F4');
    worksheet.mergeCells('G4:M4');
    worksheet.getCell('C4').value = 'Working time: 工作時間 Tgian làm việc';
    worksheet.getCell('O4').value = '(C+S)裁斷+針車 - Chặt + May';

    worksheet.getCell('A5').value = 'PPH';
    worksheet.mergeCells('C5:F5');
    worksheet.mergeCells('G5:M5');
    worksheet.getCell('C5').value = 'Tatk time';
    worksheet.getCell('O5').value = '(F+A)成型+包裝 - Gò+ Bao bì';
    worksheet.getCell('O6').value = '(C2B)裁斷+針車+成型+包裝 - C+M+G+BB';
    worksheet.getCell('O7:Q7');
    worksheet.getCell('O7').value = 'LC (C2B)';

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

    worksheet.getCell('A6').value = 'No 序號';
    worksheet.getCell('B6').value = 'Operation-操作名稱 (Tên công đoạn)';
    worksheet.getCell('C6').value = 'Standard 標準工時 Tgian chuẩn';
    worksheet.getCell('G6').value = 'Standard Labor 需求人力 Số LĐ chuẩn';
    worksheet.getCell('H6').value =
      'Allocated Labor  分配勞動人數 Số LĐ phân bổ';
    worksheet.getCell('I6').value = 'Line balance 人均工時';
    worksheet.getCell('J6').value = 'Multi-skill';
    worksheet.getCell('K6').value = 'Capacity 標產(雙) Sản lượng 1H';
    worksheet.getCell('L6').value = 'Actual  Labor 實際人力 Số LĐ t.tế';
    worksheet.getCell('M6').value = 'Remark 備註 Chi chú';

    worksheet.getCell('C7').value = 'VA';
    worksheet.getCell('D7').value = 'NVA';
    worksheet.getCell('E7').value = 'LOSS';
    worksheet.getCell('F7').value = 'CT';

    const records: ITablectData[] = await this.IE.query(
      `SELECT tb.*
        FROM IE_TableCT AS tb
        LEFT JOIN IE_StageList AS sl ON sl.Id = tb.Id
        ORDER BY tb.CreatedAt`,
      {
        type: QueryTypes.SELECT,
      },
    );

    const groupedMap = new Map<string, Section>();

    for (const item of records) {
      const { No, ProgressStagePartName, Area, Nva, Va, Loss, MachineType } =
        item;

      const vaData = JSON.parse(Va) as ITablectType;
      const nvaData = JSON.parse(Nva) as ITablectType;

      const vaAvgCT = vaData.Average;
      const nvaAvgCT = nvaData.Average;
      const totalCT = vaAvgCT + nvaAvgCT;

      if (!groupedMap.has(Area)) {
        groupedMap.set(Area, {
          title: Area,
          rows: [],
          CT: 0,
          PP: 0,
        });
      }

      const section = groupedMap.get(Area)!;

      section.rows.push({
        no: No,
        operation: ProgressStagePartName,
        va: vaAvgCT,
        nvan: nvaAvgCT,
        ct: totalCT,
        loss: Loss,
        machineType: MachineType,
      });

      section.CT += totalCT;
      section.PP =
        section.CT === 0 ? 0 : Number((27000 / section.CT).toFixed(1));
    }

    const lsaData: Section[] = Array.from(groupedMap.values());

    let startRow = 8;

    lsaData.forEach((items) => {
      worksheet.mergeCells(`A${startRow}:M${startRow}`);
      worksheet.getCell(`A${startRow}`).value = items.title;

      startRow++;

      items.rows.forEach((item) => {
        worksheet.getCell(`A${startRow}`).value = item.no;
        worksheet.getCell(`B${startRow}`).value = item.operation;
        worksheet.getCell(`C${startRow}`).value = item.va;
        worksheet.getCell(`D${startRow}`).value = item.nvan;
        worksheet.getCell(`E${startRow}`).value = item.loss;
        worksheet.getCell(`F${startRow}`).value = item.ct;
        worksheet.getCell(`M${startRow}`).value = item.machineType;

        worksheet.getRow(startRow).height = 24;
        startRow++;
      });
      // Ghi CT
      worksheet.getCell(`D${startRow}`).value = 'CT';
      worksheet.getCell(`E${startRow}`).value = items.CT;
      startRow++;

      // Ghi PP
      worksheet.getCell(`D${startRow}`).value = 'PP';
      worksheet.getCell(`E${startRow}`).value = items.PP;
      startRow++;
    });
    const total = lsaData.reduce((prev, curr) => prev + curr.CT, 0);
    worksheet.getCell(`D${startRow}`).value = 'TOTAL:';
    worksheet.getCell(`E${startRow}`).value = total;
    startRow++;

    worksheet.getCell(`D${startRow}`).value = 'PP:';
    worksheet.getCell(`E${startRow}`).value =
      total === 0 ? 0 : Number((27000 / total).toFixed(1));
    startRow++;

    return await workbook.xlsx.writeBuffer();
  }
}
