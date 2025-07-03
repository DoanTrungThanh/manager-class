import { supabase } from './supabase';
import { 
  Student, 
  Class, 
  Classroom, 
  Schedule, 
  Attendance, 
  User,
  GradePeriod,
  GradeColumn,
  Grade,
  Subject
} from '../types';

// Helper function to generate IDs
const generateId = (prefix: string) => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// Users service
export const usersService = {
  async getAll(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role,
        avatar: item.avatar,
        password: item.password,
        isActive: item.is_active,
        lastLogin: item.last_login,
        createdAt: item.created_at,
        gender: item.gender || 'male',
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      // Return empty array if Supabase is not available
      return [];
    }
  },

  async authenticate(email: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .eq('is_active', true)
        .single();
      
      if (error) return null;
      
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        password: data.password,
        isActive: data.is_active,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        gender: data.gender || 'male',
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  },

  async create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      const id = generateId('USR');
      const { data, error } = await supabase
        .from('users')
        .insert({
          id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          avatar: userData.avatar,
          password: userData.password,
          is_active: userData.isActive ?? true,
          last_login: userData.lastLogin,
          gender: userData.gender || 'male',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        password: data.password,
        isActive: data.is_active,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        gender: data.gender || 'male',
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<User>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.email && { email: updates.email }),
          ...(updates.role && { role: updates.role }),
          ...(updates.avatar !== undefined && { avatar: updates.avatar }),
          ...(updates.password && { password: updates.password }),
          ...(updates.isActive !== undefined && { is_active: updates.isActive }),
          ...(updates.lastLogin !== undefined && { last_login: updates.lastLogin }),
          ...(updates.gender && { gender: updates.gender }),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        password: data.password,
        isActive: data.is_active,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        gender: data.gender || 'male',
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
};

// Subjects service
export const subjectsService = {
  async getAll(): Promise<Subject[]> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        description: item.description,
        color: item.color,
        isActive: item.is_active,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
  },

  async create(subject: Omit<Subject, 'id' | 'createdAt'>): Promise<Subject> {
    try {
      const id = generateId('SUB');
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          id,
          name: subject.name,
          code: subject.code,
          description: subject.description,
          color: subject.color,
          is_active: subject.isActive,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        code: data.code,
        description: data.description,
        color: data.color,
        isActive: data.is_active,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Subject>): Promise<Subject> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.code && { code: updates.code }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.color && { color: updates.color }),
          ...(updates.isActive !== undefined && { is_active: updates.isActive }),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        code: data.code,
        description: data.description,
        color: data.color,
        isActive: data.is_active,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  },
};

