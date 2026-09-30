export const MIN_GOAL = 30;
export const MAX_GOAL = 165;

const VERDICTS = {
  poor: ['Way out.', 'Read the scale again.', 'Not this time.'],
  fair: ['Close.', 'Nearly on the mark.', 'Getting sharper.'],
  great: ['On the mark.', 'Dead on.', 'Machined.'],
};

export interface Result {
  readonly goal: number;
  readonly actual: number;
  readonly error: number;
  readonly accuracy: number;
  readonly quote: string;
}

const pick = (list: readonly string[], random: () => number): string =>
  list[Math.floor(random() * list.length)]!;

export function randomGoal(random: () => number = Math.random): number {
  return Math.round(MIN_GOAL + random() * (MAX_GOAL - MIN_GOAL));
}

export function score(goal: number, angle: number, random: () => number = Math.random): Result {
  const actual = Math.round(angle);
  const error = Math.abs(goal - actual);
  const accuracy = Math.max(0, Math.round(100 - (error / 90) * 100));
  const verdicts = accuracy < 50 ? VERDICTS.poor : accuracy < 85 ? VERDICTS.fair : VERDICTS.great;
  return { goal, actual, error, accuracy, quote: pick(verdicts, random) };
}
