

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
  
  // Cadastro permanente do veículo
  export interface Vehicle {
    id: string;
    plate: string;
    model: string;
  }
  
  // Registro de uma movimentação individual do veículo
  export interface VehicleLog {
      id: string;
      vehicleId: string; // link to Vehicle.id
      driverName: string;
      parkingLot: 'P1' | 'P2';
      entryTimestamp: string;
      exitTimestamp: string | null;
      status: 'entered' | 'exited';
      // Include vehicle info for easier display
      vehiclePlate: string;
      vehicleModel: string;
  }

  // Type for combining vehicle with its latest log status
  export interface VehicleWithStatus extends Vehicle {
      status: 'entered' | 'exited';
      lastLogId?: string;
      // Last log info to display in list
      driverName?: string;
      parkingLot?: 'P1' | 'P2';
  }

  // Type for the new vehicle form (permanent + first log)
  export interface NewVehicleFormData {
    plate: string;
    model: string;
    driverName: string;
    parkingLot: 'P1' | 'P2';
  }

  // Type for the re-entry form
  export interface ReEnterVehicleFormData {
    driverName: string;
    parkingLot: 'P1' | 'P2';
  }

  // Cadastro permanente do visitante
  export interface Visitor {
    id: string;
    name: string;
    company: string;
    rg: string;
    cpf: string;
    // Dados da primeira visita, salvos no cadastro inicial
    plate?: string;
    responsible?: string;
    reason?: string;
  }

  // Registro de uma visita individual
  export interface VisitLog {
      id: string;
      visitorId: string; // link to Visitor.id
      plate?: string;
      responsible: string;
      reason: string;
      parkingLot: 'P1' | 'P2';
      entryTimestamp: string;
      exitTimestamp: string | null;
      status: 'entered' | 'exited';
      // Include visitor info for easier display
      visitorName: string;
      visitorCompany: string;
  }

  // Type for combining visitor with their latest visit status and info
  export interface VisitorWithStatus extends Visitor {
      status: 'entered' | 'exited';
      lastVisitId?: string;
      // Last visit info to pre-fill forms and display in list
      plate?: string;
      responsible?: string;
      reason?: string;
  }

  // Type for the new visitor form (permanent + first visit)
  export interface NewVisitorFormData {
    name: string;
    company: string;
    rg: string;
    cpf: string;
    plate?: string;
    responsible: string;
    reason: string;
    parkingLot: 'P1' | 'P2';
  }

  // Type for the revisit form
  export interface RevisitFormData {
    plate?: string;
    responsible: string;
    reason: string;
    parkingLot: 'P1' | 'P2';
  }