// Students service
export const studentsService = {
  async getAll(): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        birthDate: item.birth_date,
        gender: item.gender || 'other',
        parentName: item.parent_name,
        motherName: item.mother_name,
        parentPhone: item.parent_phone,
        parentIdCard: item.parent_id_card,
        parentIdCard2: item.parent_id_card2,
        status: item.status || 'active',
        driveLink: item.drive_link,
        classId: item.class_id,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  async create(student: Omit<Student, 'id' | 'createdAt'>): Promise<Student> {
    try {
      const id = generateId('ST');
      const { data, error } = await supabase
        .from('students')
        .insert({
          id,
          name: student.name,
          birth_date: student.birthDate,
          gender: student.gender || 'other',
          parent_name: student.parentName,
          mother_name: student.motherName,
          parent_phone: student.parentPhone,
          parent_id_card: student.parentIdCard,
          parent_id_card2: student.parentIdCard2,
          status: student.status || 'active',
          drive_link: student.driveLink,
          class_id: student.classId,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        birthDate: data.birth_date,
        gender: data.gender || 'other',
        parentName: data.parent_name,
        motherName: data.mother_name,
        parentPhone: data.parent_phone,
        parentIdCard: data.parent_id_card,
        parentIdCard2: data.parent_id_card2,
        status: data.status || 'active',
        driveLink: data.drive_link,
        classId: data.class_id,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Student>): Promise<Student> {
    try {
      const { data, error } = await supabase
        .from('students')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.birthDate && { birth_date: updates.birthDate }),
          ...(updates.gender && { gender: updates.gender }),
          ...(updates.parentName && { parent_name: updates.parentName }),
          ...(updates.motherName !== undefined && { mother_name: updates.motherName }),
          ...(updates.parentPhone && { parent_phone: updates.parentPhone }),
          ...(updates.parentIdCard !== undefined && { parent_id_card: updates.parentIdCard }),
          ...(updates.parentIdCard2 !== undefined && { parent_id_card2: updates.parentIdCard2 }),
          ...(updates.status && { status: updates.status }),
          ...(updates.driveLink !== undefined && { drive_link: updates.driveLink }),
          ...(updates.classId !== undefined && { class_id: updates.classId }),
        })
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        throw new Error(`Student with ID ${id} not found for update.`);
      }
      
      return {
        id: data.id,
        name: data.name,
        birthDate: data.birth_date,
        gender: data.gender || 'other',
        parentName: data.parent_name,
        motherName: data.mother_name,
        parentPhone: data.parent_phone,
        parentIdCard: data.parent_id_card,
        parentIdCard2: data.parent_id_card2,
        status: data.status || 'active',
        driveLink: data.drive_link,
        classId: data.class_id,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },
};

// Classes service
export const classesService = {
  async getAll(): Promise<Class[]> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        teacherId: item.teacher_id,
        studentIds: item.student_ids || [],
        maxStudents: item.max_students,
        subjectId: item.subject_id,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
  },

  async create(classData: Omit<Class, 'id' | 'createdAt'>): Promise<Class> {
    try {
      const id = generateId('CL');
      const { data, error } = await supabase
        .from('classes')
        .insert({
          id,
          name: classData.name,
          teacher_id: classData.teacherId,
          student_ids: classData.studentIds || [],
          max_students: classData.maxStudents || 30,
          subject_id: classData.subjectId,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        teacherId: data.teacher_id,
        studentIds: data.student_ids || [],
        maxStudents: data.max_students,
        subjectId: data.subject_id,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Class>): Promise<Class> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.teacherId && { teacher_id: updates.teacherId }),
          ...(updates.studentIds && { student_ids: updates.studentIds }),
          ...(updates.maxStudents && { max_students: updates.maxStudents }),
          ...(updates.subjectId !== undefined && { subject_id: updates.subjectId }),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        teacherId: data.teacher_id,
        studentIds: data.student_ids || [],
        maxStudents: data.max_students,
        subjectId: data.subject_id,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  },
};

// Classrooms service
export const classroomsService = {
  async getAll(): Promise<Classroom[]> {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        capacity: item.capacity,
        location: item.location,
        equipment: item.equipment || [],
        status: item.status,
        description: item.description,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      return [];
    }
  },

  async create(classroom: Omit<Classroom, 'id' | 'createdAt'>): Promise<Classroom> {
    try {
      const id = generateId('CR');
      const { data, error } = await supabase
        .from('classrooms')
        .insert({
          id,
          name: classroom.name,
          capacity: classroom.capacity || 30,
          location: classroom.location || '',
          equipment: classroom.equipment || [],
          status: classroom.status || 'available',
          description: classroom.description,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        capacity: data.capacity,
        location: data.location,
        equipment: data.equipment || [],
        status: data.status,
        description: data.description,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error creating classroom:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Classroom>): Promise<Classroom> {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.capacity && { capacity: updates.capacity }),
          ...(updates.location !== undefined && { location: updates.location }),
          ...(updates.equipment && { equipment: updates.equipment }),
          ...(updates.status && { status: updates.status }),
          ...(updates.description !== undefined && { description: updates.description }),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        capacity: data.capacity,
        location: data.location,
        equipment: data.equipment || [],
        status: data.status,
        description: data.description,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error updating classroom:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('classrooms')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting classroom:', error);
      throw error;
    }
  },
};

// Schedules service
export const schedulesService = {
  async getAll(): Promise<Schedule[]> {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        classId: item.class_id,
        teacherId: item.teacher_id,
        subjectId: item.subject_id,
        classroomId: item.classroom_id,
        date: item.date,
        timeSlot: item.time_slot,
        startTime: item.start_time,
        endTime: item.end_time,
        status: item.status,
      }));
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return [];
    }
  },

  async create(schedule: Omit<Schedule, 'id'>): Promise<Schedule> {
    try {
      const id = generateId('SCH');
      const { data, error } = await supabase
        .from('schedules')
        .insert({
          id,
          class_id: schedule.classId,
          teacher_id: schedule.teacherId,
          subject_id: schedule.subjectId,
          classroom_id: schedule.classroomId,
          date: schedule.date,
          time_slot: schedule.timeSlot,
          start_time: schedule.startTime,
          end_time: schedule.endTime,
          status: schedule.status || 'scheduled',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        classId: data.class_id,
        teacherId: data.teacher_id,
        subjectId: data.subject_id,
        classroomId: data.classroom_id,
        date: data.date,
        timeSlot: data.time_slot,
        startTime: data.start_time,
        endTime: data.end_time,
        status: data.status,
      };
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Schedule>): Promise<Schedule> {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .update({
          ...(updates.classId && { class_id: updates.classId }),
          ...(updates.teacherId && { teacher_id: updates.teacherId }),
          ...(updates.subjectId !== undefined && { subject_id: updates.subjectId }),
          ...(updates.classroomId !== undefined && { classroom_id: updates.classroomId }),
          ...(updates.date && { date: updates.date }),
          ...(updates.timeSlot && { time_slot: updates.timeSlot }),
          ...(updates.startTime && { start_time: updates.startTime }),
          ...(updates.endTime && { end_time: updates.endTime }),
          ...(updates.status && { status: updates.status }),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        classId: data.class_id,
        teacherId: data.teacher_id,
        subjectId: data.subject_id,
        classroomId: data.classroom_id,
        date: data.date,
        timeSlot: data.time_slot,
        startTime: data.start_time,
        endTime: data.end_time,
        status: data.status,
      };
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  },
};

// Attendance service
export const attendanceService = {
  async getAll(): Promise<Attendance[]> {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('checked_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        scheduleId: item.schedule_id,
        studentId: item.student_id,
        status: item.status,
        checkedAt: item.checked_at,
      }));
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
  },

  async create(attendance: Omit<Attendance, 'id'>): Promise<Attendance> {
    try {
      const id = generateId('ATT');
      const { data, error } = await supabase
        .from('attendance')
        .insert({
          id,
          schedule_id: attendance.scheduleId,
          student_id: attendance.studentId,
          status: attendance.status,
          checked_at: attendance.checkedAt || new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        scheduleId: data.schedule_id,
        studentId: data.student_id,
        status: data.status,
        checkedAt: data.checked_at,
      };
    } catch (error) {
      console.error('Error creating attendance:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Attendance>): Promise<Attendance> {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .update({
          ...(updates.scheduleId && { schedule_id: updates.scheduleId }),
          ...(updates.studentId && { student_id: updates.studentId }),
          ...(updates.status && { status: updates.status }),
          ...(updates.checkedAt !== undefined && { checked_at: updates.checkedAt }),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        scheduleId: data.schedule_id,
        studentId: data.student_id,
        status: data.status,
        checkedAt: data.checked_at,
      };
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting attendance:', error);
      throw error;
    }
  },
};

// Grade Periods service
export const gradePeriodsService = {
  async getAll(): Promise<GradePeriod[]> {
    try {
      const { data, error } = await supabase
        .from('grade_periods')
        .select('*')
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        startDate: item.start_date,
        endDate: item.end_date,
        isActive: item.is_active,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Error fetching grade periods:', error);
      return [];
    }
  },

  async create(period: Omit<GradePeriod, 'id' | 'createdAt'>): Promise<GradePeriod> {
    try {
      const id = generateId('GP');
      const { data, error } = await supabase
        .from('grade_periods')
        .insert({
          id,
          name: period.name,
          start_date: period.startDate,
          end_date: period.endDate,
          is_active: period.isActive,
          created_by: '1', // Default to admin user
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error creating grade period:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<GradePeriod>): Promise<GradePeriod> {
    try {
      const { data, error } = await supabase
        .from('grade_periods')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.startDate && { start_date: updates.startDate }),
          ...(updates.endDate && { end_date: updates.endDate }),
          ...(updates.isActive !== undefined && { is_active: updates.isActive }),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error updating grade period:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('grade_periods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting grade period:', error);
      throw error;
    }
  },
};

// Grade Columns service
export const gradeColumnsService = {
  async getAll(): Promise<GradeColumn[]> {
    try {
      const { data, error } = await supabase
        .from('grade_columns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        classId: item.class_id,
        teacherId: item.teacher_id,
        gradePeriodId: item.grade_period_id,
        maxScore: item.max_score,
        weight: item.weight,
        description: item.description,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Error fetching grade columns:', error);
      return [];
    }
  },

  async create(column: Omit<GradeColumn, 'id' | 'createdAt'>): Promise<GradeColumn> {
    try {
      const id = generateId('GC');
      const { data, error } = await supabase
        .from('grade_columns')
        .insert({
          id,
          name: column.name,
          class_id: column.classId,
          teacher_id: column.teacherId,
          grade_period_id: column.gradePeriodId,
          max_score: column.maxScore || 10,
          weight: column.weight || 1,
          description: column.description,
          created_by: column.teacherId || '1',
          type: 'regular',
          is_active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        classId: data.class_id,
        teacherId: data.teacher_id,
        gradePeriodId: data.grade_period_id,
        maxScore: data.max_score,
        weight: data.weight,
        description: data.description,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error creating grade column:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<GradeColumn>): Promise<GradeColumn> {
    try {
      const { data, error } = await supabase
        .from('grade_columns')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.classId && { class_id: updates.classId }),
          ...(updates.teacherId && { teacher_id: updates.teacherId }),
          ...(updates.gradePeriodId !== undefined && { grade_period_id: updates.gradePeriodId }),
          ...(updates.maxScore && { max_score: updates.maxScore }),
          ...(updates.weight && { weight: updates.weight }),
          ...(updates.description !== undefined && { description: updates.description }),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        classId: data.class_id,
        teacherId: data.teacher_id,
        gradePeriodId: data.grade_period_id,
        maxScore: data.max_score,
        weight: data.weight,
        description: data.description,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error updating grade column:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('grade_columns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting grade column:', error);
      throw error;
    }
  },
};

// Grades service
export const gradesService = {
  async getAll(): Promise<Grade[]> {
    try {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        gradeColumnId: item.grade_column_id,
        studentId: item.student_id,
        score: item.score,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching grades:', error);
      return [];
    }
  },

  async create(grade: Omit<Grade, 'id' | 'createdAt' | 'updatedAt'>): Promise<Grade> {
    try {
      const id = generateId('GR');
      const { data, error } = await supabase
        .from('grades')
        .insert({
          id,
          grade_column_id: grade.gradeColumnId,
          student_id: grade.studentId,
          score: grade.score,
          notes: grade.notes,
          entered_by: '1', // Default to admin user
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        gradeColumnId: data.grade_column_id,
        studentId: data.student_id,
        score: data.score,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error creating grade:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Grade>): Promise<Grade> {
    try {
      const { data, error } = await supabase
        .from('grades')
        .update({
          ...(updates.gradeColumnId && { grade_column_id: updates.gradeColumnId }),
          ...(updates.studentId && { student_id: updates.studentId }),
          ...(updates.score !== undefined && { score: updates.score }),
          ...(updates.notes !== undefined && { notes: updates.notes }),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        gradeColumnId: data.grade_column_id,
        studentId: data.student_id,
        score: data.score,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error updating grade:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting grade:', error);
      throw error;
    }
  },

  async upsert(grade: Omit<Grade, 'id' | 'createdAt' | 'updatedAt'>): Promise<Grade> {
    try {
      // Check if grade exists
      const { data: existingData } = await supabase
        .from('grades')
        .select('id')
        .eq('grade_column_id', grade.gradeColumnId)
        .eq('student_id', grade.studentId)
        .maybeSingle();

      if (existingData) {
        // Update existing grade
        const { data, error } = await supabase
          .from('grades')
          .update({
            score: grade.score,
            notes: grade.notes,
          })
          .eq('id', existingData.id)
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id,
          gradeColumnId: data.grade_column_id,
          studentId: data.student_id,
          score: data.score,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      } else {
        // Create new grade
        return this.create(grade);
      }
    } catch (error) {
      console.error('Error upserting grade:', error);
      throw error;
    }
  },
};