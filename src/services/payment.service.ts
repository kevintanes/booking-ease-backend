import prisma from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const xenditRequest = async (endpoint, method, body) => {
  const credentials = Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64");
  const response = await fetch(`https://api.xendit.co${endpoint}`, {
    method,
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return response.json();
};

export const makePayment = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId },
    include: {
      service: true,
      user: true,
    },
  });

  if (booking?.status !== "WAITING_PAYMENT") {
    throw new AppError("Payment already processed!", 400);
  }

  const existingPayment = await prisma.payment.findUnique({
    where: {
      bookingId: booking.id,
    },
  });

  if (
    existingPayment &&
    existingPayment.status === "UNPAID" &&
    existingPayment.xenditPaymentUrl
  ) {
    return existingPayment;
  }

  const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const invoiceData = await xenditRequest(`/v2/invoices`, "POST", {
    external_id: `booking_${booking.id}_${Date.now()}`,
    amount: Number(booking.totalAmount),
    description: `Booking for ${booking.service.name}`,
    invoice_duration: 86400,
    customer: {
      given_names: booking.user.name,
      email: booking.user.email,
    },
    customer_notification_preference: {
      invoice_created: ["email"],
      invoice_reminder: ["email"],
      invoice_paid: ["email"],
    },
    success_redirect_url: `${CLIENT_ORIGIN}/bookings/${booking.id}?payment=success`,
    failed_redirect_url: `${CLIENT_ORIGIN}/bookings/${booking.id}?payment=failed`,
    currency: "IDR",
    item: [
      {
        name: booking.service.name,
        quantity: 1,
        price: Number(booking.totalAmount),
        category: "Service",
      },
    ],
  });

  console.log(76, invoiceData);

  if (invoiceData.error_code) {
    console.log("Xendit error: ", invoiceData);
    throw new AppError(`Payment gateway error: ${invoiceData.message}`, 500);
  }

  const payment = await prisma.payment.upsert({
    where: { bookingId: booking.id },
    update: {
      xenditInvoiceId: invoiceData.id,
      xenditPaymentUrl: invoiceData.invoice_url,
      amount: booking.totalAmount,
      status: "UNPAID",
      expiredAt,
    },
    create: {
      bookingId: booking.id,
      xenditInvoiceId: invoiceData.id,
      xenditPaymentUrl: invoiceData.invoice_url,
      amount: booking.totalAmount,
      status: "UNPAID",
      expiredAt,
    },
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "PENDING",
    },
  });

  return payment;
};
