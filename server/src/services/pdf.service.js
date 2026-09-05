import puppeteer from 'puppeteer';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export const pdfService = {
  async generatePdfFromHtml(htmlContent) {
    let browser = null;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      });
      return pdfBuffer;
    } catch (e) {
      console.warn('PDF generation failed:', e.message);
      throw e;
    } finally {
      if (browser) await browser.close();
    }
  },
};

export const emailService = {
  getTransporter() {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
    });
  },

  async sendEmail({ to, subject, html, attachments = [] }) {
    try {
      const transporter = this.getTransporter();
      const result = await transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject,
        html,
        attachments,
      });
      return result;
    } catch (e) {
      console.warn(`Failed to send email to ${to}:`, e.message);
      return null;
    }
  },
};
