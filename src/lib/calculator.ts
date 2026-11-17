export interface CalculatorInputs {
  dailyGross: number;
  workingDays: number;
  commissionPercent: number;
  dailyFuel: number;
  dailyOther: number;
  monthlyRental: number;
}

export interface CalculatorResult {
  gross: number;
  commission: number;
  fuel: number;
  other: number;
  rental: number;
  net: number;
}

export function calculateMonthlyIncome(input: CalculatorInputs, rentsVehicle: boolean): CalculatorResult {
  const dailyGross = Math.max(0, finite(input.dailyGross));
  const workingDays = Math.min(31, Math.max(0, Math.floor(finite(input.workingDays))));
  const commissionPercent = Math.min(100, Math.max(0, finite(input.commissionPercent)));
  const fuel = Math.max(0, finite(input.dailyFuel)) * workingDays;
  const other = Math.max(0, finite(input.dailyOther)) * workingDays;
  const gross = dailyGross * workingDays;
  const commission = gross * commissionPercent / 100;
  const rental = rentsVehicle ? Math.max(0, finite(input.monthlyRental)) : 0;
  return { gross, commission, fuel, other, rental, net: gross - commission - fuel - other - rental };
}

function finite(value: number) { return Number.isFinite(value) ? value : 0; }
