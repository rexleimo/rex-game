import type { PerformanceInput, PerformanceResult, TimingJudgment } from './types';

const JUDGMENT_SCORE: Record<TimingJudgment, number> = {
  perfect: 1,
  great: 0.9,
  good: 0.65,
  miss: 0,
};

export function judgeTiming(deltaSeconds: number): TimingJudgment {
  const delta = Math.abs(deltaSeconds);
  if (delta <= 0.045) return 'perfect';
  if (delta <= 0.09) return 'great';
  if (delta <= 0.15) return 'good';
  return 'miss';
}

export function calculatePerformanceResult(input: PerformanceInput): PerformanceResult {
  const total = Math.max(input.judgments.length, 1);
  const weighted = input.judgments.reduce((sum, judgment) => sum + JUDGMENT_SCORE[judgment], 0);
  const accuracy = Math.round((weighted / total) * 100);
  const continuity = Math.round((Math.min(input.maxCombo, total) / total) * 100);
  const formation = input.formationTotal > 0
    ? Math.round((input.formationHits / input.formationTotal) * 100)
    : 100;
  const spirit = Math.round(accuracy * 0.4 + continuity * 0.3 + formation * 0.3);

  const counts: Record<TimingJudgment, number> = { perfect: 0, great: 0, good: 0, miss: 0 };
  for (const judgment of input.judgments) counts[judgment] += 1;

  return {
    accuracy,
    continuity,
    formation,
    spirit,
    maxCombo: input.maxCombo,
    grade: spirit >= 90 ? '甲' : spirit >= 75 ? '乙' : spirit >= 60 ? '丙' : '习',
    judgments: counts,
  };
}
