ALTER TABLE `User`
  ADD COLUMN `friendCode` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `User_friendCode_key` ON `User`(`friendCode`);

CREATE TABLE `Friendship` (
  `id` VARCHAR(191) NOT NULL,
  `userLowId` VARCHAR(191) NOT NULL,
  `userHighId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Friendship_userLowId_userHighId_key`(`userLowId`, `userHighId`),
  INDEX `Friendship_userLowId_idx`(`userLowId`),
  INDEX `Friendship_userHighId_idx`(`userHighId`),
  CONSTRAINT `Friendship_userLowId_fkey` FOREIGN KEY (`userLowId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Friendship_userHighId_fkey` FOREIGN KEY (`userHighId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
