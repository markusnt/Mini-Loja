import { TableCell, TableRow } from '@/components/ui/table'

type EmptyTableRowProps = {
  colSpan: number
  message?: string
}

export function EmptyTableRow({
  colSpan,
  message = 'Nenhum registro encontrado.',
}: EmptyTableRowProps) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="text-muted-foreground h-24 text-center"
      >
        {message}
      </TableCell>
    </TableRow>
  )
}
