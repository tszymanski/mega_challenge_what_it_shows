// The problems inside one big ticket, counted the way the desk counts: by cause (causes.ts), each
// report where it is filed. causes.ts has no cause for a report whose date moved by one day; the
// desk read those (desk-notes.json) and files them under their tenant's cause. They are their own
// problem, so they get their own row too: counted under the cause they're filed in, and again here.
import notes from '#lib/data/desk-notes.json';
import { groupByCause, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day' | 'unplaced';

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  // Reports intake tagged as something other than this problem.
  mistagged: number;
  firstSeen: string;
  lastSeen: string;
  // For one-day: the causes its reports are filed under, with counts.
  filedUnder?: Record<string, number>;
};

function group(problem: Problem, rs: Report[]): ProblemGroup {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
    channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
    mistagged: rs.filter((r) => r.meta.intakeTag !== problem).length,
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

export function splitTicket(all: Report[], ticket: number, tenantOf: (r: Report) => Tenant | undefined): ProblemGroup[] {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const byCause = groupByCause(merged, tenantOf).map((g) => group(g.cause, g.reports));
  const oneDay = merged.filter((r) => notes.oneDayMove.includes(r.id));
  if (!oneDay.length) return byCause;
  const filedUnder = Object.fromEntries(
    byCause.map((g) => [g.problem, g.reports.filter((r) => oneDay.includes(r)).length] as const).filter(([, n]) => n),
  );
  return [...byCause, { ...group('one-day', oneDay), filedUnder }];
}
