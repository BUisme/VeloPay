// ============================================================
// database.js - Supabase CRUD Operations
// ============================================================

const DB = {

  // ================================================
  // LOANS
  // ================================================

  async getAllLoans() {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getLoanById(id) {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getLoanByContractNumber(contractNumber) {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('contract_number', contractNumber)
      .single();
    if (error) throw error;
    return data;
  },

  async createLoan(loanData) {
    const { data, error } = await supabase
      .from('loans')
      .insert([loanData])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateLoan(id, updateData) {
    const { data, error } = await supabase
      .from('loans')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  // Soft delete (เปลี่ยน status เป็น cancelled)
  async deleteLoan(id) {
    const { data, error } = await supabase
      .from('loans')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  // ================================================
  // PAYMENTS
  // ================================================

  async getPaymentsByLoanId(loanId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('installment_number', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createPaymentsSchedule(payments) {
    const { data, error } = await supabase
      .from('payments')
      .insert(payments)
      .select();
    if (error) throw error;
    return data;
  },

  async updatePayment(id, updateData) {
    const { data, error } = await supabase
      .from('payments')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  // สรุปสถานะ payment ของสัญญา
  async getPaymentSummary(loanId) {
    const payments = await this.getPaymentsByLoanId(loanId);
    const totalInstallments = payments.length;
    const paidCount    = payments.filter(p => p.status === 'paid').length;
    const overdueCount = payments.filter(p => p.status === 'overdue').length;
    const totalPaid    = payments.reduce((sum, p) => sum + (p.paid_amount || 0), 0);
    const totalDue     = payments.reduce((sum, p) => sum + p.total_amount, 0);

    return {
      totalInstallments,
      paidCount,
      overdueCount,
      pendingCount:     payments.filter(p => p.status === 'pending').length,
      totalPaid:        LoanCalculator.round(totalPaid),
      totalDue:         LoanCalculator.round(totalDue),
      remainingAmount:  LoanCalculator.round(totalDue - totalPaid),
      progressPercent:  totalInstallments > 0 ? Math.round((paidCount / totalInstallments) * 100) : 0
    };
  }
};
