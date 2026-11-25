export const MONTHS = [
  'GEN', 'FEB', 'MAR', 'ABR', 'MAI', 'JUN',
  'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DES'
] as const;

export const MONTHS_LONG = [
  'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
  'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'
] as const;

export type MonthIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type Mode = 'allergy' | 'flowering';
export type RiskLevel = 0 | 1 | 2 | 3; // 0 cap, 1 baix, 2 mitjà, 3 alt

export interface Species {
  id: string;
  scientificName: string;
  commonName: string;
  allergenicityLabel: 'Nul·la' | 'Baixa' | 'Mitjana' | 'Alta';
  /** Nivell d'al·lèrgia per mes, índex 0 = GEN */
  allergy: readonly RiskLevel[];
  /** Intensitat de floració per mes, índex 0 = GEN */
  flowering: readonly RiskLevel[];
  /** Color de floració (mode floració) */
  floweringColor: string;
  criticalMonths: string;
  advice: string;
}

export const ALLERGY_COLORS: Record<RiskLevel, string> = {
  0: '#C7CDD4',
  1: '#4D7C0F',
  2: '#D97706',
  3: '#B91C1C'
};

export const ALLERGY_OPACITY: Record<RiskLevel, number> = {
  0: 0.08,
  1: 0.45,
  2: 0.72,
  3: 0.95
};

export const ALLERGY_RADIUS: Record<RiskLevel, number> = {
  0: 2.2,
  1: 3.4,
  2: 4.3,
  3: 5.4
};

export const FLOWERING_OPACITY: Record<RiskLevel, number> = {
  0: 0.06,
  1: 0.45,
  2: 0.72,
  3: 0.95
};

export const FLOWERING_RADIUS: Record<RiskLevel, number> = {
  0: 2.2,
  1: 3.4,
  2: 4.4,
  3: 5.6
};

export const SPECIES: readonly Species[] = [
  {
    id: 'platanus',
    scientificName: 'Platanus × acerifolia',
    commonName: "Plàtan d'ombra",
    allergenicityLabel: 'Alta',
    allergy:    [0, 0, 2, 3, 3, 1, 0, 0, 0, 0, 0, 0],
    flowering:  [0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0],
    floweringColor: '#7A9E7E',
    criticalMonths: 'Març – Maig',
    advice: "Evita l'activitat intensa sota plataners en floració i en dies de vent. La poda i els tricomes poden irritar vies respiratòries."
  },
  {
    id: 'cupressus',
    scientificName: 'Cupressus sempervirens',
    commonName: 'Xiprer',
    allergenicityLabel: 'Alta',
    allergy:    [3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2],
    flowering:  [1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    floweringColor: '#8B9A6B',
    criticalMonths: 'Gener – Març',
    advice: "Espècie molt al·lergògena a l'hivern. En pics de pol·len, mantén finestres tancades i consulta la previsió diària."
  },
  {
    id: 'pinus',
    scientificName: 'Pinus pinea',
    commonName: 'Pi pinyer',
    allergenicityLabel: 'Mitjana',
    allergy:    [0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0],
    flowering:  [0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0],
    floweringColor: '#A3B18A',
    criticalMonths: 'Abril – Maig',
    advice: "El pol·len és abundant però menys agressiu que el de plàtan o xiprer. Precaució en persones sensibilitzades."
  },
  {
    id: 'olea',
    scientificName: 'Olea europaea',
    commonName: 'Olivera',
    allergenicityLabel: 'Alta',
    allergy:    [0, 0, 0, 1, 3, 2, 0, 0, 0, 0, 0, 0],
    flowering:  [0, 0, 0, 1, 3, 2, 0, 0, 0, 0, 0, 0],
    floweringColor: '#B7C59B',
    criticalMonths: 'Maig – Juny',
    advice: "Pot provocar símptomes intensos en persones al·lèrgiques. Redueix l'exposició exterior durant el pic de floració."
  },
  {
    id: 'tipuana',
    scientificName: 'Tipuana tipu',
    commonName: 'Tipuana',
    allergenicityLabel: 'Baixa',
    allergy:    [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    flowering:  [0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 0],
    floweringColor: '#D4A017',
    criticalMonths: 'Juny – Juliol',
    advice: "Floració ornamental groga molt visible a l'estiu. Al·lèrgia generalment baixa; atenció a la caiguda de flors a la vorera."
  },
  {
    id: 'jacaranda',
    scientificName: 'Jacaranda mimosifolia',
    commonName: 'Jacaranda',
    allergenicityLabel: 'Baixa',
    allergy:    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    flowering:  [0, 0, 0, 0, 3, 3, 1, 0, 0, 0, 0, 0],
    floweringColor: '#7B6AA6',
    criticalMonths: 'Maig – Juny',
    advice: "Espècie ornamental de floració lila. Impacte al·lergènic baix; valor paisatgístic alt durant la floració."
  },
  {
    id: 'prunus',
    scientificName: 'Prunus cerasifera',
    commonName: 'Prunera vermella',
    allergenicityLabel: 'Baixa',
    allergy:    [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    flowering:  [0, 2, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    floweringColor: '#C96B8A',
    criticalMonths: 'Febrer – Març',
    advice: "Floració rosa primerenca. Pot generar molèsties lleus en persones molt sensibles als prunus ornamentals."
  },
  {
    id: 'cercis',
    scientificName: 'Cercis siliquastrum',
    commonName: "Arbre de l'amor",
    allergenicityLabel: 'Nul·la',
    allergy:    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    flowering:  [0, 0, 1, 3, 2, 0, 0, 0, 0, 0, 0, 0],
    floweringColor: '#B04A7A',
    criticalMonths: 'Abril – Maig',
    advice: "Floració magenta sobre branca. Sense rellevància al·lergògena significativa; espècie segura per a itineraris sensibles."
  }
] as const;

export const SPECIES_BY_ID = Object.fromEntries(
  SPECIES.map((s) => [s.id, s])
) as Record<string, Species>;

export const SPECIES_IDS = SPECIES.map((s) => s.id);

export function getRiskLabel(level: RiskLevel): string {
  return ['Nul', 'Baix', 'Mitjà', 'Alt'][level];
}

export function getActivity(species: Species, month: number, mode: Mode): RiskLevel {
  const arr = mode === 'allergy' ? species.allergy : species.flowering;
  return (arr[month] ?? 0) as RiskLevel;
}
