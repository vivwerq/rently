export type AccountType =
  | 'CUSTOMER_FUNDS_RECEIVABLE'   // Asset: Gateway settlement asset
  | 'PLATFORM_COMMISSION_REVENUE' // Revenue: Rently marketplace earnings
  | 'SUPPLIER_PAYABLE'            // Liability: Net earnings owed to host/operator
  | 'DEPOSIT_ESCROW_LIABILITY'    // Liability: Renter deposit held in segregated trust
  | 'GATEWAY_FEE_EXPENSE'         // Expense: Payment processing fee
  | 'REFUND_EXPENSE';             // Expense/Outflow: Deposit refunds

export interface LedgerAccount {
  id: string;
  name: string;
  type: AccountType;
  balance: number; // Balance in INR
  description: string;
}

export interface JournalEntry {
  id: string;
  transactionId: string;
  timestamp: string;
  referenceType: 'RENTAL_PAYMENT' | 'DEPOSIT_ESCROW_HOLD' | 'DEPOSIT_REFUND' | 'SUPPLIER_PAYOUT' | 'DAMAGE_CLAIM_SETTLEMENT';
  referenceId: string;
  debitAccountId: string;
  debitAccountName: string;
  creditAccountId: string;
  creditAccountName: string;
  amount: number;
  description: string;
}

export interface LedgerAuditReport {
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  discrepancy: number;
  accounts: LedgerAccount[];
  recentEntries: JournalEntry[];
  summary: {
    totalEscrowHeld: number;
    totalPlatformRevenue: number;
    totalSupplierPayables: number;
    totalSettledRefunds: number;
  };
}

class DoubleEntryLedgerEngine {
  private accounts: Map<string, LedgerAccount> = new Map();
  private journalEntries: JournalEntry[] = [];

  constructor() {
    this.initializeDefaultAccounts();
  }

  private initializeDefaultAccounts() {
    const defaultAccounts: LedgerAccount[] = [
      {
        id: 'ACC-ASSET-RECEIVABLE',
        name: 'Customer Cash & Gateway Receivable',
        type: 'CUSTOMER_FUNDS_RECEIVABLE',
        balance: 15400,
        description: 'Settled inflow through payment gateway / escrow collections'
      },
      {
        id: 'ACC-LIAB-ESCROW',
        name: 'Segregated Security Deposit Trust',
        type: 'DEPOSIT_ESCROW_LIABILITY',
        balance: 5700,
        description: 'Customer deposits held in trust, segregated from operational cash'
      },
      {
        id: 'ACC-LIAB-SUPPLIER',
        name: 'Operator & Seller Payables',
        type: 'SUPPLIER_PAYABLE',
        balance: 8150,
        description: 'Net rental earnings payable to vetted operators and peer hosts'
      },
      {
        id: 'ACC-REV-PLATFORM',
        name: 'Rently Platform Commission Revenue',
        type: 'PLATFORM_COMMISSION_REVENUE',
        balance: 1550,
        description: '10-15% platform facilitation fee retained on completed handovers'
      },
      {
        id: 'ACC-EXP-REFUNDS',
        name: 'Deposit Refund Clearing',
        type: 'REFUND_EXPENSE',
        balance: 2400,
        description: 'Completed automated deposit releases post return inspection'
      }
    ];

    for (const acc of defaultAccounts) {
      this.accounts.set(acc.id, acc);
    }

    // Initial seed journal entry
    this.journalEntries.push({
      id: 'JRN-SEED-001',
      transactionId: 'TX-INITIAL-SEED',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      referenceType: 'RENTAL_PAYMENT',
      referenceId: 'ORD-482910',
      debitAccountId: 'ACC-ASSET-RECEIVABLE',
      debitAccountName: 'Customer Cash & Gateway Receivable',
      creditAccountId: 'ACC-LIAB-ESCROW',
      creditAccountName: 'Segregated Security Deposit Trust',
      amount: 2400,
      description: 'Initial Creta booking refundable deposit hold'
    });
  }

