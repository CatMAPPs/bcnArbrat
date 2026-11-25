<script lang="ts">
  import { SPECIES_BY_ID, getRiskLabel, MONTHS } from '$lib/data/species';
  import { app } from '$lib/state/app.svelte';

  const selected = $derived(app.selectedTree);
  const species = $derived(selected ? SPECIES_BY_ID[selected.sp] : null);
  const monthLevel = $derived.by(() => {
    if (!species) return 0;
    return app.mode === 'allergy' ? species.allergy[app.month] : species.flowering[app.month];
  });
  const monthLabel = $derived(MONTHS[app.month]);

  const levelColor = $derived.by(() => {
    if (!species) return '#C7CDD4';
    if (app.mode === 'flowering') return monthLevel > 0 ? species.floweringColor : '#C7CDD4';
    return ['#C7CDD4', '#4D7C0F', '#D97706', '#B91C1C'][monthLevel];
  });
</script>

{#if selected && species}
  <aside
    class="absolute top-1/2 left-1/2 z-30 w-[min(340px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 border border-line bg-paper shadow-[0_12px_30px_rgba(17,24,39,0.18)]"
    aria-label="Fitxa d'arbre"
  >
    <div class="flex items-start justify-between gap-4 border-b border-line px-4 py-3">
      <div class="min-w-0">
        <p class="text-[10px] font-mono tracking-[0.18em] text-muted uppercase">Inspector</p>
        <h2 class="mt-1 text-[15px] font-medium leading-tight text-ink">{selected.ca || species.commonName}</h2>
        <p class="mt-0.5 text-[12px] italic leading-tight text-muted">{selected.nc || species.scientificName}</p>
      </div>
      <button
        type="button"
        class="shrink-0 border border-line px-2 py-1 font-mono text-[10px] tracking-[0.08em] text-muted hover:text-ink"
        onclick={() => app.clearSelection()}
        aria-label="Tancar fitxa"
      >
        TANCAR
      </button>
    </div>

    <div class="grid grid-cols-2 border-b border-line">
      <div class="border-r border-line px-4 py-3">
        <p class="text-[10px] font-mono tracking-[0.14em] text-muted uppercase">
          Nivell {app.mode === 'allergy' ? 'al·lèrgia' : 'floració'}
        </p>
        <div class="mt-1 flex items-center gap-2">
          <span class="h-2.5 w-2.5 border border-[#111827]/15" style="background:{levelColor}"></span>
          <span class="font-mono text-[13px] text-ink">{getRiskLabel(monthLevel as 0 | 1 | 2 | 3)}</span>
          <span class="font-mono text-[10px] text-muted">{monthLabel}</span>
        </div>
      </div>
      <div class="px-4 py-3">
        <p class="text-[10px] font-mono tracking-[0.14em] text-muted uppercase">Al·lergenicitat</p>
        <p class="mt-1 font-mono text-[13px] text-ink">{species.allergenicityLabel}</p>
      </div>
    </div>

    <dl class="space-y-0">
      <div class="grid grid-cols-[120px_1fr] gap-3 border-b border-line px-4 py-3">
        <dt class="text-[10px] font-mono tracking-[0.14em] text-muted uppercase">Mesos crítics</dt>
        <dd class="text-[13px] text-ink">{species.criticalMonths}</dd>
      </div>
      <div class="grid grid-cols-[120px_1fr] gap-3 border-b border-line px-4 py-3">
        <dt class="text-[10px] font-mono tracking-[0.14em] text-muted uppercase">Barri</dt>
        <dd class="text-[13px] text-ink">{selected.ba || '—'}</dd>
      </div>
      <div class="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
        <dt class="text-[10px] font-mono tracking-[0.14em] text-muted uppercase">Consell</dt>
        <dd class="text-[13px] leading-relaxed text-ink">{species.advice}</dd>
      </div>
    </dl>
  </aside>
{/if}
