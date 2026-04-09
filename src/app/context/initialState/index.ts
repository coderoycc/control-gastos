// src/app/context/initialState/index.ts

import { Account, Label, SpendingLimit, Transaction } from '../types';

export const INITIAL_ACCOUNTS: Account[] = [
  { id: '1', name: 'Cuenta Personal', detail: 'Cuenta principal', balance: 0 },
  { id: '2', name: 'Ahorros', detail: 'Cuenta de ahorros', balance: 0 },
];

export const INITIAL_LABELS: Label[] = [
  { id: '1', name: 'Alimentación', color: '#10b981', type: 'salida' },
  { id: '2', name: 'Servicios', color: '#f59e0b', type: 'salida' },
  { id: '3', name: 'Transporte', color: '#3b82f6', type: 'salida' },
  { id: '4', name: 'Ingreso', color: '#8b5cf6', type: 'entrada' },
  { id: '5', name: 'Ahorro', color: '#ec4899', type: 'entrada' },
  { id: '6', name: 'Entretenimiento', color: '#14b8a6', type: 'salida' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'entrada',
    date: '2026-03-01',
    detail: 'Salario',
    amount: 3500,
    accountId: '1',
    labels: ['4']
  },
  {
    id: '2',
    type: 'salida',
    date: '2026-03-05',
    detail: 'Supermercado',
    amount: 150,
    accountId: '1',
    labels: ['1']
  },
  {
    id: '3',
    type: 'salida',
    date: '2026-03-08',
    detail: 'Electricidad',
    amount: 80,
    accountId: '1',
    labels: ['2']
  },
  {
    id: '4',
    type: 'transferencia',
    date: '2026-03-10',
    detail: 'Ahorro mensual',
    amount: 500,
    accountId: '2',
    labels: ['5']
  },
];

export const INITIAL_SPENDING_LIMITS: SpendingLimit[] = [
  {
    id: '1',
    title: 'Límite Mensual',
    amount: 2000,
    enabled: true
  },
  {
    id: '2',
    title: 'Límite Semanal',
    amount: 500,
    enabled: false
  }
];