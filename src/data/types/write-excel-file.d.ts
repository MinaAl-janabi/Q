declare module 'write-excel-file' {
  // نوع كل خلية
  export interface Cell {
    value?: string | number | boolean | Date | null;
    fontWeight?: 'bold';
    type?: 'string' | 'number' | 'boolean' | 'date';
  }

  // خيارات التصدير
  export interface Options {
    fileName?: string;
    sheet?: string;
  }

  // الدالة الرئيسية
  export default function writeXlsxFile(
    data: Cell[][],
    options?: Options
  ): Promise<void>;
}