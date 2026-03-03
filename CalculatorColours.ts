// Core base number names
export const yorubaNumbers: Record<number, string> = {
  0: 'Ódo', 1: 'Ení', 2: 'Éjì', 3: 'Ẹ́ta', 4: 'Ẹ́rin', 5: 'Árǔn',
  6: 'Ẹ́fà', 7: 'Éje', 8: 'Ẹ́jọ', 9: 'Ẹ́sǎn', 10: 'Ẹ́wǎ',
  20: 'Ogún', 30: 'Ọgbọ̀n', 40: 'Ogójì', 50: 'Àádọ́ta',
  60: 'Ọgọ́ta', 70: 'Àádọ́rin', 80: 'Ọgọ́rin', 90: 'Àádọ́rǔn',
  100: 'Ọgọ́rǔn', 1000: 'Ẹgbẹ̀rǔn',
};

// Base "l" multiplier suffixes for round numbers (2–900)
export const multipliers: Record<number, string> = {
  2: 'léjì', 3: 'lẹ́ta', 4: 'lẹ́rin', 5: 'lárǔn', 6: 'lẹ́fà', 7: 'léje', 8: 'lẹ́jọ', 9: 'lẹ́sǎn',
  10: 'lẹ́wǎ', 20: 'logún', 30: 'lọgbọ̀n', 40: 'logójì',
  50: 'làádọ́ta', 60: 'lọgọ́ta', 70: 'làádọ́rin', 80: 'lọgọ́rin', 90: 'làádọ́rǔn',
  100: 'lọgọ́rǔn',
};

// The "l" multiplier form of 1000 — the engine of the system
const L_EGBERUN = 'lẹ́gbẹ̀rǔn';

/**
 * Decomposes n into "simple" additive components for use as Ẹgbẹ̀rǔn multipliers.
 * Each component is expressible as a single unambiguous "l"-multiplier.
 * e.g.  1152 → [1000, 100, 52]
 *         52 → [52]
 *       1000 → [1000]
 *    1000000 → [1000000]
 *    1152000 → [1000000, 100000, 52000]
 *
 * This prevents multiplicative-chain ambiguity: instead of one Ẹgbẹ̀rǔn term
 * with multiplier lẹ́gbẹ̀rǔn+lọgọ́rǔn+làádọ́taéjì (read as ×1000×100×52),
 * we emit three separate Ẹgbẹ̀rǔn terms that are read additively.
 */
function getSimpleComponents(n: bigint): bigint[] {
  if (n <= 0n) return [];
  if (n < 100n) return [n];            // 1–99: single component
  if (n < 1000n) {
    // Split hundreds from tens+units
    const hundreds = (n / 100n) * 100n;
    const remainder = n % 100n;
    return remainder > 0n ? [hundreds, remainder] : [hundreds];
  }
  // 1000+: recursively split thousands from sub-1000
  const thousandsValue = n / 1000n;
  const remainder = n % 1000n;
  const thousandsComponents = getSimpleComponents(thousandsValue).map(c => c * 1000n);
  const remainderComponents = remainder > 0n ? getSimpleComponents(remainder) : [];
  return [...thousandsComponents, ...remainderComponents];
}

/** Number (non-BigInt) version of getSimpleComponents */
function getSimpleComponentsNum(n: number): number[] {
  if (n <= 0) return [];
  if (n < 100) return [n];
  if (n < 1000) {
    const hundreds = Math.floor(n / 100) * 100;
    const remainder = n % 100;
    return remainder > 0 ? [hundreds, remainder] : [hundreds];
  }
  const thousandsValue = Math.floor(n / 1000);
  const remainder = n % 1000;
  const thousandsComponents = getSimpleComponentsNum(thousandsValue).map(c => c * 1000);
  const remainderComponents = remainder > 0 ? getSimpleComponentsNum(remainder) : [];
  return [...thousandsComponents, ...remainderComponents];
}

/**
 * Returns the "l" multiplier suffix for any number n ≥ 2.
 * NOTE: n must be a "simple" component (output of getSimpleComponentsNum)
 * to avoid creating ambiguous multiplicative chains.
 */
