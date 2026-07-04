const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateReceiptPDF(order) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, '..', 'receipts', `receipt-${order.orderId}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // ── Shop Header ──────────────────────────────────────────────
    doc.fontSize(22).font('Helvetica-Bold').text('TechNexus Shop', { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('#555')
      .text('Quezon City, Philippines', { align: 'center' });
    doc.fillColor('#000');
    doc.moveDown(1);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ccc').stroke();
    doc.moveDown(1);

    // ── Title ─────────────────────────────────────────────────────
    doc.fontSize(16).font('Helvetica-Bold').text('Order Receipt', { align: 'center' });
    doc.moveDown(1);

    // ── Order Info ───────────────────────────────────────────────
    doc.fontSize(11).font('Helvetica');
    doc.text(`Order ID: ${order.orderId}`);
    doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`);
    doc.text(`Status: ${order.status.toUpperCase()}`);
    if (order.status === 'shipped' && order.estimatedDelivery) {
      doc.text(`Estimated Delivery: ${order.estimatedDelivery}`);
    }
    if (order.trackingNumber) {
      doc.text(`Tracking Number: ${order.trackingNumber}`);
    }
    doc.moveDown(1);

    // ── Customer Info ────────────────────────────────────────────
    doc.font('Helvetica-Bold').text('Customer');
    doc.font('Helvetica');
    doc.text(`${order.customerName}`);
    doc.text(`${order.customerEmail}`);
    if (order.shippingAddress) doc.text(`${order.shippingAddress}`);
    doc.moveDown(1.5);

    // ── Items Table ──────────────────────────────────────────────
    const tableTop = doc.y;
    const col = {
      item: 50,
      qty: 300,
      price: 370,
      subtotal: 470,
    };
    const rowHeight = 22;

    function drawTableHeader(y) {
      doc.font('Helvetica-Bold').fontSize(11);
      doc.text('Item', col.item, y);
      doc.text('Qty', col.qty, y, { width: 50, align: 'right' });
      doc.text('Price', col.price, y, { width: 80, align: 'right' });
      doc.text('Subtotal', col.subtotal, y, { width: 80, align: 'right' });
      doc.moveTo(50, y + rowHeight - 5).lineTo(545, y + rowHeight - 5).strokeColor('#ccc').stroke();
    }

    drawTableHeader(tableTop);
    let y = tableTop + rowHeight;

    doc.font('Helvetica').fontSize(11);

    order.items.forEach((item) => {
      const qty = Number(item.quantity);
      const price = Number(item.price);
      const subtotal = qty * price;

      if (y > 700) {
        doc.addPage();
        y = 50;
        drawTableHeader(y);
        y += rowHeight;
      }

      doc.text(item.description, col.item, y, { width: 240 });
      doc.text(String(qty), col.qty, y, { width: 50, align: 'right' });
      doc.text(`PHP ${price.toFixed(2)}`, col.price, y, { width: 80, align: 'right' });
      doc.text(`PHP ${subtotal.toFixed(2)}`, col.subtotal, y, { width: 80, align: 'right' });

      y += rowHeight;
    });

    doc.moveTo(50, y).lineTo(545, y).strokeColor('#ccc').stroke();
    y += 10;

    // ── Total ────────────────────────────────────────────────────
    doc.font('Helvetica-Bold').fontSize(13);
    doc.text(`Total: PHP ${Number(order.totalAmount).toFixed(2)}`, col.item, y, {
      width: 495,
      align: 'right',
    });

    doc.moveDown(3);

    // ── Footer ───────────────────────────────────────────────────
    doc.fontSize(9).font('Helvetica').fillColor('#888')
      .text('Thank you for shopping with TechNexus Shop!', 50, doc.y, {
        width: 495,
        align: 'center',
      });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

module.exports = generateReceiptPDF;