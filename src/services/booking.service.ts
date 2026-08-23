import prisma from "../config/prisma.js";

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