export function getMultiplier(n: number): string {
  if (n <= 1) return '';
  if (multipliers[n] !== undefined) return multipliers[n];
  if (n < 100) {
    const tens = Math.floor(n / 10) * 10;
    const units = n % 10;
    return (multipliers[tens] || '') + (units > 0 ? (yorubaNumbers[units]?.toLowerCase() || '') : '');
  }
  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    return multipliers[100] +
      (hundreds > 1 ? (multipliers[hundreds] || '') : '') +
      (remainder > 0 ? getMultiplier(remainder) : '');
  }
  const thousands = Math.floor(n / 1000);
  const remainder = n % 1000;
  return (thousands === 1 ? L_EGBERUN : L_EGBERUN + getMultiplier(thousands)) +
    (remainder > 0 ? getMultiplier(remainder) : '');
}

export interface MagnitudeColour {
  power: number;
  colour: string;
  label: string;
  yoruba: string;
  colourName: string;
  relevance: string;
  mathPower: string;
}

export const magnitudeColours: MagnitudeColour[] = [
  { power: 0,  colour: '#0891B2', label: 'Zero',                      yoruba: 'Ódo',                      colourName: 'Cerulean',        relevance: 'The Silence',   mathPower: '0⁰' },
  { power: 0,  colour: '#16A34A', label: 'Units',                     yoruba: 'Ení-Ẹ́sǎn',               colourName: 'Vibrant Green',    relevance: 'Foundation',    mathPower: '10⁰' },
  { power: 1,  colour: '#2563EB', label: 'Tens',                      yoruba: 'Ẹ́wǎ-Àádọ́rǔnẸ́sǎn',     colourName: 'Royal Blue',      relevance: 'First Step',    mathPower: '10¹' },
  { power: 2,  colour: '#9333EA', label: 'Hundreds',                  yoruba: 'Ọgọ́rǔn',                 colourName: 'Purple',          relevance: 'Growth',        mathPower: '10²' },
  { power: 3,  colour: '#DC2626', label: 'Thousands',                 yoruba: 'Ẹgbẹ̀rǔn',               colourName: 'Red',             relevance: 'Community',     mathPower: '10³' },
  { power: 4,  colour: '#B59410', label: 'Tens of Thousands',         yoruba: 'Ẹgbẹ̀rǔnléwǎ',           colourName: 'Dark Goldenrod',  relevance: 'Village Scale', mathPower: '10⁴' },
  { power: 5,  colour: '#6FBDFA', label: 'Hundreds of Thousands',     yoruba: 'Ẹgbẹ̀rǔnlọ́gọ́rǔn',     colourName: 'Sky Blue',        relevance: 'City Scale',    mathPower: '10⁵' },
  { power: 6,  colour: '#8B4513', label: 'Millions',                  yoruba: 'Mílíọ̀nù',                colourName: 'Saddle Brown',    relevance: 'Nation Scale',  mathPower: '10⁶' },
  { power: 7,  colour: '#D5B60A', label: 'Tens of Millions',          yoruba: 'Mílíọ̀nù léwǎ',           colourName: 'Golden Yellow',   relevance: 'Continental',   mathPower: '10⁷' },
  { power: 8,  colour: '#EF6000', label: 'Hundreds of Millions',      yoruba: 'Mílíọ̀nù lọ́gọ́rǔn',     colourName: 'Dark Orange',     relevance: 'Near Billion',  mathPower: '10⁸' },
  { power: 9,  colour: '#000080', label: 'Billions',                  yoruba: 'Bílíọ̀nù',                colourName: 'Navy Blue',       relevance: 'World Scale',   mathPower: '10⁹' },
  { power: 10, colour: '#FC5D8D', label: 'Tens of Billions',          yoruba: 'Bílíọ̀nù léwǎ',           colourName: 'Hot Pink',        relevance: 'Global Wealth', mathPower: '10¹⁰' },
  { power: 11, colour: '#808000', label: 'Hundreds of Billions',      yoruba: 'Bílíọ̀nù lọ́gọ́rǔn',     colourName: 'Olive',           relevance: 'Mega Wealth',   mathPower: '10¹¹' },
  { power: 12, colour: '#8B008B', label: 'Trillions',                 yoruba: 'Tírílíọ̀nù',              colourName: 'Dark Magenta',    relevance: 'State Budget',  mathPower: '10¹²' },
  { power: 13, colour: '#6A5ACD', label: 'Tens of Trillions',         yoruba: 'Tírílíọ̀nù léwǎ',         colourName: 'Slate Blue',      relevance: 'National Debt', mathPower: '10¹³' },
  { power: 14, colour: '#FF6347', label: 'Hundreds of Trillions',     yoruba: 'Tírílíọ̀nù lọ́gọ́rǔn',   colourName: 'Tomato',          relevance: 'World GDP',     mathPower: '10¹⁴' },
  { power: 15, colour: '#4682B4', label: 'Quadrillions',              yoruba: 'Kuwadrílíọ̀nù',           colourName: 'Steel Blue',      relevance: 'Ocean Drops',   mathPower: '10¹⁵' },
  { power: 16, colour: '#F59E0B', label: 'Tens of Quadrillions',      yoruba: 'Kuwadrílíọ̀nù léwǎ',      colourName: 'Amber',           relevance: 'Deep Space',    mathPower: '10¹⁶' },
  { power: 17, colour: '#8B0000', label: 'Hundreds of Quadrillions',  yoruba: 'Kuwadrílíọ̀nù lọ́gọ́rǔn', colourName: 'Dark Red',        relevance: 'Star Light',    mathPower: '10¹⁷' },
  { power: 18, colour: '#047857', label: 'Quintillions',              yoruba: 'Kuíntílíọ̀nù',            colourName: 'Emerald',         relevance: 'Sand Grains',   mathPower: '10¹⁸' },
  { power: 19, colour: '#7C3AED', label: 'Tens of Quintillions',      yoruba: 'Kuíntílíọ̀nù léwǎ',       colourName: 'Violet',          relevance: 'Cosmic Dust',   mathPower: '10¹⁹' },
  { power: 20, colour: '#D2691E', label: 'Hundreds of Quintillions',  yoruba: 'Kuíntílíọ̀nù lọ́gọ́rǔn', colourName: 'Chocolate',       relevance: 'Stellar Mass',  mathPower: '10²⁰' },
  { power: 21, colour: '#1E90FF', label: 'Sextillions',               yoruba: 'Sẹ́kstílíọ̀nù',          colourName: 'Dodger Blue',     relevance: 'Galaxy Scale',  mathPower: '10²¹' },
  { power: 22, colour: '#B91C1C', label: 'Tens of Sextillions',       yoruba: 'Sẹ́kstílíọ̀nù léwǎ',      colourName: 'Crimson',         relevance: 'Dark Matter',   mathPower: '10²²' },
  { power: 23, colour: '#65A30D', label: 'Hundreds of Sextillions',   yoruba: 'Sẹ́kstílíọ̀nù lọ́gọ́rǔn', colourName: 'Lime Green',      relevance: 'Nebula Scale',  mathPower: '10²³' },
  { power: 24, colour: '#4B0082', label: 'Septillions',               yoruba: 'Sẹ́ptílíọ̀nù',           colourName: 'Indigo',          relevance: 'Universe Edge', mathPower: '10²⁴' },
  { power: 25, colour: '#FA8072', label: 'Tens of Septillions',       yoruba: 'Sẹ́ptílíọ̀nù léwǎ',       colourName: 'Salmon',          relevance: 'Beyond Stars',  mathPower: '10²⁵' },
  { power: 26, colour: '#008B8B', label: 'Hundreds of Septillions',   yoruba: 'Sẹ́ptílíọ̀nù lọ́gọ́rǔn', colourName: 'Dark Teal',       relevance: 'Void Scale',    mathPower: '10²⁶' },
  { power: 27, colour: '#DAA520', label: 'Octillions',                yoruba: 'Ọ́ktílíọ̀nù',            colourName: 'Goldenrod',       relevance: 'Atom Count',    mathPower: '10²⁷' },
  { power: 28, colour: '#7B2D8E', label: 'Tens of Octillions',        yoruba: 'Ọ́ktílíọ̀nù léwǎ',        colourName: 'Deep Violet',     relevance: 'Deep Atom',     mathPower: '10²⁸' },
  { power: 29, colour: '#20B2AA', label: 'Hundreds of Octillions',    yoruba: 'Ọ́ktílíọ̀nù lọ́gọ́rǔn',  colourName: 'Light Sea Green', relevance: 'Quark Scale',   mathPower: '10²⁹' },
  { power: 30, colour: '#B22222', label: 'Nonillions',                yoruba: 'Nọ́nílíọ̀nù',            colourName: 'Firebrick',       relevance: 'Particle Sea',  mathPower: '10³⁰' },
  { power: 31, colour: '#9370DB', label: 'Tens of Nonillions',        yoruba: 'Nọ́nílíọ̀nù léwǎ',        colourName: 'Medium Purple',   relevance: 'Energy Field',  mathPower: '10³¹' },
  { power: 32, colour: '#A0522D', label: 'Hundreds of Nonillions',    yoruba: 'Nọ́nílíọ̀nù lọ́gọ́rǔn',  colourName: 'Sienna',          relevance: 'Quantum Foam',  mathPower: '10³²' },
  { power: 33, colour: '#191970', label: 'Decillions',                yoruba: 'Dẹ́sílíọ̀nù',            colourName: 'Midnight Blue',   relevance: 'Pure Math',     mathPower: '10³³' },
  { power: 34, colour: '#E11D48', label: 'Tens of Decillions',        yoruba: 'Dẹ́sílíọ̀nù léwǎ',        colourName: 'Rose',            relevance: 'Abstract',      mathPower: '10³⁴' },
  { power: 35, colour: '#5F9EA0', label: 'Hundreds of Decillions',    yoruba: 'Dẹ́sílíọ̀nù lọ́gọ́rǔn',  colourName: 'Cadet Blue',      relevance: 'Theoretical',   mathPower: '10³⁵' },
  { power: 36, colour: '#CD7F32', label: 'Undecillions',              yoruba: 'Ọ́ndẹ́sílíọ̀nù',         colourName: 'Bronze',          relevance: 'Beyond Sight',  mathPower: '10³⁶' },
  { power: 37, colour: '#9932CC', label: 'Tens of Undecillions',      yoruba: 'Ọ́ndẹ́sílíọ̀nù léwǎ',     colourName: 'Dark Orchid',     relevance: 'Infinite Edge', mathPower: '10³⁷' },
  { power: 38, colour: '#228B22', label: 'Hundreds of Undecillions',  yoruba: 'Ọ́ndẹ́sílíọ̀nù lọ́gọ́rǔn', colourName: 'Forest Green',    relevance: 'Pure Concept',  mathPower: '10³⁸' },
  { power: 39, colour: '#483D8B', label: 'Duodecillions',             yoruba: 'Dúódẹ́sílíọ̀nù',         colourName: 'Dark Slate Blue', relevance: 'Mind Only',     mathPower: '10³⁹' },
  { power: 40, colour: '#800000', label: 'Tens of Duodecillions',     yoruba: 'Dúódẹ́sílíọ̀nù léwǎ',     colourName: 'Maroon',          relevance: 'Imagination',   mathPower: '10⁴⁰' },
  { power: 41, colour: '#CD853F', label: 'Hundreds of Duodecillions', yoruba: 'Dúódẹ́sílíọ̀nù lọ́gọ́rǔn', colourName: 'Peru',            relevance: 'Dream Scale',   mathPower: '10⁴¹' },
  { power: 42, colour: '#94AA00', label: 'Tredecillions+',            yoruba: 'Trẹ́dẹ́sílíọ̀nù',        colourName: 'Dark Olive',      relevance: 'The Infinite',  mathPower: '10⁴²' },
  { power: -2, colour: '#FF13F0', label: '"l" Multiplier',            yoruba: 'l',                        colourName: 'Neon Pink',       relevance: 'The Bridge',    mathPower: '×n' },
  { power: -3, colour: '#808080', label: 'Unassigned',                yoruba: 'Contents',                 colourName: 'Gray',            relevance: 'Open Space',    mathPower: '—' },
];

