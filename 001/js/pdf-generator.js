// ============================================================
// pdf-generator.js - PDF Generation (jsPDF + AutoTable)
// ============================================================
// สร้าง 3 แบบ PDF:
//   1. ตารางการผ่อนชำระ (Payment Schedule)
//   2. ใบเสร็จรับเงิน   (Receipt)
//   3. รายงานสรุปชำระ   (Summary Report)
// ============================================================

const PDFGenerator = {

  // ================================================
  // 1. ตารางการผ่อนชำระ
  // ================================================
  generatePaymentSchedulePDF(loan, schedule) {
    const doc = new jsPDF('p', 'mm', 'a4');

    // --- Header Banner ---
    doc.setFillColor(30, 58, 138);
    doc.roundedRect(10, 8, 190, 28, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('ตารางการผ่อนชำระเงินกู้', 105, 22, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`สัญญาที่ : ${loan.contract_number}`, 105, 31, { align: 'center' });

    // --- ข้อมูลสัญญา ---
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    const y = 45;
    doc.text(`ชื่อผู้กู้          : ${loan.customer_name}`,           15, y);
    doc.text(`จำนวนเงินกู้       : ${Utils.formatCurrency(loan.loan_amount)}`, 110, y);
    doc.text(`อัตราดอกเบี้ย      : ${loan.interest_rate}% ต่อปี (${Utils.formatInterestType(loan.interest_type)})`, 15, y + 7);
    doc.text(`จำนวนงวด           : ${loan.installments} งวด (${Utils.formatFrequency(loan.payment_frequency)})`, 110, y + 7);
    doc.text(`วันที่เริ่มสัญญา    : ${Utils.formatDate(loan.start_date)}`, 15, y + 14);
    doc.text(`ผ่อนต่องวด         : ${Utils.formatCurrency(loan.monthly_payment)}`, 110, y + 14);
    doc.text(`ยอดรวม (ต้น+ดอก)  : ${Utils.formatCurrency(loan.total_amount)}`, 15, y + 21);

    // --- เส้นคั่น ---
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.3);
    doc.line(15, y + 27, 195, y + 27);

    // --- ตาราง ---
    const body = schedule.map((row, i) => [
      i + 1,
      row.due_date ? Utils.formatDate(row.due_date) : '-',
      Utils.formatCurrency(row.principalAmount),
      Utils.formatCurrency(row.interestAmount),
      Utils.formatCurrency(row.totalPayment),
      Utils.formatCurrency(row.remainingBalance)
    ]);

    doc.autoTable({
      startY: y + 30,
      head: [['งวดที่', 'วันครบกำหนด', 'เงินต้น', 'ดอกเบี้ย', 'จำนวนจ่าย', 'คงเหลือ']],
      body,
      theme: 'grid',
      headStyles:  { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontSize: 9, halign: 'center' },
      bodyStyles:  { fontSize: 8.5, halign: 'center' },
      columnStyles: { 0: { cellWidth: 18 }, 1: { cellWidth: 35 }, 2: { cellWidth: 33 }, 3: { cellWidth: 33 }, 4: { cellWidth: 33 }, 5: { cellWidth: 33 } },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: 15, right: 15 }
    });

    // --- Footer ---
    const finalY = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('พิมพ์วันที่ : ' + Utils.formatDateThai(new Date().toISOString()), 15, finalY);

    doc.save(`ตารางผ่อน_${loan.contract_number}.pdf`);
  },

  // ================================================
  // 2. ใบเสร็จรับเงิน
  // ================================================
  generateReceiptPDF(loan, payment) {
    const doc = new jsPDF('p', 'mm', 'a4');

    // --- Header ---
    doc.setFillColor(30, 58, 138);
    doc.roundedRect(10, 8, 190, 24, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('ใบเสร็จรับเงิน', 105, 24, { align: 'center' });

    // --- เลขที่ + วันที่ ---
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.text(`เลขที่ : ${payment.receipt_number || 'N/A'}`, 15, 44);
    doc.text(`วันที่ : ${Utils.formatDate(payment.paid_date || new Date().toISOString())}`, 120, 44);

    // --- ข้อมูล ---
    const sY = 55, lH = 8;
    doc.text('ชื่อผู้จ่าย',  15, sY);           doc.text(`: ${loan.customer_name}`,           65, sY);
    doc.text('สัญญาที่',     15, sY + lH);      doc.text(`: ${loan.contract_number}`,         65, sY + lH);
    doc.text('งวดที่',       15, sY + lH * 2);  doc.text(`: ${payment.installment_number}`,   65, sY + lH * 2);
    doc.text('วิธีชำระ',     15, sY + lH * 3);  doc.text(`: ${payment.payment_method || '-'}`, 65, sY + lH * 3);

    // --- เส้นคั่น ---
    doc.setDrawColor(200);
    doc.line(15, sY + lH * 3.8, 195, sY + lH * 3.8);

    // --- ยอดเงิน (ใหญ่) ---
    doc.setFontSize(13);
    doc.setTextColor(30, 58, 138);
    doc.text('จำนวนเงินที่จ่าย', 15, sY + lH * 5.2);
    doc.setFontSize(20);
    doc.text(Utils.formatCurrency(payment.paid_amount), 195, sY + lH * 5.2, { align: 'right' });

    // --- รายละเอียด ---
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`เงินต้น   : ${Utils.formatCurrency(payment.principal_amount)}`, 15, sY + lH * 7);
    doc.text(`ดอกเบี้ย  : ${Utils.formatCurrency(payment.interest_amount)}`, 15, sY + lH * 7.8);

    // --- ลงนาม ---
    doc.setDrawColor(30, 41, 59);
    doc.line(40, sY + lH * 10.5, 110, sY + lH * 10.5);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('ลงนาม (ผู้รับเงิน)', 75, sY + lH * 11.2, { align: 'center' });

    doc.save(`ใบเสร็จ_${loan.contract_number}_งวด${payment.installment_number}.pdf`);
  },

  // ================================================
  // 3. รายงานสรุปชำระ
  // ================================================
  generateSummaryPDF(loan, payments, summary) {
    const doc = new jsPDF('p', 'mm', 'a4');

    // --- Header ---
    doc.setFillColor(30, 58, 138);
    doc.roundedRect(10, 8, 190, 24, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('รายงานสรุปการชำระเงิน', 105, 24, { align: 'center' });

    // --- สรุป ---
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.text(`สัญญา : ${loan.contract_number}  |  ผู้กู้ : ${loan.customer_name}`, 15, 44);

    // Summary boxes
    const bY = 50, bW = 45;
    const boxes = [
      { label: 'จ่ายแล้ว',    value: `${summary.paidCount}/${summary.totalInstallments}`, color: [30, 58, 138] },
      { label: 'ยอดจ่ายแล้ว', value: Utils.formatCurrency(summary.totalPaid),             color: [22, 163, 74] },
      { label: 'คงเหลือ',      value: Utils.formatCurrency(summary.remainingAmount),      color: [156, 163, 175] },
      { label: 'ค้างชำระ',     value: String(summary.overdueCount),                       color: [220, 38, 38] }
    ];
    boxes.forEach((box, i) => {
      const x = 15 + (bW + 3) * i;
      doc.setFillColor(...box.color);
      doc.roundedRect(x, bY, bW, 22, 2, 2, 'F');
      doc.setTextColor(255);
      doc.setFontSize(8);  doc.text(box.label, x + bW / 2, bY + 7, { align: 'center' });
      doc.setFontSize(11); doc.text(box.value, x + bW / 2, bY + 16, { align: 'center' });
    });

    // --- ตาราง ---
    const body = payments.map(p => [
      p.installment_number,
      Utils.formatDate(p.due_date),
      Utils.formatCurrency(p.total_amount),
      Utils.formatCurrency(p.paid_amount),
      p.paid_date ? Utils.formatDate(p.paid_date) : '-',
      Utils.formatStatus(p.status).label
    ]);

    doc.autoTable({
      startY: bY + 28,
      head: [['งวดที่', 'วันครบกำหนด', 'ต้องจ่าย', 'จ่ายจริง', 'วันที่จ่าย', 'สถานะ']],
      body,
      theme: 'grid',
      headStyles:  { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontSize: 9, halign: 'center' },
      bodyStyles:  { fontSize: 8.5, halign: 'center' },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: 15, right: 15 }
    });

    doc.save(`รายงานชำระ_${loan.contract_number}.pdf`);
  }
};
