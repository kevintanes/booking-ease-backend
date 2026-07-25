import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw {
    status: 500,
    message: "JWT_SECRET is not configured!",
  };
}

export const generateToken = (userId: string) => {
  return jwt.sign({ userId: userId }, jwtSecret, {
    expiresIn: "1d",
  });
};
