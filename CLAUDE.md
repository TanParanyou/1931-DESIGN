# 1931-DESIGN Project Guidelines

## โครงสร้างโปรเจค

```
1931-DESIGN/
├── frontend/          # Next.js Application (Client & Admin)
│   └── src/
│       ├── app/       # App Router (Client & Admin pages)
│       ├── components/ # React Components
│       ├── config/    # Configuration files
│       ├── constants/ # Constants
│       ├── context/   # React Context
│       ├── hooks/     # Custom Hooks
│       ├── lib/       # Utility libraries
│       ├── services/  # API Services
│       └── types/     # TypeScript Types
│
└── backend/           # Go Fiber Application (API)
    ├── cmd/           # Application entry points
    ├── config/        # Configuration
    ├── docs/          # API Documentation (Swagger)
    ├── internal/      # Internal packages
    └── pkg/           # Public packages
```

## Technology Stack

### Frontend

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: CSS / Tailwind CSS
- **State Management**: React Context

### Backend

- **Framework**: Go Fiber
- **Database**: PostgreSQL
- **Storage**: Cloudflare R2 (สำหรับเก็บรูปภาพ)
- **ORM**: sqlx

## คำสั่งที่ใช้งานบ่อย

### Frontend

```bash
cd frontend
npm install          # ติดตั้ง dependencies
npm run dev          # รัน development server
npm run build        # Build production
npm run lint         # ตรวจสอบ code
```

### Backend

```bash
cd backend
go mod tidy          # จัดการ dependencies
go run cmd/app/main.go   # รัน server
```

## ขอบเขตการทำงาน

### ✅ สิ่งที่ควรทำ

- เขียนโค้ดเป็นภาษาอังกฤษ (variable names, functions, comments)
- ใช้ TypeScript อย่างเคร่งครัด ไม่ใช้ `any` type
- แยก components ให้เป็น reusable
- ใช้ services layer สำหรับ API calls
- Handle errors อย่างเหมาะสม
- เขียน code ที่ clean และอ่านง่าย

### ❌ สิ่งที่ไม่ควรทำ

- ไม่แก้ไขไฟล์ `.env` โดยไม่ได้รับอนุญาต
- ไม่ลบไฟล์โดยไม่ถามก่อน
- ไม่ใช้ `any` type ใน TypeScript
- ไม่ hardcode sensitive data

## UI Components ที่ต้องใช้

### Loading Component

เมื่อต้องแสดง loading state ให้ใช้ `Loading` component จาก `@/components/ui/Loading`

```tsx
import { Loading, PageLoading, Skeleton, TableSkeleton, CardSkeleton } from '@/components/ui/Loading';

// Loading variants: 'spinner' | 'dots' | 'pulse' | 'bars' | 'gradient' | 'orbit'
// Sizes: 'sm' | 'md' | 'lg' | 'xl'

<Loading variant="orbit" size="lg" text="กำลังโหลด..." />
<Loading variant="spinner" />
<Loading variant="dots" size="sm" />
<PageLoading text="กำลังโหลดข้อมูล..." />

// Skeleton loading
<TableSkeleton rows={5} columns={4} />
<CardSkeleton />
<Skeleton className="h-10 w-full" rounded="lg" />
```

**ห้ามใช้** `Loader2` จาก lucide-react โดยตรง ให้ใช้ Loading component แทน

### DataTable Component

สำหรับแสดงตารางข้อมูลให้ใช้ `DataTable` component จาก `@/components/ui/DataTable`

