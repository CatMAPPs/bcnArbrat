<script lang="ts">
  import { MONTHS } from '$lib/data/species';
  import { app } from '$lib/state/app.svelte';
</script>

<div class="border border-line">
  <div class="grid grid-cols-12">
    {#each MONTHS as label, i}
      <button
        type="button"
        class="h-9 border-r border-line text-[10px] font-mono tracking-[0.06em] transition-colors last:border-r-0
          {app.month === i ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-[#ECEFF1]'}"
        onclick={() => (app.month = i)}
        aria-pressed={app.month === i}
        aria-label={`Mes ${label}`}
      >
        {label}
      </button>
    {/each}
  </div>
</div>
