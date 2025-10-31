const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.vote.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.election.deleteMany();
  await prisma.party.deleteMany();
  await prisma.user.deleteMany();

  console.log('✨ Cleared existing data');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      fname: 'Admin',
      lname: 'User',
      city: 'Mumbai',
      dob: new Date('1990-01-01'),
      wardNo: 1,
      houseNo: 'A-101',
      email: 'admin@voting.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user');

  // Create test voters
  const voters = await Promise.all([
    prisma.user.create({
      data: {
        fname: 'John',
        lname: 'Doe',
        city: 'Mumbai',
        dob: new Date('1995-05-15'),
        wardNo: 2,
        houseNo: 'B-202',
        email: 'john@test.com',
        password: hashedPassword,
        role: 'VOTER',
      },
    }),
    prisma.user.create({
      data: {
        fname: 'Jane',
        lname: 'Smith',
        city: 'Delhi',
        dob: new Date('1998-08-20'),
        wardNo: 3,
        houseNo: 'C-303',
        email: 'jane@test.com',
        password: hashedPassword,
        role: 'VOTER',
      },
    }),
  ]);

  console.log(`✅ Created ${voters.length} test voters`);

  // Create parties
  const parties = await Promise.all([
    prisma.party.create({
      data: {
        name: 'Progressive Democratic Party',
        shortName: 'PDP',
      },
    }),
    prisma.party.create({
      data: {
        name: 'National Unity Alliance',
        shortName: 'NUA',
      },
    }),
    prisma.party.create({
      data: {
        name: 'Green Future Party',
        shortName: 'GFP',
      },
    }),
    prisma.party.create({
      data: {
        name: 'Independent',
        shortName: 'IND',
      },
    }),
  ]);

  console.log(`✅ Created ${parties.length} parties`);

  // Create election
  const now = new Date();
  const election = await prisma.election.create({
    data: {
      title: 'City Council Election 2025',
      description: 'Annual city council representative election',
      startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Started yesterday
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Ends in 7 days
    },
  });

  console.log('✅ Created election');

  // Create candidates
  const candidates = await Promise.all([
    prisma.candidate.create({
      data: {
        name: 'Rajesh Kumar',
        profession: 'Social Worker',
        education: 'Masters in Public Administration',
        partyId: parties[0].id,
        electionId: election.id,
      },
    }),
    prisma.candidate.create({
      data: {
        name: 'Priya Sharma',
        profession: 'Environmental Activist',
        education: 'PhD in Environmental Science',
        partyId: parties[2].id,
        electionId: election.id,
      },
    }),
    prisma.candidate.create({
      data: {
        name: 'Amit Patel',
        profession: 'Business Owner',
        education: 'MBA',
        partyId: parties[1].id,
        electionId: election.id,
      },
    }),
    prisma.candidate.create({
      data: {
        name: 'Sunita Verma',
        profession: 'Teacher',
        education: 'Masters in Education',
        partyId: parties[3].id,
        electionId: election.id,
      },
    }),
  ]);

  console.log(`✅ Created ${candidates.length} candidates`);

  console.log('\n📧 Test Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:');
  console.log('  Email: admin@voting.com');
  console.log('  Password: admin123');
  console.log('\nVoters:');
  console.log('  Email: john@test.com');
  console.log('  Email: jane@test.com');
  console.log('  Password: admin123 (for all)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });