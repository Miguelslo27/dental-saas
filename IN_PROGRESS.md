# In Progress

Active tasks for the current development cycle. Add tasks here before starting work.

## Gateway Timeout Fix — DEPLOYED

- [ ] Deploy and verify fix resolves the intermittent timeouts
- [ ] If timeouts persist: implement secondary fixes (health check, eager Prisma init, graceful shutdown)

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

### Historia 3: API — Endpoint para consultas vinculables

**Como** frontend, **quiero** obtener la lista de consultas de un paciente que se pueden vincular a un labwork, **para** mostrarlas en el formulario.

- [ ] **3.1 Endpoint GET** `/patients/:id/appointments` ya existe — verificar que devuelve datos suficientes (id, date, type, cost, doctor)
- [ ] **3.2 Si es necesario**, agregar query param `?forLabworkLinking=true` para filtrar solo consultas activas con costo

### Historia 4: Frontend — Formulario de creación/edición de labwork

**Como** usuario de la clínica, **quiero** poder seleccionar una consulta vinculada al crear un trabajo de laboratorio, **para** indicar que el lab fue solicitado en esa consulta.

- [ ] **4.1 Agregar campo "Consulta vinculada"** al formulario de labwork:
  - Select/combobox opcional con consultas del paciente seleccionado
  - Se habilita solo después de seleccionar paciente
  - Muestra: fecha, tipo, doctor, costo de cada consulta
- [ ] **4.2 Agregar checkbox "Precio incluido en la consulta":**
  - Aparece solo cuando se selecciona una consulta vinculada
  - Al marcar, mostrar nota informativa: "El precio de este trabajo no se sumará a la deuda del paciente"
- [ ] **4.3 i18n:** Agregar claves de traducción (ES, EN, AR) para los nuevos campos y mensajes
- [ ] **4.4 Tests del formulario** con react-testing-library

### Historia 5: Frontend — Visualización de vinculación

**Como** usuario, **quiero** ver en la lista y detalle de labworks si está vinculado a una consulta, **para** tener contexto completo.

- [ ] **5.1 Mostrar badge/chip** "Incluido en consulta" en la lista de labworks cuando `priceIncludedInAppointment === true`
- [ ] **5.2 En detalle del labwork**, mostrar link a la consulta vinculada
- [ ] **5.3 En la sección de deuda del paciente**, reflejar correctamente que el labwork incluido no suma a la deuda
- [ ] **5.4 Tests de visualización**

### Plan de desarrollo (orden de ejecución)

1. **PR 1 — Modelo + Backend** (Historias 1 + 2): Migración Prisma, lógica de negocio, tests
2. **PR 2 — API + Frontend** (Historias 3 + 4 + 5): Endpoint, formulario, visualización, tests

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
