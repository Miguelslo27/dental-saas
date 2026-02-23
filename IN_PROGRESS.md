# In Progress

Active tasks for the current development cycle. Add tasks here before starting work.

## Gateway Timeout Fix — DEPLOYED

- [x] PR #152: Add `traefik.docker.network=coolify` to `api`, `web`, `app` (root cause fix)
- [x] PR #153: Show "session expired" message on auto-logout redirect
- [ ] Deploy and verify fix resolves the intermittent timeouts
- [ ] If timeouts persist: implement secondary fixes (health check, eager Prisma init, graceful shutdown)

## Create Appointments from Patient Detail — PR #156

- [x] Add `defaultPatientId` prop to `AppointmentFormModal` (pre-select + disable patient selector)
- [x] Add "Nueva Cita" button to `PatientDetailPage` (guarded by `APPOINTMENTS_CREATE` permission)

## Searchable Patient Combobox — PR #157 ✅

- [x] Extract shared `PatientSearchCombobox` to `components/ui/` (search from 1 char, arrow keys, Enter/click, Escape, click-outside)
- [x] Replace plain `<select>` in `AppointmentFormModal` with combobox
- [x] Replace inline `PatientSearch` in `LabworkFormModal` with shared combobox (~130 lines removed)

## Fix Date Locale Formatting — PR #158

- [x] Fix `formatTimeRange` and `formatAppointmentDate` in `appointment-api.ts` (use `i18n.language` instead of `undefined`)
- [x] Fix `formatDateHeader` in `AppointmentsPage.tsx`
- [x] Fix payment date display in `PaymentSection.tsx`
- [x] Update test mocks for `initReactI18next` and `i18n.language`
- [x] All 922 tests passing, build succeeds

## Rediseño de la Ficha del Paciente (upcoming)

**Problema:** Todo el contenido está apilado en una sola columna. El odontograma ocupa mucho espacio vertical, y para llegar a imágenes o entregas hay que hacer mucho scroll. La información no se distribuye de forma eficiente.

**Secciones actuales (orden vertical):**
1. Header (nombre, contacto, acciones)
2. Odontograma + sidebar de dientes registrados
3. Imágenes (upload + galería)
4. Entregas/Pagos (balance + listado)

### Propuesta A: Layout 2 columnas (Odontograma | Imágenes + Entregas)

```
┌─────────────────────────────────────────────────┐
│  Header (nombre, contacto, acciones)            │
├──────────────────────┬──────────────────────────┤
│  Odontograma         │  Imágenes                │
│  + leyenda           │  ──────────              │
│  + dientes           │  Entregas/Pagos          │
│    registrados       │  (balance + listado)     │
│                      │                          │
└──────────────────────┴──────────────────────────┘
```

- **Pros:** Simple de implementar, todo visible sin tanto scroll, el odontograma mantiene su tamaño completo en la columna izquierda
- **Contras:** En pantallas medianas (~1024px) las columnas pueden quedar apretadas, las imágenes tienen menos ancho disponible
- **Responsive:** Colapsa a 1 columna en mobile/tablet

### Propuesta B: Tabs (Odontograma | Imágenes | Entregas)

```
┌─────────────────────────────────────────────────┐
│  Header (nombre, contacto, acciones)            │
├─────────────────────────────────────────────────┤
│  [Odontograma]  [Imágenes]  [Entregas]          │
│  ───────────────────────────────────────        │
│  Contenido del tab activo                       │
│  (ocupa todo el ancho)                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

- **Pros:** Cada sección ocupa el 100% del ancho, interfaz limpia sin scroll, funciona bien en todas las resoluciones
- **Contras:** Solo se ve una sección a la vez (no se puede ver odontograma y entregas al mismo tiempo), requiere clicks extra para navegar entre secciones
- **Responsive:** Funciona perfecto en cualquier pantalla

### Propuesta C: Layout mixto — Odontograma compacto arriba + 2 columnas abajo (Recomendada)

```
┌─────────────────────────────────────────────────┐
│  Header (nombre, contacto, acciones)            │
├─────────────────────────────────────────────────┤
│  Odontograma (compacto, centrado)               │
│  + leyenda inline  + dientes registrados →      │
├──────────────────────┬──────────────────────────┤
│  Imágenes            │  Entregas/Pagos          │
│  (upload + galería)  │  (balance + listado)     │
│                      │                          │
└──────────────────────┴──────────────────────────┘
```

- **Pros:** El odontograma se mantiene como protagonista con ancho completo pero más compacto (dientes registrados como lista horizontal o colapsable), imágenes y entregas se muestran lado a lado sin scroll excesivo, mejor aprovechamiento del espacio
- **Contras:** Requiere más trabajo de maquetación, la zona del odontograma necesita rediseño para ser más compacta (leyenda inline, dientes como chips en vez de cards)
- **Responsive:** Colapsa: odontograma full width → imágenes full width → entregas full width

### Propuesta D: Layout 2 columnas con sidebar colapsable (Preferida por el usuario)

```
┌─────────────────────────────────────────────────┐
│  Header (nombre, contacto, acciones)            │
├──────────────────────┬──────────────────────────┤
│  Imágenes            │                          │
│  (upload + galería)  │  Odontograma             │
│  ──────────────────  │  + leyenda               │
│  Entregas/Pagos      │  + dientes registrados   │
│  (balance + listado) │                          │
│        [◀ colapsar]  │  (expande a full width   │
│                      │   cuando sidebar colapsa)│
└──────────────────────┴──────────────────────────┘
```

- **Pros:** Imágenes y entregas accesibles de inmediato sin scroll, la sidebar colapsable permite ver el odontograma a pantalla completa cuando se necesita, buena distribución del espacio
- **Contras:** Requiere implementar lógica de colapsar/expandir con animación, más complejo que A
- **Responsive:** Colapsa a 1 columna en mobile/tablet (sidebar se convierte en secciones apiladas)

**Recomendación técnica:** Propuesta C. Pero la **Propuesta D** es la preferida del usuario y ofrece la mejor experiencia interactiva.

### Tareas
- [x] PR #160: Layout 2 columnas con sidebar colapsable
- [x] PR #161: Fix tooltip en dientes temporales (transform en SVG, no en wrapper)
- [x] Compactar la sección del odontograma (leyenda compacta, dientes registrados como chips, breakpoint lg)
- [ ] Probar en desktop, tablet y mobile

---

## i18n Hardcoded Strings Migration (upcoming)

Migrate hardcoded Spanish strings to i18n keys, split by module:
- [ ] Appointments module
- [ ] Patients module
- [ ] Doctors module
- [ ] Labworks module
- [ ] Expenses module
- [ ] Dashboard module
- [ ] Settings module
- [ ] Auth module
- [ ] Admin module
- [ ] Layout/Nav module
