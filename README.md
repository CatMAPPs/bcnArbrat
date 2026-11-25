# Pol·len BCN

Mapa interactiu de l'arbrat de Barcelona per consultar nivells d'al·lèrgia i floració carrer a carrer segons el mes de l'any.

## Stack

- **SvelteKit** + **Svelte 5** (`$state`, `$derived`, `$effect`) + **TypeScript**
- **Tailwind CSS**
- **mapicgc-gl-js** (ICGC)
- **GeoJSON** generat des d'Open Data BCN

## Posada en marxa

```bash
npm install
npm run dev
```

L'aplicació carrega `static/data/arbrat_bcn.geojson`. El repositori inclou un fitxer de mostra petit per poder arrencar el projecte immediatament.

## Generar el dataset real (Open Data BCN)

1. Executa el comando; descarrega automàticament l'arbrat viari, de zona i de parcs d'Open Data Barcelona:

```bash
npm run prepare:data
```

Les fonts es desen a `data/arbrat_viari.csv`, `data/arbrat_zona.json` i `data/arbrat_parcs.json`. També pots executar l'script Python sense `--fetch` per reutilitzar-les sense tornar-les a descarregar.

L'script filtra les espècies del MVP, normalitza columnes, arrodoneix coordenades a 5 decimals i genera propietats compactes (`sp`, `nc`, `ca`, `ba`). El CSV no s'inclou al repositori perquè és una dada d'entrada descarregable.

## Estructura

```text
pollen-bcn/
├── scripts/
│   └── prepare_data.py
├── static/
│   └── data/
│       └── arbrat_bcn.geojson
└── src/
    ├── lib/
    │   ├── components/      # Mapa, panell, selector, filtre, inspector
    │   ├── data/            # Diccionari d'espècies
    │   ├── map/             # Expressions MapLibre/ICGC
    │   └── state/           # Estat global amb runes Svelte 5
    └── routes/              # Layout i pàgina principal
```

## Notes

- El mapa usa l'estil base `TOPOGRIS` d'ICGC per maximitzar el contrast dels colors semàntics.
- La font GeoJSON està configurada amb `cluster: true` per rendiment amb volums grans.
- El comptatge d'arbres visibles es calcula amb `queryRenderedFeatures` sobre el viewport actual.
