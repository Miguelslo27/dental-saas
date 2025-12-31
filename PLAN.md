# Super Admin Panel - Plan de Desarrollo

## Fase Actual: PR #14 - Super Admin Frontend Panel

### Objetivos
Panel de administración para gestionar la plataforma SaaS a nivel global:
- Setup inicial del super administrador
- Login separado del flujo de tenants
- Dashboard con estadísticas de la plataforma
- Gestión de tenants (crear, suspender, eliminar)
- Gestión de usuarios (ver, suspender, reset password)

### Microtareas

- [x] Crear admin store (Zustand) para autenticación
- [x] Crear servicio API para endpoints de admin
- [x] Crear AdminLayout con navegación
- [x] Crear página /admin/setup
- [x] Crear página /admin/login
- [x] Crear página /admin/dashboard
- [x] Crear página /admin/tenants
- [x] Crear página /admin/users
- [x] Integrar rutas en App.tsx
- [ ] Verificar compilación y crear commit
- [ ] Push y crear PR #14

---

## Mejoras Futuras / Backlog

### De PR #13 (Super Admin Backend)
1. **Operaciones bulk más seguras** - Optimizar eliminación de tenants con muchos registros
2. **Mejorar manejo de errores en cascada** - Capturar errores específicos de cada operación
3. **Índices de base de datos** - Agregar índices en queries frecuentes
4. **Logging de auditoría** - Registrar todas las acciones administrativas
5. **Soft delete para tenants** - En lugar de borrar, marcar como eliminados
6. **Exportar datos de tenant** - Funcionalidad de backup antes de eliminar
7. **Dashboard con métricas en tiempo real** - WebSocket para actualizaciones live
8. **Paginación del lado servidor** - Para listados grandes de usuarios/tenants
9. **Filtros avanzados** - Por fecha de creación, tipo de plan, etc.
10. **Tests E2E para panel admin** - Cubrir flujos críticos con Playwright

### Pendientes Generales
- Implementar refresh token automático
- Agregar confirmación de email para super admin
- Implementar 2FA para super admin
- Agregar dark mode toggle en panel admin
