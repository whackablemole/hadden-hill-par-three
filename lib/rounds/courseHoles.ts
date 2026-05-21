import { prisma } from "@/lib/db/prisma";

const CANONICAL_HOLES = [
	{ id: 1, lengthYards: 150, strokeIndex: 3, par: 3 },
	{ id: 2, lengthYards: 85, strokeIndex: 5, par: 3 },
	{ id: 3, lengthYards: 140, strokeIndex: 1, par: 3 },
	{ id: 4, lengthYards: 95, strokeIndex: 2, par: 3 },
	{ id: 5, lengthYards: 115, strokeIndex: 4, par: 3 },
	{ id: 6, lengthYards: 105, strokeIndex: 6, par: 3 },
];

export async function ensureCanonicalCourseHoles() {
	await prisma.courseHoleDefinition.createMany( {
		data: CANONICAL_HOLES,
		skipDuplicates: true,
	} );
}
