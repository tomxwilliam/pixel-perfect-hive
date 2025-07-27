import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceData {
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_company?: string;
  amount: number;
  due_date?: string;
  created_date: string;
  project_title?: string;
  status: string;
  paid_at?: string;
}

interface TemplateData {
  company_details: {
    company_name: string;
    address: string;
    email: string;
    phone: string;
    website: string;
  };
  branding: {
    logo_url: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
  };
  layout_settings: {
    template_style: string;
    show_company_logo: boolean;
    show_payment_terms: boolean;
    footer_text: string;
    currency_symbol: string;
    date_format: string;
  };
}

export const generateInvoicePDF = async (
  invoiceData: InvoiceData,
  templateData: TemplateData
): Promise<Blob> => {
  // Create a temporary div to render the invoice HTML
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '794px'; // A4 width at 96 DPI
  tempDiv.style.background = 'white';
  tempDiv.style.fontFamily = 'Arial, sans-serif';
  
  // Generate the HTML content
  tempDiv.innerHTML = generateInvoiceHTML(invoiceData, templateData);
  
  // Add to document temporarily
  document.body.appendChild(tempDiv);
  
  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2, // High quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    return pdf.output('blob');
  } finally {
    // Clean up
    document.body.removeChild(tempDiv);
  }
};

