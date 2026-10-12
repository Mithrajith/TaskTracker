/**
 * SEEDER UTILITY
 * 
 * NOTE: This is strictly an optional initial setup script (run via `FORCE_SEED=true npm run seed`).
 * The application runtime does NOT use or import this file.
 * All API routes in the application query live collections directly in MongoDB Atlas.
 */

import User from '../models/User.js';
import { ROLES, ACCOUNT_STATUS } from '../config/constants.js';

export const seedDatabase = async ({ silent = false } = {}) => {
  const log = (...args) => {
    if (!silent) console.log(...args);
  };

  const adminExists = await User.findOne({ role: ROLES.ADMIN });
  if (!adminExists) {
    log('Creating initial Admin account...');
    await User.create({
      name: 'Mentor Alex (Lead AI Instructor)',
      registerNumber: 'ADMIN001',
      githubRepoUrl: 'https://github.com/mentor-ai',
      password: 'AdminPassword123!',
      role: ROLES.ADMIN,
      status: ACCOUNT_STATUS.ACTIVE,
      mustChangePassword: false,
    });
    log('Admin account created: Register No: ADMIN001 | Password: AdminPassword123!');
  } else {
    log('Admin account already exists.');
  }
};
