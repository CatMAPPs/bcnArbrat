<script lang="ts">
  import MapView from '$lib/components/MapView.svelte';
  import ControlPanel from '$lib/components/ControlPanel.svelte';
  import TreeInspector from '$lib/components/TreeInspector.svelte';
</script>

<svelte:head>
  <title>Pol·len BCN — Arbrat, al·lèrgia i floració</title>
  <meta
    name="description"
    content="Mapa interactiu de l'arbrat de Barcelona per consultar nivells d'al·lèrgia i floració carrer a carrer segons el mes."
  />
</svelte:head>

<main class="relative h-[100dvh] w-full overflow-hidden bg-paper text-ink">
  <MapView />
  <ControlPanel />
  <TreeInspector />
</main>
