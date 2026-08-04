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

import { ClassMember } from '../src/features/member/models/member.model';

const studentNames = [
  "Adhelia Khairunissa Tofari",
  "Adilah Hammam Akram",
  "Adinda Afifah Putri",
  "Adzan Ahlil Fiqri",
  "Aira Saskia Sahwa",
  "Almira Rakhadhiya Aryacitadi",
  "Annisa Maharani",
  "Annisah Agustin",
  "Arif Raffy Fadlurahman",
  "Aryo Aji Sadewo",
  "Cahaya",
  "Callyla Sakhi Faiha",
  "Dedy Anang Setiawan",
  "Deje Enne Dani Rosaline",
  "Dewa Nyoman Zed Zamuel Zouse",
  "Fersya Wulanda",
  "Ihsan Hafidz Assidiq",
  "Intan Nurhikmah",
  "K'satria Ali",
  "Marcellino",
  "Muhammad Fauzan Kamal Putra",
  "Muhammad Rafa Fadilah",
  "Najwa Fajrina Ayatul Husna",
  "Nauval Arief Hibatulloh",
  "Naysheilla Bilqis Heryanto",
  "Nazmu Toriq",
  "Qisya Awfiyah Ramadhani",
  "Rambuana Ahmad Adnan",
  "Rayhan Saputra",
  "Rayvan Irfansyah",
  "Rivael Lionel Messi Boryan",
  "Saddam Qadafi Nurama",
  "Safa Oktafianti",
  "Salsa Nabila",
  "Siti Syeera Azzahrah",
  "Syadira Putri Aulia"
];

async function seed() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected.');

    await ClassMember.deleteMany({});

    for (let i = 0; i < studentNames.length; i++) {
      const name = studentNames[i];
      const attendanceNumber = i + 1;
      const publicId = `KSP-MEM-${String(attendanceNumber).padStart(4, '0')}`;
      
      const member = new ClassMember({
        name,
        attendanceNumber,
        publicId,
        isActive: true,
      });

      await member.save();
      console.log(`Seeded member: ${member.name} (${publicId})`);
    }

    console.log('Seeding completed successfully. Seeded 36 members.');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
