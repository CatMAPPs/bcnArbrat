<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';
  import { Map, Config } from 'mapicgc-gl-js';
  import '../../../node_modules/mapicgc-gl-js/dist/mapicgc-gl.css';
  import { app } from '$lib/state/app.svelte';
  import { buildColorExpression } from '$lib/map/expressions';

  type AnyMap = any;
  type FeatureCollection = {
    type: 'FeatureCollection';
    features: any[];
    name?: string;
  };

  let mapContainer = $state<HTMLDivElement>();
  let map: AnyMap;
  let ready = $state(false);
  let initialized = false;
  let allData: FeatureCollection | null = null;

  const SOURCE_ID = 'trees';
  const CLUSTER_LAYER = 'trees-clusters';
  const CLUSTER_COUNT_LAYER = 'trees-cluster-count';
  const POINT_LAYER = 'trees-points';
  const SELECTED_SOURCE_ID = 'selected-tree';

  function filteredData(): FeatureCollection {
    if (!allData) return { type: 'FeatureCollection', features: [] };
    const selected = new Set(app.selectedSpecies);
    const barri = app.selectedBarri;
    return {
      type: 'FeatureCollection',
      features: allData.features.filter((f) => {
        const p = f.properties ?? {};
        if (!selected.has(p.sp)) return false;
        if (barri !== 'all' && p.ba !== barri) return false;
        return true;
      })
    };
  }

  function updateVisibleCount() {
    if (!map || !ready) return;
    const features: any[] = map.queryRenderedFeatures({
      layers: [POINT_LAYER, CLUSTER_LAYER]
    });

    const seen = new Set<string>();
    let total = 0;
    for (const f of features) {
      const key = f.properties?.cluster_id
        ? `c:${f.properties.cluster_id}`
        : `p:${f.id ?? `${f.properties?.sp}-${f.geometry?.coordinates?.join(',')}`}`;
      if (seen.has(key)) continue;
      seen.add(key);
      total += f.properties?.point_count ? Number(f.properties.point_count) : 1;
    }
    app.visibleCount = total;
  }

  function applyPaint() {
    if (!map || !ready) return;
    map.setPaintProperty(POINT_LAYER, 'circle-color', buildColorExpression(app.month, app.mode));
  }

  function applyFilterData() {
    if (!map || !ready) return;
    const source = map.getSource(SOURCE_ID);
    if (!source) return;
    source.setData(filteredData());
    map.once('idle', updateVisibleCount);
  }

  function addLayers(initialData: FeatureCollection) {
    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: initialData,
      cluster: true,
      clusterRadius: 48,
      clusterMaxZoom: 16,
      generateId: true
    });

    map.addLayer({
      id: CLUSTER_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#E8EBEE',
          50, '#DDE2E7',
          200, '#CDD5DC',
          800, '#B8C3CD'
        ],
        'circle-stroke-color': '#111827',
        'circle-stroke-width': 0.8,
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          14,
          50, 18,
          200, 24,
          800, 32
        ]
      }
    });

    map.addLayer({
      id: CLUSTER_COUNT_LAYER,
      type: 'symbol',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-size': 11,
        'text-font': ['Open Sans Regular']
      },
      paint: {
        'text-color': '#111827'
      }
    });

    map.addLayer({
      id: POINT_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': buildColorExpression(app.month, app.mode),
        'circle-opacity': 1,
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, 4,
          13, 6,
          16, 9,
          18, 12
        ],
        'circle-stroke-width': 0
      }
    });

    map.addSource(SELECTED_SOURCE_ID, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });

    map.addLayer({
      id: 'selected-tree-halo',
      type: 'circle',
      source: SELECTED_SOURCE_ID,
      paint: {
        'circle-color': '#FFFFFF',
        'circle-radius': 13,
        'circle-opacity': 0.95,
        'circle-stroke-color': '#B91C1C',
        'circle-stroke-width': 2
      }
    });

    map.addLayer({
      id: 'selected-tree-pin',
      type: 'circle',
      source: SELECTED_SOURCE_ID,
      paint: {
        'circle-color': '#B91C1C',
        'circle-radius': 7,
        'circle-stroke-color': '#FFFFFF',
        'circle-stroke-width': 2
      }
    });
  }

  function bindEvents() {
    map.on('click', (e: any) => {
      const hits = map.queryRenderedFeatures(e.point, {
        layers: [POINT_LAYER, CLUSTER_LAYER]
      });
      const hit = hits[0];
      if (!hit) {
        app.clearSelection();
        return;
      }

      if (hit.layer?.id === CLUSTER_LAYER) {
        app.clearSelection();
        const source = map.getSource(SOURCE_ID);
        const clusterId = hit.properties?.cluster_id;
        if (!source || clusterId == null) return;
        source.getClusterExpansionZoom(clusterId).then((zoom: number) => {
          map.easeTo({
            center: hit.geometry.coordinates,
            zoom: Math.min(zoom, 18),
            duration: 450
          });
        });
        return;
      }

      const p = hit.properties ?? {};
      app.selectedTree = { sp: p.sp, nc: p.nc, ca: p.ca, ba: p.ba };
      app.selectedTreeCoordinates = hit.geometry.coordinates as [number, number];
    });

    map.on('movestart', () => app.clearSelection());
    map.on('moveend', updateVisibleCount);
    map.on('resize', updateVisibleCount);
  }

  onMount(async () => {
    const data = await Config.getConfigICGC();

    map = new Map({
      container: mapContainer,
      style: data.Styles.ORTO,
      center: [2.1734, 41.3851],
      zoom: 13,
      pitch: 0,
      hash: false,
      attributionControl: true
    });

    map.on('load', async () => {
      const res = await fetch(`${base}/data/arbrat_bcn.geojson`);
      allData = (await res.json()) as FeatureCollection;

      const barris = Array.from(
        new Set(
          allData.features
            .map((f) => f.properties?.ba)
            .filter((b): b is string => typeof b === 'string' && b.length > 0)
        )
      ).sort((a, b) => a.localeCompare(b, 'ca'));
      app.barris = barris;

      addLayers(filteredData());
      bindEvents();

      ready = true;
      initialized = true;
      updateVisibleCount();
      map.once('idle', updateVisibleCount);
    });
  });

  onDestroy(() => {
    if (map) map.remove();
  });

  $effect(() => {
    const coordinates = app.selectedTreeCoordinates;
    if (!map || !ready) return;
    const source = map.getSource('selected-tree');
    source?.setData({
      type: 'FeatureCollection',
      features: coordinates
        ? [{ type: 'Feature', geometry: { type: 'Point', coordinates }, properties: {} }]
        : []
    });
  });

  $effect(() => {
    app.month;
    app.mode;
    if (!initialized) return;
    applyPaint();
  });

  $effect(() => {
    app.selectedSpecies;
    app.selectedBarri;
    if (!initialized) return;
    applyFilterData();
  });
</script>

<div class="map" bind:this={mapContainer}></div>

<style>
  .map {
    position: absolute;
    inset: 0;
  }
</style>
