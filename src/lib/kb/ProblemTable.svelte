<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { splitTicket, type Problem } from '#lib/kb/problems';

  // issues: problem → link to the ticket filed for it.
  let { ticket, issues = {} }: { ticket: number; issues?: Partial<Record<Problem, string>> } = $props();

  const groups = $derived(splitTicket(reports as Report[], ticket, tenantOf));
  const total = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket).length);
  const channels = (c: Record<string, number>) =>
    Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .map(([ch, n]) => `${ch} ×${n}`)
      .join(' · ');
  const filed = (f: Record<string, number>) =>
    Object.entries(f)
      .map(([cause, n]) => `${n} under ${cause}`)
      .join(', ');
</script>

<p class="sum">
  <strong>{total}</strong> reports merged into #{ticket} · <strong>{groups.length}</strong> problems
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>channels</th><th>mistagged</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants.length}</td>
        <td class="small">{channels(g.channels)}</td>
        <td>{g.mistagged}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if issues[g.problem]}<a href={issues[g.problem]}>#{issues[g.problem]?.split('/').pop()}</a>{:else}—{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each groups as g (g.problem)}
  {#if g.filedUnder}
    <p class="small">The {g.reports.length} <code>{g.problem}</code> reports are also counted where the desk files them: {filed(g.filedUnder)}.</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .small { color: var(--muted); font-size: 0.85em; }
</style>
