import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router'
import { adminTenantsApi, type Tenant, type TenantsListResponse } from '@/lib/admin-api'
import {
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Power,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react'

export function AdminTenantsPage() {
  const [data, setData] = useState<TenantsListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('')
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const fetchTenants = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await adminTenantsApi.list({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
      })
      setData(response)
      setError(null)
    } catch (err) {
      console.error('Error fetching tenants:', err)
      setError('Error al cargar las clínicas')
    } finally {
      setIsLoading(false)
    }
  }, [page, search, status])

  useEffect(() => {
    fetchTenants()
  }, [fetchTenants])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchTenants()
  }

  const handleToggleStatus = async (tenant: Tenant) => {
    setActionLoading(tenant.id)
    try {
      if (tenant.isActive) {
        await adminTenantsApi.suspend(tenant.id)
      } else {
        await adminTenantsApi.activate(tenant.id)
      }
      fetchTenants()
    } catch (err) {
      console.error('Error toggling tenant status:', err)
    } finally {
      setActionLoading(null)
      setOpenMenu(null)
    }
  }

  const handleDelete = async (tenant: Tenant) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${tenant.name}"? Esta acción eliminará todos los datos asociados.`)) {
      return
    }

    setActionLoading(tenant.id)
    try {
      await adminTenantsApi.delete(tenant.id)
      fetchTenants()
    } catch (err) {
      console.error('Error deleting tenant:', err)
    } finally {
      setActionLoading(null)
      setOpenMenu(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clínicas</h1>
          <p className="text-gray-500">Gestiona todas las clínicas de la plataforma</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, slug o email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Table */}
      {!isLoading && data && (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clínica
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuarios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pacientes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creada
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.tenants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron clínicas
                    </td>
                  </tr>
                ) : (
                  data.tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{tenant.name}</p>
                            <p className="text-sm text-gray-500">{tenant.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tenant.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3" />
                            Suspendido
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {tenant._count.users}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {tenant._count.patients}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {tenant.subscription?.plan?.displayName || 'Sin plan'}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(tenant.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === tenant.id ? null : tenant.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            disabled={actionLoading === tenant.id}
                          >
                            {actionLoading === tenant.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          
                          {openMenu === tenant.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                              <Link
                                to={`/admin/tenants/${tenant.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Eye className="h-4 w-4" />
                                Ver detalles
                              </Link>
                              <button
                                onClick={() => handleToggleStatus(tenant)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Power className="h-4 w-4" />
                                {tenant.isActive ? 'Suspender' : 'Activar'}
                              </button>
                              <button
                                onClick={() => handleDelete(tenant)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Mostrando {(page - 1) * 10 + 1} a {Math.min(page * 10, data.pagination.total)} de {data.pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-sm">
                  Página {page} de {data.pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminTenantsPage
