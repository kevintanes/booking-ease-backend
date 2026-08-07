import prisma from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

export const getServices = async () => {
  const services = await prisma.service.findMany({
    include: { category: true },
  });

  return services;
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
