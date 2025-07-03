import { Student, Class, Schedule, Attendance, FinanceRecord, Asset, Notification, Staff, Classroom, GradePeriod, GradeColumn, Grade, Subject } from '../types';

// Database interface
export interface Database {
  students: Student[];
  classes: Class[];
  classrooms: Classroom[];
  schedules: Schedule[];
  attendance: Attendance[];
  finances: FinanceRecord[];
  assets: Asset[];
  notifications: Notification[];
  staff: Staff[];
  gradePeriods: GradePeriod[];
  gradeColumns: GradeColumn[];
  grades: Grade[];
  subjects: Subject[];
  lastUpdated: string;
  version: string; // Thêm version để track changes
}

// Default data
const createInitialSchedules = () => {
  const today = new Date();
  const schedules: Schedule[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    if (i === 1 || i === 3 || i === 5) {
      schedules.push({
        id: `SCH${String(schedules.length + 1).padStart(3, '0')}`,
        classId: 'CL001',
        teacherId: '3',
        classroomId: 'CR001',
        subjectId: 'SUB001',
        date: dateStr,
        timeSlot: 'morning',
        startTime: '08:00',
        endTime: '10:00',
        status: 'scheduled',
      });
      
      schedules.push({
        id: `SCH${String(schedules.length + 1).padStart(3, '0')}`,
        classId: 'CL002',
        teacherId: '3',
        classroomId: 'CR002',
        subjectId: 'SUB002',
        date: dateStr,
        timeSlot: 'afternoon',
        startTime: '14:00',
        endTime: '16:00',
        status: 'scheduled',
      });
    }
    
    if (i === 2 || i === 4) {
      schedules.push({
        id: `SCH${String(schedules.length + 1).padStart(3, '0')}`,
        classId: 'CL001',
        teacherId: '3',
        classroomId: 'CR001',
        subjectId: 'SUB001',
        date: dateStr,
        timeSlot: 'evening',
        startTime: '18:00',
        endTime: '20:00',
        status: 'scheduled',
      });
    }
  }
  
  return schedules;
};