/**
 * Converts a scientific-notation string (e.g. "4.313e+41") to BigInt.
 * Returns null if conversion is not possible.
 */
export function sciNotationToBigInt(s: string): bigint | null {
  const m = s.match(/^(-?)(\d+\.?\d*)e([+-]?\d+)$/i);
  if (!m) return null;
  try {
    const exp = parseInt(m[3]);
    const decimals = m[2].includes('.') ? m[2].length - m[2].indexOf('.') - 1 : 0;
    const digits = m[2].replace('.', '');
    const shift = exp - decimals;
    const result = shift >= 0
      ? BigInt(digits) * (10n ** BigInt(shift))
      : BigInt(digits) / (10n ** BigInt(-shift));
    return m[1] === '-' ? -result : result;
  } catch { return null; }
}

/** BigInt version of getMultiplier — handles numbers of any magnitude. */
export function getMultiplierBig(n: bigint): string {
  if (n <= 1n) return '';
  if (n <= 900n) {
    const nNum = Number(n);
    if (multipliers[nNum] !== undefined) return multipliers[nNum];
  }
  if (n < 100n) {
    const tens = Number((n / 10n) * 10n);
    const units = Number(n % 10n);
    return (multipliers[tens] || '') + (units > 0 ? (yorubaNumbers[units]?.toLowerCase() || '') : '');
  }
  if (n < 1000n) {
    const hundreds = Number(n / 100n);
    const remainder = n % 100n;
    return multipliers[100] +
      (hundreds > 1 ? (multipliers[hundreds] || '') : '') +
      (remainder > 0n ? getMultiplierBig(remainder) : '');
  }
  const thousands = n / 1000n;
  const remainder = n % 1000n;
  return (thousands === 1n ? L_EGBERUN : L_EGBERUN + getMultiplierBig(thousands)) +
    (remainder > 0n ? getMultiplierBig(remainder) : '');
}

