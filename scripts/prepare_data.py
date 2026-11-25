#!/usr/bin/env python3
"""
Prepara un GeoJSON ultra-lleuger a partir de les dades d'Arbrat d'Open Data BCN
(Arbrat viari, Arbrat de zona i Arbrat de parcs).

Ús:
  python scripts/prepare_data.py \
        --fetch \
        --input data/arbrat_viari.csv data/arbrat_zona.json data/arbrat_parcs.json \
    --output static/data/arbrat_bcn.geojson
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from urllib.request import urlopen
from pathlib import Path

SPECIES_MATCH: dict[str, list[str]] = {
    "platanus": ["platanus"],
    "cupressus": ["cupressus"],
    "pinus": ["pinus pinea", "pinus halepensis", "pinus pinaster", "pinus"],
    "olea": ["olea europaea", "olea"],
    "tipuana": ["tipuana tipu", "tipuana"],
    "jacaranda": ["jacaranda mimosifolia", "jacaranda"],
    "prunus": ["prunus cerasifera", "prunus pissardii", "prunus serrulata", "prunus"],
    "cercis": ["cercis siliquastrum", "cercis"],
    # Recomanat afegir el Lledoner (Celtis australis): és el 2n arbre més comú de BCN!
    "celtis": ["celtis australis", "celtis"],
}

SPECIES_ORDER = [
    "platanus",
    "celtis",
    "cupressus",
    "olea",
    "tipuana",
    "jacaranda",
    "cercis",
    "prunus",
    "pinus",
]

# Evitem "x" i "y" genèrics per no agafar per error x_etrs89 / y_etrs89
COLUMN_ALIASES = {
    "lat": ["latitud", "latitude", "geo_point_2d_lat"],
    "lon": ["longitud", "longitude", "geo_point_2d_lon"],
    "scientific": ["nom_cientific", "nomcientific", "scientific_name", "especie_nom_cientific"],
    "catalan": ["nom_catala", "nom_cat", "nom_catala_especie", "nom_esp"],
    "barri": ["nom_barri", "barri", "nom_districte_barri"],
}

DEFAULT_CATALAN = {
    "platanus": "Plàtan d'ombra",
    "celtis": "Lledoner",
    "cupressus": "Xiprer",
    "pinus": "Pi",
    "olea": "Olivera",
    "tipuana": "Tipuana",
    "jacaranda": "Jacaranda",
    "prunus": "Prunera",
    "cercis": "Arbre de l'amor",
}

DEFAULT_SOURCE_URL = (
    "https://opendata-ajuntament.barcelona.cat/resources/bcn/Arbrat/"
    "OD_Arbrat_Viari_BCN.csv"
)
SOURCE_URLS = {
    "csv": DEFAULT_SOURCE_URL,
    "zona": "https://opendata-ajuntament.barcelona.cat/resources/bcn/Arbrat/OD_Arbrat_Zona_BCN.json",
    "parcs": "https://opendata-ajuntament.barcelona.cat/resources/bcn/Arbrat/OD_Arbrat_Parcs_BCN.json",
}


def normalize(text: str | None) -> str:
    if not text:
        return ""
    return str(text).strip().lower().replace("×", "x").replace("  ", " ")


def find_column(fieldnames: list[str], aliases: list[str]) -> str | None:
    normalized = {normalize(f): f for f in fieldnames}
    # 1. Coincidència exacta primer
    for alias in aliases:
        if alias in normalized:
            return normalized[alias]
    # 2. Coincidència parcial (excloent explícitament etrs89)
    for alias in aliases:
        for norm, original in normalized.items():
            if "etrs89" in norm:
                continue
            if alias in norm:
                return original
    return None


def detect_columns(fieldnames: list[str]) -> dict[str, str]:
    cols: dict[str, str] = {}
    missing: list[str] = []
    for key, aliases in COLUMN_ALIASES.items():
        found = find_column(fieldnames, aliases)
        if found:
            cols[key] = found
        elif key in {"lat", "lon", "scientific"}:
            missing.append(key)
    if missing:
        raise ValueError(
            f"Falten columnes obligatòries: {missing}. Columnes disponibles: {fieldnames}"
        )
    return cols


def match_species(scientific_name: str) -> str | None:
    norm = normalize(scientific_name)
    if not norm or norm in {"sense especificar", "desconegut", "null", "none"}:
        return None
    for sp_id in SPECIES_ORDER:
        for pattern in SPECIES_MATCH[sp_id]:
            if pattern in norm:
                return sp_id
    return None


def parse_coord(raw: str | None) -> float | None:
    if raw is None:
        return None
    text = str(raw).strip().replace(",", ".")
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def round_coord(value: float) -> float:
    return round(value + 1e-12, 5)


def build_feature(
    row: dict[str, str], cols: dict[str, str], sp_id: str, seen_coords: set[tuple[float, float]]
) -> dict | None:
    lat = parse_coord(row.get(cols["lat"]))
    lon = parse_coord(row.get(cols["lon"]))
    if lat is None or lon is None:
        return None
    # Bounding box estricte de Barcelona
    if not (41.30 <= lat <= 41.47 and 2.05 <= lon <= 2.25):
        return None

    rlon = round_coord(lon)
    rlat = round_coord(lat)
    coord_key = (rlon, rlat)
    if coord_key in seen_coords:
        return None
    seen_coords.add(coord_key)

    scientific = str(row.get(cols["scientific"], "")).strip() or sp_id
    catalan = str(row.get(cols["catalan"], "")).strip() if "catalan" in cols else ""
    barri = str(row.get(cols["barri"], "")).strip() if "barri" in cols else ""

    if catalan.lower() in {"sense especificar", "null", "none"}:
        catalan = ""

    return {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [rlon, rlat]},
        "properties": {
            "sp": sp_id,
            "nc": scientific,
            "ca": catalan or DEFAULT_CATALAN.get(sp_id, ""),
            "ba": barri,
        },
    }


def process_rows(
    rows: list[dict[str, str]],
    source_name: str,
    export_all: bool,
    features: list[dict],
    seen_coords: set[tuple[float, float]],
) -> tuple[int, int, int]:
    total_rows = 0
    kept_rows = 0
    unknown_species = 0

    if not rows:
        raise ValueError(f"Fitxer buit: {source_name}")

    cols = detect_columns(list(rows[0].keys()))
    print(f"[info] {source_name} -> Columnes: {cols}")

    for row in rows:
        total_rows += 1
        scientific = row.get(cols["scientific"], "")
        sp_id = match_species(scientific)
        if not sp_id:
            unknown_species += 1
            if not export_all:
                continue
            sp_id = "other"

        feature = build_feature(row, cols, sp_id, seen_coords)
        if not feature:
            continue
        features.append(feature)
        kept_rows += 1

    return total_rows, kept_rows, unknown_species


def process_file(
    input_path: Path,
    encoding: str,
    export_all: bool,
    features: list[dict],
    seen_coords: set[tuple[float, float]],
) -> tuple[int, int, int]:
    if input_path.suffix.lower() == ".json":
        with input_path.open("r", encoding=encoding) as fh:
            payload = json.load(fh)
        if not isinstance(payload, list) or not all(isinstance(item, dict) for item in payload):
            raise ValueError(f"JSON inesperat: s'esperava una llista d'objectes: {input_path}")
        rows = [
            {key: "" if value is None else str(value) for key, value in item.items()}
            for item in payload
        ]
    else:
        with input_path.open("r", encoding=encoding, newline="") as fh:
            sample = fh.read(8192)
            fh.seek(0)
            try:
                dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
            except csv.Error:
                dialect = csv.excel
            reader = csv.DictReader(fh, dialect=dialect)
            if not reader.fieldnames:
                raise ValueError(f"CSV sense capçalera: {input_path}")
            rows = list(reader)

    return process_rows(rows, input_path.name, export_all, features, seen_coords)


def download_source(url: str, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with urlopen(url) as response, output_path.open("wb") as fh:
        while chunk := response.read(1024 * 1024):
            fh.write(chunk)


def main() -> int:
    parser = argparse.ArgumentParser(description="CSV Arbrat BCN -> GeoJSON lleuger")
    parser.add_argument(
        "--input",
        nargs="+",
        required=True,
        help="Ruta a un o més CSV d'Open Data BCN (viari, zona, parcs)",
    )
    parser.add_argument("--output", required=True, help="Ruta de sortida .geojson")
    parser.add_argument("--all", action="store_true", help="Exporta totes les espècies")
    parser.add_argument("--encoding", default="utf-8-sig", help="Codificació del CSV")
    parser.add_argument(
        "--fetch",
        action="store_true",
        help="Descarrega les fonts oficials abans de processar-les",
    )
    parser.add_argument(
        "--source-url",
        default=DEFAULT_SOURCE_URL,
        help="URL personalitzada del CSV viari que es descarrega amb --fetch",
    )
    args = parser.parse_args()

    if args.fetch:
        try:
            for raw_input in args.input:
                input_path = Path(raw_input)
                name = input_path.name.lower()
                if "zona" in name:
                    source_url = SOURCE_URLS["zona"]
                elif "parc" in name:
                    source_url = SOURCE_URLS["parcs"]
                else:
                    source_url = args.source_url
                print(f"[info] Descarregant {input_path.name} des de {source_url}")
                download_source(source_url, input_path)
                print(f"[ok] Font descarregada: {input_path}")
        except OSError as error:
            print(f"[error] No s'han pogut descarregar les dades: {error}", file=sys.stderr)
            return 1

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    features: list[dict] = []
    seen_coords: set[tuple[float, float]] = set()
    grand_total = 0
    grand_kept = 0
    grand_unknown = 0

    for raw_in in args.input:
        input_path = Path(raw_in)
        if not input_path.exists():
            print(
                f"[error] No existeix el fitxer d'entrada: {input_path}\n"
                "        Executa amb --fetch o passa una altra ruta amb --input.",
                file=sys.stderr,
            )
            return 1
        t, k, u = process_file(input_path, args.encoding, args.all, features, seen_coords)
        grand_total += t
        grand_kept += k
        grand_unknown += u

    geojson = {"type": "FeatureCollection", "name": "arbrat_bcn", "features": features}

    with output_path.open("w", encoding="utf-8") as fh:
        json.dump(geojson, fh, ensure_ascii=False, separators=(",", ":"))

    size_mb = output_path.stat().st_size / (1024 * 1024)
    print("-" * 40)
    print(f"[ok] Total files llegides: {grand_total}")
    print(f"[ok] Arbres únics exportats: {grand_kept}")
    print(f"[ok] Espècies fora del filtre: {grand_unknown if not args.all else 0}")
    print(f"[ok] Fitxer generat: {output_path} ({size_mb:.2f} MB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
