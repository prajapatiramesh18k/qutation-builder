import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CustomerDetails, QuotationItem, Shop } from '@/types';

interface PDFData {
  customer: CustomerDetails;
  items: QuotationItem[];
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  deliveryCharges: number;
  total: number;
  notes: string;
}

function rs(amount: number): string {
  return 'Rs. ' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function loadImage(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) return '';
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

export async function generatePDF(data: PDFData, quotationNumber: string, shop: Shop): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // ============ BRAND LOGOS ============
  const logos = shop.showLogos && shop.logoUrls.length > 0
    ? await Promise.all(shop.logoUrls.map(url => loadImage(url)))
    : [];

  // ============ HEADER ============
  doc.setFillColor(233, 69, 96);
  doc.rect(0, 0, pageWidth, 5, 'F');

  doc.setTextColor(26, 26, 46);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(shop.name, margin, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  let infoY = 21;
  if (shop.email) {
    doc.text(shop.email, margin, infoY);
    infoY += 3;
  }
  if (shop.website) {
    doc.text(shop.website, margin, infoY);
    infoY += 3;
  }
  if (shop.contactPerson) {
    doc.text(shop.contactPerson, margin, infoY);
    infoY += 3;
  }
  if (shop.address) {
    const addrLines = doc.splitTextToSize(shop.address, contentWidth);
    doc.text(addrLines, margin, infoY);
  }

  if (logos.length > 0) {
    const logoW = 26;
    const logoH = 18;
    const logoGap = 2;
    const logoAreaWidth = (logoW * logos.length) + (logoGap * (logos.length - 1));
    const logoAreaX = pageWidth - margin - logoAreaWidth;
    let lx = logoAreaX;
    for (const logoData of logos) {
      if (logoData) {
        try { doc.addImage(logoData, 'PNG', lx, 6, logoW, logoH); } catch { /* skip */ }
      }
      lx += logoW + logoGap;
    }
  }

  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, 36, pageWidth - margin, 36);

  // ============ QUOTATION INFO ============
  const quotY = 40;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 46);
  doc.text('Quotation #: ' + quotationNumber, margin, quotY);

  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Date: ' + dateStr, pageWidth - margin, quotY, { align: 'right' });

  doc.setTextColor(0, 0, 0);
  doc.line(margin, quotY + 4, pageWidth - margin, quotY + 4);

  // ============ CUSTOMER DETAILS ============
  const custY = quotY + 10;

  doc.setFillColor(248, 248, 252);
  doc.roundedRect(margin, custY, contentWidth, 35, 2, 2, 'F');

  doc.setFillColor(26, 26, 46);
  doc.roundedRect(margin, custY, 42, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTOMER DETAILS', margin + 2, custY + 5.5);

  doc.setTextColor(26, 26, 46);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Name: ' + (data.customer.customerName || '-'), margin + 3, custY + 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Phone: +91 ' + (data.customer.customerPhone || '-'), margin + 3, custY + 20);

  const addrText = 'Address: ' + (data.customer.customerAddress || 'N/A');
  const addrLines = doc.splitTextToSize(addrText, contentWidth - 6);
  doc.text(addrLines, margin + 3, custY + 26);

  doc.setTextColor(0, 0, 0);

  // ============ ITEMS TABLE ============
  const tableY = custY + 42;

  const tableData = data.items.map((item, index) => {
    const parts = item.size ? item.size.split('×') : [];
    const sqft = parts.length === 2 ? parseFloat(parts[0]) * parseFloat(parts[1]) : 0;
    const unitPrice = sqft > 0 && item.rate ? item.rate * sqft : item.unitPrice;
    return [
      index + 1,
      item.productName,
      item.size ? item.size : '-',
      sqft > 0 ? sqft : '-',
      item.quantity,
      item.rate ? rs(item.rate) : '-',
      rs(unitPrice),
      rs(item.quantity * unitPrice),
    ];
  });

  autoTable(doc, {
    startY: tableY,
    head: [['#', 'Description', 'Size', 'Sq.Ft', 'Qty', 'Rate', 'Unit Price', 'Amount']],
    body: tableData,
    headStyles: {
      fillColor: [26, 26, 46],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [252, 252, 255],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 42, halign: 'center' },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 30, halign: 'center' },
      7: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      lineColor: [230, 230, 235],
      lineWidth: 0.2,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableEndY = (doc as any).lastAutoTable.finalY;

  // ============ TOTALS (RIGHT SIDE) ============
  const totalsX = pageWidth - margin - 80;
  const totalsWidth = 80;
  let ty = tableEndY + 10;

  doc.setFillColor(248, 248, 252);
  doc.roundedRect(totalsX - 2, ty - 2, totalsWidth + 4, 72, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Subtotal', totalsX, ty);
  doc.setTextColor(26, 26, 46);
  doc.text(rs(data.subtotal), totalsX + totalsWidth, ty, { align: 'right' });

  ty += 9;
  doc.setTextColor(80, 80, 80);
  doc.text('GST (' + data.gstPercent + '%)', totalsX, ty);
  doc.setTextColor(26, 26, 46);
  doc.text(rs(data.gstAmount), totalsX + totalsWidth, ty, { align: 'right' });

  ty += 9;
  doc.setTextColor(80, 80, 80);
  doc.text('Delivery', totalsX, ty);
  doc.setTextColor(26, 26, 46);
  doc.text(rs(data.deliveryCharges), totalsX + totalsWidth, ty, { align: 'right' });

  ty += 8;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(totalsX, ty, totalsX + totalsWidth, ty);

  ty += 10;
  doc.setFillColor(233, 69, 96);
  doc.roundedRect(totalsX - 2, ty - 6, totalsWidth + 4, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('GRAND TOTAL', totalsX + 2, ty + 1);
  doc.text(rs(data.total), totalsX + totalsWidth, ty + 1, { align: 'right' });

  // ============ NOTES ============
  if (data.notes) {
    const notesY = tableEndY + 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 46);
    doc.text('Notes:', margin, notesY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const noteLines = doc.splitTextToSize(data.notes, contentWidth);
    doc.text(noteLines, margin, notesY + 5);
    doc.setTextColor(0, 0, 0);
  }

  // ============ FOOTER ============
  const footerY = pageHeight - 8;
  doc.setDrawColor(26, 26, 46);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  const footerLeft = [shop.name, shop.website].filter(Boolean).join(' | ');
  doc.text(footerLeft, margin, footerY);
  doc.text(new Date().toLocaleDateString('en-IN'), pageWidth - margin, footerY, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  doc.save('Quotation-' + quotationNumber + '.pdf');
}