export const defaultDatabase: Database = {
  version: '2.0.0', // Thêm version
  students: [
    {
      id: 'ST001',
      name: 'Nguyễn Văn An',
      birthDate: '2010-05-15',
      gender: 'male',
      parentName: 'Nguyễn Văn Bình',
      motherName: 'Trần Thị Hoa',
      parentPhone: '0901234567',
      parentIdCard: '001201012345',
      parentIdCard2: '001201012346',
      status: 'active',
      driveLink: 'https://drive.google.com/file/d/example1',
      classId: 'CL001',
      createdAt: '2024-01-15',
    },
    {
      id: 'ST002',
      name: 'Trần Thị Bình',
      birthDate: '2011-03-20',
      gender: 'female',
      parentName: 'Trần Văn Cường',
      motherName: 'Lê Thị Mai',
      parentPhone: '0902345678',
      parentIdCard: '001201023456',
      parentIdCard2: '001201023457',
      status: 'active',
      driveLink: 'https://drive.google.com/file/d/example2',
      classId: 'CL001',
      createdAt: '2024-01-16',
    },
    {
      id: 'ST003',
      name: 'Lê Minh Châu',
      birthDate: '2010-08-10',
      gender: 'female',
      parentName: 'Lê Văn Dũng',
      motherName: 'Nguyễn Thị Lan',
      parentPhone: '0903456789',
      parentIdCard: '001201034567',
      parentIdCard2: '001201034568',
      status: 'active',
      driveLink: 'https://drive.google.com/file/d/example3',
      classId: 'CL002',
      createdAt: '2024-01-17',
    },
    {
      id: 'ST004',
      name: 'Phạm Thị Dung',
      birthDate: '2011-01-25',
      gender: 'female',
      parentName: 'Phạm Văn Em',
      motherName: 'Hoàng Thị Hương',
      parentPhone: '0904567890',
      parentIdCard: '001201045678',
      parentIdCard2: '001201045679',
      status: 'active',
      driveLink: 'https://drive.google.com/file/d/example4',
      classId: 'CL001',
      createdAt: '2024-01-18',
    },
    {
      id: 'ST005',
      name: 'Hoàng Văn Giang',
      birthDate: '2010-12-05',
      gender: 'male',
      parentName: 'Hoàng Văn Tuấn',
      motherName: 'Trần Thị Hoa',
      parentPhone: '0905678901',
      parentIdCard: '001201056789',
      parentIdCard2: '001201056780',
      status: 'inactive',
      driveLink: 'https://drive.google.com/file/d/example5',
      classId: 'CL002',
      createdAt: '2024-01-19',
    },
  ],
  classes: [
    {
      id: 'CL001',
      name: 'Lớp Toán 6A',
      teacherId: '3',
      studentIds: ['ST001', 'ST002', 'ST004'],
      maxStudents: 30,
      subjectId: 'SUB001',
      createdAt: '2024-01-10',
    },
    {
      id: 'CL002',
      name: 'Lớp Văn 7B',
      teacherId: '3',
      studentIds: ['ST003', 'ST005'],
      maxStudents: 25,
      subjectId: 'SUB002',
      createdAt: '2024-01-11',
    },
  ],
  classrooms: [
    {
      id: 'CR001',
      name: 'Phòng A101',
      capacity: 30,
      location: 'Tầng 1, Tòa A',
      equipment: ['Máy chiếu', 'Bảng thông minh', 'Điều hòa', 'Micro'],
      status: 'available',
      description: 'Phòng học chính với đầy đủ thiết bị hiện đại',
      createdAt: '2024-01-01',
    },
    {
      id: 'CR002',
      name: 'Phòng B201',
      capacity: 25,
      location: 'Tầng 2, Tòa B',
      equipment: ['Máy chiếu', 'Bảng trắng', 'Điều hòa'],
      status: 'available',
      description: 'Phòng học nhỏ phù hợp cho lớp ít học sinh',
      createdAt: '2024-01-01',
    },
    {
      id: 'CR003',
      name: 'Phòng C301',
      capacity: 40,
      location: 'Tầng 3, Tòa C',
      equipment: ['Máy chiếu', 'Bảng thông minh', 'Điều hòa', 'Micro', 'Loa'],
      status: 'available',
      description: 'Phòng học lớn cho các buổi hội thảo',
      createdAt: '2024-01-01',
    },
    {
      id: 'CR004',
      name: 'Phòng Lab',
      capacity: 20,
      location: 'Tầng 1, Tòa A',
      equipment: ['Máy tính', 'Máy chiếu', 'Bảng thông minh', 'Điều hòa'],
      status: 'maintenance',
      description: 'Phòng thực hành máy tính',
      createdAt: '2024-01-01',
    },
  ],
  subjects: [
    {
      id: 'SUB001',
      name: 'Toán học',
      code: 'MATH',
      description: 'Môn học về toán học cơ bản',
      color: '#3B82F6',
      isActive: true,
      createdAt: '2024-01-01',
    },
    {
      id: 'SUB002',
      name: 'Ngữ văn',
      code: 'VIET',
      description: 'Môn học về ngữ văn và văn học',
      color: '#10B981',
      isActive: true,
      createdAt: '2024-01-01',
    },
    {
      id: 'SUB003',
      name: 'Tiếng Anh',
      code: 'ENG',
      description: 'Môn học ngoại ngữ tiếng Anh',
      color: '#F59E0B',
      isActive: true,
      createdAt: '2024-01-01',
    },
    {
      id: 'SUB004',
      name: 'Vật lý',
      code: 'PHY',
      description: 'Môn học về vật lý cơ bản',
      color: '#EF4444',
      isActive: true,
      createdAt: '2024-01-01',
    },
    {
      id: 'SUB005',
      name: 'Hóa học',
      code: 'CHEM',
      description: 'Môn học về hóa học cơ bản',
      color: '#8B5CF6',
      isActive: true,
      createdAt: '2024-01-01',
    },
  ],
  schedules: createInitialSchedules(),
  attendance: [
    {
      id: 'ATT001',
      scheduleId: 'SCH001',
      studentId: 'ST001',
      status: 'present',
      checkedAt: new Date().toISOString(),
    },
    {
      id: 'ATT002',
      scheduleId: 'SCH001',
      studentId: 'ST002',
      status: 'late',
      checkedAt: new Date().toISOString(),
    },
  ],
  finances: [
    {
      id: 'FIN001',
      type: 'income',
      amount: 5000000,
      description: 'Học phí tháng 1',
      category: 'Học phí',
      date: '2024-01-15',
      createdBy: '1',
    },
    {
      id: 'FIN002',
      type: 'expense',
      amount: 2000000,
      description: 'Lương giáo viên',
      category: 'Lương',
      date: '2024-01-20',
      createdBy: '1',
    },
  ],
  assets: [
    {
      id: 'AST001',
      name: 'Máy chiếu Epson',
      category: 'Thiết bị điện tử',
      quantity: 2,
      status: 'available',
      receivedDate: '2024-01-10',
      description: 'Máy chiếu cho phòng học',
    },
    {
      id: 'AST002',
      name: 'Bàn ghế học sinh',
      category: 'Nội thất',
      quantity: 30,
      status: 'distributed',
      assignedTo: 'STF001',
      receivedDate: '2024-01-05',
      description: 'Bộ bàn ghế cho lớp học',
    },
  ],
  notifications: [
    {
      id: 'NOT001',
      title: 'Thông báo lịch học tuần mới',
      message: 'Lịch học tuần này đã được cập nhật. Vui lòng kiểm tra lịch dạy của bạn.',
      type: 'info',
      recipients: 'all',
      createdAt: '2024-01-20',
      createdBy: '1',
    },
    {
      id: 'NOT002',
      title: 'Cập nhật quy định mới',
      message: 'Vui lòng đọc kỹ quy định mới về giờ giấc và trang phục',
      type: 'warning',
      recipients: 'teachers',
      createdAt: '2024-01-18',
      createdBy: '1',
    },
  ],
  staff: [
    {
      id: 'STF001',
      name: 'Nguyễn Thị Lan',
      email: 'lan.nguyen@school.com',
      phone: '0912345678',
      role: 'teacher',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      salary: 8000000,
      startDate: '2023-09-01',
      createdAt: '2023-09-01',
    },
    {
      id: 'STF002',
      name: 'Trần Văn Minh',
      email: 'minh.tran@school.com',
      phone: '0923456789',
      role: 'manager',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      salary: 12000000,
      startDate: '2023-08-15',
      createdAt: '2023-08-15',
    },
  ],
  gradePeriods: [
    {
      id: 'GP001',
      name: 'Học kỳ 1 năm 2024',
      description: 'Học kỳ đầu tiên của năm học 2024',
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      isActive: true,
      createdAt: '2024-01-01',
    },
    {
      id: 'GP002',
      name: 'Học kỳ 2 năm 2024',
      description: 'Học kỳ thứ hai của năm học 2024',
      startDate: '2024-07-01',
      endDate: '2024-12-31',
      isActive: false,
      createdAt: '2024-01-01',
    },
  ],
  gradeColumns: [
    {
      id: 'GC001',
      name: 'Kiểm tra 15 phút lần 1',
      description: 'Kiểm tra định kỳ 15 phút',
      maxScore: 10,
      weight: 1,
      classId: 'CL001',
      teacherId: '3',
      gradePeriodId: 'GP001',
      createdAt: '2024-01-15',
    },
    {
      id: 'GC002',
      name: 'Kiểm tra giữa kỳ',
      description: 'Bài kiểm tra giữa học kỳ',
      maxScore: 10,
      weight: 2,
      classId: 'CL001',
      teacherId: '3',
      gradePeriodId: 'GP001',
      createdAt: '2024-01-15',
    },
  ],
  grades: [
    {
      id: 'GR001',
      gradeColumnId: 'GC001',
      studentId: 'ST001',
      score: 8.5,
      notes: 'Làm bài tốt',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20',
    },
    {
      id: 'GR002',
      gradeColumnId: 'GC001',
      studentId: 'ST002',
      score: 7.0,
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20',
    },
  ],
  lastUpdated: new Date().toISOString(),
};

