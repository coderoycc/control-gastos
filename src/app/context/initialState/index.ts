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
  // ── ENERO 2026 ────────────────────────────────────────────────
  { id: 't01', type: 'entrada',       date: '2026-01-01', detail: 'Salario enero',          amount: 4200,  accountId: '1', labels: ['4'] },
  { id: 't02', type: 'salida',        date: '2026-01-03', detail: 'Supermercado',            amount: 320,   accountId: '1', labels: ['1'] },
  { id: 't03', type: 'salida',        date: '2026-01-07', detail: 'Electricidad',            amount: 95,    accountId: '1', labels: ['2'] },
  { id: 't04', type: 'salida',        date: '2026-01-10', detail: 'Internet y teléfono',     amount: 75,    accountId: '1', labels: ['2'] },
  { id: 't05', type: 'salida',        date: '2026-01-12', detail: 'Combustible',             amount: 110,   accountId: '1', labels: ['3'] },
  { id: 't06', type: 'salida',        date: '2026-01-14', detail: 'Cine y streaming',        amount: 60,    accountId: '1', labels: ['6'] },
  { id: 't07', type: 'salida',        date: '2026-01-17', detail: 'Farmacia',                amount: 45,    accountId: '1', labels: ['1'] },
  { id: 't08', type: 'salida',        date: '2026-01-20', detail: 'Restaurante',             amount: 140,   accountId: '1', labels: ['1', '6'] },
  { id: 't09', type: 'salida',        date: '2026-01-22', detail: 'Transporte público',      amount: 35,    accountId: '1', labels: ['3'] },
  { id: 't10', type: 'salida',        date: '2026-01-25', detail: 'Ropa',                    amount: 180,   accountId: '1', labels: ['6'] },
  { id: 't11', type: 'salida',        date: '2026-01-28', detail: 'Agua',                    amount: 55,    accountId: '1', labels: ['2'] },
  { id: 't12', type: 'transferencia', date: '2026-01-31', detail: 'Ahorro mensual',          amount: 300,   accountId: '2', labels: ['5'], toAccountId: '2' },
  { id: 't13', type: 'entrada',       date: '2026-01-15', detail: 'Trabajo freelance',       amount: 850,   accountId: '2', labels: ['4'] },

  // ── FEBRERO 2026 ──────────────────────────────────────────────
  { id: 't14', type: 'entrada',       date: '2026-02-01', detail: 'Salario febrero',         amount: 4200,  accountId: '1', labels: ['4'] },
  { id: 't15', type: 'salida',        date: '2026-02-03', detail: 'Supermercado',            amount: 290,   accountId: '1', labels: ['1'] },
  { id: 't16', type: 'salida',        date: '2026-02-06', detail: 'Electricidad',            amount: 102,   accountId: '1', labels: ['2'] },
  { id: 't17', type: 'salida',        date: '2026-02-09', detail: 'Gasolina',                amount: 95,    accountId: '1', labels: ['3'] },
  { id: 't18', type: 'salida',        date: '2026-02-11', detail: 'Suscripciones digitales', amount: 50,    accountId: '1', labels: ['6'] },
  { id: 't19', type: 'salida',        date: '2026-02-14', detail: 'Cena San Valentín',       amount: 220,   accountId: '1', labels: ['1', '6'] },
  { id: 't20', type: 'salida',        date: '2026-02-18', detail: 'Médico',                  amount: 180,   accountId: '1', labels: ['2'] },
  { id: 't21', type: 'salida',        date: '2026-02-21', detail: 'Supermercado 2',          amount: 130,   accountId: '1', labels: ['1'] },
  { id: 't22', type: 'salida',        date: '2026-02-24', detail: 'Peluquería',              amount: 40,    accountId: '1', labels: ['6'] },
  { id: 't23', type: 'salida',        date: '2026-02-26', detail: 'Internet',                amount: 75,    accountId: '1', labels: ['2'] },
  { id: 't24', type: 'salida',        date: '2026-02-27', detail: 'Bus mensual',             amount: 68,    accountId: '1', labels: ['3'] },
  { id: 't25', type: 'transferencia', date: '2026-02-28', detail: 'Ahorro mensual',          amount: 0,     accountId: '2', labels: ['5'], toAccountId: '2' },
  { id: 't26', type: 'entrada',       date: '2026-02-10', detail: 'Bono extra',              amount: 600,   accountId: '1', labels: ['4'] },

  // ── MARZO 2026 ────────────────────────────────────────────────
  { id: 't27', type: 'entrada',       date: '2026-03-01', detail: 'Salario marzo',           amount: 3500,  accountId: '1', labels: ['4'] },
  { id: 't28', type: 'salida',        date: '2026-03-05', detail: 'Supermercado',            amount: 150,   accountId: '1', labels: ['1'] },
  { id: 't29', type: 'salida',        date: '2026-03-08', detail: 'Electricidad',            amount: 80,    accountId: '1', labels: ['2'] },
  { id: 't30', type: 'transferencia', date: '2026-03-10', detail: 'Ahorro mensual',          amount: 500,   accountId: '2', labels: ['5'], toAccountId: '2' },
  { id: 't31', type: 'salida',        date: '2026-03-12', detail: 'Combustible',             amount: 98,    accountId: '1', labels: ['3'] },
  { id: 't32', type: 'salida',        date: '2026-03-15', detail: 'Restaurante',             amount: 65,    accountId: '1', labels: ['1', '6'] },
  { id: 't33', type: 'salida',        date: '2026-03-18', detail: 'Farmacia',                amount: 35,    accountId: '1', labels: ['1'] },
  { id: 't34', type: 'salida',        date: '2026-03-20', detail: 'Streaming',               amount: 25,    accountId: '1', labels: ['6'] },
  { id: 't35', type: 'salida',        date: '2026-03-22', detail: 'Transporte taxi',         amount: 28,    accountId: '1', labels: ['3'] },
  { id: 't36', type: 'entrada',       date: '2026-03-25', detail: 'Venta artículos',         amount: 200,   accountId: '2', labels: ['4'] },

  // ── ABRIL 2026 ────────────────────────────────────────────────
  { id: 't37', type: 'entrada',       date: '2026-04-01', detail: 'Salario abril',           amount: 5100,  accountId: '1', labels: ['4'] },
  { id: 't38', type: 'salida',        date: '2026-04-02', detail: 'Supermercado',            amount: 310,   accountId: '1', labels: ['1'] },
  { id: 't39', type: 'salida',        date: '2026-04-05', detail: 'Electricidad',            amount: 115,   accountId: '1', labels: ['2'] },
  { id: 't40', type: 'salida',        date: '2026-04-07', detail: 'Gas',                     amount: 78,    accountId: '1', labels: ['2'] },
  { id: 't41', type: 'salida',        date: '2026-04-09', detail: 'Gasolina',                amount: 125,   accountId: '1', labels: ['3'] },
  { id: 't42', type: 'salida',        date: '2026-04-11', detail: 'Ropa de temporada',       amount: 280,   accountId: '1', labels: ['6'] },
  { id: 't43', type: 'salida',        date: '2026-04-13', detail: 'Cine',                    amount: 45,    accountId: '1', labels: ['6'] },
  { id: 't44', type: 'salida',        date: '2026-04-15', detail: 'Supermercado 2',          amount: 195,   accountId: '1', labels: ['1'] },
  { id: 't45', type: 'salida',        date: '2026-04-17', detail: 'Agua',                    amount: 62,    accountId: '1', labels: ['2'] },
  { id: 't46', type: 'salida',        date: '2026-04-19', detail: 'Mecánico auto',           amount: 350,   accountId: '1', labels: ['3'] },
  { id: 't47', type: 'salida',        date: '2026-04-21', detail: 'Restaurante cumpleaños',  amount: 175,   accountId: '1', labels: ['1', '6'] },
  { id: 't48', type: 'salida',        date: '2026-04-23', detail: 'Internet',                amount: 75,    accountId: '1', labels: ['2'] },
  { id: 't49', type: 'salida',        date: '2026-04-25', detail: 'Medicamentos',            amount: 55,    accountId: '1', labels: ['1'] },
  { id: 't50', type: 'salida',        date: '2026-04-27', detail: 'Bar con amigos',          amount: 90,    accountId: '1', labels: ['6'] },
  { id: 't51', type: 'salida',        date: '2026-04-29', detail: 'Bus mensual',             amount: 68,    accountId: '1', labels: ['3'] },
  { id: 't52', type: 'transferencia', date: '2026-04-30', detail: 'Ahorro mensual',          amount: 200,   accountId: '2', labels: ['5'], toAccountId: '2' },
  { id: 't53', type: 'entrada',       date: '2026-04-16', detail: 'Freelance diseño',        amount: 750,   accountId: '2', labels: ['4'] },

  // ── MAYO 2026 ─────────────────────────────────────────────────
  { id: 't54', type: 'entrada',       date: '2026-05-01', detail: 'Salario mayo',            amount: 4800,  accountId: '1', labels: ['4'] },
  { id: 't55', type: 'salida',        date: '2026-05-02', detail: 'Supermercado',            amount: 275,   accountId: '1', labels: ['1'] },
  { id: 't56', type: 'salida',        date: '2026-05-05', detail: 'Electricidad',            amount: 108,   accountId: '1', labels: ['2'] },
  { id: 't57', type: 'salida',        date: '2026-05-07', detail: 'Gasolina',                amount: 130,   accountId: '1', labels: ['3'] },
  { id: 't58', type: 'salida',        date: '2026-05-09', detail: 'Supermercado 2',          amount: 160,   accountId: '1', labels: ['1'] },
  { id: 't59', type: 'salida',        date: '2026-05-11', detail: 'Netflix y Spotify',       amount: 42,    accountId: '1', labels: ['6'] },
  { id: 't60', type: 'salida',        date: '2026-05-13', detail: 'Peluquería',              amount: 40,    accountId: '1', labels: ['6'] },
  { id: 't61', type: 'salida',        date: '2026-05-15', detail: 'Internet',                amount: 75,    accountId: '1', labels: ['2'] },
  { id: 't62', type: 'salida',        date: '2026-05-17', detail: 'Transporte taxi',         amount: 22,    accountId: '1', labels: ['3'] },
  { id: 't63', type: 'salida',        date: '2026-05-19', detail: 'Farmacia',                amount: 38,    accountId: '1', labels: ['1'] },
  { id: 't64', type: 'salida',        date: '2026-05-21', detail: 'Cena familiar',           amount: 190,   accountId: '1', labels: ['1', '6'] },
  { id: 't65', type: 'salida',        date: '2026-05-22', detail: 'Agua',                    amount: 58,    accountId: '1', labels: ['2'] },
  { id: 't66', type: 'salida',        date: '2026-05-24', detail: 'Bus mensual',             amount: 68,    accountId: '1', labels: ['3'] },
  { id: 't67', type: 'salida',        date: '2026-05-26', detail: 'Spa y bienestar',         amount: 95,    accountId: '1', labels: ['6'] },
  { id: 't68', type: 'salida',        date: '2026-05-28', detail: 'Supermercado 3',          amount: 145,   accountId: '1', labels: ['1'] },
  { id: 't69', type: 'transferencia', date: '2026-05-30', detail: 'Ahorro mensual',          amount: 450,   accountId: '2', labels: ['5'], toAccountId: '2' },
  { id: 't70', type: 'entrada',       date: '2026-05-12', detail: 'Venta online',            amount: 320,   accountId: '2', labels: ['4'] },
  { id: 't71', type: 'salida',        date: '2026-05-14', detail: 'Curso online',            amount: 120,   accountId: '2', labels: ['6'] },
  { id: 't72', type: 'salida',        date: '2026-05-29', detail: 'Seguro auto',             amount: 210,   accountId: '1', labels: ['2'] },
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