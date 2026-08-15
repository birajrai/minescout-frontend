import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { api, ApiError } from '../../lib/api'
import { useApiQuery } from '../../lib/hooks'
import { PageHeader } from './PageHeader'
import { DataTable, type DataColumn } from './DataTable'
import { EmptyState } from './EmptyState'
import { ConfirmDialog } from './ConfirmDialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'

export interface CrudField {
  name: string
  label: string
  type?: 'text' | 'textarea' | 'number'
  options?: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
  hint?: string
}

export function ResourceCrudPage<T extends { id: string }>({
  title,
  description,
  queryKey,
  listFn,
  createUrl,
  updateUrl,
  deleteUrl,
  columns,
  fields,
  idKey = 'id',
  displayOf,
}: {
  title: string
  description: string
  queryKey: readonly unknown[]
  listFn: () => Promise<T[]>
  createUrl: string
  updateUrl: (id: string) => string
  deleteUrl: (id: string) => string
  columns: DataColumn<T>[]
  fields: CrudField[]
  idKey?: string
  displayOf?: (row: T) => string
}) {
  const queryClient = useQueryClient()
  const list = useApiQuery(queryKey, listFn)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<T | null>(null)

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: [...queryKey] })

  const save = useMutation<{ id: string }, ApiError, Record<string, unknown>>({
    mutationFn: (body) => (editing ? api.patch<{ id: string }>(updateUrl(String((editing as Record<string, unknown>)[idKey])), body) : api.post<{ id: string }>(createUrl, body)),
    onSuccess: () => {
      toast.success(editing ? 'Saved' : 'Created')
      setOpen(false)
      setEditing(null)
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const remove = useMutation<{ success: boolean }, ApiError, string>({
    mutationFn: (id) => api.delete<{ success: boolean }>(deleteUrl(id)),
    onSuccess: () => {
      toast.success('Deleted')
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body: Record<string, unknown> = {}
    for (const f of fields) {
      const v = fd.get(f.name)
      if (v === null) continue
      body[f.name] = f.type === 'number' ? Number(v) || 0 : String(v)
    }
    save.mutate(body)
  }

  const openNew = () => {
    setEditing(null)
    setOpen(true)
  }
  const openEdit = (row: T) => {
    setEditing(row)
    setOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} description={description}>
        <Button onClick={openNew}><Plus className="h-4 w-4" /> Add {title.replace(/s$/, '')}</Button>
      </PageHeader>

      <DataTable
        columns={[
          ...columns,
          {
            key: 'actions',
            header: 'Actions',
            className: 'w-full',
            cell: (row) => (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)} aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setConfirmDelete(row)} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
        rows={list.data ?? []}
        rowKey={(r) => String((r as Record<string, unknown>)[idKey])}
        isLoading={list.isLoading}
        error={list.error}
        onRetry={() => void list.refetch()}
        empty={<EmptyState title={`No ${title.toLowerCase()} yet`} description="Create one to get started." />}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit' : `Add ${title.replace(/s$/, '')}`}</DialogTitle>
            <DialogDescription>{editing && displayOf ? displayOf(editing) : ''}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="flex flex-col gap-4">
            {fields.map((f) => (
              <div key={f.name} className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{f.label}</Label>
                {f.type === 'textarea' ? (
                  <Textarea name={f.name} rows={3} required={f.required} placeholder={f.placeholder} defaultValue={editing ? String((editing as Record<string, unknown>)[f.name] ?? '') : ''} />
                ) : (
                  <Input name={f.name} type={f.type ?? 'text'} required={f.required} placeholder={f.placeholder} defaultValue={editing ? String((editing as Record<string, unknown>)[f.name] ?? '') : ''} />
                )}
                {f.hint ? <span className="text-xs text-muted-foreground">{f.hint}</span> : null}
              </div>
            ))}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => setConfirmDelete(open ? confirmDelete : null)}
        title={`Delete ${displayOf && confirmDelete ? displayOf(confirmDelete) : 'this item'}?`}
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => confirmDelete && remove.mutate(String((confirmDelete as Record<string, unknown>)[idKey]))}
      />
    </div>
  )
}
