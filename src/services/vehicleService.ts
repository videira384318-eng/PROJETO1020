"use client";

import type { VehicleFormData, VehicleLogEntry } from '@/app/veiculos/page';

const VEHICLES_COLLECTION = 'vehicles_local';
const VEHICLE_LOG_COLLECTION = 'vehicle_log_local';

// --- Helper Functions for localStorage ---
const getStoredData = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

const setStoredData = <T>(key: string, data: T[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// --- Vehicle Management ---
export const addVehicle = (vehicleData: Omit<VehicleFormData, 'id'>): string => {
  const vehicles = getStoredData<VehicleFormData>(VEHICLES_COLLECTION);
  const newVehicle: VehicleFormData = {
    ...vehicleData,
    id: `vehicle_${new Date().getTime()}_${Math.random()}`
  };
  const updatedVehicles = [...vehicles, newVehicle];
  setStoredData(VEHICLES_COLLECTION, updatedVehicles);
  return newVehicle.id!;
};

export const updateVehicle = (vehicleId: string, vehicleData: Partial<VehicleFormData>): void => {
    const vehicles = getStoredData<VehicleFormData>(VEHICLES_COLLECTION);
    const updatedVehicles = vehicles.map(v => 
        v.id === vehicleId ? { ...v, ...vehicleData } : v
    );
    setStoredData(VEHICLES_COLLECTION, updatedVehicles);
}

export const deleteVehicle = (vehicleId: string): void => {
    const vehicles = getStoredData<VehicleFormData>(VEHICLES_COLLECTION);
    const updatedVehicles = vehicles.filter(v => v.id !== vehicleId);
    setStoredData(VEHICLES_COLLECTION, updatedVehicles);
};

export const getVehicles = (): VehicleFormData[] => {
    return getStoredData<VehicleFormData>(VEHICLES_COLLECTION);
};

// --- Vehicle Log Management ---
export const addVehicleLog = (logData: Omit<VehicleLogEntry, 'logId'>): string => {
    const log = getStoredData<VehicleLogEntry>(VEHICLE_LOG_COLLECTION);
    const newLogEntry: VehicleLogEntry = {
        ...logData,
        logId: `log_${new Date().getTime()}_${Math.random()}`
    };
    const updatedLog = [newLogEntry, ...log];
    setStoredData(VEHICLE_LOG_COLLECTION, updatedLog);
    return newLogEntry.logId;
};

export const updateVehicleLog = (logId: string, logData: Partial<VehicleLogEntry>): void => {
    const log = getStoredData<VehicleLogEntry>(VEHICLE_LOG_COLLECTION);
    const updatedLog = log.map(l => 
        l.logId === logId ? { ...l, ...logData } : l
    );
    setStoredData(VEHICLE_LOG_COLLECTION, updatedLog);
};

export const deleteVehicleLog = (logId: string): void => {
    const log = getStoredData<VehicleLogEntry>(VEHICLE_LOG_COLLECTION);
    const updatedLog = log.filter(l => l.logId !== logId);
    setStoredData(VEHICLE_LOG_COLLECTION, updatedLog);
};

export const getVehicleLog = (): VehicleLogEntry[] => {
    return getStoredData<VehicleLogEntry>(VEHICLE_LOG_COLLECTION);
};
