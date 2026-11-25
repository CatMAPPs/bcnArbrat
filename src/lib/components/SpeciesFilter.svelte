<script lang="ts">
  import { SPECIES, getActivity, getRiskLabel } from '$lib/data/species';
  import { app } from '$lib/state/app.svelte';

  const activeColor = (spId: string) => {
    const sp = SPECIES.find((s) => s.id === spId);
    if (!sp) return '#C7CDD4';
    const level = getActivity(sp, app.month, app.mode);
    if (app.mode === 'flowering') return level > 0 ? sp.floweringColor : '#C7CDD4';
    return ['#C7CDD4', '#4D7C0F', '#D97706', '#B91C1C'][level];
  };
</script>

<div class="space-y-4">
  <div>
    <div class="mb-2 flex items-center justify-between">
      <p class="text-[10px] font-mono tracking-[0.18em] text-muted uppercase">Espècies</p>
      <button
        type="button"
        class="text-[10px] font-mono tracking-[0.08em] text-muted underline decoration-line underline-offset-2 hover:text-ink"
        onclick={() => app.setAllSpecies()}
      >
        TOTES
      </button>
    </div>

    <div class="border border-line">
      {#each SPECIES as sp}
        {@const active = app.selectedSpecies.includes(sp.id)}
        {@const level = getActivity(sp, app.month, app.mode)}
        <button
          type="button"
          class="flex w-full items-center gap-3 border-b border-line px-3 py-2.5 text-left last:border-b-0 hover:bg-[#ECEFF1]/50"
          onclick={() => app.toggleSpecies(sp.id)}
          aria-pressed={active}
        >
          <span
            class="mt-0.5 h-2.5 w-2.5 shrink-0 border border-[#111827]/15"
            style="background:{active ? activeColor(sp.id) : '#F8F9FA'}"
          ></span>
          <span class="min-w-0 flex-1">
            <span class="block text-[13px] leading-tight text-ink">{sp.commonName}</span>
            <span class="block truncate text-[11px] italic leading-tight text-muted">{sp.scientificName}</span>
          </span>
          <span class="font-mono text-[10px] tracking-[0.06em] text-muted">
            {active ? getRiskLabel(level) : 'OFF'}
          </span>
        </button>
      {/each}
    </div>
  </div>

  <div>
    <label for="barri" class="mb-2 block text-[10px] font-mono tracking-[0.18em] text-muted uppercase">
      Barri
    </label>
    <select
      id="barri"
      bind:value={app.selectedBarri}
      class="h-10 w-full border border-line bg-paper px-3 text-[12px] text-ink outline-none focus:border-ink"
    >
      <option value="all">Tots els barris</option>
      {#each app.barris as barri}
        <option value={barri}>{barri}</option>
      {/each}
    </select>
  </div>
</div>
