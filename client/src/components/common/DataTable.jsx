import { Table } from '../ui/Table.jsx'
import { Badge } from '../ui/Badge.jsx'
import { Dropdown } from '../ui/Dropdown.jsx'
import { cn } from '../../lib/cn.js'

const DataTable = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  onView,
  className 
}) => (
  <Table
    columns={columns}
    data={data}
    onEdit={onEdit}
    onDelete={onDelete}
    onView={onView}
    className={cn("shadow-2xl", className)}
    searchable
    searchValue=""
    onSearchChange={() => {}}
  />
)

export { DataTable }
