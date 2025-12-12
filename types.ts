export interface FinancialItem {
  id: string;
  name: string;
  amount: number;
}

export enum AccountType {
  CHECKING = 'Checking',
  SAVINGS = 'Savings'
}

export interface BankAccount extends FinancialItem {
  bankName: string;
  type: AccountType;
}

export interface BusinessData {
  accountsReceivable: FinancialItem[];
  accountsPayable: FinancialItem[];
  creditCards: FinancialItem[];
  bankAccounts: BankAccount[];
}

export interface CalculationResult {
  totalAR: number;
  totalAP: number;
  totalCredit: number;
  totalBank: number;
  bankBreakdown: Record<string, number>; // B1, B2, etc. keyed by Bank Name
  netReceivables: number; // AR - AP
  netBank: number; // B - C
  bne: number; // The user's specific formula or total net
  bneFormulaStr: string;
}
