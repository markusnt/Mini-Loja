export function getCategoryDeleteBlockReason(productCount: number): string | null {
  if (productCount <= 0) {
    return null
  }

  const label = productCount === 1 ? 'produto vinculado' : 'produtos vinculados'
  return `Categoria com ${productCount} ${label}. Remova ou reatribua os produtos antes de excluir.`
}

export function isCategoryDeleteBlocked(category: {
  _count?: { products: number }
}): boolean {
  return (category._count?.products ?? 0) > 0
}