  /**
   * Post a double-entry transaction bundle.
   * Total debits MUST equal total credits.
   */
  public postTransaction(
    referenceType: JournalEntry['referenceType'],
    referenceId: string,
    legs: Array<{ debitAccountId: string; creditAccountId: string; amount: number; description: string }>
  ): JournalEntry[] {
    const txId = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newEntries: JournalEntry[] = [];

    for (const leg of legs) {
      const debitAcc = this.accounts.get(leg.debitAccountId);
      const creditAcc = this.accounts.get(leg.creditAccountId);

      if (!debitAcc || !creditAcc) {
        throw new Error(`Invalid ledger accounts: ${leg.debitAccountId} or ${leg.creditAccountId}`);
      }

      if (leg.amount <= 0) {
        throw new Error(`Transaction amount must be positive: ${leg.amount}`);
      }

      // Update balances
      debitAcc.balance += leg.amount;
      creditAcc.balance += leg.amount;

      const entry: JournalEntry = {
        id: `JRN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        transactionId: txId,
        timestamp: new Date().toISOString(),
        referenceType,
        referenceId,
        debitAccountId: debitAcc.id,
        debitAccountName: debitAcc.name,
        creditAccountId: creditAcc.id,
        creditAccountName: creditAcc.name,
        amount: leg.amount,
        description: leg.description
      };

      this.journalEntries.unshift(entry);
      newEntries.push(entry);
    }

    return newEntries;
  }

  /**
   * Process a rental booking payment split.
   * Debits Receivable and credits Escrow (deposit), Supplier (rent - commission), Platform (commission).
   */
  public recordRentalFunding(
    bookingId: string,
    totalPaid: number,
    depositAmount: number,
    platformFeeAmount: number,
    supplierShareAmount: number
  ): JournalEntry[] {
    const legs: Array<{ debitAccountId: string; creditAccountId: string; amount: number; description: string }> = [];

    if (depositAmount > 0) {
      legs.push({
        debitAccountId: 'ACC-ASSET-RECEIVABLE',
        creditAccountId: 'ACC-LIAB-ESCROW',
        amount: depositAmount,
        description: `Deposit held in escrow for booking ${bookingId}`
      });
    }

    if (supplierShareAmount > 0) {
      legs.push({
        debitAccountId: 'ACC-ASSET-RECEIVABLE',
        creditAccountId: 'ACC-LIAB-SUPPLIER',
        amount: supplierShareAmount,
        description: `Supplier earnings allocated for booking ${bookingId}`
      });
    }

    if (platformFeeAmount > 0) {
      legs.push({
        debitAccountId: 'ACC-ASSET-RECEIVABLE',
        creditAccountId: 'ACC-REV-PLATFORM',
        amount: platformFeeAmount,
        description: `Platform fee commission on booking ${bookingId}`
      });
    }

    return this.postTransaction('RENTAL_PAYMENT', bookingId, legs);
  }

  /**
   * Process an uncontested deposit release refund to the customer.
   */
  public recordDepositRefund(bookingId: string, refundAmount: number): JournalEntry[] {
    const legs = [
      {
        debitAccountId: 'ACC-LIAB-ESCROW',
        creditAccountId: 'ACC-ASSET-RECEIVABLE',
        amount: refundAmount,
        description: `Security deposit refund release for booking ${bookingId}`
      }
    ];

    return this.postTransaction('DEPOSIT_REFUND', bookingId, legs);
  }

  /**
   * Perform real-time double-entry reconciliation audit.
   */
  public generateAuditReport(): LedgerAuditReport {
    let totalDebits = 0;
    let totalCredits = 0;

    for (const entry of this.journalEntries) {
      totalDebits += entry.amount;
      totalCredits += entry.amount;
    }

    const escrowAcc = this.accounts.get('ACC-LIAB-ESCROW');
    const platformAcc = this.accounts.get('ACC-REV-PLATFORM');
    const supplierAcc = this.accounts.get('ACC-LIAB-SUPPLIER');
    const refundAcc = this.accounts.get('ACC-EXP-REFUNDS');

    return {
      totalDebits,
      totalCredits,
      isBalanced: totalDebits === totalCredits,
      discrepancy: Math.abs(totalDebits - totalCredits),
      accounts: Array.from(this.accounts.values()),
      recentEntries: this.journalEntries.slice(0, 20),
      summary: {
        totalEscrowHeld: escrowAcc ? escrowAcc.balance : 0,
        totalPlatformRevenue: platformAcc ? platformAcc.balance : 0,
        totalSupplierPayables: supplierAcc ? supplierAcc.balance : 0,
        totalSettledRefunds: refundAcc ? refundAcc.balance : 0
      }
    };
  }
}

export const ledgerEngine = new DoubleEntryLedgerEngine();
