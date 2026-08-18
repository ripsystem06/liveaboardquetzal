// Bank accounts rendered on the bank-transfer PDF.
// `label` is the localized section heading shown above each account.
export interface BankAccount {
  label: { en: string; es: string }
  bankName: string
  beneficiary: string
  clabe?: string
  accountNumber?: string
  routingNumber?: string
  zelle?: string
}

export const bankAccounts: BankAccount[] = [
  {
    label: { en: 'BBVA (Mexico)', es: 'BBVA (México)' },
    bankName: 'BBVA',
    beneficiary: 'Alejandro Vasquez Pila',
    clabe: '012022012760605958',
    accountNumber: '1276060595',
  },
  {
    label: { en: 'Wells Fargo (United States)', es: 'Wells Fargo (Estados Unidos)' },
    bankName: 'Wells Fargo',
    beneficiary: 'Alejandro Vasquez Pila',
    routingNumber: '121000248',
    accountNumber: '9757390019',
    zelle: 'pilaztek@hotmail.com',
  },
]
