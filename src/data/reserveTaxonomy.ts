export type ReserveLibraryType = 'general' | 'extra';

export interface ReserveTaxonomyEntry {
  sourceSequence: number;
  libraryType: ReserveLibraryType;
  categoryId: string;
  categoryLabel: string;
  categoryOrder: number;
  itemOrder: number;
  defaultSelected: boolean;
}

export const GENERAL_CATEGORY_MAP: Record<string, { label: string; order: number; count: number }> = {
  all: { label: '全部武将', order: 0, count: 315 },
  std: { label: '标准包', order: 1, count: 25 },
  feng: { label: '风包', order: 2, count: 8 },
  huo: { label: '火包', order: 3, count: 8 },
  lin: { label: '林包', order: 4, count: 8 },
  shan: { label: '山包', order: 5, count: 8 },
  yijiang: { label: '一将成名', order: 6, count: 11 },
  sp: { label: 'SP武将', order: 7, count: 15 },
  other: { label: '其他扩展武将', order: 8, count: 232 },
};

export const EXTRA_CATEGORY_MAP: Record<string, { label: string; order: number; count: number }> = {
  all: { label: '全部附加牌', order: 0, count: 31 },
  equipment: { label: '装备附加牌', order: 1, count: 12 },
  trick: { label: '锦囊附加牌', order: 2, count: 12 },
  special: { label: '特殊模式牌', order: 3, count: 7 },
};

export function getGeneralCategoryId(seq: number): string {
  if (seq >= 1 && seq <= 25) return 'std';
  if (seq >= 26 && seq <= 33) return 'feng';
  if (seq >= 34 && seq <= 41) return 'huo';
  if (seq >= 42 && seq <= 49) return 'lin';
  if (seq >= 50 && seq <= 57) return 'shan';
  if (seq >= 58 && seq <= 68) return 'yijiang';
  if (seq >= 69 && seq <= 83) return 'sp';
  return 'other';
}

export function getExtraCategoryId(seq: number): string {
  if (seq >= 1 && seq <= 12) return 'equipment';
  if (seq >= 13 && seq <= 24) return 'trick';
  return 'special';
}

export function buildGeneralTaxonomy(total = 315): ReserveTaxonomyEntry[] {
  return Array.from({ length: total }, (_, i) => {
    const seq = i + 1;
    const catId = getGeneralCategoryId(seq);
    const catInfo = GENERAL_CATEGORY_MAP[catId];
    return {
      sourceSequence: seq,
      libraryType: 'general',
      categoryId: catId,
      categoryLabel: catInfo.label,
      categoryOrder: catInfo.order,
      itemOrder: seq,
      defaultSelected: true, // Generals allowed by default
    };
  });
}

export function buildExtraTaxonomy(total = 31): ReserveTaxonomyEntry[] {
  return Array.from({ length: total }, (_, i) => {
    const seq = i + 1;
    const catId = getExtraCategoryId(seq);
    const catInfo = EXTRA_CATEGORY_MAP[catId];
    return {
      sourceSequence: seq,
      libraryType: 'extra',
      categoryId: catId,
      categoryLabel: catInfo.label,
      categoryOrder: catInfo.order,
      itemOrder: seq,
      defaultSelected: false, // Extra cards unselected by default
    };
  });
}

export function auditReserveTaxonomy(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const generals = buildGeneralTaxonomy(315);
  const extras = buildExtraTaxonomy(31);

  if (generals.length !== 315) errors.push(`Expected 315 generals, found ${generals.length}`);
  if (extras.length !== 31) errors.push(`Expected 31 extra cards, found ${extras.length}`);

  const genSeqs = new Set(generals.map(g => g.sourceSequence));
  if (genSeqs.size !== 315) errors.push('Duplicate or missing general sequence numbers');

  const extraSeqs = new Set(extras.map(e => e.sourceSequence));
  if (extraSeqs.size !== 31) errors.push('Duplicate or missing extra card sequence numbers');

  return { valid: errors.length === 0, errors };
}
