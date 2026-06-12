# Control de Gastos

Aplicación web de gestión financiera personal desarrollada con React y Vite. Permite registrar transacciones (ingresos, egresos y transferencias), visualizar reportes gráficos y detallados, y administrar cuentas, etiquetas y límites de gasto. Los datos se almacenan localmente en el navegador mediante IndexedDB e incluyen funcionalidad de copia de seguridad.

## Características principales

- **Registro de transacciones**: Alta, edición y eliminación de entradas, salidas y transferencias entre cuentas.
- **Filtrado avanzado**: Filtros por cuenta y rango de fechas en el listado mensual.
- **Reportes interactivos**: Visualización por cuenta, por etiqueta y gráficos dinámicos (torta, barras y líneas) con navegación por swipe y parámetros de mes en la URL.
- **Configuración completa**: Gestión de cuentas, etiquetas (con colores y tipo entrada/salida) y límites mensuales de gasto.
- **Respaldo de datos**: Exportación e importación de archivos `.dat` con codificación propia.
- **Tema oscuro/claro**: Cambio de tema global.
- **Navegación táctil**: Soporte de gestos swipe en las pantallas de transacciones y reportes.
- **PWA ready**: Configurado con `vite-plugin-pwa` para instalación como aplicación de escritorio.

## Stack tecnológico

| Herramienta        | Uso                               |
| ------------------ | --------------------------------- |
| React 18.3         | Librería UI                       |
| Vite 6.3           | Build tool y dev server           |
| React Router 7.13  | Enrutamiento                      |
| Tailwind CSS 4.1   | Estilos utility-first             |
| MUI 7.3 / Radix UI | Componentes accesibles            |
| Recharts 2.15      | Gráficos                          |
| date-fns 3.6       | Formateo y manipulación de fechas |
| IndexedDB (idb)    | Persistencia local                |
| Lucide React       | Iconografía                       |
| Motion 12          | Animaciones                       |
| Sonner             | Notificaciones toast              |

## Estructura del proyecto

```
src/
  app/
    components/
      Layout.tsx
      Summary.tsx
      TransactionTable.tsx
      BottomSheet.tsx
      SwipeableContainer/       (en src/components/)
      ui/                      ( componentes base: Button, Card, Table, etc. )
    context/
      DataProvider.tsx
      ThemeContext.tsx
      types.ts
      hooks/
      initialState.ts
    pages/
      AddTransaction.tsx
      EditTransaction.tsx
      TransactionsList.tsx
      Reports.tsx
      ReportByAccount.tsx
      ReportCharts.tsx
      ConfigurationsManager.tsx
    routes.ts
  services/
    db/                       ( repositorios IndexedDB )
  index.ts
```

## Rutas

| Ruta                  | Componente              | Descripción                                          |
| --------------------- | ----------------------- | ---------------------------------------------------- |
| `/`                   | `TransactionsList`      | Listado mensual de transacciones con resumen         |
| `/add`                | `AddTransaction`        | Formulario de nueva transacción                      |
| `/edit/:id`           | `EditTransaction`       | Edición o eliminación de transacción                 |
| `/reports`            | `Reports`               | Menú de reportes                                     |
| `/reports/by-account` | `ReportByAccount`       | Reporte detallado por cuenta                         |
| `/reports/charts`     | `ReportCharts`          | Gráficos interactivos                                |
| `/accounts`           | `ConfigurationsManager` | Configuración de cuentas, etiquetas, límites y datos |

## Instalación y desarrollo

```bash
# Instalar dependencias
pnpm install

# Servidor de desarrollo (localhost)
pnpm dev

# Servidor de desarrollo en red
pnpm dev:network

# Build de producción
pnpm build

# Preview del build
pnpm preview
```

## Datos iniciales

Al abrir la app por primera vez se ejecuta un seed con cuentas, etiquetas y transacciones de ejemplo para facilitar la demostración. Toda la información se guarda en IndexedDB del navegador.
