import logger from '#config/logger';
import { db } from '#config/database';
import { users } from '#models/user.model';
import { eq } from 'drizzle-orm';

export const getAllUsers = async () => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);

    return allUsers;
  } catch (e) {
    logger.error('Error fetching users', e);
    throw new Error('Could not fetch users');
  }
};

export const getUserById = async id => {
  try {
    const results = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (results.length === 0) {
      throw new Error('User not found');
    }

    return results[0];
  } catch (e) {
    logger.error('Error fetching user by id', e);
    throw e;
  }
};

export const updateUser = async (id, updates) => {
  try {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new Error('User not found');
    }

    const updatedUsers = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return updatedUsers[0];
  } catch (e) {
    logger.error('Error updating user', e);
    throw e;
  }
};

export const deleteUser = async id => {
  try {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new Error('User not found');
    }

    await db.delete(users).where(eq(users.id, id));
  } catch (e) {
    logger.error('Error deleting user', e);
    throw e;
  }
};
