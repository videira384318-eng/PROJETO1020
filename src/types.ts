export interface AttendanceScan {
    scanId: string;
    employeeId: string;
    scanTime: string;
    scanType: 'entry' | 'exit';
    placa?: string;
    ramal?: string;
  }
  