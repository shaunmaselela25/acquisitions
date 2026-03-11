import logger from '#config/logger';
import { cookies } from '#utils/cookies';
import { jwttoken } from '#utils/jwt';
import { formatValidationErrors } from '#utils/format';
import { userIdSchema, updateUserSchema } from '#validations/users.validations';
import {
  getAllUsers as fetchAllUsers,
  getUserById as fetchUserById,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '#services/users.services';

const getAuthenticatedUser = (req) => {
  if (req.user) return req.user;
  const token = cookies.get(req, 'token');
  if (!token) return null;
  try {
    return jwttoken.verify(token);
  } catch {
    return null;
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    logger.info('Fetching all users from database');

    const allUsers = await fetchAllUsers();

    return res.status(200).json({
      message: 'Successfully fetched all users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error('Error fetching users', e);
    return next(e);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const parsedParams = userIdSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(parsedParams.error),
      });
    }

    const { id } = parsedParams.data;

    logger.info(`Fetching user by id: ${id}`);
    const user = await fetchUserById(id);

    return res.status(200).json({
      message: 'Successfully fetched user',
      user,
    });
  } catch (e) {
    logger.error('Error fetching user by id', e);
    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    return next(e);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const parsedParams = userIdSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(parsedParams.error),
      });
    }

    const parsedBody = updateUserSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(parsedBody.error),
      });
    }

    const currentUser = getAuthenticatedUser(req);
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = parsedParams.data;
    const updates = parsedBody.data;

    if (updates.role && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can change roles' });
    }

    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    logger.info(`Updating user: ${id}`);
    const user = await updateUserService(id, updates);

    return res.status(200).json({
      message: 'User updated successfully',
      user,
    });
  } catch (e) {
    logger.error('Error updating user', e);
    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    return next(e);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const parsedParams = userIdSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(parsedParams.error),
      });
    }

    const currentUser = getAuthenticatedUser(req);
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = parsedParams.data;

    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    logger.info(`Deleting user: ${id}`);
    await deleteUserService(id);

    return res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (e) {
    logger.error('Error deleting user', e);
    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    return next(e);
  }
};
