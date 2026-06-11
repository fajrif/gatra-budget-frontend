/**
 * Determines the SLA status
 * @param tanggalPO {date}
 * @param tanggalTransaksi {date}
 * @returns {'ontime' | 'h+1' | 'late'} string
 */
export const calculateSLAStatus = (tanggalPO, tanggalTransaksi) => {
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

export const getSLALabel = (status) => {
  const labels = {
    'ontime': 'Tepat Waktu',
    'h+1': 'H+1',
    'late': 'Terlambat',
    'unknown': 'Tidak Ada Data'
  };
  return labels[status] || 'Tidak Ada Data';
};

export const getSLAColor = (status) => {
  const colors = {
    'ontime': 'text-green-600',
    'h+1': 'text-blue-600',
    'late': 'text-red-600',
    'unknown': 'text-slate-400'
  };
  return colors[status] || 'text-slate-400';
};

export const getSLABgColor = (status) => {
  const _default = 'bg-slate-50 text-slate-700';
  const colors = {
    'ontime': 'bg-green-50 text-green-700',
    'h+1': 'bg-blue-50 text-blue-700',
    'late': 'bg-red-50 text-red-700',
    'unknown': 'bg-slate-50 text-slate-700'
  };
  return colors[status] || _default;
};

export const spellOutNumber = (num) => {
  if (num === 0) return 'Nol';
  const ones = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

  if (num < 0) return 'Minus ' + spellOutNumber(Math.abs(num));
  if (num < 12) return ones[num];
  if (num < 20) return spellOutNumber(num - 10) + ' Belas';
  if (num < 100) return spellOutNumber(Math.floor(num / 10)) + ' Puluh' + (num % 10 !== 0 ? ' ' + spellOutNumber(num % 10) : '');
  if (num < 200) return 'Seratus' + (num % 100 !== 0 ? ' ' + spellOutNumber(num % 100) : '');
  if (num < 1000) return spellOutNumber(Math.floor(num / 100)) + ' Ratus' + (num % 100 !== 0 ? ' ' + spellOutNumber(num % 100) : '');
  if (num < 2000) return 'Seribu' + (num % 1000 !== 0 ? ' ' + spellOutNumber(num % 1000) : '');
  if (num < 1000000) return spellOutNumber(Math.floor(num / 1000)) + ' Ribu' + (num % 1000 !== 0 ? ' ' + spellOutNumber(num % 1000) : '');
  if (num < 1000000000) return spellOutNumber(Math.floor(num / 1000000)) + ' Juta' + (num % 1000000 !== 0 ? ' ' + spellOutNumber(num % 1000000) : '');
  if (num < 1000000000000) return spellOutNumber(Math.floor(num / 1000000000)) + ' Miliar' + (num % 1000000000 !== 0 ? ' ' + spellOutNumber(num % 1000000000) : '');
  return spellOutNumber(Math.floor(num / 1000000000000)) + ' Triliun' + (num % 1000000000000 !== 0 ? ' ' + spellOutNumber(num % 1000000000000) : '');
};

export const groupItemsByJenisBuku = (items) => {
  if (!items || !Array.isArray(items)) return [];

  const grouped = {};
  items.forEach(item => {
    const book = item.book_edition?.book || item.book;
    const jenisBukuId = book?.jenis_buku?.id || 'unknown';
    if (!grouped[jenisBukuId]) {
      grouped[jenisBukuId] = {
        jenisBuku: book?.jenis_buku,
        items: []
      };
    }
    grouped[jenisBukuId].items.push(item);
  });

  const sortedGroups = Object.values(grouped).sort((a, b) => {
    const codeA = a.jenisBuku?.code || '';
    const codeB = b.jenisBuku?.code || '';
    if (codeA === 'LKS') return -1;
    if (codeB === 'LKS') return 1;
    if (codeA === 'PG') return -1;
    if (codeB === 'PG') return 1;
    return codeA.localeCompare(codeB);
  });

  return sortedGroups;
};

export const getPeriodeLabel = (periode, year, shortChar = false) => {
  if (!year) return '-';
  const nextYear = parseInt(year) + 1;
  if (periode == 1) {
    return shortChar ? `GANJIL ${year}/${nextYear}` : `Semester Ganjil ${year}/${nextYear}`;
  } else if (periode == 2) {
    return shortChar ? `GENAP ${year}/${nextYear}` : `Semester Genap ${year}/${nextYear}`;
  }
  return shortChar ? `${year}/${nextYear}` : `Semester ${year}/${nextYear}`;
};
