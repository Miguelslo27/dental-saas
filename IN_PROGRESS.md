# In Progress

Active tasks for the current development cycle. Add tasks here before starting work.

## Gateway Timeout Fix — ✅ RESOLVED

- [x] Deploy and verify fix resolves the intermittent timeouts
- [x] Confirmed: timeouts resolved in production

## Rediseño de la Ficha del Paciente

- [ ] Probar en desktop, tablet y mobile

---

## Epic: Vinculación Trabajo de Laboratorio ↔ Consulta (Precio Incluido)

**Problema:** Cuando se crea una consulta y un trabajo de laboratorio, ambos se suman por separado a la deuda del paciente. Pero en muchos casos el precio del trabajo de laboratorio ya está incluido en el precio de la consulta. No hay forma de indicar esto, causando doble cobro.

**Solución:** Permitir vincular un trabajo de laboratorio a una consulta existente del mismo paciente. Al vincular, preguntar si el precio del lab ya está incluido en la consulta. Si lo está, el precio del lab no suma a la deuda.

### Historia 1: Modelo de datos — Vincular labwork a appointment

**Como** administrador del sistema, **quiero** que un trabajo de laboratorio pueda estar vinculado a una consulta, **para** reflejar que el lab fue solicitado en esa consulta.

- [x] **1.1 Migración Prisma:** Agregar campos al modelo `Labwork`:
  - `appointmentId` (String?, FK → Appointment, opcional)
  - `priceIncludedInAppointment` (Boolean, default false)
  - Relación: `Labwork.appointment → Appointment` (opcional)
  - Relación inversa: `Appointment.labworks → Labwork[]`
- [x] **1.2 Generar migración y cliente Prisma**
- [x] **1.3 Tests de migración:** Verificar que la migración es reversible y no rompe datos existentes

### Historia 2: Backend — Lógica de negocio

**Como** sistema, **quiero** que cuando un labwork tiene `priceIncludedInAppointment = true`, su precio no se sume a la deuda, **para** evitar doble cobro.

- [x] **2.1 Actualizar `getPatientBalance()`** en `payment.service.ts`:
  - Excluir labworks con `priceIncludedInAppointment === true` del cálculo de `totalDebt`
- [x] **2.2 Actualizar `recalculatePaidStatus()`** en `payment.service.ts`:
  - Excluir labworks incluidos en consulta del pool FIFO (no deben consumir pagos)
  - Auto-marcar `isPaid = true` en labworks con precio incluido en consulta
- [x] **2.3 Actualizar servicio de labworks** (`labwork.service.ts`):
  - Validar que `appointmentId` pertenece al mismo paciente y tenant
  - Validar que `priceIncludedInAppointment` solo puede ser `true` si hay `appointmentId`
  - Permitir actualizar vinculación en update
- [x] **2.4 Actualizar Zod schemas** de validación para labwork create/update
- [x] **2.5 Tests unitarios** del servicio de labworks (crear con/sin vinculación)
- [x] **2.6 Tests unitarios** de `getPatientBalance()` con labwork incluido en consulta
- [x] **2.7 Tests unitarios** de `recalculatePaidStatus()` con labwork incluido
- [x] **2.8 Tests de integración** de las rutas de labwork con los nuevos campos

### Historia 3: API — Endpoint para consultas vinculables ✅

- [x] **3.1** `getAppointmentsByPatient()` ya existe y devuelve datos suficientes (id, date, type, cost, doctor)
- [x] **3.2** No fue necesario agregar query param adicional

### Historia 4: Frontend — Formulario de creación/edición de labwork ✅

- [x] **4.1** Selector de consulta vinculada en LabworkFormModal (aparece al seleccionar paciente)
- [x] **4.2** Checkbox "Precio incluido en la consulta" con nota informativa
- [x] **4.3** i18n: Claves ES, EN, AR agregadas
- [x] **4.4** Pre-selección de consulta al editar labwork existente

### Historia 5: Frontend — Visualización de vinculación ✅

- [x] **5.1** Badge "Incluido en consulta" en LabworkCard
- [x] **5.2** Deuda del paciente refleja correctamente labworks incluidos (backend ya lo maneja)

### Plan de desarrollo (completado)

1. **PR #166 — Modelo + Backend** (Historias 1 + 2) ✅ Merged
2. **PR #167 — API + Frontend** (Historias 3 + 4 + 5) ✅ Merged

### Bugfix adicional (incluido en PR #167)

- [x] Fix: interceptor axios redirigía a "session expired" en lugar de mostrar error de credenciales en login

---

---

## E2E Testing — Playwright ✅ COMPLETADO (46/46 tests)

Suite de pruebas end-to-end automatizadas con Playwright contra la app local.

**Ejecutar:** `cd apps/app && npx playwright test e2e/phase*.spec.ts`

### Fase 1: Auth & Navegación — 7/7 ✅ `phase1-auth-navigation.spec.ts`

