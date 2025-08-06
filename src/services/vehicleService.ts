"use client";

import type { VehicleFormData, VehicleLogEntry } from '@/app/veiculos/page';

const VEHICLES_KEY = 'vehicles_storage';
const VEHICLE_LOG_KEY = 'vehicle_log_storage';

// --- Helper Functions ---
const getStoredData = <T,>(key: string): T[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
};

const setStoredData = <T,>(key: string, data: T[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
};


// --- Vehicle Management ---
export const addVehicle = async (vehicleData: Omit<VehicleFormData, 'id'>): Promise<string> => {
    const vehicles = getStoredData<VehicleFormData>(VEHICLES_KEY);
    const newVehicle: VehicleFormData = {
        id: `vhc_${new Date().getTime()}`,
        ...vehicleData,
    };
    setStoredData<VehicleFormData>(VEHICLES_KEY, [...vehicles, newVehicle]);
    return newVehicle.id!;
};

export const updateVehicle = async (vehicleId: string, vehicleData: Partial<VehicleFormData>): Promise<void> => {
    const vehicles = getStoredData<VehicleFormData>(VEHICLES_KEY);
    const updatedVehicles = vehicles.map(v => v.id === vehicleId ? { ...v, ...vehicleData } : v);
    setStoredData<VehicleFormData>(VEHICLES_KEY, updatedVehicles);
};

export const deleteVehicle = async (vehicleId: string): Promise<void> => {
    const vehicles = getStoredData<VehicleFormData>(VEHICLES_KEY);
    const updatedVehicles = vehicles.filter(v => v.id !== vehicleId);
    setStoredData<VehicleFormData>(VEHICLES_KEY, updatedVehicles);
};

export const getVehicles = async (): Promise<VehicleFormData[]> => {
    return getStoredData<VehicleFormData>(VEHICLES_KEY);
};

// --- Vehicle Log Management ---
export const addVehicleLog = async (logData: Omit<VehicleLogEntry, 'logId'>): Promise<string> => {
    const log = getStoredData<VehicleLogEntry>(VEHICLE_LOG_KEY);
    const newLog: VehicleLogEntry = {
        logId: `log_${new Date().getTime()}`,
        ...logData,
    };
    setStoredData<VehicleLogEntry>(VEHICLE_LOG_KEY, [...log, newLog]);
    return newLog.logId;
};

export const updateVehicleLog = async (logId: string, logData: Partial<Omit<VehicleLogEntry, 'logId' | 'id'>>): Promise<void> => {
    const logs = getStoredData<VehicleLogEntry>(VEHICLE_LOG_KEY);
    const updatedLogs = logs.map(l => l.logId === logId ? { ...l, ...logData } : l);
    setStoredData<VehicleLogEntry>(VEHICLE_LOG_KEY, updatedLogs);
};

export const deleteVehicleLog = async (logId: string): Promise<void> => {
    const logs = getStoredData<VehicleLogEntry>(VEHICLE_LOG_KEY);
    const updatedLogs = logs.filter(l => l.logId !== logId);
    setStoredData<VehicleLogEntry>(VEHICLE_LOG_KEY, updatedLogs);
};

export const getVehicleLog = async (): Promise<VehicleLogEntry[]> => {
    return getStoredData<VehicleLogEntry>(VEHICLE_LOG_KEY);
};

export const getLastVehicleLog = async (vehicleId: string): Promise<VehicleLogEntry | null> => {
    const log = getStoredData<VehicleLogEntry>(VEHICLE_LOG_KEY);
    const vehicleLogs = log
        .filter(l => l.id === vehicleId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return vehicleLogs[0] || null;
}
