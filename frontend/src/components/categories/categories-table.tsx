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
import type { Category } from '@/types/catalog'

type CategoriesTableProps = {
  categories: Category[]
  onEdit?: (category: Category) => void
  onDelete?: (category: Category) => void
}

export function CategoriesTable({
  categories,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="w-28 text-right">Produtos</TableHead>
              <TableHead className="w-28 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <EmptyTableRow
                colSpan={4}
                message="Nenhuma categoria encontrada."
              />
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">
                    {category._count?.products ?? 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <RowActions
                      onEdit={() => onEdit?.(category)}
                      onDelete={() => onDelete?.(category)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
