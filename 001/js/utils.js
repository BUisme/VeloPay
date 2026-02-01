// ============================================================
// utils.js - Utility Functions
// ============================================================

const Utils = {

  // --- Format เงินเป็นบาท (1,234,567.89 บาท) ---
  formatCurrency(amount) {
    if (amount == null) return '0.00 บาท';
    return Number(amount).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' บาท';
  },

  // --- Format วันที่เป็น DD/MM/YYYY (พ.ศ.) ---
  formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day   = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year  = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  },

  // --- Format วันที่เป็นภาษาไทย เต็ม (เช่น 5 มกราคม 2568) ---
  formatDateThai(dateString) {
    if (!dateString) return '-';
    const months = [
      'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน',
      'พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม',
      'กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'
    ];
    const date = new Date(dateString);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
  },

  // --- แปลง frequency เป็นภาษาไทย ---
  formatFrequency(freq) {
    const map = { monthly: 'รายเดือน', weekly: 'รายสัปดาห์', daily: 'รายวัน' };
    return map[freq] || freq;
  },

  // --- แปลง interest type เป็นภาษาไทย ---
  formatInterestType(type) {
    const map = { reducing: 'ลดต้นลดดอก', flat: 'คงที่' };
    return map[type] || type;
  },

  // --- แปลง status เป็นภาษาไทย + สี ---
  formatStatus(status) {
    const map = {
      active:    { label: 'แบ่งจ่าย',    color: '#3b82f6', bg: '#dbeafe' },
      completed: { label: 'เสร็จสิ้น',    color: '#16a34a', bg: '#dcfce7' },
      overdue:   { label: 'ค้างชำระ',     color: '#dc2626', bg: '#fee2e2' },
      cancelled: { label: 'ยกเลิก',       color: '#6b7280', bg: '#f3f4f6' },
      pending:   { label: 'รอชำระ',       color: '#9333ea', bg: '#f3e8ff' },
      paid:      { label: 'จ่ายแล้ว',     color: '#16a34a', bg: '#dcfce7' },
      partial:   { label: 'จ่ายบางส่วน',  color: '#ea580c', bg: '#ffedd5' }
    };
    return map[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
  },

  // --- สร้าง Contract Number อัตโนมัติ (เช่น LN-2568-00001) ---
  generateContractNumber() {
    const year   = new Date().getFullYear() + 543;
    const random = String(Math.floor(Math.random() * 90000) + 10000);
    return `LN-${year}-${random}`;
  },

  // --- สร้าง URL สำหรับ Customer View ---
  // ⚠️  เปลี่ยน YOUR_GITHUB_USERNAME เป็น username GitHub ของคุณ
  getCustomerViewUrl(contractNumber) {
    const baseUrl = 'https://YOUR_GITHUB_USERNAME.github.io/loan-payment-system/customer-view.html';
    return `${baseUrl}?contract=${encodeURIComponent(contractNumber)}`;
  },

  // --- แสดง Toast Notification ---
  showToast(message, type = 'success') {
    const existing = document.getElementById('toast-container');
    if (existing) existing.remove();

    const colors = {
      success: { bg: '#16a34a', icon: '✓' },
      error:   { bg: '#dc2626', icon: '✕' },
      warning: { bg: '#ea580c', icon: '⚠' },
      info:    { bg: '#3b82f6', icon: 'ℹ' }
    };
    const c = colors[type] || colors.info;

    const toast = document.createElement('div');
    toast.id = 'toast-container';
    toast.innerHTML = `<span style="font-size:18px;margin-right:10px;">${c.icon}</span>${message}`;
    toast.style.cssText = `
      position:fixed; top:24px; right:24px; z-index:9999;
      background:${c.bg}; color:#fff; padding:14px 24px; border-radius:10px;
      font-family:'Sarabun',sans-serif; font-size:16px;
      box-shadow:0 4px 16px rgba(0,0,0,0.25);
      animation: slideIn 0.3s ease; display:flex; align-items:center;
    `;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
  },

  // --- แสดง Modal Confirm ---
  async confirmDialog(message, title = 'ยืนยัน') {
    return new Promise((resolve) => {
      const existing = document.getElementById('confirm-modal');
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.id = 'confirm-modal';
      modal.style.cssText = `
        position:fixed; top:0; left:0; width:100%; height:100%;
        background:rgba(0,0,0,0.5); z-index:10000;
        display:flex; align-items:center; justify-content:center;
      `;
      modal.innerHTML = `
        <div style="background:#fff; border-radius:16px; padding:32px; max-width:420px; width:90%;
                     box-shadow:0 8px 32px rgba(0,0,0,0.3); font-family:'Sarabun',sans-serif;">
          <h3 style="margin:0 0 12px; font-size:20px; color:#1e293b;">${title}</h3>
          <p style="margin:0 0 24px; color:#475569; font-size:16px; line-height:1.5;">${message}</p>
          <div style="display:flex; gap:12px; justify-content:flex-end;">
            <button id="confirm-cancel"
              style="padding:10px 22px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;
                     cursor:pointer; font-size:15px; color:#475569; font-family:'Sarabun',sans-serif;">ยกเลิก</button>
            <button id="confirm-ok"
              style="padding:10px 22px; border:none; border-radius:8px; background:#dc2626; color:#fff;
                     cursor:pointer; font-size:15px; font-family:'Sarabun',sans-serif;">ยืนยัน</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById('confirm-cancel').onclick = () => { modal.remove(); resolve(false); };
      document.getElementById('confirm-ok').onclick      = () => { modal.remove(); resolve(true);  };
    });
  }
};
