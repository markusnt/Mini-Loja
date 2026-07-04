import { EmptyTableRow } from '@/components/crud/empty-table-row'
import { RowActions } from '@/components/crud/row-actions'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  getCategoryDeleteBlockReason,
  isCategoryDeleteBlocked,
} from '@/lib/category-rules'
import type { Category } from '@/types/catalog'

type CategoriesTableProps = {
  categories: Category[]
  onView?: (category: Category) => void
  onEdit?: (category: Category) => void
  onDelete?: (category: Category) => void
}

export function CategoriesTable({
  categories,
  onView,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Table containerClassName="overflow-x-hidden">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead className="w-full">Nome</TableHead>
              <TableHead className="w-24 text-right">Produtos</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <EmptyTableRow
                colSpan={4}
                message="Nenhuma categoria encontrada."
              />
            ) : (
              categories.map((category) => {
                const productCount = category._count?.products ?? 0
                const deleteBlocked = isCategoryDeleteBlocked(category)
                const deleteTooltip = getCategoryDeleteBlockReason(productCount)

                return (
                  <TableRow key={category.id}>
                    <TableCell>{category.id}</TableCell>
                    <TableCell className="max-w-0 font-medium">
                      <button
                        type="button"
                        onClick={() => onView?.(category)}
                        className="block w-full truncate text-left hover:underline"
                      >
                        {category.name}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">{productCount}</TableCell>
                    <TableCell className="text-right">
                      <RowActions
                        onEdit={() => onEdit?.(category)}
                        onDelete={() => onDelete?.(category)}
                        deleteDisabled={deleteBlocked}
                        deleteTooltip={deleteTooltip ?? undefined}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