const generateInvoiceHTML = (invoiceData: InvoiceData, templateData: TemplateData): string => {
  const { company_details, branding, layout_settings } = templateData;
  
  return `
    <div style="
      font-family: Arial, sans-serif; 
      margin: 40px; 
      color: #333;
      background: white;
      line-height: 1.4;
    ">
      <!-- Header -->
      <div style="
        border-bottom: 3px solid ${branding.primary_color}; 
        padding-bottom: 20px; 
        margin-bottom: 30px; 
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div style="flex: 1;">
          <div style="
            font-size: 28px; 
            font-weight: bold; 
            color: ${branding.primary_color}; 
            margin-bottom: 10px;
          ">${company_details.company_name}</div>
          <div style="color: #666; line-height: 1.5;">
            ${company_details.address.replace(/\n/g, '<br>')}<br>
            ${company_details.email}${company_details.phone ? '<br>' + company_details.phone : ''}
            ${company_details.website ? '<br>' + company_details.website : ''}
          </div>
        </div>
        ${layout_settings.show_company_logo && branding.logo_url ? `
          <div style="
            width: 120px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <img src="${branding.logo_url}" alt="Logo" style="max-width: 120px; max-height: 60px;">
          </div>
        ` : ''}
      </div>
      
      <!-- Invoice Title -->
      <div style="
        font-size: 32px; 
        font-weight: bold; 
        margin: 30px 0;
        color: ${branding.accent_color};
      ">INVOICE</div>
      
      <!-- Invoice Details -->
      <div style="
        background: linear-gradient(135deg, ${branding.primary_color}15, ${branding.secondary_color}15); 
        padding: 25px; 
        border-radius: 8px; 
        margin: 20px 0;
        border-left: 4px solid ${branding.primary_color};
      ">
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        ">
          <div>
            <p><strong>Invoice Number:</strong> ${invoiceData.invoice_number}</p>
            <p><strong>Issue Date:</strong> ${formatDate(invoiceData.created_date, layout_settings.date_format)}</p>
            ${invoiceData.due_date ? `<p><strong>Due Date:</strong> ${formatDate(invoiceData.due_date, layout_settings.date_format)}</p>` : ''}
            <p><strong>Status:</strong> ${invoiceData.status.toUpperCase()}</p>
            ${invoiceData.paid_at ? `<p><strong>Paid Date:</strong> ${formatDate(invoiceData.paid_at, layout_settings.date_format)}</p>` : ''}
          </div>
          <div>
            <p><strong>Bill To:</strong></p>
            <p>${invoiceData.customer_name}<br>
            ${invoiceData.customer_email}
            ${invoiceData.customer_company ? '<br>' + invoiceData.customer_company : ''}
            </p>
          </div>
        </div>
        <div style="
          font-size: 28px; 
          font-weight: bold; 
          color: ${branding.secondary_color}; 
          text-align: right;
        ">Total: ${layout_settings.currency_symbol}${invoiceData.amount.toLocaleString()}</div>
      </div>

      <!-- Items Table -->
      <table style="
        width: 100%;
        border-collapse: collapse;
        margin: 30px 0;
      ">
        <thead>
          <tr>
            <th style="
              padding: 15px;
              text-align: left;
              border-bottom: 1px solid #eee;
              background: ${branding.primary_color};
              color: white;
              font-weight: bold;
            ">Description</th>
            <th style="
              padding: 15px;
              text-align: right;
              border-bottom: 1px solid #eee;
              background: ${branding.primary_color};
              color: white;
              font-weight: bold;
            ">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="
              padding: 15px;
              text-align: left;
              border-bottom: 1px solid #eee;
            ">${invoiceData.project_title || 'Professional Services'}</td>
            <td style="
              padding: 15px;
              text-align: right;
              border-bottom: 1px solid #eee;
            ">${layout_settings.currency_symbol}${invoiceData.amount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <!-- Total Section -->
      <div style="
        background: ${branding.primary_color}10;
        padding: 20px;
        border-radius: 8px;
        text-align: right;
        margin: 30px 0;
      ">
        <h3 style="margin: 0; color: ${branding.primary_color};">
          Total Amount: ${layout_settings.currency_symbol}${invoiceData.amount.toLocaleString()}
        </h3>
      </div>

      ${layout_settings.show_payment_terms ? `
        <div style="
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
          font-size: 14px;
        ">
          <strong>Payment Terms:</strong> Payment is due within 30 days of invoice date. 
          Late payments may incur additional charges.
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="
        margin-top: 50px; 
        padding-top: 30px; 
        border-top: 2px solid ${branding.primary_color}; 
        text-align: center; 
        color: #666;
        font-style: italic;
      ">
        <p>${layout_settings.footer_text}</p>
      </div>
    </div>
  `;
};

const formatDate = (dateString: string, format: string): string => {
  const date = new Date(dateString);
  
  switch (format) {
    case 'MM/DD/YYYY':
      return date.toLocaleDateString('en-US');
    case 'YYYY-MM-DD':
      return date.toISOString().split('T')[0];
    case 'DD/MM/YYYY':
    default:
      return date.toLocaleDateString('en-GB');
  }
};

// Alternative simpler PDF generation without html2canvas
export const generateSimpleInvoicePDF = (
  invoiceData: InvoiceData,
  templateData: TemplateData
): jsPDF => {
  const { company_details, branding, layout_settings } = templateData;
  
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  let yPosition = 20;
  
  // Set primary color (approximate conversion from hex to RGB)
  const primaryColorRGB = hexToRgb(branding.primary_color);
  
  // Header
  pdf.setFontSize(24);
  pdf.setTextColor(primaryColorRGB.r, primaryColorRGB.g, primaryColorRGB.b);
  pdf.text(company_details.company_name, 20, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setTextColor(102, 102, 102);
  pdf.text(company_details.address, 20, yPosition);
  yPosition += 5;
  pdf.text(company_details.email, 20, yPosition);
  yPosition += 5;
  if (company_details.phone) {
    pdf.text(company_details.phone, 20, yPosition);
    yPosition += 5;
  }
  if (company_details.website) {
    pdf.text(company_details.website, 20, yPosition);
    yPosition += 5;
  }
  
  yPosition += 15;
  
  // Invoice title
  pdf.setFontSize(32);
  pdf.setTextColor(primaryColorRGB.r, primaryColorRGB.g, primaryColorRGB.b);
  pdf.text('INVOICE', 20, yPosition);
  yPosition += 20;
  
  // Invoice details
  pdf.setFontSize(12);
  pdf.setTextColor(51, 51, 51);
  pdf.text(`Invoice Number: ${invoiceData.invoice_number}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Issue Date: ${formatDate(invoiceData.created_date, layout_settings.date_format)}`, 20, yPosition);
  yPosition += 6;
  if (invoiceData.due_date) {
    pdf.text(`Due Date: ${formatDate(invoiceData.due_date, layout_settings.date_format)}`, 20, yPosition);
    yPosition += 6;
  }
  pdf.text(`Status: ${invoiceData.status.toUpperCase()}`, 20, yPosition);
  yPosition += 10;
  
  // Bill To
  pdf.text('Bill To:', 20, yPosition);
  yPosition += 6;
  pdf.text(invoiceData.customer_name, 20, yPosition);
  yPosition += 6;
  pdf.text(invoiceData.customer_email, 20, yPosition);
  yPosition += 6;
  if (invoiceData.customer_company) {
    pdf.text(invoiceData.customer_company, 20, yPosition);
    yPosition += 6;
  }
  
  yPosition += 10;
  
  // Amount
  pdf.setFontSize(18);
  pdf.setTextColor(primaryColorRGB.r, primaryColorRGB.g, primaryColorRGB.b);
  pdf.text(`Total: ${layout_settings.currency_symbol}${invoiceData.amount.toLocaleString()}`, pageWidth - 20, yPosition, { align: 'right' });
  
  yPosition += 20;
  
  // Footer
  if (yPosition < pageHeight - 30) {
    pdf.setFontSize(10);
    pdf.setTextColor(102, 102, 102);
    pdf.text(layout_settings.footer_text, pageWidth / 2, pageHeight - 20, { align: 'center' });
  }
  
  return pdf;
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 123, b: 255 }; // Default blue
};