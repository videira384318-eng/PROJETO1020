export interface AttendanceScan {
    id: string; // Document ID from LocalStorage
    scanId: string;
    employeeId: string; // This can be the local storage ID of the employee
    scanTime: string;
    scanType: 'entry' | 'exit';
    placa?: string;
    ramal?: string;
  }
  
  export interface UserProfile {
    uid: string;
    email: string;
    role: 'adm' | 'rh' | 'portaria' | 'supervisao';
    permissions: string[];
  }
  