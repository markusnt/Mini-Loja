export function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatCurrencyInput(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function maskCurrencyInput(input: string) {
  const digits = input.replace(/\D/g, '')

  if (!digits) {
    return ''
  }

  const amount = Number(digits) / 100
  return formatCurrencyInput(amount)
}

export function parseCurrencyInput(input: string) {
  const digits = input.replace(/\D/g, '')

  if (!digits) {
    return 0
  }

  return Number(digits) / 100
}