- [x] **1.1** Registro de nueva clínica — crea tenant, auto-loguea, redirige a dashboard
- [x] **1.2** Login con credenciales válidas — redirect al dashboard con sidebar visible
- [x] **1.3** Login con credenciales inválidas — muestra error en rojo
- [x] **1.4** Forgot password — envía formulario, muestra feedback
- [x] **1.5** Protección de rutas — `/patients` sin auth redirige a `/login`
- [x] **1.6** Navegación sidebar — todos los 7 links funcionan correctamente
- [x] **1.7** Logout — cierra sesión, rutas protegidas redirigen a login

### Fase 2: Pacientes (CRUD) — 7/7 ✅ `phase2-patients.spec.ts`

- [x] **2.1** Crear paciente con todos los campos (nombre, email, teléfono, género)
- [x] **2.2** Buscar paciente + búsqueda sin resultados
- [x] **2.3** Ver detalle: datos, email, teléfono, odontograma
- [x] **2.4** Editar paciente: cambiar teléfono, verificar persistencia en detalle
- [x] **2.5** Odontograma: abrir ficha dental, verificar rendering
- [x] **2.6** Filtros: toggle "Mostrar inactivos"

### Fase 3: Doctores — 5/5 ✅ `phase3-doctors.spec.ts`

- [x] **3.1** Crear doctor con nombre, especialidad, email, teléfono
- [x] **3.2** Ver lista de doctores
- [x] **3.3** Editar doctor: cambiar especialidad
- [x] **3.4** Eliminar doctor con confirmación

### Fase 4: Citas — 6/6 ✅ `phase4-appointments.spec.ts`

- [x] **4.1** Crear cita: paciente, doctor, fecha, hora, tipo, costo
- [x] **4.2** Ver cita en calendario del día
- [x] **4.3** Navegación calendario: mes anterior/siguiente, botón "Hoy"
- [x] **4.4** Editar cita via menú "Más opciones"
- [x] **4.5** Filtros de citas

### Fase 5: Laboratorio — 5/5 ✅ `phase5-labworks.spec.ts`

- [x] **5.1** Crear labwork con paciente, laboratorio, fecha, precio
- [x] **5.2** Vincular labwork a cita existente del paciente
- [x] **5.3** Checkbox "precio incluido en consulta"
- [x] **5.4** Ver lista de labworks
- [x] **5.5** Editar labwork: marcar como entregado

### Fase 6: Gastos — 5/5 ✅ `phase6-expenses.spec.ts`

- [x] **6.1** Crear gasto con proveedor, fecha, monto, artículo
- [x] **6.2** Ver lista de gastos con stat cards
- [x] **6.3** Editar gasto: cambiar monto
- [x] **6.4** Eliminar gasto con confirmación

### Fase 7: Dashboard — 3/3 ✅ `phase7-9-dashboard-settings-crossmodule.spec.ts`

- [x] **7.1** Stats cards: pacientes activos, citas del mes, ingresos
- [x] **7.2** Gráficos: "Citas por Día" e "Ingresos por Mes" renderizan sin error
- [x] **7.3** Card de citas del mes visible

### Fase 8: Settings — 4/4 ✅

- [x] **8.1** Editar info de clínica: página carga correctamente
- [x] **8.2** Cambiar idioma a English: UI cambia completamente
- [x] **8.3** Volver a Español: heading "Configuración" visible
- [x] **8.4** Horario de atención: formulario de time inputs funcional

### Fase 9: Flujos cross-module — 3/3 ✅

- [x] **9.1** Flujo completo: paciente → cita → labwork vinculado
- [x] **9.2** Balance del paciente visible en página de detalle
- [x] **9.4** Responsive: dashboard renderiza en viewport mobile 375px

### Hallazgos

- **Registro** redirige directo al dashboard (no pasa por `/register/success`)
- **i18n** usa el idioma del navegador — Chromium headless default es inglés, todos los selectores son bilingual (ES/EN)
- **Login flaky** ocasional (~1/5 ejecuciones) por timing de API — se resuelve con retry

---

## Hotfix: Appointment Conflict Error Handling

- [x] Backend verified: `excludeAppointmentId` works correctly on update (no self-conflict bug)
- [x] Added backend tests: edit appointment without time change, edit to free time slot
- [x] Error banner displayed inside the modal (above form, below header)
- [x] PatientDetailPage: use `getAppointmentApiErrorMessage()` instead of raw axios message
- [x] AppointmentsPage: pass store error to modal, clear on open/close
- [x] Error messages use i18n keys with `getUserLanguage()` fallback to `'es'` (workaround for `LanguageDetector` using browser language instead of app preference)
- [x] i18n error keys added to ES, EN, AR (`appointments.errors.*`)
- [x] Frontend + backend tests updated

**Hallazgo:** `i18next-browser-languagedetector` detects browser language (`en-US`) instead of app preference. Workaround: `getUserLanguage()` reads `localStorage('language')` directly. Root fix tracked in i18n migration below.

---

## i18n Hardcoded Strings Migration (upcoming)

Migrate hardcoded Spanish strings to i18n keys, split by module:
- [ ] Appointments module (error messages done, form labels pending)
- [ ] Patients module
- [ ] Doctors module
- [ ] Labworks module
- [ ] Expenses module
- [ ] Dashboard module
- [ ] Settings module
- [ ] Auth module
- [ ] Admin module
- [ ] Layout/Nav module
