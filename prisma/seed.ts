import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const holeDefinitions = [
  { id: 1, lengthYards: 150, strokeIndex: 3, par: 3 },
  { id: 2, lengthYards: 85, strokeIndex: 5, par: 3 },
  { id: 3, lengthYards: 140, strokeIndex: 1, par: 3 },
  { id: 4, lengthYards: 95, strokeIndex: 2, par: 3 },
  { id: 5, lengthYards: 115, strokeIndex: 4, par: 3 },
  { id: 6, lengthYards: 105, strokeIndex: 6, par: 3 },
];

async function main() {
  for (const hole of holeDefinitions) {
    await prisma.courseHoleDefinition.upsert({
      where: { id: hole.id },
      update: hole,
      create: hole,
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
