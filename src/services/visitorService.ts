"use client";

import type { VisitorFormData } from '@/app/visitantes/page';

const VISITORS_COLLECTION = 'visitors_local';

// Helper function to get visitors from localStorage
const getStoredVisitors = (): VisitorFormData[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(VISITORS_COLLECTION);
    return stored ? JSON.parse(stored) : [];
};

// Helper function to save visitors to localStorage
const setStoredVisitors = (visitors: VisitorFormData[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(VISITORS_COLLECTION, JSON.stringify(visitors));
};

export const addVisitor = (visitorData: VisitorFormData): string => {
  const visitors = getStoredVisitors();
  const newVisitor: VisitorFormData = {
    ...visitorData,
    id: `visitor_${new Date().getTime()}_${Math.random()}`
  };
  const updatedVisitors = [...visitors, newVisitor];
  setStoredVisitors(updatedVisitors);
  return newVisitor.id!;
};

export const updateVisitor = (visitorId: string, visitorData: Partial<VisitorFormData>): void => {
    const visitors = getStoredVisitors();
    const updatedVisitors = visitors.map(v => 
        v.id === visitorId ? { ...v, ...visitorData } : v
    );
    setStoredVisitors(updatedVisitors);
};

export const deleteVisitorByPersonId = (personId: string): void => {
    const visitors = getStoredVisitors();
    const updatedVisitors = visitors.filter(v => v.personId !== personId);
    setStoredVisitors(updatedVisitors);
};

export const deleteVisitorsByPersonIds = (personIds: string[]): void => {
    if (personIds.length === 0) return;
    const visitors = getStoredVisitors();
    const updatedVisitors = visitors.filter(v => !personIds.includes(v.personId!));
    setStoredVisitors(updatedVisitors);
};

export const deleteVisitorLog = (visitId: string): void => {
    const visitors = getStoredVisitors();
    const updatedVisitors = visitors.filter(v => v.id !== visitId);
    setStoredVisitors(updatedVisitors);
};

export const getVisitors = (): VisitorFormData[] => {
    return getStoredVisitors();
};
