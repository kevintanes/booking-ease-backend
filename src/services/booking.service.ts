import type { BookingStatus, Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

interface AddBookingInput {
  serviceId: string;
  timeSlotId: string;
  bookingDate: string;
  notes?: string;
}

interface PaginationQuery {
  status?: BookingStatus;
  page?: number;
  limit?: number;
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

export const getBookings = async (userId: string, query: PaginationQuery) => {
  const page = Math.max(query.page ?? 1, 1);
  const limit = Math.max(query.limit ?? 10, 1);
  const skip = (page - 1) * limit;

  const whereClause: Prisma.BookingWhereInput = {
    userId,
    ...(query.status ? { status: query.status } : {}),
  };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: whereClause,
      include: {
        service: { include: { category: true } },
        timeSlot: true,
        payment: true,
      },
      skip,
      take: limit,
      orderBy: { bookingDate: "desc" },
    }),
    prisma.booking.count({ where: whereClause }),
  ]);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
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

export const cancelBooking = async (id: string, userId: string) => {
  const booking = await prisma.booking.findFirst({
    where: { id: id, userId: userId },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (["COMPLETED", "CANCELLED"].includes(booking.status)) {
    throw new AppError("Cannot cancel this booking", 400);
  }

  const update = await prisma.booking.update({
    where: { id: id },
    data: { status: "CANCELLED" },
  });

  return update;
};
