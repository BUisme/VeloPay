// ============================================================
// qrcode-generator.js - QR Code Generation
// ============================================================
// ใช้ library: qrcodejs (CDN)
// QR Code จะ link ไปยัง customer-view.html?contract=XXXXX
// ============================================================

const QRCodeGenerator = {

  // --- สร้าง QR Code แล้วใส่ใน element ---
  generate(contractNumber, targetElementId, size = 200) {
    const url       = Utils.getCustomerViewUrl(contractNumber);
    const container = document.getElementById(targetElementId);
    if (!container) return;

    container.innerHTML = '';

    try {
      new QRCode(container, {
        text:         url,
        width:        size,
        height:       size,
        colorDark:    '#1e3a8a',
        colorLight:   '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
      container.setAttribute('data-qr-url', url);
      return url;
    } catch (err) {
      console.error('QR generation error:', err);
      container.innerHTML = '<p style="color:red;font-size:13px;">เกิดข้อผิดพลาดในการสร้าง QR</p>';
      return null;
    }
  },

  // --- Download QR เป็น PNG ---
  async downloadQR(contractNumber, size = 300) {
    const url    = Utils.getCustomerViewUrl(contractNumber);
    const tmpDiv = document.createElement('div');
    tmpDiv.style.display = 'none';
    document.body.appendChild(tmpDiv);

    new QRCode(tmpDiv, {
      text: url, width: size, height: size,
      colorDark: '#1e3a8a', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    await new Promise(r => setTimeout(r, 500));

    const canvas = tmpDiv.querySelector('canvas');
    if (canvas) {
      const link     = document.createElement('a');
      link.download  = `QR_${contractNumber}.png`;
      link.href      = canvas.toDataURL('image/png');
      link.click();
    }
    tmpDiv.remove();
  },

  // --- Copy URL ---
  copyQRUrl(contractNumber) {
    const url = Utils.getCustomerViewUrl(contractNumber);
    navigator.clipboard.writeText(url).then(() => {
      Utils.showToast('คัดลอก URL สำเร็จ!', 'success');
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      Utils.showToast('คัดลอก URL สำเร็จ!', 'success');
    });
  }
};