// Database operations
class DatabaseManager {
  private static instance: DatabaseManager;
  private database: Database;
  private readonly STORAGE_KEY = 'classroom_database';
  private readonly CURRENT_VERSION = '2.0.0';

  private constructor() {
    this.database = this.loadDatabase();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private loadDatabase(): Database {
    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Check version compatibility
        if (parsed.version !== this.CURRENT_VERSION) {
          console.log('Database version mismatch, migrating...');
          return this.migrateDatabase(parsed);
        }
        
        // Validate the structure
        if (this.validateDatabase(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading database from localStorage:', error);
    }

    // If no valid data found, use default
    console.log('Using default database');
    return { ...defaultDatabase };
  }

  private migrateDatabase(oldData: any): Database {
    console.log('Migrating database to version', this.CURRENT_VERSION);
    
    // Start with default database structure
    const migratedData: Database = { ...defaultDatabase };
    
    // Migrate existing data if available and valid
    try {
      if (oldData.students && Array.isArray(oldData.students)) {
        migratedData.students = oldData.students;
      }
      
      if (oldData.classes && Array.isArray(oldData.classes)) {
        migratedData.classes = oldData.classes;
      }
      
      if (oldData.classrooms && Array.isArray(oldData.classrooms)) {
        migratedData.classrooms = oldData.classrooms;
      }
      
      if (oldData.schedules && Array.isArray(oldData.schedules)) {
        migratedData.schedules = oldData.schedules;
      }
      
      if (oldData.attendance && Array.isArray(oldData.attendance)) {
        migratedData.attendance = oldData.attendance;
      }
      
      if (oldData.finances && Array.isArray(oldData.finances)) {
        migratedData.finances = oldData.finances;
      }
      
      if (oldData.assets && Array.isArray(oldData.assets)) {
        migratedData.assets = oldData.assets;
      }
      
      if (oldData.notifications && Array.isArray(oldData.notifications)) {
        migratedData.notifications = oldData.notifications;
      }
      
      if (oldData.staff && Array.isArray(oldData.staff)) {
        migratedData.staff = oldData.staff;
      }
      
      if (oldData.subjects && Array.isArray(oldData.subjects)) {
        migratedData.subjects = oldData.subjects;
      }
      
      // New fields - use defaults if not present
      if (oldData.gradePeriods && Array.isArray(oldData.gradePeriods)) {
        migratedData.gradePeriods = oldData.gradePeriods;
      }
      
      if (oldData.gradeColumns && Array.isArray(oldData.gradeColumns)) {
        migratedData.gradeColumns = oldData.gradeColumns;
      }
      
      if (oldData.grades && Array.isArray(oldData.grades)) {
        migratedData.grades = oldData.grades;
      }
      
    } catch (error) {
      console.error('Error during migration:', error);
    }
    
    // Update version and timestamp
    migratedData.version = this.CURRENT_VERSION;
    migratedData.lastUpdated = new Date().toISOString();
    
    // Save migrated data
    this.saveDatabase(migratedData);
    
    return migratedData;
  }

  private validateDatabase(data: any): data is Database {
    const requiredFields = [
      'students', 'classes', 'classrooms', 'schedules', 
      'attendance', 'finances', 'assets', 'notifications', 
      'staff', 'gradePeriods', 'gradeColumns', 'grades', 
      'subjects', 'lastUpdated'
    ];
    
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // Check all required fields exist and are arrays
    for (const field of requiredFields) {
      if (field === 'lastUpdated') {
        if (!data[field] || typeof data[field] !== 'string') {
          return false;
        }
      } else {
        if (!Array.isArray(data[field])) {
          return false;
        }
      }
    }
    
    return true;
  }

  private saveDatabase(database?: Database): void {
    try {
      const dataToSave = database || this.database;
      dataToSave.lastUpdated = new Date().toISOString();
      dataToSave.version = this.CURRENT_VERSION;
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
      console.log('Database saved successfully');
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  // Clear localStorage and reset to defaults
  public clearAndReset(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.database = { ...defaultDatabase };
    this.saveDatabase();
    console.log('Database cleared and reset to defaults');
  }

  // Export database to JSON file
  public exportDatabase(): void {
    try {
      const dataStr = JSON.stringify(this.database, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `classroom_database_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      console.log('Database exported successfully');
    } catch (error) {
      console.error('Error exporting database:', error);
    }
  }

  // Import database from JSON file
  public importDatabase(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const imported = JSON.parse(content);
          
          if (this.validateDatabase(imported)) {
            // Migrate if necessary
            if (imported.version !== this.CURRENT_VERSION) {
              this.database = this.migrateDatabase(imported);
            } else {
              this.database = imported;
            }
            
            this.saveDatabase();
            console.log('Database imported successfully');
            resolve(true);
          } else {
            console.error('Invalid database format');
            reject(new Error('Invalid database format'));
          }
        } catch (error) {
          console.error('Error parsing imported file:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  }

  // Reset database to default
  public resetDatabase(): void {
    this.database = { ...defaultDatabase };
    this.saveDatabase();
    console.log('Database reset to default');
  }

  // Getters with safe defaults
  public getStudents(): Student[] {
    return [...(this.database.students || [])];
  }

  public getClasses(): Class[] {
    return [...(this.database.classes || [])];
  }

  public getClassrooms(): Classroom[] {
    return [...(this.database.classrooms || [])];
  }

  public getSchedules(): Schedule[] {
    return [...(this.database.schedules || [])];
  }

  public getAttendance(): Attendance[] {
    return [...(this.database.attendance || [])];
  }

  public getFinances(): FinanceRecord[] {
    return [...(this.database.finances || [])];
  }

  public getAssets(): Asset[] {
    return [...(this.database.assets || [])];
  }

  public getNotifications(): Notification[] {
    return [...(this.database.notifications || [])];
  }

  public getStaff(): Staff[] {
    return [...(this.database.staff || [])];
  }

  public getGradePeriods(): GradePeriod[] {
    return [...(this.database.gradePeriods || [])];
  }

  public getGradeColumns(): GradeColumn[] {
    return [...(this.database.gradeColumns || [])];
  }

  public getGrades(): Grade[] {
    return [...(this.database.grades || [])];
  }

  public getSubjects(): Subject[] {
    return [...(this.database.subjects || [])];
  }

  // Setters with validation
  public setStudents(students: Student[]): void {
    this.database.students = [...students];
    this.saveDatabase();
  }

  public setClasses(classes: Class[]): void {
    this.database.classes = [...classes];
    this.saveDatabase();
  }

  public setClassrooms(classrooms: Classroom[]): void {
    this.database.classrooms = [...classrooms];
    this.saveDatabase();
  }

  public setSchedules(schedules: Schedule[]): void {
    this.database.schedules = [...schedules];
    this.saveDatabase();
  }

  public setAttendance(attendance: Attendance[]): void {
    this.database.attendance = [...attendance];
    this.saveDatabase();
  }

  public setFinances(finances: FinanceRecord[]): void {
    this.database.finances = [...finances];
    this.saveDatabase();
  }

  public setAssets(assets: Asset[]): void {
    this.database.assets = [...assets];
    this.saveDatabase();
  }

  public setNotifications(notifications: Notification[]): void {
    this.database.notifications = [...notifications];
    this.saveDatabase();
  }

  public setStaff(staff: Staff[]): void {
    this.database.staff = [...staff];
    this.saveDatabase();
  }

  public setGradePeriods(gradePeriods: GradePeriod[]): void {
    this.database.gradePeriods = [...gradePeriods];
    this.saveDatabase();
  }

  public setGradeColumns(gradeColumns: GradeColumn[]): void {
    this.database.gradeColumns = [...gradeColumns];
    this.saveDatabase();
  }

  public setGrades(grades: Grade[]): void {
    this.database.grades = [...grades];
    this.saveDatabase();
  }

  public setSubjects(subjects: Subject[]): void {
    this.database.subjects = [...subjects];
    this.saveDatabase();
  }

  // Get database info
  public getDatabaseInfo() {
    return {
      version: this.database.version || this.CURRENT_VERSION,
      lastUpdated: this.database.lastUpdated,
      totalStudents: (this.database.students || []).length,
      totalClasses: (this.database.classes || []).length,
      totalClassrooms: (this.database.classrooms || []).length,
      totalSchedules: (this.database.schedules || []).length,
      totalAttendance: (this.database.attendance || []).length,
      totalFinances: (this.database.finances || []).length,
      totalAssets: (this.database.assets || []).length,
      totalNotifications: (this.database.notifications || []).length,
      totalStaff: (this.database.staff || []).length,
      totalGradePeriods: (this.database.gradePeriods || []).length,
      totalGradeColumns: (this.database.gradeColumns || []).length,
      totalGrades: (this.database.grades || []).length,
      totalSubjects: (this.database.subjects || []).length,
    };
  }
}

export default DatabaseManager;