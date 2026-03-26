/**
 * Export utilities for PDF and Excel generation
 */

// CSV export (already used in DataTable, enhanced here)
export function exportToCSV(data: Record<string, any>[], filename: string, columns?: { key: string; label: string }[]) {
  if (!data.length) return;

  const keys = columns ? columns.map(c => c.key) : Object.keys(data[0]);
  const headers = columns ? columns.map(c => c.label) : keys;

  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      keys.map(key => {
        const val = row[key];
        const str = val == null ? '' : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(',')
    ),
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

// Excel export using simple XML-based format (no external deps needed)
export function exportToExcel(
  data: Record<string, any>[],
  filename: string,
  options?: {
    sheetName?: string;
    columns?: { key: string; label: string; width?: number }[];
    title?: string;
  }
) {
  if (!data.length) return;

  const sheetName = options?.sheetName || 'Hesabat';
  const columns: { key: string; label: string; width?: number }[] = options?.columns || Object.keys(data[0]).map(k => ({ key: k, label: k, width: 120 }));
  const title = options?.title || filename;

  // Build XML Spreadsheet
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?mso-application progid="Excel.Sheet"?>\n';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
  xml += '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';

  // Styles
  xml += '<Styles>\n';
  xml += '  <Style ss:ID="Default" ss:Name="Normal"><Font ss:Size="11"/></Style>\n';
  xml += '  <Style ss:ID="Title"><Font ss:Size="16" ss:Bold="1" ss:Color="#6C63FF"/></Style>\n';
  xml += '  <Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#6C63FF" ss:Pattern="Solid"/></Style>\n';
  xml += '  <Style ss:ID="Date"><NumberFormat ss:Format="yyyy-mm-dd"/></Style>\n';
  xml += '  <Style ss:ID="AltRow"><Interior ss:Color="#F4F5F9" ss:Pattern="Solid"/></Style>\n';
  xml += '</Styles>\n';

  xml += `<Worksheet ss:Name="${sheetName}">\n`;
  xml += '<Table>\n';

  // Column widths
  columns.forEach(col => {
    xml += `  <Column ss:Width="${col.width || 120}"/>\n`;
  });

  // Title row
  xml += '<Row ss:Height="30">\n';
  xml += `  <Cell ss:StyleID="Title"><Data ss:Type="String">${escapeXml(title)}</Data></Cell>\n`;
  xml += '</Row>\n';
  xml += '<Row></Row>\n'; // empty row

  // Header row
  xml += '<Row>\n';
  columns.forEach(col => {
    xml += `  <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(col.label)}</Data></Cell>\n`;
  });
  xml += '</Row>\n';

  // Data rows
  data.forEach((row, i) => {
    xml += `<Row${i % 2 === 1 ? ' ss:StyleID="AltRow"' : ''}>\n`;
    columns.forEach(col => {
      const val = row[col.key];
      const type = typeof val === 'number' ? 'Number' : 'String';
      xml += `  <Cell><Data ss:Type="${type}">${escapeXml(String(val ?? ''))}</Data></Cell>\n`;
    });
    xml += '</Row>\n';
  });

  xml += '</Table>\n</Worksheet>\n</Workbook>';

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  downloadBlob(blob, `${filename}.xls`);
}

// Simple PDF export (creates a printable HTML that triggers print dialog)
export function exportToPDF(
  data: Record<string, any>[],
  filename: string,
  options?: {
    columns?: { key: string; label: string }[];
    title?: string;
    subtitle?: string;
  }
) {
  if (!data.length) return;

  const columns = options?.columns || Object.keys(data[0]).map(k => ({ key: k, label: k }));
  const title = options?.title || filename;
  const subtitle = options?.subtitle || new Date().toLocaleDateString('az-AZ');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @media print {
          @page { margin: 1.5cm; size: A4 landscape; }
        }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          color: #1a1a2e;
          margin: 0;
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #6C63FF;
          padding-bottom: 12px;
          margin-bottom: 20px;
        }
        .header h1 {
          font-size: 24px;
          color: #6C63FF;
          margin: 0;
        }
        .header .subtitle {
          color: #666;
          font-size: 12px;
        }
        .logo {
          font-size: 28px;
          font-weight: 800;
          color: #6C63FF;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        th {
          background: #6C63FF;
          color: white;
          padding: 10px 12px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 8px 12px;
          border-bottom: 1px solid #eee;
        }
        tr:nth-child(even) {
          background: #f8f9fe;
        }
        tr:hover {
          background: #eef0ff;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          color: #999;
          font-size: 10px;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }
        .stats {
          display: flex;
          gap: 20px;
          margin-bottom: 16px;
          font-size: 13px;
        }
        .stats span {
          background: #f0f0ff;
          padding: 4px 12px;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>${title}</h1>
          <div class="subtitle">${subtitle}</div>
        </div>
        <div class="logo">MTM</div>
      </div>
      <div class="stats">
        <span>Cəmi: <strong>${data.length}</strong> sətir</span>
        <span>Tarix: <strong>${new Date().toLocaleDateString('az-AZ')}</strong></span>
      </div>
      <table>
        <thead>
          <tr>
            ${columns.map(c => `<th>${c.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row =>
            `<tr>${columns.map(c => `<td>${row[c.key] ?? ''}</td>`).join('')}</tr>`
          ).join('')}
        </tbody>
      </table>
      <div class="footer">
        MTM - Mobile Team Management | Hesabat ${new Date().toLocaleString('az-AZ')} tarixində yaradılıb
      </div>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

// Helper: escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper: trigger file download
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
