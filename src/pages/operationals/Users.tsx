import { useState, type ChangeEvent } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { usersAPI } from '@/api/endpoints';
import { Card, CardContent } from '@/components/ui/card';
import AboutCard from '@/components/ui/AboutCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Search, Trash2, User } from 'lucide-react';
import AddEditUserDialog from '@/components/dialogs/operationals/AddEditUserDialog';
import Pagination from '@/components/Pagination';
import { getRoleColor } from '@/utils/helpers/UserHelper';
import { formatDate } from '@/utils/formatters';
import { PAGINATION } from '@/utils/constants';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { ListEnvelope, User as UserType } from '@/types';

type UsersEnvelope = ListEnvelope<'users', UserType>;

const emptyUsers: UsersEnvelope = {
  users: [],
  pagination: { total: 0, page: 1, limit: PAGINATION.DEFAULT_LIMIT, total_pages: 0 },
};

const MasterUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const limit = PAGINATION.DEFAULT_LIMIT;
  const confirm = useConfirm();

  const {
    data: usersData = emptyUsers,
    isLoading,
  } = useQuery({
    queryKey: ['users', searchTerm, currentPage, limit],
    queryFn: async () => {
      const response = await usersAPI.getAll({
        search: searchTerm,
        page: currentPage,
        limit: limit,
      });
      return response.data;
    },
    enabled: searchTerm.length === 0 || searchTerm.length >= 3,
    placeholderData: keepPreviousData,
  });

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setShowDialog(true);
  };

  const finishSubmit = (isQuery = true) => {
    if (isQuery) {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
    setShowDialog(false);
    setEditingUser(null);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(PAGINATION.DEFAULT_PAGE);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await usersAPI.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Success',
        description: 'User berhasil dihapus.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Gagal menghapus user.'),
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Master Data User</h1>
            <p className="text-slate-500 font-normal mt-1">Kelola data user anda</p>
          </div>
        </div>

        <AboutCard icon={User} title="Tentang Master Data User">
          <p className="text-sm text-slate-700 mb-3">
            Master data user atau pengguna digunakan untuk akses system ini.
          </p>
          <div className="space-y-1 text-sm text-slate-600">
            <p>
              • <strong className="font-semibold">Email:</strong> Email pengguna yang di daftarkan
            </p>
            <p>
              • <strong className="font-semibold">Password:</strong> Password min. 8 karakter,
              mengandung huruf besar dan kecil, mengandung min. 1 symbol
            </p>
            <p>
              • <strong className="font-semibold">Nama Lengkap:</strong> Nama lengkap pengguna
              (min. 3 karakter)
            </p>
            <p>
              • <strong className="font-semibold">Role:</strong> Role dari pengguna (admin / user /
              operator)
            </p>
          </div>
        </AboutCard>

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Filter pencarian ..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-blue-900 hover:bg-blue-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah User
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-none shadow-md animate-pulse">
                <CardContent className="p-6">
                  <div className="h-5 bg-slate-200 rounded w-1/4 mb-3" />
                  <div className="h-6 bg-slate-200 rounded w-2/3 mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : usersData.users.length === 0 ? (
          <Card className="border-none shadow-md">
            <CardContent className="p-12 text-center">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Belum ada user. Tambahkan user pertama anda.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usersData.users.map((user) => (
              <Card
                key={user.id}
                className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          const ok = await confirm({
                            message: 'Yakin ingin menghapus user ini?',
                          });
                          if (ok) deleteMutation.mutate(user.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">{user.full_name}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Email: {user.email}
                    <br />
                    Dibuat pada: {formatDate(user.created_at)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && usersData.users.length > 0 && usersData.pagination && (
          <Pagination
            currentPage={currentPage}
            totalPages={usersData.pagination.total_pages}
            total={usersData.pagination.total}
            limit={usersData.pagination.limit}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <AddEditUserDialog
        isOpen={showDialog}
        onClose={() => finishSubmit(false)}
        editingUser={editingUser}
        onFinish={finishSubmit}
      />
    </div>
  );
};

export default MasterUser;