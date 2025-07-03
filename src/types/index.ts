export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'teacher';
  avatar?: string;
  createdAt: string;
  password?: string; // Thêm trường password (chỉ dùng cho quản lý)
  isActive?: boolean; // Trạng thái hoạt động
  lastLogin?: string; // Lần đăng nhập cuối
  gender?: 'male' | 'female' | 'other'; // Giới tính người dùng
}

export interface Student {
  id: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other'; // Giới tính học sinh
  parentName: string; // Tên của ba
  motherName?: string; // Tên của mẹ
  parentPhone: string;
  parentIdCard?: string; // CCCD của phụ huynh
  parentIdCard2?: string; // CCCD của phụ huynh thứ 2
  status: 'active' | 'inactive'; // Tình trạng học sinh
  driveLink?: string;
  classId?: string;
  createdAt: string;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  studentIds: string[];
  maxStudents: number;
  subjectId?: string; // Thêm môn học cho lớp
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  location: string;
  equipment: string[];
  status: 'available' | 'occupied' | 'maintenance';
  description?: string;
  createdAt: string;
}

export interface Schedule {
  id: string;
  classId: string;
  teacherId: string;
  subjectId?: string; // Thêm môn học cho lịch dạy
  classroomId?: string; // Thêm phòng học
  date: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Attendance {
  id: string;
  scheduleId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late';
  checkedAt?: string;
}

export interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  createdBy: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  quantity: number;
  status: 'available' | 'distributed' | 'maintenance';
  assignedTo?: string;
  receivedDate: string;
  description?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  recipients: 'all' | 'teachers' | 'managers' | string[];
  createdAt: string;
  createdBy: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'teacher' | 'manager';
  address: string;
  salary: number;
  startDate: string;
  createdAt: string;
}

// New types for grading system
export interface GradePeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface GradeColumn {
  id: string;
  name: string;
  classId: string;
  teacherId: string;
  gradePeriodId?: string;
  maxScore: number;
  weight: number;
  description?: string;
  createdAt: string;
}

export interface Grade {
  id: string;
  gradeColumnId: string;
  studentId: string;
  score?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}