/** Converts a BigInt to its full Yoruba name — supports tredecillion and beyond. */
export function toYorubaBig(num: bigint): string {
  const n = num < 0n ? -num : num;
  if (n <= 1000n) {
    const nNum = Number(n);
    if (yorubaNumbers[nNum] !== undefined) return yorubaNumbers[nNum];
  }
  if (n > 0n && n < 100n) {
    const tens = Number((n / 10n) * 10n);
    const units = Number(n % 10n);
    return (yorubaNumbers[tens] || '') + (units > 0 ? (yorubaNumbers[units] || '') : '');
  }
  let result = '';
  let remaining = n;

  if (remaining >= 1000n) {
    const thousands = remaining / 1000n;
    // Decompose into simple additive components — each gets its own Ẹgbẹ̀rǔn prefix
    const components = getSimpleComponents(thousands);
    for (const comp of components) {
      result += comp === 1n
        ? yorubaNumbers[1000]!
        : yorubaNumbers[1000]! + getMultiplierBig(comp);
    }
    remaining = remaining % 1000n;
  }

  if (remaining >= 100n) {
    const hundreds = Number(remaining / 100n);
    const hundredWord = yorubaNumbers[hundreds * 100];
    result += hundredWord || (yorubaNumbers[100] + (hundreds > 1 ? (multipliers[hundreds] || '') : ''));
    remaining = remaining % 100n;
  }

  const remNum = Number(remaining);
  if (remNum > 0) {
    if (yorubaNumbers[remNum] !== undefined) {
      result += yorubaNumbers[remNum];
    } else {
      const tens = Math.floor(remNum / 10) * 10;
      const units = remNum % 10;
      result += (yorubaNumbers[tens] || '') + (units > 0 ? (yorubaNumbers[units] || '') : '');
    }
  }
  return result || n.toString();
}

