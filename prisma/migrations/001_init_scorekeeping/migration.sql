CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NULL,
  `imageUrl` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `User_email_key`(`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CourseHoleDefinition` (
  `id` INTEGER NOT NULL,
  `lengthYards` INTEGER NOT NULL,
  `strokeIndex` INTEGER NOT NULL,
  `par` INTEGER NOT NULL DEFAULT 3,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `CourseHoleDefinition_strokeIndex_key`(`strokeIndex`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Round` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `playedOn` DATETIME(3) NOT NULL,
  `targetHoleCount` INTEGER NOT NULL,
  `status` ENUM('IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'IN_PROGRESS',
  `completedAt` DATETIME(3) NULL,
  `totalStrokes` INTEGER NOT NULL DEFAULT 0,
  `totalPutts` INTEGER NOT NULL DEFAULT 0,
  `averagePuttsPerHole` DOUBLE NOT NULL DEFAULT 0,
  `totalBirdies` INTEGER NOT NULL DEFAULT 0,
  `totalPars` INTEGER NOT NULL DEFAULT 0,
  `totalBogeys` INTEGER NOT NULL DEFAULT 0,
  `totalDoubleBogeys` INTEGER NOT NULL DEFAULT 0,
  `totalTripleBogeyPlus` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Round_userId_idx`(`userId`),
  CONSTRAINT `Round_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `HoleEntry` (
  `id` VARCHAR(191) NOT NULL,
  `roundId` VARCHAR(191) NOT NULL,
  `holeSequence` INTEGER NOT NULL,
  `baseHoleId` INTEGER NOT NULL,
  `strokes` INTEGER NOT NULL,
  `penalties` INTEGER NOT NULL,
  `bunkers` INTEGER NOT NULL,
  `putts` INTEGER NOT NULL,
  `greenInRegulation` BOOLEAN NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `HoleEntry_roundId_holeSequence_key`(`roundId`, `holeSequence`),
  INDEX `HoleEntry_roundId_idx`(`roundId`),
  CONSTRAINT `HoleEntry_roundId_fkey` FOREIGN KEY (`roundId`) REFERENCES `Round`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `HoleEntry_baseHoleId_fkey` FOREIGN KEY (`baseHoleId`) REFERENCES `CourseHoleDefinition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
