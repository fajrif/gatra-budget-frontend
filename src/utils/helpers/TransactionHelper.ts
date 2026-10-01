/** SLA buckets used by the transaction reporting screens. */
export type SLAStatus = 'ontime' | 'h+1' | 'late' | 'unknown';

/**
 * Determines the SLA status for a transaction.
 * @param tanggalPO PO date
 * @param tanggalTransaksi Payment date
 */
export const calculateSLAStatus = (
  tanggalPO: string | Date | null | undefined,
  tanggalTransaksi: string | Date | null | undefined,
): SLAStatus => {
  if (!tanggalPO || !tanggalTransaksi) return 'unknown';

  const po = new Date(tanggalPO);
  const tx = new Date(tanggalTransaksi);

  // Get end of month for PO date
  const endOfPOMonth = new Date(po.getFullYear(), po.getMonth() + 1, 0);
  // Get end of next month
  const endOfNextMonth = new Date(po.getFullYear(), po.getMonth() + 2, 0);

  if (tx <= endOfPOMonth) {
    return 'ontime'; // Dibayar di bulan yang sama
  } else if (tx <= endOfNextMonth) {
    return 'h+1'; // Dibayar di H+1 (bulan berikutnya)
  } else {
    return 'late'; // Terlambat
  }
};

const SLA_LABELS: Record<SLAStatus, string> = {
  ontime: 'Tepat Waktu',
  'h+1': 'H+1',
  late: 'Terlambat',
  unknown: 'Tidak Ada Data',
};

export const getSLALabel = (status: SLAStatus | string): string =>
  SLA_LABELS[status as SLAStatus] || 'Tidak Ada Data';

const SLA_COLORS: Record<SLAStatus, string> = {
  ontime: 'text-green-600',
  'h+1': 'text-blue-600',
  late: 'text-red-600',
  unknown: 'text-slate-400',
};

export const getSLAColor = (status: SLAStatus | string): string =>
  SLA_COLORS[status as SLAStatus] || 'text-slate-400';

const SLA_BG_COLORS: Record<SLAStatus, string> = {
  ontime: 'bg-green-50 text-green-700',
  'h+1': 'bg-blue-50 text-blue-700',
  late: 'bg-red-50 text-red-700',
  unknown: 'bg-slate-50 text-slate-700',
};

export const getSLABgColor = (status: SLAStatus | string): string =>
  SLA_BG_COLORS[status as SLAStatus] || 'bg-slate-50 text-slate-700';

export const spellOutNumber = (num: number): string => {
  if (num === 0) return 'Nol';
  const ones = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  if (num < 0) return 'Minus ' + spellOutNumber(Math.abs(num));
  if (num < 12) return ones[num];
  if (num < 20) return spellOutNumber(num - 10) + ' Belas';
  if (num < 100)
    return (
      spellOutNumber(Math.floor(num / 10)) +
      ' Puluh' +
      (num % 10 !== 0 ? ' ' + spellOutNumber(num % 10) : '')
    );
  if (num < 200)
    return 'Seratus' + (num % 100 !== 0 ? ' ' + spellOutNumber(num % 100) : '');
  if (num < 1000)
    return (
      spellOutNumber(Math.floor(num / 100)) +
      ' Ratus' +
      (num % 100 !== 0 ? ' ' + spellOutNumber(num % 100) : '')
    );
  if (num < 2000)
    return 'Seribu' + (num % 1000 !== 0 ? ' ' + spellOutNumber(num % 1000) : '');
  if (num < 1000000)
    return (
      spellOutNumber(Math.floor(num / 1000)) +
      ' Ribu' +
      (num % 1000 !== 0 ? ' ' + spellOutNumber(num % 1000) : '')
    );
  if (num < 1000000000)
    return (
      spellOutNumber(Math.floor(num / 1000000)) +
      ' Juta' +
      (num % 1000000 !== 0 ? ' ' + spellOutNumber(num % 1000000) : '')
    );
  if (num < 1000000000000)
    return (
      spellOutNumber(Math.floor(num / 1000000000)) +
      ' Miliar' +
      (num % 1000000000 !== 0 ? ' ' + spellOutNumber(num % 1000000000) : '')
    );
  return (
    spellOutNumber(Math.floor(num / 1000000000000)) +
    ' Triliun' +
    (num % 1000000000000 !== 0 ? ' ' + spellOutNumber(num % 1000000000000) : '')
  );
};

interface BookEdition {
  book?: BookReference | null;
}

interface BookReference {
  jenis_buku?: JenisBuku | null;
}

interface JenisBuku {
  id: string;
  code: string;
  name: string;
}

interface GroupableItem {
  book?: BookReference | null;
  book_edition?: BookEdition | null;
}

export interface ItemGroup<T> {
  jenis_buku: JenisBuku | null | undefined;
  items: T[];
}

/**
 * Groups items by their `jenis_buku` reference, sorting `LKS` then `PG` first
 * and the remaining codes alphabetically.
 */
export const groupItemsByJenisBuku = <T extends GroupableItem>(
  items: T[] | null | undefined,
): ItemGroup<T>[] => {
  if (!items || !Array.isArray(items)) return [];

  const grouped: Record<string, ItemGroup<T>> = {};
  items.forEach((item) => {
    const book = item.book_edition?.book || item.book;
    const jenisBukuId = book?.jenis_buku?.id || 'unknown';
    if (!grouped[jenisBukuId]) {
      grouped[jenisBukuId] = {
        jenis_buku: book?.jenis_buku,
        items: [],
      };
    }
    grouped[jenisBukuId].items.push(item);
  });

  const sortedGroups = Object.values(grouped).sort((a, b) => {
    const codeA = a.jenis_buku?.code || '';
    const codeB = b.jenis_buku?.code || '';
    if (codeA === 'LKS') return -1;
    if (codeB === 'LKS') return 1;
    if (codeA === 'PG') return -1;
    if (codeB === 'PG') return 1;
    return codeA.localeCompare(codeB);
  });

  return sortedGroups;
};

/** Renders a semester label such as `Semester Ganjil 2024/2025`. */
export const getPeriodeLabel = (
  periode: number | string | null | undefined,
  year: number | string | null | undefined,
  shortChar = false,
): string => {
  if (!year) return '-';
  const nextYear = parseInt(String(year), 10) + 1;
  if (periode == 1) {
    return shortChar ? `GANJIL ${year}/${nextYear}` : `Semester Ganjil ${year}/${nextYear}`;
  } else if (periode == 2) {
    return shortChar ? `GENAP ${year}/${nextYear}` : `Semester Genap ${year}/${nextYear}`;
  }
  return shortChar ? `${year}/${nextYear}` : `Semester ${year}/${nextYear}`;
};