
import { UserData, FeasibilityResult, EmploymentType } from '../types';
import { BENCHMARKS_2026 } from '../constants';

/**
 * Calcolo rata mensile ammortamento alla francese
 */
export const calculateMonthlyPayment = (principal: number, annualRate: number, years: number): number => {
  const monthlyRate = annualRate / 12;
  const numberOfPayments = years * 12;
  if (monthlyRate === 0) return principal / numberOfPayments;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
};

export const evaluateFeasibility = (data: UserData): FeasibilityResult => {
  const rate = data.interestRate / 100;
  const monthlyPayment = calculateMonthlyPayment(data.loanAmount, rate, data.durationYears);
  const ltv = data.loanAmount / data.price;
  const dti = (monthlyPayment + data.otherLoans) / data.monthlyNetIncome;
  
  // Soglia di sussistenza: 900€ per i primi due soggetti (richiedente + 1 dipendente), 250€ per ogni persona in più
  const extraPeople = Math.max(0, data.dependents - 1);
  const totalSubsistenceNeeded = BENCHMARKS_2026.MIN_SUBSISTENCE_BASE + (extraPeople * BENCHMARKS_2026.MIN_SUBSISTENCE_PER_DEPENDENT);
  const subsistenceLeft = data.monthlyNetIncome - monthlyPayment - data.otherLoans;
  
  const maturityAge = data.age + data.durationYears;
  
  const messages: string[] = [];
  let score = 0; // 0 = Good, 1 = Warning, 2 = Critical

  // LTV Check
  const maxLtv = data.isUnder36 ? BENCHMARKS_2026.MAX_LTV_CONSAP : BENCHMARKS_2026.MAX_LTV_STANDARD;
  if (ltv > maxLtv) {
    messages.push(`LTV troppo alto: ${(ltv * 100).toFixed(1)}% (Max ${maxLtv * 100}% per il tuo profilo).`);
    score = 2;
  } else if (ltv > 0.8) {
    messages.push(`LTV superiore all'80%: l'istruttoria potrebbe essere più rigorosa.`);
    score = Math.max(score, 1);
  }

  // DTI Check
  if (dti > 0.36) {
    messages.push(`Rapporto Rata/Reddito eccessivo: ${(dti * 100).toFixed(1)}% (Soglia massima 33%).`);
    score = 2;
  } else if (dti > 0.33) {
    messages.push(`Rapporto Rata/Reddito al limite (33-36%). Necessario reddito solido.`);
    score = Math.max(score, 1);
  }

  // Subsistence Check
  if (subsistenceLeft < totalSubsistenceNeeded) {
    messages.push(`Reddito residuo insufficiente (${Math.round(subsistenceLeft)}€). Minimo richiesto per nucleo: ${totalSubsistenceNeeded}€.`);
    score = 2;
  }

  // Age Check
  if (maturityAge > BENCHMARKS_2026.MAX_MATURITY_AGE) {
    messages.push(`Scadenza mutuo a ${maturityAge} anni oltre il limite bancario di ${BENCHMARKS_2026.MAX_MATURITY_AGE}.`);
    score = 2;
  }

  // Employment Check
  if (data.employmentType === EmploymentType.DETERMINATO) {
    messages.push("Il contratto a tempo determinato richiede co-obbligati o garanzie aggiuntive.");
    score = Math.max(score, 1);
  }

  const status: FeasibilityResult['status'] = score === 0 ? 'GREEN' : score === 1 ? 'YELLOW' : 'RED';

  return {
    monthlyPayment,
    ltv,
    dti,
    subsistenceLeft,
    status,
    messages: messages.length > 0 ? messages : ["Profilo eccellente.", "Prefattibilità alta."],
    maxAgeReached: maturityAge > BENCHMARKS_2026.MAX_MATURITY_AGE
  };
};
