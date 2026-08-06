import prisma from "../config/prisma.js";

export const getServices = async () => {
  const services = await prisma.service.findMany({
    include: {
      category: true,
    },
  });

  return services;
};
