export interface FeeCalculationContext {
  baseFee: number;
  isEarlyBird?: boolean;
  isInterCollegeStudent?: boolean;
  teamSize?: number;
  hasStudentId?: boolean;
  daysUntilEvent?: number;
}

export interface FeeBreakdown {
  strategyName: string;
  originalFee: number;
  discountAmount: number;
  surchargeAmount: number;
  finalFee: number;
  discountDescription: string;
}

export interface PricingStrategy {
  getName(): string;
  calculateFee(context: FeeCalculationContext): FeeBreakdown;
}

/**
 * 1. FreeStrategy: Always returns zero fee (Free workshops, community sessions).
 */
export class FreeStrategy implements PricingStrategy {
  public getName(): string {
    return 'Free';
  }

  public calculateFee(context: FeeCalculationContext): FeeBreakdown {
    return {
      strategyName: 'Free',
      originalFee: context.baseFee,
      discountAmount: context.baseFee,
      surchargeAmount: 0,
      finalFee: 0,
      discountDescription: 'Free Event — 100% sponsored by campus committee.'
    };
  }
}

/**
 * 2. EarlyBirdStrategy: 25% discount for early registrations.
 */
export class EarlyBirdStrategy implements PricingStrategy {
  private discountPercentage: number;

  constructor(discountPercentage: number = 25) {
    this.discountPercentage = discountPercentage;
  }

  public getName(): string {
    return 'EarlyBird';
  }

  public calculateFee(context: FeeCalculationContext): FeeBreakdown {
    if (context.baseFee <= 0) {
      return new FreeStrategy().calculateFee(context);
    }

    const discountAmount = Math.round((context.baseFee * this.discountPercentage) / 100);
    const finalFee = Math.max(0, context.baseFee - discountAmount);

    return {
      strategyName: 'EarlyBird',
      originalFee: context.baseFee,
      discountAmount,
      surchargeAmount: 0,
      finalFee,
      discountDescription: `Early Bird Registration — ${this.discountPercentage}% off base ticket price.`
    };
  }
}

/**
 * 3. InterCollegeFeeStrategy: Standard fee for host students, with a nominal external student surcharge.
 */
export class InterCollegeFeeStrategy implements PricingStrategy {
  private externalSurcharge: number;

  constructor(externalSurcharge: number = 50) {
    this.externalSurcharge = externalSurcharge;
  }

  public getName(): string {
    return 'InterCollegeFee';
  }

  public calculateFee(context: FeeCalculationContext): FeeBreakdown {
    if (context.baseFee <= 0) {
      return new FreeStrategy().calculateFee(context);
    }

    const isExternal = context.isInterCollegeStudent ?? true;
    const surchargeAmount = isExternal ? this.externalSurcharge : 0;
    const finalFee = context.baseFee + surchargeAmount;

    return {
      strategyName: 'InterCollegeFee',
      originalFee: context.baseFee,
      discountAmount: 0,
      surchargeAmount,
      finalFee,
      discountDescription: isExternal
        ? `Inter-College Tier — Standard base ₹${context.baseFee} + ₹${this.externalSurcharge} cross-campus facilities fee.`
        : 'Home Institution Pass — Standard base ticket rate with zero external surcharges.'
    };
  }
}

/**
 * 4. GroupDiscountStrategy: 20% discount for teams of 3 or more students.
 */
export class GroupDiscountStrategy implements PricingStrategy {
  private groupDiscountPercent: number;

  constructor(groupDiscountPercent: number = 20) {
    this.groupDiscountPercent = groupDiscountPercent;
  }

  public getName(): string {
    return 'GroupDiscount';
  }

  public calculateFee(context: FeeCalculationContext): FeeBreakdown {
    if (context.baseFee <= 0) {
      return new FreeStrategy().calculateFee(context);
    }

    const teamSize = context.teamSize || 1;
    const qualifies = teamSize >= 3;
    const discountAmount = qualifies
      ? Math.round((context.baseFee * this.groupDiscountPercent) / 100)
      : 0;
    const finalFee = Math.max(0, context.baseFee - discountAmount);

    return {
      strategyName: 'GroupDiscount',
      originalFee: context.baseFee,
      discountAmount,
      surchargeAmount: 0,
      finalFee,
      discountDescription: qualifies
        ? `Team Group Discount — ${this.groupDiscountPercent}% off for group size of ${teamSize} members.`
        : `Solo registration — Add 2+ teammates (size >= 3) to unlock a ${this.groupDiscountPercent}% group discount.`
    };
  }
}

/**
 * 5. StudentIdDiscountStrategy: 15% discount upon student verification.
 */
export class StudentIdDiscountStrategy implements PricingStrategy {
  private idDiscountPercent: number;

  constructor(idDiscountPercent: number = 15) {
    this.idDiscountPercent = idDiscountPercent;
  }

  public getName(): string {
    return 'StudentIdDiscount';
  }

  public calculateFee(context: FeeCalculationContext): FeeBreakdown {
    if (context.baseFee <= 0) {
      return new FreeStrategy().calculateFee(context);
    }

    const hasId = context.hasStudentId ?? true;
    const discountAmount = hasId
      ? Math.round((context.baseFee * this.idDiscountPercent) / 100)
      : 0;
    const finalFee = Math.max(0, context.baseFee - discountAmount);

    return {
      strategyName: 'StudentIdDiscount',
      originalFee: context.baseFee,
      discountAmount,
      surchargeAmount: 0,
      finalFee,
      discountDescription: hasId
        ? `Verified University Student — ${this.idDiscountPercent}% concession applied with academic ID.`
        : 'Standard public pricing (provide University ID card to unlock 15% discount).'
    };
  }
}

/**
 * FeeCalculatorContext:
 * Context class of the Strategy pattern.
 * Allows switching pricing algorithms at runtime.
 */
export class FeeCalculatorContext {
  private strategy: PricingStrategy;

  constructor(strategy?: PricingStrategy) {
    this.strategy = strategy || new StudentIdDiscountStrategy();
  }

  public setStrategy(strategy: PricingStrategy): this {
    this.strategy = strategy;
    return this;
  }

  public getStrategyName(): string {
    return this.strategy.getName();
  }

  public calculate(context: FeeCalculationContext): FeeBreakdown {
    return this.strategy.calculateFee(context);
  }

  /**
   * Factory helper to dynamically resolve strategy by key
   */
  public static resolveStrategy(strategyKey: string): PricingStrategy {
    switch (strategyKey?.toLowerCase()) {
      case 'free':
        return new FreeStrategy();
      case 'earlybird':
      case 'early_bird':
        return new EarlyBirdStrategy();
      case 'intercollegefee':
      case 'inter_college':
        return new InterCollegeFeeStrategy();
      case 'groupdiscount':
      case 'group_discount':
        return new GroupDiscountStrategy();
      case 'studentiddiscount':
      case 'student_id':
      default:
        return new StudentIdDiscountStrategy();
    }
  }
}
