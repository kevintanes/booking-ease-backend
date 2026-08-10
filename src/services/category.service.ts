import prisma from "../config/prisma.js";

export const getCategories = async () => {
  const categories = await prisma.category.findMany();

  return categories;
};
