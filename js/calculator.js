// ============================================================
// calculator.js - Loan Interest Calculator
// ============================================================
// รองรับ 2 แบบ:
//   1. ลดต้นลดดอก (Reducing Balance)  → สูตร EMI
//   2. อัตราคงที่  (Flat Rate)         → ดอกเบี้ยรวม = P × r × t
// ============================================================

const LoanCalculator = {

  // --- คำนวณดอกเบี้ยแบบลดต้นลดดอก (Reducing Balance) ---
  calculateReducing(principal, annualRate, totalInstallments, frequency = 'monthly') {
    const periodicRate = this.getPeriodicRate(annualRate, frequency);
    const pow          = Math.pow(1 + periodicRate, totalInstallments);
    const emi          = principal * periodicRate * pow / (pow - 1);

    let balance      = principal;
    let totalInterest = 0;
    const schedule   = [];

    for (let i = 1; i <= totalInstallments; i++) {
      const interestAmount  = balance * periodicRate;
      const principalAmount = emi - interestAmount;
      balance              -= principalAmount;
      totalInterest        += interestAmount;

      schedule.push({
        installment:      i,
        principalAmount:  this.round(principalAmount),
        interestAmount:   this.round(interestAmount),
        totalPayment:     this.round(emi),
        remainingBalance: this.round(Math.max(balance, 0))
      });
    }

    return {
      type:             'reducing',
      principal:        this.round(principal),
      annualRate,
      totalInstallments,
      periodicPayment:  this.round(emi),
      totalInterest:    this.round(totalInterest),
      totalAmount:      this.round(principal + totalInterest),
      schedule
    };
  },

  // --- คำนวณดอกเบี้ยแบบคงที่ (Flat Rate) ---
  calculateFlat(principal, annualRate, totalInstallments, frequency = 'monthly') {
    const years         = this.getYears(totalInstallments, frequency);
    const totalInterest = principal * (annualRate / 100) * years;
    const totalAmount   = principal + totalInterest;
    const periodicPayment    = totalAmount / totalInstallments;
    const principalPerPeriod = principal / totalInstallments;
    const interestPerPeriod  = totalInterest / totalInstallments;

    let balance = principal;
    const schedule = [];

    for (let i = 1; i <= totalInstallments; i++) {
      balance -= principalPerPeriod;
      schedule.push({
        installment:      i,
        principalAmount:  this.round(principalPerPeriod),
        interestAmount:   this.round(interestPerPeriod),
        totalPayment:     this.round(periodicPayment),
        remainingBalance: this.round(Math.max(balance, 0))
      });
    }

    return {
      type:             'flat',
      principal:        this.round(principal),
      annualRate,
      totalInstallments,
      periodicPayment:  this.round(periodicPayment),
      totalInterest:    this.round(totalInterest),
      totalAmount:      this.round(totalAmount),
      schedule
    };
  },

  // --- เลือกแบบคำนวณตาม type ---
  calculate(principal, annualRate, totalInstallments, interestType = 'reducing', frequency = 'monthly') {
    return interestType === 'reducing'
      ? this.calculateReducing(principal, annualRate, totalInstallments, frequency)
      : this.calculateFlat(principal, annualRate, totalInstallments, frequency);
  },

  // --- แปลงอัตราต่อปีเป็นอัตราต่องวด ---
  getPeriodicRate(annualRate, frequency) {
    const rate = annualRate / 100;
    switch (frequency) {
      case 'monthly': return rate / 12;
      case 'weekly':  return rate / 52;
      case 'daily':   return rate / 365;
      default:        return rate / 12;
    }
  },

  // --- แปลงจำนวนงวดเป็นปี ---
  getYears(totalInstallments, frequency) {
    switch (frequency) {
      case 'monthly': return totalInstallments / 12;
      case 'weekly':  return totalInstallments / 52;
      case 'daily':   return totalInstallments / 365;
      default:        return totalInstallments / 12;
    }
  },

  // --- Round to 2 decimal places ---
  round(value) {
    return Math.round(value * 100) / 100;
  },

  // --- สร้างตาราง due dates สำหรับทุกงวด ---
  generateDueDates(startDate, totalInstallments, frequency = 'monthly') {
    const dates = [];
    const start = new Date(startDate);

    for (let i = 1; i <= totalInstallments; i++) {
      const dueDate = new Date(start);
      switch (frequency) {
        case 'monthly': dueDate.setMonth(start.getMonth() + i); break;
        case 'weekly':  dueDate.setDate(start.getDate() + (i * 7)); break;
        case 'daily':   dueDate.setDate(start.getDate() + i); break;
      }
      dates.push(dueDate.toISOString().split('T')[0]);
    }
    return dates;
  }
};
