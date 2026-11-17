import { describe, expect, it } from 'vitest';
import { calculateMonthlyIncome } from './calculator';

const base = { dailyGross: 30000, workingDays: 22, commissionPercent: 10, dailyFuel: 5000, dailyOther: 1000, monthlyRental: 120000 };

describe('calculateMonthlyIncome', () => {
  it('calculates the owned vehicle scenario', () => {
    expect(calculateMonthlyIncome(base, false)).toEqual({ gross: 660000, commission: 66000, fuel: 110000, other: 22000, rental: 0, net: 462000 });
  });
  it('subtracts monthly rental only for a rented vehicle', () => {
    expect(calculateMonthlyIncome(base, true).net).toBe(342000);
  });
  it('clamps negative and invalid assumptions to safe values', () => {
    const result = calculateMonthlyIncome({ ...base, dailyGross: -1, workingDays: 44, commissionPercent: 160, dailyFuel: Number.NaN }, true);
    expect(result.gross).toBe(0);
    expect(result.commission).toBe(0);
    expect(result.fuel).toBe(0);
    expect(result.rental).toBe(120000);
    expect(result.net).toBe(-151000);
  });
});
