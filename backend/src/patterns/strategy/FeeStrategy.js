export class FreeStrategy {
  getName() {
    return "Free";
  }
  calculateFee(context) {
    return {
      strategyName: "Free",
      originalFee: context.baseFee,
      discountAmount: context.baseFee,
      surchargeAmount: 0,
      finalFee: 0,
      discountDescription: "Free Event \u2014 100% sponsored by campus committee."
    };
  }
}
export class EarlyBirdStrategy {
  discountPercentage;
  constructor(discountPercentage = 25) {
    this.discountPercentage = discountPercentage;
  }
  getName() {
    return "EarlyBird";
  }
  calculateFee(context) {
    if (context.baseFee <= 0) {
      return new FreeStrategy().calculateFee(context);
    }
    const discountAmount = Math.round(context.baseFee * this.discountPercentage / 100);
    const finalFee = Math.max(0, context.baseFee - discountAmount);
    return {
      strategyName: "EarlyBird",
      originalFee: context.baseFee,
      discountAmount,
      surchargeAmount: 0,
      finalFee,
      discountDescription: `Early Bird Registration \u2014 ${this.discountPercentage}% off base ticket price.`
    };
  }
}
export class InterCollegeFeeStrategy {
  externalSurcharge;
  constructor(externalSurcharge = 50) {
    this.externalSurcharge = externalSurcharge;
  }
  getName() {
    return "InterCollegeFee";
  }
  calculateFee(context) {
    if (context.baseFee <= 0) {
      return new FreeStrategy().calculateFee(context);
    }
    const isExternal = context.isInterCollegeStudent ?? true;
    const surchargeAmount = isExternal ? this.externalSurcharge : 0;
    const finalFee = context.baseFee + surchargeAmount;
    return {
      strategyName: "InterCollegeFee",
      originalFee: context.baseFee,
      discountAmount: 0,
      surchargeAmount,
      finalFee,
      discountDescription: isExternal ? `Inter-College Tier \u2014 Standard base \u20B9${context.baseFee} + \u20B9${this.externalSurcharge} cross-campus facilities fee.` : "Home Institution Pass \u2014 Standard base ticket rate with zero external surcharges."
    };
  }
}
export class GroupDiscountStrategy {
  groupDiscountPercent;
  constructor(groupDiscountPercent = 20) {
    this.groupDiscountPercent = groupDiscountPercent;
  }
  getName() {
    return "GroupDiscount";
  }
  calculateFee(context) {
    if (context.baseFee <= 0) {
      return new FreeStrategy().calculateFee(context);
    }
    const teamSize = context.teamSize || 1;
    const qualifies = teamSize >= 3;
    const discountAmount = qualifies ? Math.round(context.baseFee * this.groupDiscountPercent / 100) : 0;
    const finalFee = Math.max(0, context.baseFee - discountAmount);
    return {
      strategyName: "GroupDiscount",
      originalFee: context.baseFee,
      discountAmount,
      surchargeAmount: 0,
      finalFee,
      discountDescription: qualifies ? `Team Group Discount \u2014 ${this.groupDiscountPercent}% off for group size of ${teamSize} members.` : `Solo registration \u2014 Add 2+ teammates (size >= 3) to unlock a ${this.groupDiscountPercent}% group discount.`
    };
  }
}
export class StudentIdDiscountStrategy {
  idDiscountPercent;
  constructor(idDiscountPercent = 15) {
    this.idDiscountPercent = idDiscountPercent;
  }
  getName() {
    return "StudentIdDiscount";
  }
  calculateFee(context) {
    if (context.baseFee <= 0) {
      return new FreeStrategy().calculateFee(context);
    }
    const hasId = context.hasStudentId ?? true;
    const discountAmount = hasId ? Math.round(context.baseFee * this.idDiscountPercent / 100) : 0;
    const finalFee = Math.max(0, context.baseFee - discountAmount);
    return {
      strategyName: "StudentIdDiscount",
      originalFee: context.baseFee,
      discountAmount,
      surchargeAmount: 0,
      finalFee,
      discountDescription: hasId ? `Verified University Student \u2014 ${this.idDiscountPercent}% concession applied with academic ID.` : "Standard public pricing (provide University ID card to unlock 15% discount)."
    };
  }
}
export class FeeCalculatorContext {
  strategy;
  constructor(strategy) {
    this.strategy = strategy || new StudentIdDiscountStrategy();
  }
  setStrategy(strategy) {
    this.strategy = strategy;
    return this;
  }
  getStrategyName() {
    return this.strategy.getName();
  }
  calculate(context) {
    return this.strategy.calculateFee(context);
  }
  /**
   * Factory helper to dynamically resolve strategy by key
   */
  static resolveStrategy(strategyKey) {
    switch (strategyKey?.toLowerCase()) {
      case "free":
        return new FreeStrategy();
      case "earlybird":
      case "early_bird":
        return new EarlyBirdStrategy();
      case "intercollegefee":
      case "inter_college":
        return new InterCollegeFeeStrategy();
      case "groupdiscount":
      case "group_discount":
        return new GroupDiscountStrategy();
      case "studentiddiscount":
      case "student_id":
      default:
        return new StudentIdDiscountStrategy();
    }
  }
}
