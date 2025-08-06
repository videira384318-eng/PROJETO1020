"use client";

import type { VisitorFormData } from '@/app/visitantes/page';

const VISITORS_KEY = 'visitors_storage';

const getStoredVisitors = (): VisitorFormData[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(VISITORS_KEY);
    return stored ? JSON.parse(stored) : [];
};

const setStoredVisitors = (visitors: VisitorFormData[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(VISITORS_KEY, JSON.stringify(visitors));
};

export const addVisitor = async (visitorData: Omit<VisitorFormData, 'id'>): Promise<string> => {
    const visitors = getStoredVisitors();
    const newVisitor: VisitorFormData = {
        id: `vis_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`,
        ...visitorData,
    };
    const updatedVisitors = [...visitors, newVisitor];
    setStoredVisitors(updatedVisitors);
    return newVisitor.id!;
};

export const updateVisitor = async (visitorId: string, visitorData: Partial<VisitorFormData>): Promise<void> => {
    const visitors = getStoredVisitors();
    const updatedVisitors = visitors.map(v => 
        v.id === visitorId ? { ...v, ...visitorData } : v
    );
    setStoredVisitors(updatedVisitors);
};

export const getVisitors = async (): Promise<VisitorFormData[]> => {
    return getStoredVisitors();
};

export const deleteVisitorByPersonId = async (personId: string): Promise<void> => {
    let visitors = getStoredVisitors();
    visitors = visitors.filter(v => v.personId !== personId);
    setStoredVisitors(visitors);
};

export const deleteVisitorsByPersonIds = async (personIds: string[]): Promise<void> => {
    if (personIds.length === 0) return;
    let visitors = getStoredVisitors();
    visitors = visitors.filter(v => !personIds.includes(v.personId!));
    setStoredVisitors(visitors);
};

export const deleteVisitorLog = async (visitId: string): Promise<void> => {
    let visitors = getStoredVisitors();
    visitors = visitors.filter(v => v.id !== visitId);
    setStoredVisitors(visitors);
};
