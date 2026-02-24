
export enum EmploymentType {
  INDETERMINATO = 'Tempo Indeterminato',
  DETERMINATO = 'Tempo Determinato',
  PARTITA_IVA = 'Libero Professionista / P.IVA',
  PENSIONATO = 'Pensionato',
}

export interface UserData {
  price: number;
  loanAmount: number;
  durationYears: number;
  monthlyNetIncome: number;
  otherLoans: number;
  age: number;
  dependents: number;
  employmentType: EmploymentType;
  isUnder36: boolean;
  interestRate: number;
}

export interface FeasibilityResult {
  monthlyPayment: number;
  ltv: number;
  dti: number; // Debt To Income
  subsistenceLeft: number;
  status: 'GREEN' | 'YELLOW' | 'RED';
  messages: string[];
  maxAgeReached: boolean;
}

export interface BankProduct {
  name: string;
  tan: number;
  taeg: number;
  monthlyPayment: number;
  totalCost: number;
  logo: string;
}
