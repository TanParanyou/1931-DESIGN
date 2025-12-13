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
