import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { seedDatabase } from '../utils/seeder.js';

dotenv.config();

const run = async () => {
  const force = process.env.FORCE_SEED === 'true' || process.argv.includes('--force');
  if (!force) {
    console.warn(
      '⚠️  SAFETY WARNING: Running this script will wipe existing collections in MongoDB.\n' +
      'The application runs entirely on live database data and does not require seeding.\n' +
      'To force re-seeding with mock data, run:\n' +
      '  FORCE_SEED=true npm run seed\n'
    );
    process.exit(0);
  }

  try {
    await connectDB();
    await seedDatabase({ silent: false });
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

run();


