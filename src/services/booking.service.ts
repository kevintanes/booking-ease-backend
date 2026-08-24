import prisma from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

interface AddBookingInput {
  serviceId: string;
  timeSlotId: string;
  bookingDate: string;
  notes?: string;
}

export const getExistingBookings = async (
  serviceId: string,
  startDate: Date,
  endDate: Date,
) => {
  const bookings = await prisma.booking.groupBy({
    by: ["timeSlotId"],
    where: {
      serviceId: serviceId,
      bookingDate: { gte: startDate, lte: endDate },
      status: { notIn: ["CANCELLED"] },
    },
    _count: { timeSlotId: true },
  });

  return bookings;
};

export const addBooking = async (booking: AddBookingInput, userId: string) => {
  const service = await prisma.service.findUnique({
    where: {
      id: booking.serviceId,
    },
  });

  if (!service) {
    throw new AppError("Service not found", 404);
  }

  const newBooking = await prisma.booking.create({
    data: {
      userId: userId,
      serviceId: booking.serviceId,
      timeSlotId: booking.timeSlotId,
      bookingDate: new Date(booking.bookingDate),
      notes: booking.notes ?? null,
      totalAmount: service.price,
      status: "WAITING_PAYMENT",
    },
    include: {
      service: {
        include: {
          category: true,
        },
      },
      timeSlot: true,
    },
  });

  return newBooking;
};

export const getBooking = async (id: string, userId: string) => {
  const booking = await prisma.booking.findFirst({
    where: { id: id, userId: userId },
    include: {
      service: {
        include: {
          category: true,
        },
      },
      timeSlot: true,
      payment: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  return booking;
};
