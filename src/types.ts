export interface AttendanceScan {
    scanId: string;
    employeeId: string;
    scanTime: string;
    scanType: 'entry' | 'exit';
    placa?: string;
    ramal?: string;
  }
  
  export interface UserProfile {
    uid: string;
    email: string;
    role: 'adm' | 'rh' | 'portaria';
    permissions: string[];
  }
  