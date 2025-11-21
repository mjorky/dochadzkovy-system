import puppeteer from 'puppeteer';
import { WorkReport } from '../../work-records/entities/work-report.entity';
import { getWorkReportHTML } from '../templates/work-report.template';
import { Buffer } from 'buffer'; // Explicitly import Node.js Buffer

export async function generateWorkReportPDF(
  data: WorkReport,
  employeeName: string,
  month: number,
  year: number,
  signatureImage: string | undefined,
): Promise<Buffer> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    const content = getWorkReportHTML(
      data,
      employeeName,
      month,
      year,
      signatureImage,
    );
    await page.setContent(content, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });

    return Buffer.from(pdfBuffer.buffer);
  } catch (error) {
    console.error('Error generating PDF with Puppeteer:', error);
    throw new Error('Failed to generate PDF report.');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function generatePDFFromHTML(htmlContent: string): Promise<Buffer> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });

    return Buffer.from(pdfBuffer.buffer);
  } catch (error) {
    console.error('Error generating PDF with Puppeteer:', error);
    throw new Error('Failed to generate PDF report.');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
