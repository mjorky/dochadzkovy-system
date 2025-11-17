import { WorkReport } from '../../work-records/entities/work-report.entity';

export function getWorkReportHTML(data: WorkReport, employeeName: string, month: number, year: number): string {
  const reportMonth = new Date(year, month - 1).toLocaleString('sk-SK', { month: 'long', year: 'numeric' });

  const dailyRows = data.dailyRecords.map(record => `
    <tr>
      <td>${record.date}</td>
      <td>${record.dayOfWeek}</td>
      <td>${record.startTime ? record.startTime.substring(0, 5) : '-'}</td>
      <td>${record.endTime ? record.endTime.substring(0, 5) : '-'}</td>
      <td><strong>${record.hours?.toFixed(2) || '-'}</strong></td>
      <td>${record.absenceReason || '-'}</td>
    </tr>
  `).join('');

  const absenceRows = data.absenceSummary.map(summary => `
    <tr>
      <td>${summary.category}</td>
      <td>${summary.days}</td>
      <td>${summary.hours.toFixed(2)}</td>
    </tr>
  `).join('');

  const activityRows = data.activitySummary.map(summary => `
    <tr>
      <td>${summary.activityType}</td>
      <td><strong>${summary.hours.toFixed(2)}</strong></td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="sk">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          color: #334155;
          background-color: #ffffff;
        }
        .page {
          width: 210mm;
          min-height: 297mm;
          padding: 15mm;
          box-sizing: border-box;
          page-break-after: always;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .header h1 {
          font-size: 22px;
          margin: 0;
          color: #0f172a;
        }
        .header p {
          font-size: 14px;
          margin: 5px 0 0;
          color: #64748b;
        }
        .card {
            background-color: transparent;
            border: none;
            box-shadow: none;
            padding: 0;
            margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse; /* Changed to collapse */
          border-radius: 8px; /* Rounded corners for the entire table */
          overflow: hidden; /* Ensures rounded corners are visible */
          border: 1px solid #e2e8f0; /* Add border to table */
        }
        thead {
          display: table-header-group;
        }
        th, td {
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        th {
          background-color: #e2e8f0;
          font-weight: bold;
          font-size: 11px;
          color: #475569;
        }
        /* Removed individual th border-radius, handled by table overflow:hidden */
        tbody tr:nth-child(even) {
            background-color: #f8fafc;
        }
        tr {
            page-break-inside: avoid;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 20px;
        }
        .summary-card {
            background-color: #f8fafc;
            border-radius: 12px;
            padding: 15px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        .summary-card .value {
            font-size: 20px;
            font-weight: bold;
            color: #1e293b;
        }
        .summary-card .label {
            font-size: 11px;
            color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <h1>Mesačný výkaz dochádzky</h1>
          <p>${employeeName} - ${reportMonth}</p>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <div class="value">${data.totalWorkDays}</div>
                <div class="label">Pracovné dni</div>
            </div>
            <div class="summary-card">
                <div class="value">${data.totalHours.toFixed(2)}</div>
                <div class="label">Celkovo hodín</div>
            </div>
            <div class="summary-card">
                <div class="value">${data.weekendWorkHours.toFixed(2)}</div>
                <div class="label">Víkendové hodiny</div>
            </div>
             <div class="summary-card">
                <div class="value">${data.holidayWorkHours.toFixed(2)}</div>
                <div class="label">Sviatočné hodiny</div>
            </div>
        </div>
        
        <div class="card">
          <h2>Záznamy dochádzky</h2>
          <table>
            <thead>
              <tr>
                <th>Dátum</th>
                <th>Deň</th>
                <th>Začiatok</th>
                <th>Koniec</th>
                <th>Hodiny</th>
                <th>Dôvod/Činnosť</th>
              </tr>
            </thead>
            <tbody>
              ${dailyRows}
            </tbody>
          </table>
        </div>
      </div>
      
      ${data.activitySummary.length > 0 ? `
      <div class="page">
        <div class="header">
            <h1>Sumár hodín podľa typov činností</h1>
        </div>
        <div class="card">
          <table>
            <thead>
              <tr>
                <th>Typ činnosti</th>
                <th>Hodiny</th>
              </tr>
            </thead>
            <tbody>
              ${activityRows}
            </tbody>
          </table>
        </div>
      </div>
      ` : ''}
      
      ${data.absenceSummary.length > 0 ? `
      <div class="page">
        <div class="header">
            <h1>Súhrn neprítomností</h1>
        </div>
        <div class="card">
          <table>
            <thead>
              <tr>
                <th>Kategória</th>
                <th>Dni</th>
                <th>Hodiny</th>
              </tr>
            </thead>
            <tbody>
              ${absenceRows}
            </tbody>
          </table>
        </div>
      </div>
      ` : ''}
    </body>
    </html>
  `;
}
