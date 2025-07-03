# Classroom Management System

A comprehensive classroom management system built with React, TypeScript, and Supabase.

## Features

- **Student Management**: Track student information, enrollment, and academic progress
- **Class Management**: Organize classes, assign teachers, and manage student rosters
- **Schedule Management**: Create and manage teaching schedules with classroom assignments
- **Attendance Tracking**: Record and monitor student attendance
- **Grade Management**: Create grading periods, columns, and track student grades
- **Financial Management**: Track income and expenses
- **Asset Management**: Manage school assets and equipment
- **User Management**: Handle different user roles (admin, manager, teacher)
- **Notifications**: Send announcements and notifications
- **Reports**: Generate various reports and analytics

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, real-time subscriptions)
- **Icons**: Lucide React
- **Build Tool**: Vite

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd classroom-management-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the migration script from `supabase/migrations/001_initial_schema.sql`

### 5. Start the development server

```bash
npm run dev
```

## Default Login Credentials

- **Admin**: admin@school.com / password
- **Manager**: manager@school.com / password  
- **Teacher**: teacher@school.com / password

## Project Structure

```
src/
├── components/          # React components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and services
├── types/              # TypeScript type definitions
└── main.tsx           # Application entry point
```

## Key Features

### User Roles

- **Admin**: Full system access, user management, financial data
- **Manager**: Student and class management, scheduling, reports
- **Teacher**: Attendance tracking, grade entry for assigned classes

### Data Management

- **Real-time sync**: All data is synchronized in real-time across devices
- **Offline support**: Basic functionality available when offline
- **Data export/import**: Backup and restore system data
- **Database management**: Admin tools for data maintenance

### Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Secure API endpoints through Supabase

## Development

### Adding New Features

1. Create new components in `src/components/`
2. Add type definitions in `src/types/`
3. Create service functions in `src/lib/supabaseService.ts`
4. Update context providers as needed

### Database Changes

1. Create new migration files in `supabase/migrations/`
2. Update TypeScript types in `src/types/`
3. Update service functions to handle new data structures

## Deployment

The application can be deployed to any static hosting service:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Ensure environment variables are set in your hosting platform

## Support

For issues and questions, please refer to the documentation or create an issue in the repository.