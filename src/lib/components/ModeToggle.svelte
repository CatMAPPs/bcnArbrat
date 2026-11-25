<script lang="ts">
  import { app } from '$lib/state/app.svelte';
</script>

<div class="grid grid-cols-2 border border-line">
  <button
    type="button"
    class="h-10 border-r border-line px-3 text-[11px] font-medium tracking-[0.12em] transition-colors
      {app.mode === 'allergy' ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-[#ECEFF1]'}"
    onclick={() => (app.mode = 'allergy')}
    aria-pressed={app.mode === 'allergy'}
  >
    AL·LÈRGIES
  </button>
  <button
    type="button"
    class="h-10 px-3 text-[11px] font-medium tracking-[0.12em] transition-colors
      {app.mode === 'flowering' ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-[#ECEFF1]'}"
    onclick={() => (app.mode = 'flowering')}
    aria-pressed={app.mode === 'flowering'}
  >
    FLORACIÓ
  </button>
</div>
