<script lang="ts">
  import { app } from '$lib/state/app.svelte';
  import { MONTHS_LONG } from '$lib/data/species';
  import MonthSelector from './MonthSelector.svelte';
  import ModeToggle from './ModeToggle.svelte';
  import SpeciesFilter from './SpeciesFilter.svelte';

  const monthName = $derived(MONTHS_LONG[app.month]);
</script>

<aside
  class="absolute z-10 border-line bg-paper
    left-0 right-0 bottom-0 border-t md:top-0 md:bottom-0 md:right-auto md:w-[360px] md:border-t-0 md:border-r"
>
  <div class="flex items-center justify-between border-b border-line px-4 py-3 md:px-5 md:py-4">
    <div>
      <p class="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">Cartografia urbana · Barcelona</p>
      <h1 class="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-ink">Pol·len BCN</h1>
    </div>
    <button
      type="button"
      class="border border-line px-2 py-1 font-mono text-[10px] tracking-[0.08em] text-muted md:hidden"
      onclick={() => (app.mobilePanelOpen = !app.mobilePanelOpen)}
      aria-expanded={app.mobilePanelOpen}
      aria-controls="control-panel-body"
    >
      {app.mobilePanelOpen ? 'PLEGAR' : 'OBRIR'}
    </button>
  </div>

  <div
    id="control-panel-body"
    class="{app.mobilePanelOpen ? 'max-h-[56dvh]' : 'max-h-0'} overflow-y-auto transition-[max-height] duration-200 md:max-h-[calc(100dvh-73px)]"
  >
    <div class="space-y-5 px-4 py-4 md:px-5 md:py-5">
      <section>
        <div class="mb-2 flex items-baseline justify-between">
          <p class="text-[10px] font-mono tracking-[0.18em] text-muted uppercase">Mode</p>
          <p class="font-mono text-[10px] text-muted">{monthName}</p>
        </div>
        <ModeToggle />
      </section>

      <section>
        <p class="mb-2 text-[10px] font-mono tracking-[0.18em] text-muted uppercase">Mes</p>
        <MonthSelector />
      </section>

      <section class="border-t border-line pt-5">
        <SpeciesFilter />
      </section>

      <section class="border-t border-line pt-4">
        <p class="text-[10px] font-mono tracking-[0.18em] text-muted uppercase">Arbres al viewport</p>
        <p class="mt-1 font-mono text-[28px] leading-none tracking-[-0.02em] text-ink">
          {app.visibleCount.toLocaleString('ca-ES')}
        </p>
        <p class="mt-2 text-[11px] leading-relaxed text-muted">
          Comptatge en temps real segons zoom, posició, espècies i barri seleccionats.
        </p>
      </section>

      <section class="border-t border-line pt-4 pb-1">
        <div class="grid grid-cols-3 gap-2 text-[10px] font-mono tracking-[0.06em] text-muted uppercase">
          <div class="flex items-center gap-2"><span class="h-2 w-2 bg-risk-low"></span>Baix</div>
          <div class="flex items-center gap-2"><span class="h-2 w-2 bg-risk-mid"></span>Mitjà</div>
          <div class="flex items-center gap-2"><span class="h-2 w-2 bg-risk-high"></span>Alt</div>
        </div>
      </section>

      <section class="border-t border-line pt-4 pb-2">
        <h2 class="text-[10px] font-mono tracking-[0.18em] text-muted uppercase">Informació</h2>
        <p class="mt-2 text-[11px] leading-relaxed text-muted">
          Dades de l'arbrat de Barcelona normalitzades per consultar espècies, barris i activitat estacional.
        </p>
        <ul class="mt-3 space-y-2 text-[11px] leading-tight text-ink">
          <li>
            <a
              href="https://opendata-ajuntament.barcelona.cat/data/ca/dataset/arbrat-viari"
              target="_blank"
              rel="noreferrer"
              class="underline decoration-line underline-offset-2 hover:text-muted"
            >
              Arbrat viari · Open Data BCN
            </a>
          </li>
          <li>
            <a
              href="https://opendata-ajuntament.barcelona.cat/data/ca/dataset/arbrat-zona"
              target="_blank"
              rel="noreferrer"
              class="underline decoration-line underline-offset-2 hover:text-muted"
            >
              Arbrat de zona · Open Data BCN
            </a>
          </li>
          <li>
            <a
              href="https://opendata-ajuntament.barcelona.cat/data/ca/dataset/arbrat-parcs"
              target="_blank"
              rel="noreferrer"
              class="underline decoration-line underline-offset-2 hover:text-muted"
            >
              Arbrat de parcs · Open Data BCN
            </a>
          </li>
          <li>
            <a
              href="https://www.icgc.cat/"
              target="_blank"
              rel="noreferrer"
              class="underline decoration-line underline-offset-2 hover:text-muted"
            >
              Cartografia base · ICGC
            </a>
          </li>
        </ul>
      </section>
    </div>
  </div>
</aside>
