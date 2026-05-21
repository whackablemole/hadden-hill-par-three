interface RoundSummaryCardProps {
  round: {
    id: string;
    playedOn: string;
    targetHoleCount: number;
    status: string;
    totalStrokes: number;
    totalPutts: number;
    averagePuttsPerHole: number;
    totalBirdies: number;
    totalPars: number;
    totalBogeys: number;
    totalDoubleBogeys: number;
    totalTripleBogeyPlus: number;
  };
}

export function RoundSummaryCard({ round }: RoundSummaryCardProps) {
  return (
    <article className="rounded border border-slate-200 bg-white p-4">
      <h3 className="font-semibold">Round {round.id.slice(0, 8)}</h3>
      <p className="text-sm text-slate-600">
        {new Date(round.playedOn).toLocaleDateString()} - {round.targetHoleCount} holes - {round.status}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div><dt>Strokes</dt><dd className="font-medium">{round.totalStrokes}</dd></div>
        <div><dt>Putts</dt><dd className="font-medium">{round.totalPutts}</dd></div>
        <div><dt>Avg putts/hole</dt><dd className="font-medium">{round.averagePuttsPerHole.toFixed(2)}</dd></div>
        <div><dt>Birdies</dt><dd className="font-medium">{round.totalBirdies}</dd></div>
        <div><dt>Pars</dt><dd className="font-medium">{round.totalPars}</dd></div>
        <div><dt>Bogeys</dt><dd className="font-medium">{round.totalBogeys}</dd></div>
        <div><dt>Double bogeys</dt><dd className="font-medium">{round.totalDoubleBogeys}</dd></div>
        <div><dt>Triple+</dt><dd className="font-medium">{round.totalTripleBogeyPlus}</dd></div>
      </dl>
    </article>
  );
}
