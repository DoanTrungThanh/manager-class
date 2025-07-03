import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  MapPin,
  Copy,
  Share2,
  Filter,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
  Save,
  Building,
  User,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Send,
  BarChart3,
  BookMarked,
  Download,
} from 'lucide-react';
import { Schedule } from '../types';
import { exportSchedules } from '../lib/excelExport';

export default function ScheduleManager() {
  const { 
    schedules, 
    classes, 
    classrooms, 
    subjects,
    addSchedule, 
    updateSchedule, 
    deleteSchedule, 
    copyWeekSchedule 
  } = useData();
  const { user, users } = useAuth();
  const toast = useToastContext();
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isExporting, setIsExporting] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [formData, setFormData] = useState({
    classId: '',
    classroomId: '',
    teacherId: '',
    subjectId: '',
    date: '',
    timeSlot: 'morning' as 'morning' | 'afternoon' | 'evening',
    startTime: '',
    endTime: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled',
  });

  const canManageSchedules = user?.role !== 'teacher';

  // Utility functions for week navigation
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getWeekEnd = (date: Date) => {
    const weekStart = getWeekStart(date);
    return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  };

  const formatWeekRange = (date: Date) => {
    const start = getWeekStart(date);
    const end = getWeekEnd(date);
    return `${start.toLocaleDateString('vi-VN')} - ${end.toLocaleDateString('vi-VN')}`;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const getWeekSchedules = () => {
    const startOfWeek = getWeekStart(currentWeek);
    
    const weekSchedules = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      let daySchedules = schedules.filter(s => s.date === dateStr);
      
      // Lọc theo vai trò người dùng
      if (user?.role === 'teacher') {
        daySchedules = daySchedules.filter(s => s.teacherId === user.id);
      }
      
      // Lọc theo time slot nếu được chọn
      if (selectedTimeSlot !== 'all') {
        daySchedules = daySchedules.filter(s => s.timeSlot === selectedTimeSlot);
      }
      
      weekSchedules.push({
        date: dateStr,
        dayName: date.toLocaleDateString('vi-VN', { weekday: 'long' }),
        dayNameShort: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
        dayNumber: date.getDate(),
        fullDate: date,
        schedules: daySchedules,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      });
    }
    return weekSchedules;
  };

  const resetForm = () => {
    setFormData({
      classId: '',
      classroomId: '',
      teacherId: '',
      subjectId: '',
      date: '',
      timeSlot: 'morning',
      startTime: '',
      endTime: '',
      status: 'scheduled',
    });
    setEditingSchedule(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const scheduleData = {
        ...formData,
        teacherId: formData.teacherId || user?.id || '',
      };
      
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, scheduleData);
        toast.success('Cập nhật lịch dạy thành công!');
      } else {
        await addSchedule(scheduleData);
        toast.success('Thêm lịch dạy thành công!');
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Có lỗi xảy ra khi lưu lịch dạy!');
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      classId: schedule.classId,
      classroomId: schedule.classroomId || '',
      teacherId: schedule.teacherId,
      subjectId: schedule.subjectId || '',
      date: schedule.date,
      timeSlot: schedule.timeSlot,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      status: schedule.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch dạy này?')) {
      try {
        await deleteSchedule(id);
        toast.success('Xóa lịch dạy thành công!');
      } catch (error) {
        console.error('Error deleting schedule:', error);
        toast.error('Có lỗi xảy ra khi xóa lịch dạy!');
      }
    }
  };

  const handleCopyWeek = async () => {
    try {
      const fromWeekStart = getWeekStart(currentWeek).toISOString().split('T')[0];
      const nextWeek = new Date(currentWeek);
      nextWeek.setDate(currentWeek.getDate() + 7);
      const toWeekStart = getWeekStart(nextWeek).toISOString().split('T')[0];
      
      // Kiểm tra xem tuần hiện tại có lịch dạy không
      const currentWeekSchedules = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        const weekStart = getWeekStart(currentWeek);
        const weekEnd = getWeekEnd(currentWeek);
        return scheduleDate >= weekStart && scheduleDate <= weekEnd;
      });

      if (currentWeekSchedules.length === 0) {
        toast.error('Tuần hiện tại không có lịch dạy để sao chép!');
        return;
      }

      // Kiểm tra xem tuần tiếp theo đã có lịch dạy chưa
      const nextWeekSchedules = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        const nextWeekStart = getWeekStart(nextWeek);
        const nextWeekEnd = getWeekEnd(nextWeek);
        return scheduleDate >= nextWeekStart && scheduleDate <= nextWeekEnd;
      });

      if (nextWeekSchedules.length > 0) {
        const confirmOverwrite = window.confirm(
          `Tuần tiếp theo (${formatWeekRange(nextWeek)}) đã có ${nextWeekSchedules.length} lịch dạy. Bạn có muốn ghi đè không?`
        );
        if (!confirmOverwrite) {
          return;
        }
        
        // Xóa lịch dạy tuần tiếp theo trước khi sao chép
        for (const schedule of nextWeekSchedules) {
          await deleteSchedule(schedule.id);
        }
      }
      
      await copyWeekSchedule(fromWeekStart, toWeekStart);
      
      // Chuyển sang tuần tiếp theo để xem kết quả
      navigateWeek('next');
      
      toast.success(`Đã sao chép ${currentWeekSchedules.length} lịch dạy sang tuần tiếp theo!`);
    } catch (error) {
      console.error('Error copying week:', error);
      toast.error('Có lỗi xảy ra khi sao chép lịch tuần!');
    }
  };

  const getTimeSlotLabel = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning': return 'Sáng';
      case 'afternoon': return 'Trưa';
      case 'evening': return 'Chiều';
      default: return timeSlot;
    }
  };

  const getTimeSlotColor = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning': return 'from-amber-400 to-yellow-500';
      case 'afternoon': return 'from-blue-400 to-cyan-500';
      case 'evening': return 'from-purple-400 to-indigo-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getTimeSlotBorder = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning': return 'border-amber-200';
      case 'afternoon': return 'border-blue-200';
      case 'evening': return 'border-purple-200';
      default: return 'border-gray-200';
    }
  };

  const getTimeSlotBg = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning': return 'bg-gradient-to-br from-amber-50 to-yellow-50';
      case 'afternoon': return 'bg-gradient-to-br from-blue-50 to-cyan-50';
      case 'evening': return 'bg-gradient-to-br from-purple-50 to-indigo-50';
      default: return 'bg-gray-50';
    }
  };

  const getTimeSlotEmoji = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌆';
      default: return '⏰';
    }
  };

  const getTimeSlotHours = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning': return '6:00 - 12:00';
      case 'afternoon': return '12:00 - 18:00';
      case 'evening': return '18:00 - 22:00';
      default: return '';
    }
  };

  const getClassroomName = (classroomId: string) => {
    const classroom = classrooms.find(c => c.id === classroomId);
    return classroom?.name || 'Chưa chọn phòng';
  };

  const getClassName = (classId: string) => {
    const classInfo = classes.find(c => c.id === classId);
    return classInfo?.name || 'Lớp không xác định';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = users.find(u => u.id === teacherId);
    return teacher?.name || 'Chưa phân công';
  };

  const getSubjectName = (subjectId: string) => {
    if (!subjectId) return '';
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || '';
  };

  const getSubjectColor = (subjectId: string) => {
    if (!subjectId) return '#6B7280'; // Default gray
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || '#6B7280';
  };

  const getTeachersByRole = () => {
    return users.filter(u => u.role === 'teacher' || u.role === 'admin' || u.role === 'manager');
  };

  const getClassSubject = (classId: string) => {
    const classInfo = classes.find(c => c.id === classId);
    return classInfo?.subjectId || '';
  };

  // Khi chọn lớp, tự động chọn môn học tương ứng nếu lớp đó đã có môn học
  const handleClassChange = (classId: string) => {
    const subjectId = getClassSubject(classId);
    setFormData({
      ...formData,
      classId,
      subjectId: subjectId || formData.subjectId,
    });
  };

  const weekSchedules = getWeekSchedules();
  const totalWeekSchedules = weekSchedules.reduce((total, day) => total + day.schedules.length, 0);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      
      // Get date range for export
      let startDate, endDate;
      
      if (viewMode === 'week') {
        // If in week view, export the current week
        startDate = getWeekStart(currentWeek).toISOString().split('T')[0];
        endDate = getWeekEnd(currentWeek).toISOString().split('T')[0];
      } else {
        // If in day view, export the selected day
        startDate = selectedDate;
        endDate = selectedDate;
      }
      
      await exportSchedules(schedules, classes, classrooms, users, subjects, startDate, endDate);
      toast.success('Xuất dữ liệu thành công!');
    } catch (error) {
      console.error('Error exporting schedules:', error);
      toast.error('Có lỗi xảy ra khi xuất dữ liệu!');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWithDateRange = async () => {
    try {
      setIsExporting(true);
      await exportSchedules(
        schedules, 
        classes, 
        classrooms, 
        users, 
        subjects, 
        exportDateRange.startDate, 
        exportDateRange.endDate
      );
      toast.success('Xuất dữ liệu thành công!');
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting schedules:', error);
      toast.error('Có lỗi xảy ra khi xuất dữ liệu!');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý lịch dạy</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'teacher' 
              ? 'Xem lịch dạy của bạn'
              : 'Quản lý lịch dạy của trung tâm'
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'day' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Calendar size={16} className="mr-2 inline" />
              Ngày
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'week' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <CalendarDays size={16} className="mr-2 inline" />
              Tuần
            </button>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <Download size={18} />
            Xuất Excel
          </button>

          {canManageSchedules && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus size={18} />
              Thêm lịch dạy
            </button>
          )}
        </div>
      </div>

      {viewMode === 'week' && (
        <>
          {/* Enhanced Week Navigation */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigateWeek('prev')}
                    className="p-2.5 hover:bg-white/80 rounded-xl transition-all duration-200 text-gray-600 hover:text-gray-800"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {formatWeekRange(currentWeek)}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {getWeekStart(currentWeek).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => navigateWeek('next')}
                    className="p-2.5 hover:bg-white/80 rounded-xl transition-all duration-200 text-gray-600 hover:text-gray-800"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={goToCurrentWeek}
                    className="bg-white text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 border border-blue-200 shadow-sm"
                  >
                    <Calendar size={16} />
                    Tuần này
                  </button>
                  
                  {canManageSchedules && totalWeekSchedules > 0 && (
                    <button
                      onClick={handleCopyWeek}
                      className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center gap-2 shadow-sm"
                      title={`Sao chép ${totalWeekSchedules} lịch dạy sang tuần tiếp theo`}
                    >
                      <Copy size={16} />
                      Sao chép tuần ({totalWeekSchedules})
                    </button>
                  )}
                </div>
              </div>

              {/* Time Slot Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Lọc theo ca:</span>
                <div className="flex items-center gap-1">
                  {[
                    { value: 'all', label: 'Tất cả', emoji: '📅' },
                    { value: 'morning', label: 'Sáng', emoji: '🌅' },
                    { value: 'afternoon', label: 'Trưa', emoji: '☀️' },
                    { value: 'evening', label: 'Chiều', emoji: '🌆' },
                  ].map((slot) => (
                    <button
                      key={slot.value}
                      onClick={() => setSelectedTimeSlot(slot.value as any)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedTimeSlot === slot.value
                          ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                      }`}
                    >
                      {slot.emoji} {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Schedule Grid - 3 ngày trên, 4 ngày dưới */}
            <div className="p-6">
              {/* 3 ngày đầu tuần */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {weekSchedules.slice(0, 3).map((day) => (
                  <div 
                    key={day.date} 
                    className={`border-2 rounded-2xl p-5 min-h-[280px] transition-all duration-200 hover:shadow-lg ${
                      day.isToday 
                        ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md' 
                        : day.isWeekend
                        ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center mb-4">
                      <h3 className={`text-lg font-bold ${day.isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                        {day.dayName}
                      </h3>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <p className={`text-2xl font-bold ${day.isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                          {day.dayNumber}
                        </p>
                        {day.isToday && (
                          <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                            Hôm nay
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {day.schedules.length > 0 ? (
                        day.schedules.map((schedule) => {
                          const className = getClassName(schedule.classId);
                          const classroomName = getClassroomName(schedule.classroomId || '');
                          const teacherName = getTeacherName(schedule.teacherId);
                          const subjectName = getSubjectName(schedule.subjectId || '');
                          const subjectColor = getSubjectColor(schedule.subjectId || '');
                          
                          return (
                            <div
                              key={schedule.id}
                              className={`group relative p-4 rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer border-2 ${getTimeSlotBorder(schedule.timeSlot)} ${getTimeSlotBg(schedule.timeSlot)} hover:scale-[1.02]`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${getTimeSlotColor(schedule.timeSlot)} text-white`}>
                                  {getTimeSlotEmoji(schedule.timeSlot)}
                                  {getTimeSlotLabel(schedule.timeSlot)}
                                </span>
                                {canManageSchedules && (
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                                    <button
                                      onClick={() => handleEdit(schedule)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                                    >
                                      <Edit size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(schedule.id)}
                                      className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate" title={className}>
                                {className}
                              </h4>
                              
                              {subjectName && (
                                <div 
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white mb-1"
                                  style={{ backgroundColor: subjectColor }}
                                >
                                  <BookMarked size={10} />
                                  {subjectName}
                                </div>
                              )}
                              
                              <div className="space-y-1 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Clock size={10} />
                                  <span>{schedule.startTime} - {schedule.endTime}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User size={10} />
                                  <span className="truncate" title={teacherName}>{teacherName}</span>
                                </div>
                                {schedule.classroomId && (
                                  <div className="flex items-center gap-1">
                                    <Building size={10} />
                                    <span className="truncate">{classroomName}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="mx-auto mb-2 text-gray-300" size={32} />
                          <p className="text-xs text-gray-400">Không có lịch</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 4 ngày cuối tuần */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {weekSchedules.slice(3, 7).map((day) => (
                  <div 
                    key={day.date} 
                    className={`border-2 rounded-2xl p-5 min-h-[280px] transition-all duration-200 hover:shadow-lg ${
                      day.isToday 
                        ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md' 
                        : day.isWeekend
                        ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center mb-4">
                      <h3 className={`text-lg font-bold ${day.isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                        {day.dayName}
                      </h3>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <p className={`text-2xl font-bold ${day.isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                          {day.dayNumber}
                        </p>
                        {day.isToday && (
                          <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                            Hôm nay
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {day.schedules.length > 0 ? (
                        day.schedules.map((schedule) => {
                          const className = getClassName(schedule.classId);
                          const classroomName = getClassroomName(schedule.classroomId || '');
                          const teacherName = getTeacherName(schedule.teacherId);
                          const subjectName = getSubjectName(schedule.subjectId || '');
                          const subjectColor = getSubjectColor(schedule.subjectId || '');
                          
                          return (
                            <div
                              key={schedule.id}
                              className={`group relative p-4 rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer border-2 ${getTimeSlotBorder(schedule.timeSlot)} ${getTimeSlotBg(schedule.timeSlot)} hover:scale-[1.02]`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${getTimeSlotColor(schedule.timeSlot)} text-white`}>
                                  {getTimeSlotEmoji(schedule.timeSlot)}
                                  {getTimeSlotLabel(schedule.timeSlot)}
                                </span>
                                {canManageSchedules && (
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                                    <button
                                      onClick={() => handleEdit(schedule)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                                    >
                                      <Edit size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(schedule.id)}
                                      className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate" title={className}>
                                {className}
                              </h4>
                              
                              {subjectName && (
                                <div 
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white mb-1"
                                  style={{ backgroundColor: subjectColor }}
                                >
                                  <BookMarked size={10} />
                                  {subjectName}
                                </div>
                              )}
                              
                              <div className="space-y-1 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Clock size={10} />
                                  <span>{schedule.startTime} - {schedule.endTime}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User size={10} />
                                  <span className="truncate" title={teacherName}>{teacherName}</span>
                                </div>
                                {schedule.classroomId && (
                                  <div className="flex items-center gap-1">
                                    <Building size={10} />
                                    <span className="truncate">{classroomName}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="mx-auto mb-2 text-gray-300" size={32} />
                          <p className="text-xs text-gray-400">Không có lịch</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Statistics */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Thống kê tuần
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Tổng buổi học</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{totalWeekSchedules}</p>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🌅</span>
                    <span className="text-sm font-medium text-amber-900">Ca sáng</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    {weekSchedules.reduce((total, day) => 
                      total + day.schedules.filter(s => s.timeSlot === 'morning').length, 0
                    )}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">☀️</span>
                    <span className="text-sm font-medium text-blue-900">Ca trưa</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {weekSchedules.reduce((total, day) => 
                      total + day.schedules.filter(s => s.timeSlot === 'afternoon').length, 0
                    )}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🌆</span>
                    <span className="text-sm font-medium text-purple-900">Ca chiều</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {weekSchedules.reduce((total, day) => 
                      total + day.schedules.filter(s => s.timeSlot === 'evening').length, 0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={20} />
              Lịch dạy ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
            </h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Day schedules grouped by time slot */}
          <div className="space-y-6">
            {['morning', 'afternoon', 'evening'].map((timeSlot) => {
              const timeSlotSchedules = schedules.filter(s => 
                s.date === selectedDate && 
                s.timeSlot === timeSlot &&
                (user?.role !== 'teacher' || s.teacherId === user.id)
              );
              
              return (
                <div key={timeSlot} className={`rounded-2xl border-2 ${getTimeSlotBorder(timeSlot)} ${getTimeSlotBg(timeSlot)} p-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{getTimeSlotEmoji(timeSlot)}</span>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">
                        Ca {getTimeSlotLabel(timeSlot)}
                      </h4>
                      <p className="text-sm text-gray-600">{getTimeSlotHours(timeSlot)}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-sm text-gray-500">
                        {timeSlotSchedules.length} buổi học
                      </span>
                    </div>
                  </div>
                  
                  {timeSlotSchedules.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {timeSlotSchedules.map((schedule) => {
                        const className = getClassName(schedule.classId);
                        const classroomName = getClassroomName(schedule.classroomId || '');
                        const teacherName = getTeacherName(schedule.teacherId);
                        const subjectName = getSubjectName(schedule.subjectId || '');
                        const subjectColor = getSubjectColor(schedule.subjectId || '');
                        
                        return (
                          <div
                            key={schedule.id}
                            className="group bg-white p-5 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-semibold text-gray-900">{className}</h5>
                              {canManageSchedules && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                                  <button
                                    onClick={() => handleEdit(schedule)}
                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(schedule.id)}
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            {subjectName && (
                              <div 
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white mb-3"
                                style={{ backgroundColor: subjectColor }}
                              >
                                <BookMarked size={12} />
                                {subjectName}
                              </div>
                            )}
                            
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Clock size={14} />
                                <span>{schedule.startTime} - {schedule.endTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User size={14} />
                                <span>{teacherName}</span>
                              </div>
                              {schedule.classroomId && (
                                <div className="flex items-center gap-2">
                                  <Building size={14} />
                                  <span>{classroomName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="mx-auto mb-4 text-gray-300" size={48} />
                      <p className="text-gray-500">Không có lịch dạy trong ca này</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal thêm/sửa lịch dạy */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSchedule ? 'Chỉnh sửa lịch dạy' : 'Thêm lịch dạy mới'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lớp học *
                </label>
                <select
                  value={formData.classId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn lớp học</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Môn học *
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn môn học</option>
                  {subjects.filter(s => s.isActive).map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giáo viên *
                </label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn giáo viên</option>
                  {getTeachersByRole().map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.role === 'admin' ? 'Quản trị viên' : teacher.role === 'manager' ? 'Quản sinh' : 'Giáo viên'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phòng học
                </label>
                <select
                  value={formData.classroomId}
                  onChange={(e) => setFormData({ ...formData, classroomId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn phòng học</option>
                  {classrooms.filter(c => c.status === 'available').map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày dạy *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ca dạy *
                </label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="morning">🌅 Ca sáng (6:00 - 12:00)</option>
                  <option value="afternoon">☀️ Ca trưa (12:00 - 18:00)</option>
                  <option value="evening">🌆 Ca chiều (18:00 - 22:00)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ bắt đầu *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ kết thúc *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="scheduled">Đã lên lịch</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {editingSchedule ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Xuất lịch dạy</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={exportDateRange.startDate}
                  onChange={(e) => setExportDateRange({ ...exportDateRange, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={exportDateRange.endDate}
                  onChange={(e) => setExportDateRange({ ...exportDateRange, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleExportWithDateRange}
                  disabled={isExporting}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}