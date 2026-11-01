<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { leftAfterUpdate, splitTicket, type Problem } from '#lib/kb/problems';

  // What engineering's update on the ticket leaves open, by problem, from the export and the tenant directory.
  let { ticket, issues = {} }: { ticket: number; issues?: Partial<Record<Problem, string>> } = $props();

  const rows = $derived(leftAfterUpdate(splitTicket(reports as Report[], ticket, tenantOf), tenantOf));
  const open = $derived(rows.filter((r) => r.open.length));
</script>

<p class="sum">
  #{ticket} closed with <strong>{open.length}</strong> of {rows.length} problems still open
</p>

<table>
  <thead>
    <tr><th>problem</th><th>engineering says</th><th>reports still open</th><th>tenants still hit</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each rows as r (r.problem)}
      <tr>
        <td><code>{r.problem}</code></td>
        <td>{r.update}</td>
        <td>{r.open.length}</td>
        <td class="small">{r.tenants.join(' · ') || '—'}</td>
        <td>{#if issues[r.problem]}<a href={issues[r.problem]}>#{issues[r.problem]?.split('/').pop()}</a>{:else}—{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .small { color: var(--muted); font-size: 0.85em; }
</style>
