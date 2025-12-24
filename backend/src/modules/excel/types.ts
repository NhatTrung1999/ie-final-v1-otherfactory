import * as ExcelJS from 'exceljs';

export interface CellConfig {
  cell?: string;
  value?: string;
  merge?: string;
}

export interface Row {
  no: string;
  operation: string;
  va: number;
  nvan: number;
  ct: number;
  loss: string;
  machineType?: string;
}

export interface Section {
  title: string;
  rows: Row[];
  CT: number;
  PP: number;
}

export interface RowLSA {
  no: string;
  operation: string;
  va: number;
  nvan: number;
  ct: number;
  standardLabor: number;
  allocatedLabor: number;
  capacity: number;
  actualLabor: number;
  lineBalance: number;
  loss: string;
  machineType?: string;
}

export interface SectionLSA {
  title: string;
  rows: RowLSA[];
  TotalVA: number
  CT: number;
  PP: number;
  TotalLineBalance: number
  TotalActualLabor: number
}

export interface CTData {
  CT1: number;
  CT2: number;
  CT3: number;
  CT4: number;
  CT5: number;
  CT6: number;
  CT7: number;
  CT8: number;
  CT9: number;
  CT10: number;
  AvgCT: number;
}

export interface TimeStudyData {
  processStage: string;
  partNameProgressDescription: string;
  va: {
    CT1: number;
    CT2: number;
    CT3: number;
    CT4: number;
    CT5: number;
    CT6: number;
    CT7: number;
    CT8: number;
    CT9: number;
    CT10: number;
    AvgCT: number;
    descriptionType: '(VA video)';
  };
  nva: {
    CT1: number;
    CT2: number;
    CT3: number;
    CT4: number;
    CT5: number;
    CT6: number;
    CT7: number;
    CT8: number;
    CT9: number;
    CT10: number;
    AvgCT: number;
    descriptionType: '(NVA necessary video)';
  };
}

export interface CellConfigTimeStudy {
  range: string;
  value?: string;
  style?: Partial<ExcelJS.Style>;
}
