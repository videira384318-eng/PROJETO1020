
"use client";

import type { VehicleFormData, VehicleLogEntry } from '@/app/veiculos/page';

const VEHICLES_KEY = 'vehicles';
const VEHICLE_LOG_KEY = 'vehicle_log';

// --- Local Storage Helpers ---
const getFromStorage = <T>(key: string): T[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
};

const setInStorage = <T>(key: string, data: T[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
};

// --- Vehicle Management ---
export const addVehicle = (vehicleData: Omit<VehicleFormData, 'id'>): string => {
    const vehicles = getFromStorage<VehicleFormData>(VEHICLES_KEY);
    const newId = `vhc_${new Date().getTime()}_${Math.random()}`;
    const newVehicle = { id: newId, ...vehicleData };
    const updatedVehicles = [...vehicles, newVehicle];
    setInStorage(VEHICLES_KEY, updatedVehicles);
    return newId;
};

export const updateVehicle = (vehicleId: string, vehicleData: Partial<VehicleFormData>): void => {
    let vehicles = getFromStorage<VehicleFormData>(VEHICLES_KEY);
    vehicles = vehicles.map(v => v.id === vehicleId ? { ...v, ...vehicleData } : v);
    setInStorage(VEHICLES_KEY, vehicles);
};

export const deleteVehicle = (vehicleId: string): void => {
    let vehicles = getFromStorage<VehicleFormData>(VEHICLES_KEY);
    vehicles = vehicles.filter(v => v.id !== vehicleId);
    setInStorage(VEHICLES_KEY, vehicles);
};

export const getVehicles = (): VehicleFormData[] => {
    return getFromStorage<VehicleFormData>(VEHICLES_KEY);
};

// --- Vehicle Log Management ---
export const addVehicleLog = (logData: Omit<VehicleLogEntry, 'logId'>): string => {
    const logs = getFromStorage<VehicleLogEntry>(VEHICLE_LOG_KEY);
    const newId = `log_vhc_${new Date().getTime()}_${Math.random()}`;
    const newLog = { logId: newId, ...logData };
    const updatedLogs = [...logs, newLog];
    setInStorage(VEHICLE_LOG_KEY, updatedLogs);
    return newId;
};

export const updateVehicleLog = (logId: string, logData: Partial<Omit<VehicleLogEntry, 'logId' | 'id'>>): void => {
    let logs = getFromStorage<VehicleLogEntry>(VEHICLE_LOG_KEY);
    logs = logs.map(l => l.logId === logId ? { ...l, ...logData } : l);
    setInStorage(VEHICLE_LOG_KEY, logs);
};

export const deleteVehicleLog = (logId: string): void => {
    let logs = getFromStorage<VehicleLogEntry>(VEHICLE_LOG_KEY);
    logs = logs.filter(l => l.logId !== logId);
    setInStorage(VEHICLE_LOG_KEY, logs);
};

export const getVehicleLog = (): VehicleLogEntry[] => {
    return getFromStorage<VehicleLogEntry>(VEHICLE_LOG_KEY);
};

export const getLastVehicleLog = (vehicleId: string): VehicleLogEntry | null => {
    const logs = getFromStorage<VehicleLogEntry>(VEHICLE_LOG_KEY);
    const vehicleLogs = logs
        .filter(log => log.id === vehicleId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return vehicleLogs.length > 0 ? vehicleLogs[0] : null;
};
