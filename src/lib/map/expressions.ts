import {
  ALLERGY_COLORS,
  ALLERGY_OPACITY,
  ALLERGY_RADIUS,
  FLOWERING_OPACITY,
  FLOWERING_RADIUS,
  SPECIES,
  type Mode,
  type RiskLevel
} from '$lib/data/species';

type Expression = unknown[];

function riskAt(month: number, mode: Mode, speciesId: string): RiskLevel {
  const sp = SPECIES.find((s) => s.id === speciesId);
  if (!sp) return 0;
  const values = mode === 'allergy' ? sp.allergy : sp.flowering;
  return (values[month] ?? 0) as RiskLevel;
}

export function buildColorExpression(month: number, mode: Mode): Expression {
  const expr: unknown[] = ['match', ['get', 'sp']];
  for (const sp of SPECIES) {
    const level = riskAt(month, mode, sp.id);
    if (mode === 'allergy') {
      expr.push(sp.id, ALLERGY_COLORS[level]);
    } else {
      expr.push(sp.id, level > 0 ? sp.floweringColor : '#C7CDD4');
    }
  }
  expr.push('#9CA3AF');
  return expr;
}

export function buildOpacityExpression(month: number, mode: Mode): Expression {
  const expr: unknown[] = ['match', ['get', 'sp']];
  for (const sp of SPECIES) {
    const level = riskAt(month, mode, sp.id);
    const value = mode === 'allergy' ? ALLERGY_OPACITY[level] : FLOWERING_OPACITY[level];
    expr.push(sp.id, value);
  }
  expr.push(0.08);
  return expr;
}

export function buildRadiusExpression(month: number, mode: Mode): Expression {
  const speciesRadius: unknown[] = ['match', ['get', 'sp']];
  for (const sp of SPECIES) {
    const level = riskAt(month, mode, sp.id);
    const base = mode === 'allergy' ? ALLERGY_RADIUS[level] : FLOWERING_RADIUS[level];
    speciesRadius.push(sp.id, base);
  }
  speciesRadius.push(2.8);

  return [
    '*',
    ['interpolate', ['linear'], ['zoom'], 10, 0.8, 13, 1, 16, 1.45, 18, 1.9],
    speciesRadius
  ];
}
