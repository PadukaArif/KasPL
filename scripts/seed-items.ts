import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

// Manual env parsing for script runner
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach((line) => {
      const parts = line.split('=');
      if (parts.length > 1) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/(^['"]|['"]$)/g, '');
        process.env[key] = value;
      }
    });
  }
} catch {
  console.log('No .env file found or error reading it');
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env');
  process.exit(1);
}

import { Item } from '../src/features/item/models/item.model';

const initialItems = [
  {
    name: 'Nasi Katsu',
    category: 'FOOD' as const,
    costPrice: 10000,
    sellingPrice: 15000,
    recommendedStock: 20,
    displayOrder: 1,
  },
  {
    name: 'Ayam Geprek',
    category: 'FOOD' as const,
    costPrice: 12000,
    sellingPrice: 17000,
    recommendedStock: 25,
    displayOrder: 2,
  },
  {
    name: 'Spaghetti',
    category: 'FOOD' as const,
    costPrice: 15000,
    sellingPrice: 20000,
    recommendedStock: 15,
    displayOrder: 3,
  },
  {
    name: 'Nasi Bakar',
    category: 'FOOD' as const,
    costPrice: 8000,
    sellingPrice: 12000,
    recommendedStock: 30,
    displayOrder: 4,
  },
  {
    name: 'Dimsum',
    category: 'SNACK' as const,
    costPrice: 10000,
    sellingPrice: 15000,
    recommendedStock: 15,
    displayOrder: 5,
  },
  {
    name: 'Rambut Nenek',
    category: 'SNACK' as const,
    costPrice: 5000,
    sellingPrice: 7000,
    recommendedStock: 10,
    displayOrder: 6,
  },
];

async function seed() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected.');

    await Item.deleteMany({ deletedAt: null });

    const count = await Item.countDocuments();
    let currentCount = count;

    for (const itemData of initialItems) {
      currentCount++;
      const publicId = `KSP-ITEM-${String(currentCount).padStart(4, '0')}`;
      
      const item = new Item({
        ...itemData,
        publicId,
        isActive: true,
        deletedAt: null,
      });

      await item.save();
      console.log(`Seeded item: ${item.name} (${publicId})`);
    }

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
