import bcrypt from "bcryptjs";

export const hashPassword = async (password, rounds = 10) => {
  const hash = await bcrypt.hash(password, rounds);

  return hash;
};
