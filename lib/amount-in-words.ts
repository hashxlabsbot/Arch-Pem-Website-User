/**
 * Number → words in the Indian numbering system (thousand, lakh, crore).
 * Used by the free bill generator to print "Amount in words" on invoices.
 */
const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
]
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function below100(n: number): string {
  if (n < 20) return ONES[n]
  const t = Math.floor(n / 10)
  const o = n % 10
  return TENS[t] + (o ? ' ' + ONES[o] : '')
}

function below1000(n: number): string {
  const h = Math.floor(n / 100)
  const r = n % 100
  const parts: string[] = []
  if (h) parts.push(ONES[h] + ' Hundred')
  if (r) parts.push(below100(r))
  return parts.join(' ')
}

/** Whole number in words, Indian system: 12,34,56,789 → "Twelve Crore Thirty Four Lakh …" */
export function numberToWordsIndian(n: number): string {
  if (!Number.isFinite(n)) return ''
  if (n === 0) return 'Zero'
  const crore = Math.floor(n / 1e7)
  const lakh = Math.floor((n % 1e7) / 1e5)
  const thousand = Math.floor((n % 1e5) / 1000)
  const rest = n % 1000
  const parts: string[] = []
  if (crore) parts.push((crore > 99 ? numberToWordsIndian(crore) : below100(crore)) + ' Crore')
  if (lakh) parts.push(below100(lakh) + ' Lakh')
  if (thousand) parts.push(below100(thousand) + ' Thousand')
  if (rest) parts.push(below1000(rest))
  return parts.join(' ')
}

/** ₹ amount in words as printed on Indian invoices: "Rupees … and … Paise Only". */
export function amountInWordsINR(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return ''
  let rupees = Math.floor(amount)
  let paise = Math.round((amount - rupees) * 100)
  if (paise === 100) {
    rupees += 1
    paise = 0
  }
  const paisePart = paise ? ` and ${below100(paise)} Paise` : ''
  return `Rupees ${numberToWordsIndian(rupees)}${paisePart} Only`
}
