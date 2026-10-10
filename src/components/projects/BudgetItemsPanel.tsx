import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetItemsAPI } from '@/api/endpoints';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/components/ui/use-toast';
import AddEditBudgetItemDialog from '@/components/dialogs/operationals/AddEditBudgetItemDialog';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { formatRupiah } from '@/utils/formatters';
import { Plus, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import type { BudgetItem, UUID } from '@/types';

export interface BudgetItemsPanelProps {
  projectId: UUID;
}

const BudgetItemsPanel = ({ projectId }: BudgetItemsPanelProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { data: allItems, isLoading } = useQuery({
    queryKey: ['budget-items', projectId],
    queryFn: () => budgetItemsAPI.getAll({ project_id: projectId, all: true }),
    select: (res) => res.data?.budget_items ?? [],
  });

  const parents = (allItems ?? []).filter((item) => item.is_parent);
  const childrenByParentId = (allItems ?? [])
    .filter((item) => !item.is_parent && item.parent_budget_id)
    .reduce<Record<string, BudgetItem[]>>((acc, child) => {
      const key = child.parent_budget_id as string;
      (acc[key] ??= []).push(child);
      return acc;
    }, {});

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetItemsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-items', projectId] });
      toast({ title: 'Success', description: 'Item anggaran berhasil dihapus.', variant: 'success' });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menghapus item anggaran.'),
        variant: 'destructive',
      });
    },
  });

  const handleDelete = async (item: BudgetItem) => {
    const ok = await confirm({
      message: `Hapus item anggaran "${item.cost_type?.nama_biaya ?? ''}"? ${
        item.kategori_anggaran === 'monthly' ? 'Ini juga akan menghapus rincian bulanannya.' : ''
      }`,
      variant: 'danger',
    });
    if (ok) deleteMutation.mutate(item.id);
  };

  const finishSubmit = (shouldRefresh: boolean) => {
    if (shouldRefresh) queryClient.invalidateQueries({ queryKey: ['budget-items', projectId] });
    setShowDialog(false);
    setEditingItem(null);
  };

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500">Memuat...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingItem(null);
            setShowDialog(true);
          }}
          className="bg-blue-900 hover:bg-blue-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Item Anggaran
        </Button>
      </div>

      {parents.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          Belum ada item anggaran. Tambahkan alokasi jenis biaya pertama untuk proyek ini.
        </div>
      ) : (
        <div className="space-y-2">
          {parents.map((parent) => {
            const children = childrenByParentId[parent.id] ?? [];
            const isMonthly = parent.kategori_anggaran === 'monthly';
            const isOpen = !!expanded[parent.id];

            return (
              <div key={parent.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <Collapsible
                  open={isOpen}
                  onOpenChange={(open) => setExpanded((e) => ({ ...e, [parent.id]: open }))}
                >
                  <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                      {isMonthly ? (
                        <CollapsibleTrigger asChild>
                          <button
                            type="button"
                            className="p-1 rounded hover:bg-slate-100 flex-shrink-0"
                          >
                            <ChevronDown
                              className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </CollapsibleTrigger>
                      ) : (
                        <span className="w-6" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 truncate">
                            {parent.cost_type?.nama_biaya ?? parent.jenis_biaya_name ?? '-'}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {isMonthly ? `Bulanan (${children.length} bulan)` : 'Lumpsum'}
                          </Badge>
                        </div>
                        {parent.deskripsi_anggaran && (
                          <p className="text-xs text-slate-500 truncate">{parent.deskripsi_anggaran}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-medium text-slate-900">
                        {formatRupiah(parent.total_anggaran)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingItem(parent);
                          setShowDialog(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(parent)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {isMonthly && (
                    <CollapsibleContent>
                      <div className="border-t border-slate-100 bg-slate-50">
                        {children
                          .slice()
                          .sort((a, b) => (a.bulan_ke ?? 0) - (b.bulan_ke ?? 0))
                          .map((child) => (
                            <div
                              key={child.id}
                              className="flex items-center justify-between px-4 py-2 pl-12 text-sm border-b border-slate-100 last:border-b-0"
                            >
                              <span className="text-slate-600">
                                Bulan {child.bulan_ke} — {child.periode_bulan}
                              </span>
                              <span className="text-slate-900">{formatRupiah(child.jumlah_anggaran)}</span>
                            </div>
                          ))}
                      </div>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              </div>
            );
          })}
        </div>
      )}

      <AddEditBudgetItemDialog
        isOpen={showDialog}
        onClose={() => finishSubmit(false)}
        projectId={projectId}
        editingItem={editingItem ?? undefined}
        onFinish={finishSubmit}
      />
    </div>
  );
};

export default BudgetItemsPanel;
