import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface MailItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export const sendOrderConfirmationEmail = async (
  email: string,
  customerName: string,
  orderId: string,
  total: number,
  items: MailItem[],
  shippingAddress: string,
  orderDate: string
) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Mail] Skipping email: RESEND_API_KEY is not set.");
    return;
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const itemsHtml = items.map(item => {
    let imageUrl = item.image;
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }

    return `
    <tr>
      <td style="padding: 24px 0; border-bottom: 1px solid #e5e5e5;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="100" valign="top">
              ${imageUrl ? `
                <img src="${imageUrl}" alt="${item.name}" width="80" style="display: block; border: 1px solid #f0f0f0;">
              ` : `
                <div style="width: 80px; height: 100px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; color: #999; font-size: 10px; text-align: center;">
                  <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 1px;">Image N/A</span>
                </div>
              `}
            </td>
            <td valign="top" style="padding-left: 20px;">
              <p style="margin: 0 0 8px; font-family: 'Times New Roman', serif; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #000; line-height: 1.4;">${item.name}</p>
              <p style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Quantity: ${item.quantity}</p>
            </td>
            <td width="100" align="right" valign="top">
              <p style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #000;">$${item.price.toLocaleString()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `}).join('');

  try {
    await resend.emails.send({
      from: 'Louis Vuitton <onboarding@resend.dev>',
      to: email,
      subject: `Order Confirmation #${orderId.slice(-8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
          <div style="max-width: 680px; margin: 0 auto; padding: 40px 20px;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 60px;">
              <h1 style="font-family: 'Times New Roman', serif; font-size: 32px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0; color: #000;">Louis Vuitton</h1>
            </div>
            
            <!-- Greeting -->
            <div style="margin-bottom: 50px;">
              <p style="font-family: 'Times New Roman', serif; font-size: 24px; color: #000; margin-bottom: 20px;">Dear ${customerName},</p>
              <p style="font-size: 13px; color: #333; line-height: 1.8; margin: 0;">
                Thank you for your order. We are pleased to confirm that your selection has been received and is currently being processed. You will receive a separate notification once your order is on its way.
              </p>
            </div>

            <!-- Order Info Grid -->
            <div style="background: #fcfcfc; padding: 30px; margin-bottom: 40px; border: 1px solid #f0f0f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" valign="top" style="padding-right: 20px; border-right: 1px solid #eee;">
                    <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 10px;">Order Reference</p>
                    <p style="font-family: 'Times New Roman', serif; font-size: 16px; color: #000; margin: 0;">#${orderId.slice(-8).toUpperCase()}</p>
                    <p style="font-size: 11px; color: #666; margin: 5px 0 0;">${orderDate}</p>
                  </td>
                  <td width="50%" valign="top" style="padding-left: 20px;">
                    <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 10px;">Shipping To</p>
                    <div style="font-family: 'Times New Roman', serif; font-size: 14px; color: #000; line-height: 1.5;">
                      ${shippingAddress.split('\n').map(line => `<div style="margin:0">${line}</div>`).join('')}
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Items -->
            <div style="margin-bottom: 50px;">
              <div style="border-bottom: 1px solid #000; padding-bottom: 15px; margin-bottom: 0;">
                <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;">Your Selection</span>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>
            </div>

            <!-- Totals -->
            <div style="margin-bottom: 60px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="60%"></td>
                  <td width="40%">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #666;">Subtotal</td>
                        <td align="right" style="padding-bottom: 12px; font-size: 12px; color: #000;">$${total.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #666;">Shipping</td>
                        <td align="right" style="padding-bottom: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #000;">Complimentary</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #000;">Total</td>
                        <td align="right" style="padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 20px; font-family: 'Times New Roman', serif; color: #000;">$${total.toLocaleString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Footer -->
            <div style="background: #111; color: #fff; padding: 40px 30px; text-align: center;">
              <p style="font-family: 'Times New Roman', serif; font-size: 18px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 30px;">Louis Vuitton</p>
              
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; line-height: 2; margin-bottom: 30px;">
                <a href="${baseUrl}" style="color: #999; text-decoration: none; margin: 0 10px;">Client Services</a>
                <a href="${baseUrl}" style="color: #999; text-decoration: none; margin: 0 10px;">Delivery & Returns</a>
                <a href="${baseUrl}" style="color: #999; text-decoration: none; margin: 0 10px;">FAQ</a>
              </div>
              
              <p style="font-size: 10px; color: #444; margin: 0;">
                © 2026 Louis Vuitton Clone. All rights reserved.<br>
                Please do not reply to this email.
              </p>
            </div>

          </div>
        </body>
        </html>
      `
    });
    console.log(`[Mail] Confirmation email sent to ${email}`);
  } catch (error) {
    console.error(`[Mail] Failed to send email:`, error);
  }
};
