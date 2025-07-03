import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student, Class, Schedule, Attendance, FinanceRecord, Asset, Notification, Classroom, GradePeriod, GradeColumn, Grade, Subject } from '../types';
import { 
  studentsService, 
  classesService, 
  classroomsService, 
  schedulesService, 
  attendanceService,
  gradePeriodsService,
  gradeColumnsService,
  gradesService,
  subjectsService
} from '../lib/supabaseService';

interface DataContextType {
  students: Student[];
  classes: Class[];
  classrooms: Classroom[];
  schedules: Schedule[];
  attendance: Attendance[];
  finances: FinanceRecord[];
  assets: Asset[];
  notifications: Notification[];
  gradePeriods: GradePeriod[];
  gradeColumns: GradeColumn[];
  grades: Grade[];
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  
  // Student operations
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  
  // Class operations
  addClass: (classData: Omit<Class, 'id' | 'createdAt'>) => Promise<void>;
  updateClass: (id: string, classData: Partial<Class>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  
  // Classroom operations
  addClassroom: (classroom: Omit<Classroom, 'id' | 'createdAt'>) => Promise<void>;
  updateClassroom: (id: string, classroom: Partial<Classroom>) => Promise<void>;
  deleteClassroom: (id: string) => Promise<void>;
  
  // Subject operations
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => Promise<void>;
  updateSubject: (id: string, subject: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  
  // Schedule operations
  addSchedule: (schedule: Omit<Schedule, 'id'>) => Promise<void>;
  updateSchedule: (id: string, schedule: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  copyWeekSchedule: (fromWeekStart: string, toWeekStart: string) => Promise<void>;
  
  // Attendance operations
  addAttendance: (attendance: Omit<Attendance, 'id'>) => Promise<void>;
  updateAttendance: (id: string, attendance: Partial<Attendance>) => Promise<void>;
  deleteAttendance: (id: string) => Promise<void>;
  resetScheduleAttendance: (scheduleId: string) => Promise<void>;
  
  // Grade Period operations
  addGradePeriod: (period: Omit<GradePeriod, 'id' | 'createdAt'>) => Promise<void>;
  updateGradePeriod: (id: string, period: Partial<GradePeriod>) => Promise<void>;
  deleteGradePeriod: (id: string) => Promise<void>;
  
  // Grade Column operations
  addGradeColumn: (column: Omit<GradeColumn, 'id' | 'createdAt'>) => Promise<void>;
  updateGradeColumn: (id: string, column: Partial<GradeColumn>) => Promise<void>;
  deleteGradeColumn: (id: string) => Promise<void>;
  
  // Grade operations
  addGrade: (grade: Omit<Grade, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGrade: (id: string, grade: Partial<Grade>) => Promise<void>;
  deleteGrade: (id: string) => Promise<void>;
  upsertGrade: (grade: Omit<Grade, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  
  // Legacy operations (for compatibility)
  addFinance: (finance: Omit<FinanceRecord, 'id'>) => void;
  updateFinance: (id: string, finance: Partial<FinanceRecord>) => void;
  deleteFinance: (id: string) => void;
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  updateNotification: (id: string, notification: Partial<Notification>) => void;
  deleteNotification: (id: string) => void;
  exportDatabase: () => void;
  importDatabase: (file: File) => Promise<boolean>;
  resetDatabase: () => void;
  getDatabaseInfo: () => any;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [finances, setFinances] = useState<FinanceRecord[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [gradePeriods, setGradePeriods] = useState<GradePeriod[]>([]);
  const [gradeColumns, setGradeColumns] = useState<GradeColumn[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        studentsData,
        classesData,
        classroomsData,
        schedulesData,
        attendanceData,
        gradePeriodsData,
        gradeColumnsData,
        gradesData,
        subjectsData,
      ] = await Promise.all([
        studentsService.getAll(),
        classesService.getAll(),
        classroomsService.getAll(),
        schedulesService.getAll(),
        attendanceService.getAll(),
        gradePeriodsService.getAll(),
        gradeColumnsService.getAll(),
        gradesService.getAll(),
        subjectsService.getAll(),
      ]);

      setStudents(studentsData);
      setClasses(classesData);
      setClassrooms(classroomsData);
      setSchedules(schedulesData);
      setAttendance(attendanceData);
      setGradePeriods(gradePeriodsData);
      setGradeColumns(gradeColumnsData);
      setGrades(gradesData);
      setSubjects(subjectsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data from database');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadAllData();
  };

  // Student operations
  const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    try {
      const newStudent = await studentsService.create(studentData);
      setStudents(prev => [newStudent, ...prev]);
    } catch (err) {
      console.error('Error adding student:', err);
      throw err;
    }
  };

  const updateStudent = async (id: string, studentData: Partial<Student>) => {
    try {
      const updatedStudent = await studentsService.update(id, studentData);
      setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));
    } catch (err) {
      console.error('Error updating student:', err);
      throw err;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await studentsService.delete(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting student:', err);
      throw err;
    }
  };

  // Class operations
  const addClass = async (classData: Omit<Class, 'id' | 'createdAt'>) => {
    try {
      const newClass = await classesService.create(classData);
      setClasses(prev => [newClass, ...prev]);
    } catch (err) {
      console.error('Error adding class:', err);
      throw err;
    }
  };

  const updateClass = async (id: string, classData: Partial<Class>) => {
    try {
      const updatedClass = await classesService.update(id, classData);
      setClasses(prev => prev.map(c => c.id === id ? updatedClass : c));
    } catch (err) {
      console.error('Error updating class:', err);
      throw err;
    }
  };

  const deleteClass = async (id: string) => {
    try {
      await classesService.delete(id);
      setClasses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting class:', err);
      throw err;
    }
  };

  // Classroom operations
  const addClassroom = async (classroomData: Omit<Classroom, 'id' | 'createdAt'>) => {
    try {
      const newClassroom = await classroomsService.create(classroomData);
      setClassrooms(prev => [newClassroom, ...prev]);
    } catch (err) {
      console.error('Error adding classroom:', err);
      throw err;
    }
  };

  const updateClassroom = async (id: string, classroomData: Partial<Classroom>) => {
    try {
      const updatedClassroom = await classroomsService.update(id, classroomData);
      setClassrooms(prev => prev.map(c => c.id === id ? updatedClassroom : c));
    } catch (err) {
      console.error('Error updating classroom:', err);
      throw err;
    }
  };

  const deleteClassroom = async (id: string) => {
    try {
      await classroomsService.delete(id);
      setClassrooms(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting classroom:', err);
      throw err;
    }
  };

  // Subject operations
  const addSubject = async (subjectData: Omit<Subject, 'id' | 'createdAt'>) => {
    try {
      const newSubject = await subjectsService.create(subjectData);
      setSubjects(prev => [newSubject, ...prev]);
    } catch (err) {
      console.error('Error adding subject:', err);
      throw err;
    }
  };

  const updateSubject = async (id: string, subjectData: Partial<Subject>) => {
    try {
      const updatedSubject = await subjectsService.update(id, subjectData);
      setSubjects(prev => prev.map(s => s.id === id ? updatedSubject : s));
    } catch (err) {
      console.error('Error updating subject:', err);
      throw err;
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      await subjectsService.delete(id);
      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting subject:', err);
      throw err;
    }
  };

  // Schedule operations
  const addSchedule = async (scheduleData: Omit<Schedule, 'id'>) => {
    try {
      const newSchedule = await schedulesService.create(scheduleData);
      setSchedules(prev => [newSchedule, ...prev]);
    } catch (err) {
      console.error('Error adding schedule:', err);
      throw err;
    }
  };

  const updateSchedule = async (id: string, scheduleData: Partial<Schedule>) => {
    try {
      const updatedSchedule = await schedulesService.update(id, scheduleData);
      setSchedules(prev => prev.map(s => s.id === id ? updatedSchedule : s));
    } catch (err) {
      console.error('Error updating schedule:', err);
      throw err;
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      await schedulesService.delete(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
      // Also delete related attendance
      setAttendance(prev => prev.filter(a => a.scheduleId !== id));
    } catch (err) {
      console.error('Error deleting schedule:', err);
      throw err;
    }
  };

  const copyWeekSchedule = async (fromWeekStart: string, toWeekStart: string) => {
    try {
      const fromDate = new Date(fromWeekStart);
      const toDate = new Date(toWeekStart);
      const daysDiff = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const sourceWeekSchedules = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        const daysDiffFromStart = Math.floor((scheduleDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiffFromStart >= 0 && daysDiffFromStart < 7;
      });

      const newSchedules = await Promise.all(
        sourceWeekSchedules.map(async (schedule) => {
          const originalDate = new Date(schedule.date);
          const newDate = new Date(originalDate.getTime() + (daysDiff * 24 * 60 * 60 * 1000));
          
          const newScheduleData = {
            ...schedule,
            date: newDate.toISOString().split('T')[0],
            status: 'scheduled' as const,
          };
          
          delete (newScheduleData as any).id;
          return await schedulesService.create(newScheduleData);
        })
      );

      setSchedules(prev => [...newSchedules, ...prev]);
    } catch (err) {
      console.error('Error copying week schedule:', err);
      throw err;
    }
  };

  // Attendance operations
  const addAttendance = async (attendanceData: Omit<Attendance, 'id'>) => {
    try {
      const newAttendance = await attendanceService.create(attendanceData);
      setAttendance(prev => [newAttendance, ...prev]);
    } catch (err) {
      console.error('Error adding attendance:', err);
      throw err;
    }
  };

  const updateAttendance = async (id: string, attendanceData: Partial<Attendance>) => {
    try {
      const updatedAttendance = await attendanceService.update(id, attendanceData);
      setAttendance(prev => prev.map(a => a.id === id ? updatedAttendance : a));
    } catch (err) {
      console.error('Error updating attendance:', err);
      throw err;
    }
  };

  const deleteAttendance = async (id: string) => {
    try {
      await attendanceService.delete(id);
      setAttendance(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting attendance:', err);
      throw err;
    }
  };

  const resetScheduleAttendance = async (scheduleId: string) => {
    try {
      const attendanceToDelete = attendance.filter(a => a.scheduleId === scheduleId);
      await Promise.all(attendanceToDelete.map(a => attendanceService.delete(a.id)));
      setAttendance(prev => prev.filter(a => a.scheduleId !== scheduleId));
    } catch (err) {
      console.error('Error resetting schedule attendance:', err);
      throw err;
    }
  };

  // Grade Period operations
  const addGradePeriod = async (periodData: Omit<GradePeriod, 'id' | 'createdAt'>) => {
    try {
      const newPeriod = await gradePeriodsService.create(periodData);
      setGradePeriods(prev => [newPeriod, ...prev]);
    } catch (err) {
      console.error('Error adding grade period:', err);
      throw err;
    }
  };

  const updateGradePeriod = async (id: string, periodData: Partial<GradePeriod>) => {
    try {
      const updatedPeriod = await gradePeriodsService.update(id, periodData);
      setGradePeriods(prev => prev.map(p => p.id === id ? updatedPeriod : p));
    } catch (err) {
      console.error('Error updating grade period:', err);
      throw err;
    }
  };

  const deleteGradePeriod = async (id: string) => {
    try {
      await gradePeriodsService.delete(id);
      setGradePeriods(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting grade period:', err);
      throw err;
    }
  };

  // Grade Column operations
  const addGradeColumn = async (columnData: Omit<GradeColumn, 'id' | 'createdAt'>) => {
    try {
      const newColumn = await gradeColumnsService.create(columnData);
      setGradeColumns(prev => [newColumn, ...prev]);
    } catch (err) {
      console.error('Error adding grade column:', err);
      throw err;
    }
  };

  const updateGradeColumn = async (id: string, columnData: Partial<GradeColumn>) => {
    try {
      const updatedColumn = await gradeColumnsService.update(id, columnData);
      setGradeColumns(prev => prev.map(c => c.id === id ? updatedColumn : c));
    } catch (err) {
      console.error('Error updating grade column:', err);
      throw err;
    }
  };

  const deleteGradeColumn = async (id: string) => {
    try {
      await gradeColumnsService.delete(id);
      setGradeColumns(prev => prev.filter(c => c.id !== id));
      // Also delete related grades
      setGrades(prev => prev.filter(g => g.gradeColumnId !== id));
    } catch (err) {
      console.error('Error deleting grade column:', err);
      throw err;
    }
  };

  // Grade operations
  const addGrade = async (gradeData: Omit<Grade, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newGrade = await gradesService.create(gradeData);
      setGrades(prev => [newGrade, ...prev]);
    } catch (err) {
      console.error('Error adding grade:', err);
      throw err;
    }
  };

  const updateGrade = async (id: string, gradeData: Partial<Grade>) => {
    try {
      const updatedGrade = await gradesService.update(id, gradeData);
      setGrades(prev => prev.map(g => g.id === id ? updatedGrade : g));
    } catch (err) {
      console.error('Error updating grade:', err);
      throw err;
    }
  };

  const deleteGrade = async (id: string) => {
    try {
      await gradesService.delete(id);
      setGrades(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error('Error deleting grade:', err);
      throw err;
    }
  };

  const upsertGrade = async (gradeData: Omit<Grade, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const upsertedGrade = await gradesService.upsert(gradeData);
      setGrades(prev => {
        const existingIndex = prev.findIndex(g => 
          g.gradeColumnId === gradeData.gradeColumnId && g.studentId === gradeData.studentId
        );
        if (existingIndex >= 0) {
          return prev.map((g, index) => index === existingIndex ? upsertedGrade : g);
        } else {
          return [upsertedGrade, ...prev];
        }
      });
    } catch (err) {
      console.error('Error upserting grade:', err);
      throw err;
    }
  };

  // Legacy operations (for compatibility with existing code)
  const generateId = (prefix: string) => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  };

  const addFinance = (financeData: Omit<FinanceRecord, 'id'>) => {
    const newFinance: FinanceRecord = {
      ...financeData,
      id: generateId('FIN'),
    };
    setFinances(prev => [...prev, newFinance]);
  };

  const updateFinance = (id: string, financeData: Partial<FinanceRecord>) => {
    setFinances(prev => prev.map(f => f.id === id ? { ...f, ...financeData } : f));
  };

  const deleteFinance = (id: string) => {
    setFinances(prev => prev.filter(f => f.id !== id));
  };

  const addAsset = (assetData: Omit<Asset, 'id'>) => {
    const newAsset: Asset = {
      ...assetData,
      id: generateId('AST'),
    };
    setAssets(prev => [...prev, newAsset]);
  };

  const updateAsset = (id: string, assetData: Partial<Asset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...assetData } : a));
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: generateId('NOT'),
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const updateNotification = (id: string, notificationData: Partial<Notification>) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, ...notificationData } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Database operations (legacy)
  const exportDatabase = () => {
    const data = {
      students,
      classes,
      classrooms,
      schedules,
      attendance,
      finances,
      assets,
      notifications,
      gradePeriods,
      gradeColumns,
      grades,
      subjects,
      lastUpdated: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `classroom_database_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const importDatabase = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const imported = JSON.parse(content);
          
          if (imported.students) setStudents(imported.students);
          if (imported.classes) setClasses(imported.classes);
          if (imported.classrooms) setClassrooms(imported.classrooms);
          if (imported.schedules) setSchedules(imported.schedules);
          if (imported.attendance) setAttendance(imported.attendance);
          if (imported.finances) setFinances(imported.finances);
          if (imported.assets) setAssets(imported.assets);
          if (imported.notifications) setNotifications(imported.notifications);
          if (imported.gradePeriods) setGradePeriods(imported.gradePeriods);
          if (imported.gradeColumns) setGradeColumns(imported.gradeColumns);
          if (imported.grades) setGrades(imported.grades);
          if (imported.subjects) setSubjects(imported.subjects);
          
          resolve(true);
        } catch (error) {
          console.error('Error importing database:', error);
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  };

  const resetDatabase = () => {
    setStudents([]);
    setClasses([]);
    setClassrooms([]);
    setSchedules([]);
    setAttendance([]);
    setFinances([]);
    setAssets([]);
    setNotifications([]);
    setGradePeriods([]);
    setGradeColumns([]);
    setGrades([]);
    setSubjects([]);
  };

  const getDatabaseInfo = () => {
    return {
      lastUpdated: new Date().toISOString(),
      totalStudents: students.length,
      totalClasses: classes.length,
      totalClassrooms: classrooms.length,
      totalSchedules: schedules.length,
      totalAttendance: attendance.length,
      totalFinances: finances.length,
      totalAssets: assets.length,
      totalNotifications: notifications.length,
      totalGradePeriods: gradePeriods.length,
      totalGradeColumns: gradeColumns.length,
      totalGrades: grades.length,
      totalSubjects: subjects.length,
    };
  };

  return (
    <DataContext.Provider value={{
      students,
      classes,
      classrooms,
      schedules,
      attendance,
      finances,
      assets,
      notifications,
      gradePeriods,
      gradeColumns,
      grades,
      subjects,
      loading,
      error,
      addStudent,
      updateStudent,
      deleteStudent,
      addClass,
      updateClass,
      deleteClass,
      addClassroom,
      updateClassroom,
      deleteClassroom,
      addSubject,
      updateSubject,
      deleteSubject,
      addSchedule,
      updateSchedule,
      deleteSchedule,
      copyWeekSchedule,
      addAttendance,
      updateAttendance,
      deleteAttendance,
      resetScheduleAttendance,
      addGradePeriod,
      updateGradePeriod,
      deleteGradePeriod,
      addGradeColumn,
      updateGradeColumn,
      deleteGradeColumn,
      addGrade,
      updateGrade,
      deleteGrade,
      upsertGrade,
      addFinance,
      updateFinance,
      deleteFinance,
      addAsset,
      updateAsset,
      deleteAsset,
      addNotification,
      updateNotification,
      deleteNotification,
      exportDatabase,
      importDatabase,
      resetDatabase,
      getDatabaseInfo,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}