export interface YorubaSegment {
  text: string;
  power: number; // -1 for zero, otherwise log10 of the segment's magnitude
}

/**
 * Returns the Yoruba word broken into coloured segments by magnitude group.
 * Each segment carries a `power` so the display can colour it independently.
 *
 * Key fix: the thousands multiplier is decomposed into simple additive components
 * (via getSimpleComponents) so that each component gets its own Ẹgbẹ̀rǔn prefix,
 * preventing ambiguous multiplicative-chain readings.
 */
export function toYorubaBigColoured(num: bigint): YorubaSegment[] {
  const n = num < 0n ? -num : num;
  if (n === 0n) return [{ text: 'Ódo', power: -1 }];

  const segs: YorubaSegment[] = [];
  let remaining = n;

  if (remaining >= 1000n) {
    const thousands = remaining / 1000n;
    // Decompose into simple additive components — each gets its own Ẹgbẹ̀rǔn prefix
    const components = getSimpleComponents(thousands);
    for (const comp of components) {
      const actualValue = comp * 1000n;
      const power = actualValue.toString().length - 1;
      const text = comp === 1n
        ? yorubaNumbers[1000]!
        : yorubaNumbers[1000]! + getMultiplierBig(comp);
      segs.push({ text, power });
    }
    remaining = remaining % 1000n;
  }

  if (remaining >= 100n) {
    const hundreds = Number(remaining / 100n);
    const hundredWord = yorubaNumbers[hundreds * 100];
    const hundredsStr = hundredWord || (yorubaNumbers[100]! + (hundreds > 1 ? (multipliers[hundreds] || '') : ''));
    segs.push({ text: hundredsStr, power: 2 });
    remaining = remaining % 100n;
  }

  const remNum = Number(remaining);
  if (remNum > 0) {
    if (yorubaNumbers[remNum] !== undefined) {
      segs.push({ text: yorubaNumbers[remNum], power: remNum >= 10 ? 1 : 0 });
    } else {
      const tens = Math.floor(remNum / 10) * 10;
      const units = remNum % 10;
      if (tens > 0 && yorubaNumbers[tens]) segs.push({ text: yorubaNumbers[tens], power: 1 });
      if (units > 0 && yorubaNumbers[units]) segs.push({ text: yorubaNumbers[units], power: 0 });
    }
  }

  return segs.length > 0 ? segs : [{ text: n.toString(), power: n.toString().length - 1 }];
}

