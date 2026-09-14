import type { BookingStatus, Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";
import type {
  CreateServiceInput,
  TimeSlotInput,
  UpdateServiceInput,
} from "../types/service.types.js";
import { AppError } from "../utils/app-error.js";

interface QueryParams {
  search?: string;
  status?: BookingStatus;
  page: number;
  limit: number;
}

export const getAdminDashboard = async () => {
  const [
    totalUsers,
    totalBookings,
    totalRevenue,
    totalPendings,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count({
      where: { role: { not: "ADMIN" } },
    }),
    prisma.booking.count(),
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.booking.count({
      where: {
        status: { in: ["PENDING", "WAITING_PAYMENT"] },
      },
    }),
    prisma.booking.findMany({
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
        service: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    total: {
      totalBookings,
      totalPendings,
      totalRevenue: Number(totalRevenue._sum.amount) ?? 0,
      totalUsers,
    },
    recentBookings,
  };
};

export const getAllAdminBookings = async ({
  limit,
  page,
  search,
  status,
}: QueryParams) => {
  const skip = (page - 1) * limit;
  const whereClause: Prisma.BookingWhereInput = {};

  if (status) whereClause.status = status;

  if (search) {
    whereClause.OR = [
      { user: { name: { contains: search } } },
      { user: { email: { contains: search } } },
      { service: { name: { contains: search } } },
    ];
  }

  const bookings = await prisma.booking.findMany({
    where: whereClause,

    select: {
      id: true,
      bookingDate: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      user: {
        select: { name: true, email: true },
      },
      service: {
        select: {
          name: true,
          category: { select: { name: true, icon: true } },
        },
      },
      timeSlot: {
        select: { startTime: true, endTime: true },
      },
      payment: {
        select: { status: true, paymentMethod: true },
      },
    },
    skip,
    take: limit,
    orderBy: { createdAt: "asc" },
  });

  const count = await prisma.booking.count({
    where: whereClause,
  });

  return {
    bookings,
    pagination: {
      page,
      limit,
      count,
      totalPage: Math.ceil(count / limit),
    },
  };
};

export const patchBookingStatus = async (
  bookingId: string,
  status: BookingStatus,
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });
};

export const addService = async (serviceData: CreateServiceInput) => {
  const { slots, ...serviceFields } = serviceData;

  return prisma.$transaction(async (tx) => {
    const service = await tx.service.create({ data: serviceFields });

    if (slots && slots.length > 0) {
      await tx.timeSlot.createMany({
        data: slots.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          maxBookings: 10,
          serviceId: service.id,
        })),
      });
    }

    return tx.service.findUnique({
      where: { id: service.id },
      include: { category: true, slots: true },
    });
  });
};

export const editService = async (
  serviceId: string,
  newData: UpdateServiceInput,
  slots?: TimeSlotInput[],
) => {
  return prisma.$transaction(async (tx) => {
    const service = await tx.service.update({
      where: { id: serviceId },
      data: newData,
    });

    if (slots !== undefined) {
      await tx.timeSlot.deleteMany({
        where: { serviceId: service.id },
      });

      if (slots.length > 0) {
        await tx.timeSlot.createMany({
          data: slots.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            serviceId: service.id,
            maxBookings: 10,
          })),
        });
      }
    }

    return tx.service.findUnique({
      where: { id: service.id },
      include: { category: true, slots: true },
    });
  });
};

export const removeService = async (serviceId: string) => {
  const service = await prisma.service.update({
    where: { id: serviceId },
    data: { isActive: false },
  });

  return service;
};

export const getUsers = async ({ limit, page }: QueryParams) => {
  const skip = (page - 1) * limit;

  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      createdAt: true,
      _count: { select: { bookings: true } },
    },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const count = await prisma.user.count({
    where: { role: "USER" },
  });

  return {
    users,
    pagination: {
      page,
      limit,
      count,
      totalPage: Math.ceil(count / limit),
    },
  };
};
