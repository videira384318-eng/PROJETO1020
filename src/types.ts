
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
  
  export interface Vehicle {
    id: string;
    plate: string;
    model: string;
    driverName: string;
    company: string;
    entryTimestamp: string;
    exitTimestamp: string | null;
    status: 'entered' | 'exited';
  }

  export interface Visitor {
    id: string;
    name: string;
    document: string;
    company: string;
    reason: string;
    entryTimestamp: string;
    exitTimestamp: string | null;
    status: 'entered' | 'exited';
  }
