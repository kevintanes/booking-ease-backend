import type { Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { getExistingBookings } from "./booking.service.js";

interface GetServicesParams {
  search?: string | undefined;
  categoryId?: string | undefined;
  page: number;
  limit: number;
}

export const getServices = async ({
  limit,
  page,
  categoryId,
  search,
}: GetServicesParams) => {
  const skip = (page - 1) * limit;

  const where: Prisma.ServiceWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { location: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  const services = await prisma.service.findMany({
    where,
    include: { category: true },
    skip,
    take: limit,
  });

  const count = await prisma.service.count({ where });

  return {
    services,
    pagination: {
      page,
      limit,
      count,
      totalPage: Math.ceil(count / limit),
    },
  };
};

export const getService = async (id: string) => {
  const service = await prisma.service.findUnique({
    where: { id: id },
    include: { category: true },
  });

  if (!service) {
    throw new AppError("Service not found", 404);
  }

  return service;
};

export const getSlots = async (id: string, date: string, dayOfWeek: number) => {
  const slots = await prisma.timeSlot.findMany({
    where: {
      serviceId: id,
      dayOfWeek: dayOfWeek,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookings = await getExistingBookings(id, startOfDay, endOfDay);

  const bookingMap: Record<string, number> = {};
  bookings.forEach((booking) => {
    bookingMap[booking.timeSlotId] = booking._count.timeSlotId;
  });

  const slotsWithAvailability = slots.map((slot) => ({
    ...slot,
    bookedCount: bookingMap[slot.id] || 0,
    available: (bookingMap[slot.id] || 0) < slot.maxBookings,
  }));

  return slotsWithAvailability;
};
