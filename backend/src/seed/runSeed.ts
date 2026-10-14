import { seedDatabase } from './seedData';

seedDatabase()
  .then(() => {
    console.log('Database seeding finished successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  });
