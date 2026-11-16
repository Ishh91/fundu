interface IssueInfo {
  warranty?: string | null;
  time?: string | null;
}

const monthsOf = (warranty?: string | null): number | null => {
  const match = /(\d+)\s*months?/i.exec(warranty ?? '');
  return match ? Number(match[1]) : null;
};

const minutesOf = (time?: string | null): number | null => {
  const match = /(\d+)\s*mins?/i.exec(time ?? '');
  return match ? Number(match[1]) : null;
};

const monthsLabel = (months: number): string => `${months} ${months === 1 ? 'Month' : 'Months'}`;

/**
 * One line each for the warranty and the visit time of the chosen repairs.
 * The warranty covers the repairs that have one (a plain inspection has none). The time is the sum of
 * the on-the-spot repairs, and is left out when any of them is a lab repair that takes longer.
 */
export function summarizeIssues(issues: readonly IssueInfo[]): { warranty: string | null; time: string | null } {
  const months = issues.map((issue) => monthsOf(issue.warranty)).filter((m): m is number => m !== null);
  let warranty: string | null = null;
  if (months.length > 0) {
    const shortest = Math.min(...months);
    const longest = Math.max(...months);
    warranty = shortest === longest ? `${monthsLabel(shortest)} Warranty` : `${shortest}-${monthsLabel(longest)} Warranty`;
  }

  const minutes = issues.map((issue) => minutesOf(issue.time));
  const onSpot = issues.length > 0 && minutes.every((m): m is number => m !== null);
  const time = onSpot ? `About ${(minutes as number[]).reduce((sum, m) => sum + m, 0)} Mins On-Spot` : null;

  return { warranty, time };
}
