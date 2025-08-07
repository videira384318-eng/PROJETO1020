export interface AttendanceScan {
    id: string; // Document ID from Firestore
    scanId: string;
    employeeId: string; // This can be the Firestore ID of the employee document
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
  