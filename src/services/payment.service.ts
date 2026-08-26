import prisma from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { xenditRequest } from "../lib/xendit/client.js";

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

export interface XenditInvoiceResponse {
  id: string;
  invoice_url: string;
  status: string;
  external_id: string;
  error_code?: string;
  message?: string;
}

export const makePayment = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId },
    include: { service: true, user: true },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.userId !== userId) {
    throw new AppError("You are not allowed to access this booking", 403);
  }

  if (booking.status !== "WAITING_PAYMENT") {
    throw new AppError("Payment already processed!", 400);
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId: booking.id },
  });

  const isExistingPaymentUsable =
    existingPayment &&
    existingPayment.status === "UNPAID" &&
    existingPayment.xenditPaymentUrl &&
    existingPayment.expiredAt !== null &&
    existingPayment.expiredAt > new Date();

  if (isExistingPaymentUsable) {
    return existingPayment;
  }

  const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const invoiceData = await xenditRequest<XenditInvoiceResponse>(
    "/v2/invoices",
    "POST",
    {
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
    },
  );

  if (invoiceData.error_code) {
    console.error("Xendit error:", invoiceData);
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
    data: { status: "PENDING" },
  });

  return payment;
};

export const handleInvoiceWebhookEvent = async (event: {
  id: string;
  status: string;
  payment_method?: string;
  paid_at?: string;
}) => {
  if (event.status === "PAID" || event.status === "SETTLED") {
    const payment = await prisma.payment.findFirst({
      where: { xenditInvoiceId: event.id },
    });

    if (!payment) return;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        paymentMethod: event.payment_method ?? null,
        paidAt: new Date(event.paid_at || Date.now()),
      },
    });

    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CONFIRMED" },
    });
  } else if (event.status === "EXPIRED") {
    const payment = await prisma.payment.findFirst({
      where: { xenditInvoiceId: event.id },
    });

    if (!payment) return;

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "EXPIRED" },
    });

    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CANCELLED" },
    });
  }
};
