import { Button } from '@/components/ui/button'
import type { PaginatedMeta } from '@/types/catalog'

type PaginationProps = {
  meta: PaginatedMeta
  onPrevious: () => void
  onNext: () => void
}

export function Pagination({ meta, onPrevious, onNext }: PaginationProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-muted-foreground text-sm">
        Página {meta.page} de {meta.totalPages} ({meta.total} produtos)
      </p>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={meta.page <= 1}
        >
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={meta.page >= meta.totalPages}
        >
          Próxima
        </Button>
      </div>
    </div>
  )
}