```tsx
import { DataTable, Column } from "@/components/ui/DataTable";
import { useDataTable } from "@/hooks/useDataTable";

// กำหนด columns
const columns: Column<MyType>[] = [
  { header: "Name", accessorKey: "name", sortable: true },
  {
    header: "Status",
    accessorKey: "status",
    cell: (value) => <Badge>{value}</Badge>,
  },
  { header: "Actions", cell: (_, row) => <ActionButtons row={row} /> },
];

// ใช้กับ useDataTable hook
const { data, pagination, sort, onPageChange, onSort, isLoading } =
  useDataTable<MyType>({
    fetcher: fetchData,
    initialPagination: { limit: 10 },
  });

<DataTable
  columns={columns}
  data={data}
  pagination={pagination}
  sorting={sort}
  onPageChange={onPageChange}
  onSort={onSort}
  isLoading={isLoading} // จะแสดง Loading component อัตโนมัติ
  hidePagination={false} // ซ่อน pagination ถ้าไม่ต้องการ
/>;
```

### Modal Components

ชุด Modal components ครบวงจร (`Modal`, `ConfirmModal`, `AlertModal`, `FormModal`) พร้อม Hooks

```tsx
import { Modal, ConfirmModal, AlertModal, FormModal, useModal, useConfirm } from '@/components/ui/Modal';

// 1. Basic Modal
<Modal isOpen={isOpen} onClose={close} title="หัวข้อ" footer={<Button>OK</Button>}>
    Content...
</Modal>

// 2. Confirm Modal (ใช้ Hook)
const { confirm, ConfirmDialog } = useConfirm();
const handleDelete = async () => {
    if (await confirm({ title: 'ยืนยัน', message: 'ลบหรือไม่?', variant: 'danger' })) {
        // delete...
    }
};
// ใส่ <ConfirmDialog /> ใน JSX

// 3. Alert Modal
<AlertModal isOpen={isOpen} onClose={close} variant="success" title="สำเร็จ" message="บันทึกแล้ว" />

// 4. Form Modal
<FormModal isOpen={isOpen} onClose={close} onSubmit={save} title="แก้ไข" isLoading={saving}>
    <input ... />
</FormModal>
```

### Checkbox Component

สำหรับ checkbox / toggle ให้ใช้ `Checkbox` component จาก `@/components/ui/Checkbox`

```tsx
import { Checkbox } from "@/components/ui/Checkbox";

<Checkbox
  id="myCheckbox"
  checked={isChecked}
  onChange={(e) => setIsChecked(e.target.checked)}
  label="คำอธิบาย checkbox"
/>;
```

**ห้ามใช้** `<input type="checkbox">` โดยตรง ให้ใช้ Checkbox component แทน

### Select Component

สำหรับ dropdown ให้ใช้ `Select` component จาก `@/components/ui/Select`

```tsx
import { Select } from "@/components/ui/Select";

const options = [
  { value: "", label: "Select an option" },
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
];

<Select
  label="เลือกตัวเลือก"
  value={selectedValue}
  onChange={(e) => setSelectedValue(e.target.value)}
  options={options}
  placeholder="เลือก..."
/>;
```

**ห้ามใช้** `<select>` โดยตรง ให้ใช้ Select component แทน

## File Naming Conventions

- **Components**: PascalCase (e.g., `ProjectCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Services**: camelCase with `Service` suffix (e.g., `projectService.ts`)
- **Types**: PascalCase (e.g., `Project.ts`)
- **Go files**: snake_case (e.g., `project_handler.go`)

## API Endpoints

Base URL: `/api/v1`

- `/auth/*` - Authentication
- `/projects/*` - Projects CRUD
- `/categories/*` - Categories CRUD
- `/settings/*` - Site Settings
- `/menus/*` - Menu Management
- `/upload/*` - File Upload (R2)

## Deployment

- **Frontend**: Vercel
- **Backend**: Render (Docker)

## Notes

- ใช้ภาษาไทยในการสื่อสารกับผู้ใช้
- ถามก่อนทำการเปลี่ยนแปลงที่สำคัญ
- อธิบายสิ่งที่ทำให้ชัดเจน
- คอมเม้นโค้ดให้ชัดเจน เป็นภาษาไทย
- ไม่ลบไฟล์โดยไม่ถามก่อน
- ไม่ hardcode sensitive data
