import logger from '#config/logger';
import bcrypt from 'bcrypt';
import { db } from '#config/database';
import { users } from '#models/user.model';
import { eq } from 'drizzle-orm';

export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error(`Error hashing password: ${error.message}`);
    throw new Error('Error hashing password', { cause: error });
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error(`Error comparing password: ${error.message}`);
    throw new Error('Error comparing password', { cause: error });
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('User already exists');
    }

    const hashedPassword = await hashPassword(password);

    const insertedUsers = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role,
      })
      .returning();

    const newUser = insertedUsers[0];

    logger.info(`User created with email: ${email}`);

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    throw error;
  }
};

export const authenticateUser = async ({ email, password }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      throw new Error('User not found');
    }

    const user = existingUser[0];

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    logger.info(`User authenticated: ${email}`);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    throw error;
  }
};
