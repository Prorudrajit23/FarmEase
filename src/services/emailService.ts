import emailjs from '@emailjs/browser';
import { format } from 'date-fns';

const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
  console.error('EmailJS credentials are not properly configured in environment variables.');
}

// Initialize EmailJS with your public key
emailjs.init(EMAILJS_PUBLIC_KEY);

// Helper function to ensure price has ₹ symbol
const formatPrice = (price: string): string => {
  // If price already has ₹ symbol, return as is
  if (price.includes('₹')) {
    return price;
  }
  
  // Extract numeric price if it has other formatting
  const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ""));
  return isNaN(numericPrice) ? `₹${price}` : `₹${numericPrice.toFixed(2)}`;
};

export const sendInvoiceEmail = async (
  toEmail: string,
  invoiceHtml: string, // This parameter is kept for backward compatibility
  orderDetails: {
    orderNumber: string;
    totalAmount: string;
    items: Array<{
      name: string;
      quantity: number;
      price: string;
    }>;
  }
) => {
  try {
    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
      throw new Error('EmailJS is not properly configured. Please check your environment variables.');
    }

    // Format items list as HTML table rows with properly formatted prices
    const itemsListHtml = orderDetails.items
      .map(item => {
        const formattedPrice = formatPrice(item.price);
        const itemTotal = parseFloat(item.price.replace(/[^0-9.]/g, "")) * item.quantity;
        const formattedTotal = formatPrice(itemTotal.toFixed(2));
        return `
      
            ${item.name}
            ${item.quantity}
            ${formattedPrice}
            ${formattedTotal}
        `;
      })
      .join('');

    // Ensure total amount has ₹ symbol
    const formattedTotalAmount = formatPrice(orderDetails.totalAmount);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: toEmail,
        order_number: orderDetails.orderNumber,
        order_date: format(new Date(), 'PPP'),
        total_amount: formattedTotalAmount,
        items_list: orderDetails.items
          .map(item => `${item.name} (${item.quantity}x) - ${formatPrice(item.price)}`)
          .join('\n'),
        items_list_html: itemsListHtml
      }
    );

    return { success: true, response };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return { success: false, error };
  }
}; 