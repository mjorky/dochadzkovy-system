import { WorkListReportResponse } from '../entities/work-list-report.entity';

export const getWorkListReportHTML = (
  data: WorkListReportResponse,
  employeeName: string,
  month: number,
  year: number,
  signatureImage?: string,
): string => {
  const monthName = new Date(year, month - 1).toLocaleString('sk-SK', {
    month: 'long',
    year: 'numeric',
  });

  // Výpočet celkových súm
  const totalProductive = data.items.reduce(
    (sum, item) => sum + item.productiveHours,
    0,
  );
  const totalNonProductive = data.items.reduce(
    (sum, item) => sum + item.nonProductiveHours,
    0,
  );
  const totalProductiveOut = data.items.reduce(
    (sum, item) => sum + item.productiveOutSkCzHours,
    0,
  );
  const totalNonProductiveZ = data.items.reduce(
    (sum, item) => sum + item.nonProductiveZHours,
    0,
  );
  const totalProductive70 = data.items.reduce(
    (sum, item) => sum + item.productive70Hours,
    0,
  );
  const totalKm = data.items.reduce((sum, item) => sum + item.travelKm, 0);

  const rows = data.items
    .map(
      (item) => `
    <tr>
      <td>${item.projectNumber}</td>
      <td>${item.projectName}</td>
      <td class="text-center">${item.productiveHours > 0 ? item.productiveHours.toFixed(2) : '0'}</td>
      <td class="text-center">${item.nonProductiveHours > 0 ? item.nonProductiveHours.toFixed(2) : '0'}</td>
      <td class="text-center">${item.productiveOutSkCzHours > 0 ? item.productiveOutSkCzHours.toFixed(2) : '0'}</td>
      <td class="text-center">${item.nonProductiveZHours > 0 ? item.nonProductiveZHours.toFixed(2) : '0'}</td>
      <td class="text-center">${item.productive70Hours > 0 ? item.productive70Hours.toFixed(2) : '0'}</td>
      <td class="text-center">${item.travelKm}</td>
      <td>${item.projectManagerName}</td>
      <td></td> <!-- Podpis -->
    </tr>
  `,
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="sk">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            font-size: 10px;
            color: #334155;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
          }
          .page {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            margin: 0 auto;
          }
          .content-wrapper {
            flex-grow: 1;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 22px;
            margin: 0 0 5px 0;
            color: #0f172a;
          }
          .header p {
            font-size: 14px;
            margin: 0;
            color: #64748b;
            font-weight: 600;
          }
          
          /* Tabuľka */
          .card {
            background-color: transparent;
            border: none;
            padding: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            font-size: 9px;
          }
          thead {
            display: table-header-group;
          }
          th, td {
            padding: 10px 5px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          th {
            background-color: #e2e8f0;
            font-weight: bold;
            color: #475569;
            vertical-align: middle;
          }
          
          /* Šírky stĺpcov */
          th.col-project { width: 20%; }
          th.col-pm { width: 12%; }
          th.col-sign { width: 8%; min-width: 50px; }

          tbody tr:nth-child(even) {
            background-color: #f8fafc;
          }
          
          .text-center {
            text-align: center;
          }

          /* Riadok Spolu */
          tr.totals-row {
            background-color: #e2e8f0 !important;
            font-weight: bold;
            color: #0f172a;
          }

          /* Pätička */
          .footer {
            margin-top: auto;
            padding-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .signature-box {
            text-align: center;
            width: 250px;
          }
          .signature-line {
            border-top: 1px solid #334155;
            padding-top: 5px;
            font-size: 11px;
            color: #334155;
          }
          .signature-img-container {
            height: 50px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="content-wrapper">
            <div class="header">
              <h1>Výkaz prác po projektoch</h1>
              <p>${employeeName} - ${monthName}</p>
            </div>

            <div class="card">
              <table>
                <thead>
                  <tr>
                    <th>Číslo zákazky</th>
                    <th class="col-project">Názov projektu</th>
                    <th class="text-center">Produktívne SK</th>
                    <th class="text-center">Neproduktívne SK</th>
                    <th class="text-center">Produktívne Z</th>
                    <th class="text-center">Neproduktívne Z</th>
                    <th class="text-center">Produktívne 70</th>
                    <th class="text-center">KM</th>
                    <th class="col-pm">Projektový manažér</th>
                    <th class="col-sign">Podpis</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                  <tr class="totals-row">
                    <td colspan="2">Celkom</td>
                    <td class="text-center">${totalProductive.toFixed(2)}</td>
                    <td class="text-center">${totalNonProductive.toFixed(2)}</td>
                    <td class="text-center">${totalProductiveOut.toFixed(2)}</td>
                    <td class="text-center">${totalNonProductiveZ.toFixed(2)}</td>
                    <td class="text-center">${totalProductive70.toFixed(2)}</td>
                    <td class="text-center">${totalKm}</td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="footer">
            <div class="signature-box">
              <div class="signature-img-container">
                ${
                  signatureImage
                    ? `<img src="${signatureImage.startsWith('data:') ? signatureImage : `data:image/png;base64,${signatureImage}`}" alt="signature" style="max-height: 50px; max-width: 200px;"/>`
                    : ''
                }
              </div>
              <div class="signature-line">Podpis zamestnanca</div>
            </div>
            
            <div class="signature-box">
              <div class="signature-img-container">
                <!-- Miesto pre podpis nadriadeného -->
              </div>
              <div class="signature-line">Podpis nadriadeného</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};