/**
 * Converts a number to its full Yoruba name.
 * Uses the recursive lẹ́gbẹ̀rǔn engine for all numbers ≥ 1000.
 */
export function toYoruba(num: number): string {
  const n = Math.floor(Math.abs(num));

  if (yorubaNumbers[n] !== undefined) return yorubaNumbers[n];

  if (n > 0 && n < 100) {
    const tens = Math.floor(n / 10) * 10;
    const units = n % 10;
    return (yorubaNumbers[tens] || '') + (units > 0 ? (yorubaNumbers[units] || '') : '');
  }

  let result = '';
  let remaining = n;

  if (remaining >= 1000) {
    const thousands = Math.floor(remaining / 1000);
    // Decompose into simple additive components — each gets its own Ẹgbẹ̀rǔn prefix
    const components = getSimpleComponentsNum(thousands);
    for (const comp of components) {
      result += comp === 1
        ? yorubaNumbers[1000]!
        : yorubaNumbers[1000]! + getMultiplier(comp);
    }
    remaining = remaining % 1000;
  }

  if (remaining >= 100) {
    const hundreds = Math.floor(remaining / 100);
    const hundredWord = yorubaNumbers[hundreds * 100];
    if (hundredWord) {
      result += hundredWord;
    } else {
      result += yorubaNumbers[100] + (hundreds > 1 ? (multipliers[hundreds] || '') : '');
    }
    remaining = remaining % 100;
  }

  if (remaining > 0) {
    if (yorubaNumbers[remaining] !== undefined) {
      result += yorubaNumbers[remaining];
    } else {
      const tens = Math.floor(remaining / 10) * 10;
      const units = remaining % 10;
      result += (yorubaNumbers[tens] || '') + (units > 0 ? (yorubaNumbers[units] || '') : '');
    }
  }

  return result || num.toString();
}
