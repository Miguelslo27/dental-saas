# In Progress

Active tasks for the current development cycle. Add tasks here before starting work.

## Gateway Timeout Fix — DEPLOYED

- [ ] Deploy and verify fix resolves the intermittent timeouts
- [ ] If timeouts persist: implement secondary fixes (health check, eager Prisma init, graceful shutdown)

## Rediseño de la Ficha del Paciente

- [ ] Probar en desktop, tablet y mobile

---

## Épica: Vista de Citas en la Ficha del Paciente

Sección colapsable de citas debajo del encabezado del paciente, con citas futuras visibles por defecto, filtros para citas pasadas, y layout horizontal tipo fila.

```
┌─────────────────────────────────────────────────────────────┐
│  Header (nombre, contacto, acciones)                        │
├─────────────────────────────────────────────────────────────┤
│  ▼ Citas (3 próximas)                    [Filtros] [+ Cita] │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │ 10 Mar   │ │ 15 Mar   │ │ 22 Mar   │  ← scroll horiz.  │
│  │ 09:30-10 │ │ 14:00-15 │ │ 11:00-12 │                    │
│  │ Limpieza │ │ Control  │ │ Extrac.  │                    │
│  │ Dr. López│ │ Dr. Ruiz │ │ Dr. López│                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
├──────────────────────┬──────────────────────────────────────┤
│  Sidebar             │  Odontograma + dientes               │
│  (imágenes, pagos)   │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

### HU1: Sección colapsable de citas

**Como** usuario de la clínica, **quiero** ver las próximas citas de un paciente directamente en su ficha, **para** tener contexto inmediato sin navegar a otra página.

#### Tareas

- [ ] **T1.1: Componente `PatientAppointmentsSection`**
  - [ ] Crear componente en `pages/patients/PatientAppointmentsSection.tsx`
  - [ ] Props: `patientId`, `onNewAppointment`
  - [ ] Estado colapsable con `useState` (inicia cerrado)
  - [ ] Persistir estado collapse en `localStorage` (`patient-appointments-collapsed`)
  - [ ] Animación de colapso suave (height transition o similar)

- [ ] **T1.2: Header de la sección (siempre visible)**
  - [ ] Título "Citas" con ícono `CalendarDays` + contador de próximas citas entre paréntesis
  - [ ] Botón toggle colapsar/expandir (ChevronDown/ChevronUp)
  - [ ] Botón "Nueva Cita" (`CalendarPlus` icon) — visible siempre, aún colapsado
  - [ ] Botón "Filtros" (`Filter` icon) — visible solo cuando expandido
  - [ ] Permisos: botón "Nueva Cita" solo visible con `APPOINTMENTS_CREATE`

- [ ] **T1.3: Integrar sección en `PatientDetailPage`**
  - [ ] Ubicar debajo del header card, arriba del layout 2 columnas
  - [ ] Full width (mismos márgenes que el header card)
  - [ ] Mover botón "Nueva Cita" del header a esta sección (eliminar el actual)
  - [ ] Conectar `onNewAppointment` al `setIsAppointmentFormOpen(true)` existente

### HU2: Carga y visualización de citas

**Como** usuario, **quiero** ver las citas del paciente en tarjetas horizontales, **para** escanear rápidamente la agenda del paciente.

#### Tareas

- [ ] **T2.1: Fetch de citas del paciente**
  - [ ] Usar endpoint existente `GET /appointments/by-patient/:patientId`
  - [ ] Llamar `getAppointmentsByPatient(patientId)` de `appointment-api.ts`
  - [ ] Estado local: `appointments`, `isLoading`, `error`
  - [ ] Fetch al montar y al crear/editar/eliminar una cita (refresh)

- [ ] **T2.2: Tarjeta compacta de cita (`PatientAppointmentCard`)**
  - [ ] Crear componente en `components/appointments/PatientAppointmentCard.tsx`
  - [ ] Diseño compacto (ancho fijo ~200px, vertical):
    - Fecha (día + mes, texto grande)
    - Hora inicio-fin
    - Status badge (mismo estilo que `AppointmentCard`: pill con colores por estado)
    - Tipo de cita (si existe)
    - Nombre del doctor
    - Costo (si existe, con indicador pagado/pendiente)
  - [ ] Menú de acciones (MoreVertical): Editar, Marcar completada, Cancelar, Descargar PDF
  - [ ] Estilos diferenciados para citas pasadas (opacity reducida, borde gris)

- [ ] **T2.3: Layout horizontal con scroll**
  - [ ] Contenedor flex con `overflow-x-auto` y scroll horizontal suave
  - [ ] Gap consistente entre tarjetas (`gap-3`)
  - [ ] Scrollbar sutil (estilizado con Tailwind `scrollbar-thin` o CSS custom)
  - [ ] Estado vacío: mensaje "No hay citas próximas" con botón para crear una

- [ ] **T2.4: Ordenamiento por defecto**
  - [ ] Mostrar solo citas futuras (status != CANCELLED, startTime >= hoy)
  - [ ] Ordenar por fecha ascendente (la más próxima primero)
  - [ ] Incluir citas de hoy

### HU3: Filtros de citas

**Como** usuario, **quiero** filtrar las citas por fecha y ver citas pasadas, **para** revisar el historial de atención del paciente.

#### Tareas

- [ ] **T3.1: Panel de filtros colapsable**
  - [ ] Toggle con botón "Filtros" en el header de la sección
  - [ ] Panel aparece entre header y tarjetas (no modal)
  - [ ] Animación suave de apertura

- [ ] **T3.2: Filtro de período**
  - [ ] Toggle "Próximas" / "Pasadas" / "Todas" (botones segmentados o tabs)
  - [ ] Default: "Próximas"
  - [ ] Al seleccionar "Pasadas", ordenar desc (más reciente primero)

- [ ] **T3.3: Filtro por rango de fechas**
  - [ ] Inputs "Desde" y "Hasta" (type="date")
  - [ ] Opcional: limpiar filtros con link "Limpiar"
  - [ ] Aplicar filtro client-side sobre las citas cargadas

- [ ] **T3.4: Filtro por estado**
  - [ ] Dropdown con estados: Programada, Confirmada, En Progreso, Completada, Cancelada, No Asistió
  - [ ] Default: Todos (excepto Cancelada en vista "Próximas")

### HU4: Acciones sobre citas

**Como** usuario con permisos, **quiero** gestionar citas directamente desde la ficha del paciente, **para** no tener que navegar a la página de citas.

#### Tareas

- [ ] **T4.1: Editar cita**
  - [ ] Abrir `AppointmentFormModal` en modo edición (pasando appointment existente)
  - [ ] Refresh de la lista al guardar

- [ ] **T4.2: Marcar completada**
  - [ ] Llamar `markAppointmentDone(id)` con confirmación
  - [ ] Refresh de la lista y mostrar toast de éxito

- [ ] **T4.3: Cancelar cita**
  - [ ] Diálogo de confirmación (reusar patrón existente)
  - [ ] Llamar `deleteAppointment(id)` (soft delete)
  - [ ] Refresh de la lista

- [ ] **T4.4: Descargar PDF**
  - [ ] Llamar `downloadAppointmentPdf(id)` existente
  - [ ] Permisos: solo visible con `APPOINTMENTS_UPDATE` / `APPOINTMENTS_DELETE` según acción

### HU5: i18n y tests

**Como** desarrollador, **quiero** que la sección esté internacionalizada y testeada, **para** mantener la calidad del proyecto.

#### Tareas

- [ ] **T5.1: Claves i18n**
  - [ ] Agregar claves bajo `patients.appointments.*` en ES, EN, AR
  - [ ] Claves: `sectionTitle`, `upcoming`, `past`, `all`, `noUpcoming`, `noPast`, `filters`, `dateFrom`, `dateTo`, `clearFilters`

- [ ] **T5.2: Tests del componente**
  - [ ] Test: renderiza sección colapsada por defecto
  - [ ] Test: expande/colapsa al hacer click
  - [ ] Test: muestra citas futuras ordenadas
  - [ ] Test: botón "Nueva Cita" visible con permiso, oculto sin él
  - [ ] Test: filtros cambian las citas mostradas
  - [ ] Test: acciones (editar, completar, cancelar) llaman las funciones correctas
  - [ ] Test: estado vacío muestra mensaje correcto

### Notas técnicas

- **Endpoint existente:** `GET /appointments/by-patient/:patientId?limit=50&includeInactive=false` — no requiere cambios en backend
- **Componentes reutilizables:** `AppointmentFormModal` (ya soporta `defaultPatientId`), helpers de `appointment-api.ts` (`getStatusBadgeClasses`, `formatTimeRange`, etc.)
- **Mover botón "Nueva Cita":** Eliminar del header del paciente (línea ~533) y colocarlo en el header de la nueva sección
- **PRs sugeridos:** T1+T2 juntos (estructura + visualización), T3 separado (filtros), T4 junto con T2 si es simple, T5 al final

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
