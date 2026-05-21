export interface HoleStatInput {
  strokes: number;
  putts: number;
}

export interface RoundStats {
  totalStrokes: number;
  totalPutts: number;
  averagePuttsPerHole: number;
  totalBirdies: number;
  totalPars: number;
  totalBogeys: number;
  totalDoubleBogeys: number;
  totalTripleBogeyPlus: number;
}

export function classifyScore(strokes: number, par = 3) {
  const delta = strokes - par;
  if (delta <= -1) return "birdie";
  if (delta === 0) return "par";
  if (delta === 1) return "bogey";
  if (delta === 2) return "double";
  return "triplePlus";
}

export function calculateRoundStats(entries: HoleStatInput[]): RoundStats {
  const holeCount = entries.length;
  const totalStrokes = entries.reduce((sum, e) => sum + e.strokes, 0);
  const totalPutts = entries.reduce((sum, e) => sum + e.putts, 0);

  let totalBirdies = 0;
  let totalPars = 0;
  let totalBogeys = 0;
  let totalDoubleBogeys = 0;
  let totalTripleBogeyPlus = 0;

  for (const entry of entries) {
    const scoreType = classifyScore(entry.strokes, 3);
    if (scoreType === "birdie") totalBirdies += 1;
    if (scoreType === "par") totalPars += 1;
    if (scoreType === "bogey") totalBogeys += 1;
    if (scoreType === "double") totalDoubleBogeys += 1;
    if (scoreType === "triplePlus") totalTripleBogeyPlus += 1;
  }

  return {
    totalStrokes,
    totalPutts,
    averagePuttsPerHole: holeCount === 0 ? 0 : totalPutts / holeCount,
    totalBirdies,
    totalPars,
    totalBogeys,
    totalDoubleBogeys,
    totalTripleBogeyPlus,
  };
}
