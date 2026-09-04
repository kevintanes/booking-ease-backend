import { BookingStatus, type Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

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
      totalRevenue: totalRevenue._sum.amount ?? 0,
      totalUsers,
    },
    recentBookings,
  };
};
