
"use client";

import type { VisitorFormData } from '@/app/visitantes/page';

const VISITORS_KEY = 'visitors';

// --- Local Storage Helpers ---
const getStoredVisitors = (): VisitorFormData[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(VISITORS_KEY);
    return stored ? JSON.parse(stored) : [];
};

const setStoredVisitors = (visitors: VisitorFormData[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(VISITORS_KEY, JSON.stringify(visitors));
};

// --- Visitor Management ---
export const addVisitor = (visitorData: Omit<VisitorFormData, 'id'>): string => {
    const visitors = getStoredVisitors();
    const newId = `vis_${new Date().getTime()}_${Math.random()}`;
    const newVisitor = { id: newId, ...visitorData };
    const updatedVisitors = [...visitors, newVisitor];
    setStoredVisitors(updatedVisitors);
    return newId;
};

export const updateVisitor = (visitorId: string, visitorData: Partial<VisitorFormData>): void => {
    let visitors = getStoredVisitors();
    visitors = visitors.map(v => v.id === visitorId ? { ...v, ...visitorData } : v);
    setStoredVisitors(visitors);
};

export const getVisitors = (): VisitorFormData[] => {
    return getStoredVisitors();
};

export const deleteVisitorByPersonId = (personId: string): void => {
    let visitors = getStoredVisitors();
    visitors = visitors.filter(v => v.personId !== personId);
    setStoredVisitors(visitors);
};

export const deleteVisitorsByPersonIds = (personIds: string[]): void => {
    if (personIds.length === 0) return;
    let visitors = getStoredVisitors();
    visitors = visitors.filter(v => !personIds.includes(v.personId!));
    setStoredVisitors(visitors);
};

export const deleteVisitorLog = (visitId: string): void => {
    let visitors = getStoredVisitors();
    visitors = visitors.filter(v => v.id !== visitId);
    setStoredVisitors(visitors);
};
