import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Calendar,
  Check,
  X,
  Clock,
  Users,
  ChevronDown,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Filter,
  Download,
  RefreshCw,
  RotateCcw,
  Save,
  Edit,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from 'lucide-react';
import { exportAttendance } from '../lib/excelExport';

export default function AttendanceManager() {
  const { 
    schedules, 
    classes, 
    students, 
    attendance, 
    addAttendance, 
    updateAttendance, 
    resetScheduleAttendance 
  } = useData();
  const { user } = useAuth();
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent' | 'late'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAttendanceSheet, setShowAttendanceSheet] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<{[key: string]: 'present' | 'absent' | 'late'}>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isExporting, setIsExporting] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [showExportModal, setShowExportModal] = useState(false);

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
      
      weekSchedules.push({
        date: dateStr,
        dayName: date.toLocaleDateString('vi-VN', { weekday: 'long' }),
        dayNumber: date.getDate(),
        fullDate: date,
        schedules: daySchedules,
        isToday: dateStr === new Date().toISOString().split('T')[0],
      });
    }
    return weekSchedules;
  };

  // Lọc lịch dạy theo vai trò người dùng
  const getSchedulesByDate = (date: string) => {
    let filteredSchedules = schedules.filter(s => s.date === date);
    
    // Nếu là giáo viên, chỉ hiển thị lịch dạy của mình
    if (user?.role === 'teacher') {
      filteredSchedules = filteredSchedules.filter(s => s.teacherId === user.id);
    }
    
    return filteredSchedules;
  };

  const selectedDateSchedules = getSchedulesByDate(selectedDate);

  const getScheduleInfo = (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return null;
    
    const classInfo = classes.find(c => c.id === schedule.classId);
    return { schedule, classInfo };
  };

  const getClassStudents = (classId: string) => {
    const classInfo = classes.find(c => c.id === classId);
    if (!classInfo) return [];
    
    return students.filter(s => classInfo.studentIds.includes(s.id));
  };

  const getStudentAttendance = (scheduleId: string, studentId: string) => {
    return attendance.find(a => a.scheduleId === scheduleId && a.studentId === studentId);
  };

  const handleAttendanceChange = (scheduleId: string, studentId: string, status: 'present' | 'absent' | 'late') => {
    const existingAttendance = getStudentAttendance(scheduleId, studentId);
    
    if (existingAttendance) {
      // Cập nhật điểm danh hiện có
      updateAttendance(existingAttendance.id, {
        status,
        checkedAt: new Date().toISOString(),
      });
    } else {
      // Tạo điểm danh mới
      addAttendance({
        scheduleId,
        studentId,
        status,
        checkedAt: new Date().toISOString(),
      });
    }
  };

  // Xử lý thay đổi điểm danh trong chế độ chỉnh sửa
  const handleEditAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setEditingAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
    setHasChanges(true);
  };

  // Lưu tất cả thay đổi điểm danh
  const saveAllAttendance = () => {
    if (!selectedSchedule) return;

    Object.entries(editingAttendance).forEach(([studentId, status]) => {
      handleAttendanceChange(selectedSchedule, studentId, status);
    });

    setEditingAttendance({});
    setHasChanges(false);
    setShowAttendanceSheet(false);
  };

  // Hủy thay đổi
  const cancelEdit = () => {
    setEditingAttendance({});
    setHasChanges(false);
    setShowAttendanceSheet(false);
  };

  // Mở bảng điểm danh
  const openAttendanceSheet = (scheduleId: string) => {
    setSelectedSchedule(scheduleId);
    setShowAttendanceSheet(true);
    
    // Khởi tạo trạng thái điểm danh hiện tại
    const scheduleInfo = getScheduleInfo(scheduleId);
    if (scheduleInfo) {
      const classStudents = getClassStudents(scheduleInfo.schedule.classId);
      const currentAttendance: {[key: string]: 'present' | 'absent' | 'late'} = {};
      
      classStudents.forEach(student => {
        const existingAttendance = getStudentAttendance(scheduleId, student.id);
        currentAttendance[student.id] = existingAttendance?.status || 'absent';
      });
      
      setEditingAttendance(currentAttendance);
    }
  };

  const selectedScheduleInfo = selectedSchedule ? getScheduleInfo(selectedSchedule) : null;
  const classStudents = selectedScheduleInfo ? getClassStudents(selectedScheduleInfo.schedule.classId) : [];
  
  const filteredStudents = classStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const currentStatus = editingAttendance[student.id] || 'absent';
    const matchesStatus = currentStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getAttendanceStats = () => {
    if (!selectedSchedule) return { present: 0, absent: 0, late: 0, total: 0 };
    
    const total = classStudents.length;
    const present = Object.values(editingAttendance).filter(status => status === 'present').length;
    const late = Object.values(editingAttendance).filter(status => status === 'late').length;
    const absent = total - present - late;
    
    return { present, absent, late, total };
  };

  const stats = getAttendanceStats();

  const markAllPresent = () => {
    if (!selectedSchedule) return;
    
    const newAttendance: {[key: string]: 'present' | 'absent' | 'late'} = {};
    classStudents.forEach(student => {
      newAttendance[student.id] = 'present';
    });
    
    setEditingAttendance(newAttendance);
    setHasChanges(true);
  };

  const resetAttendance = () => {
    if (!selectedSchedule) return;
    
    const newAttendance: {[key: string]: 'present' | 'absent' | 'late'} = {};
    classStudents.forEach(student => {
      newAttendance[student.id] = 'absent';
    });
    
    setEditingAttendance(newAttendance);
    setHasChanges(true);
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
      case 'morning': return 'bg-yellow-100 text-yellow-800';
      case 'afternoon': return 'bg-blue-100 text-blue-800';
      case 'evening': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100';
      case 'late': return 'text-yellow-600 bg-yellow-100';
      case 'absent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return CheckCircle;
      case 'late': return Clock;
      case 'absent': return AlertCircle;
      default: return UserCheck;
    }
  };

  // Hiển thị thông báo cho giáo viên nếu không có lịch dạy
  const isTeacher = user?.role === 'teacher';
  const hasSchedulesToday = selectedDateSchedules.length > 0;
  const weekSchedules = getWeekSchedules();

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await exportAttendance(attendance, schedules, classes, students);
      setShowExportModal(false);
      setIsExporting(false);
      setExportDateRange({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error exporting attendance:', error);
      setIsExporting(false);
    }
  };

  const handleExportWithDateRange = async () => {
    try {
      setIsExporting(true);
      await exportAttendance(
        attendance, 
        schedules, 
        classes, 
        students, 
        exportDateRange.startDate, 
        exportDateRange.endDate
      );
      setShowExportModal(false);
      setIsExporting(false);
    } catch (error) {
      console.error('Error exporting attendance:', error);
      setIsExporting(false);
    }
  };

  // Nếu đang hiển thị bảng điểm danh
  if (showAttendanceSheet && selectedScheduleInfo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-all"
            >
              <ArrowLeft size={20} />
              <span>Quay lại</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Điểm danh lớp {selectedScheduleInfo.classInfo?.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {selectedScheduleInfo.schedule.startTime} - {selectedScheduleInfo.schedule.endTime} • 
                Ca {getTimeSlotLabel(selectedScheduleInfo.schedule.timeSlot)} • 
                {new Date(selectedScheduleInfo.schedule.date).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-orange-600 text-sm font-medium">
                Có thay đổi chưa lưu
              </span>
            )}
            <button
              onClick={markAllPresent}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Điểm danh tất cả
            </button>
            <button
              onClick={resetAttendance}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Reset
            </button>
            <button
              onClick={saveAllAttendance}
              disabled={!hasChanges}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              Lưu điểm danh
            </button>
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Tổng số</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-900">Có mặt</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Đi muộn</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-sm font-medium text-red-900">Vắng mặt</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          </div>
        </div>

        {/* Bộ lọc và tìm kiếm */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="present">Có mặt</option>
              <option value="late">Đi muộn</option>
              <option value="absent">Vắng mặt</option>
            </select>
          </div>

          {/* Bảng điểm danh */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">STT</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên học sinh</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Mã HS</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">SĐT phụ huynh</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Có mặt</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Đi muộn</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Vắng mặt</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => {
                  const currentStatus = editingAttendance[student.id] || 'absent';
                  const StatusIcon = getStatusIcon(currentStatus);
                  
                  return (
                    <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{student.name}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-sm">{student.id}</td>
                      <td className="py-3 px-4 text-gray-600">{student.parentPhone}</td>
                      
                      {/* Radio buttons cho điểm danh */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="radio"
                          name={`attendance-${student.id}`}
                          checked={currentStatus === 'present'}
                          onChange={() => handleEditAttendanceChange(student.id, 'present')}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="radio"
                          name={`attendance-${student.id}`}
                          checked={currentStatus === 'late'}
                          onChange={() => handleEditAttendanceChange(student.id, 'late')}
                          className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="radio"
                          name={`attendance-${student.id}`}
                          checked={currentStatus === 'absent'}
                          onChange={() => handleEditAttendanceChange(student.id, 'absent')}
                          className="w-4 h-4 text-red-600 focus:ring-red-500"
                        />
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${getStatusColor(currentStatus)}`}>
                          <StatusIcon size={14} />
                          <span>
                            {currentStatus === 'present' ? 'Có mặt' :
                             currentStatus === 'late' ? 'Đi muộn' : 'Vắng mặt'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <UserCheck className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="text-gray-500">
                {searchTerm ? 'Không tìm thấy học sinh nào' : 'Lớp học này chưa có học sinh'}
              </p>
            </div>
          )}
        </div>

        {/* Nút lưu cố định ở cuối */}
        {hasChanges && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
              <span className="text-gray-700 font-medium">Có thay đổi chưa lưu</span>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={saveAllAttendance}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Save size={16} />
                Lưu điểm danh
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Điểm danh học sinh</h1>
          <p className="text-gray-600 mt-1">
            {isTeacher 
              ? 'Điểm danh cho các lớp bạn dạy'
              : 'Quản lý điểm danh học sinh theo buổi học'
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle view mode */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'day' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Calendar size={16} className="mr-1 inline" />
              Ngày
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'week' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <CalendarDays size={16} className="mr-1 inline" />
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
          
          {viewMode === 'day' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSchedule(''); // Reset selected schedule when date changes
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>
      </div>

      {/* Week Navigation */}
      {viewMode === 'week' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Tuần {formatWeekRange(currentWeek)}
                </h2>
                <p className="text-sm text-gray-600">
                  {getWeekStart(currentWeek).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => navigateWeek('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            
            <button
              onClick={goToCurrentWeek}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Calendar size={16} />
              Tuần này
            </button>
          </div>

          {/* Weekly Schedule Grid */}
          <div className="grid grid-cols-7 gap-4">
            {weekSchedules.map((day) => (
              <div 
                key={day.date} 
                className={`border rounded-lg p-4 min-h-[200px] ${
                  day.isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="text-center mb-3">
                  <h3 className={`font-semibold ${day.isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                    {day.dayName}
                  </h3>
                  <p className={`text-sm ${day.isToday ? 'text-blue-700' : 'text-gray-600'}`}>
                    {day.dayNumber}
                  </p>
                  {day.isToday && (
                    <span className="inline-block mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                      Hôm nay
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  {day.schedules.map((schedule) => {
                    const classInfo = classes.find(c => c.id === schedule.classId);
                    const scheduleAttendance = attendance.filter(a => a.scheduleId === schedule.id);
                    const totalStudents = classInfo?.studentIds.length || 0;
                    const attendanceCount = scheduleAttendance.length;
                    
                    return (
                      <button
                        key={schedule.id}
                        onClick={() => openAttendanceSheet(schedule.id)}
                        className={`w-full p-3 rounded-lg text-left transition-all hover:shadow-md ${getTimeSlotColor(schedule.timeSlot)} border border-opacity-20 hover:border-opacity-40`}
                      >
                        <p className="font-medium text-sm truncate" title={classInfo?.name}>
                          {classInfo?.name}
                        </p>
                        <p className="text-xs opacity-75">
                          {schedule.startTime} - {schedule.endTime}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-75">
                            {totalStudents} HS
                          </span>
                          <div className="flex items-center gap-1">
                            {attendanceCount === totalStudents ? (
                              <CheckCircle size={12} className="text-green-600" />
                            ) : attendanceCount > 0 ? (
                              <Clock size={12} className="text-yellow-600" />
                            ) : (
                              <AlertCircle size={12} className="text-gray-400" />
                            )}
                            <span className="text-xs font-medium">
                              {attendanceCount}/{totalStudents}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {day.schedules.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">
                      Không có lịch
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Statistics */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê tuần</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Tổng buổi học</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {weekSchedules.reduce((total, day) => total + day.schedules.length, 0)}
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} className="text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">Ca sáng</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {weekSchedules.reduce((total, day) => 
                    total + day.schedules.filter(s => s.timeSlot === 'morning').length, 0
                  )}
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Ca trưa</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {weekSchedules.reduce((total, day) => 
                    total + day.schedules.filter(s => s.timeSlot === 'afternoon').length, 0
                  )}
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} className="text-purple-600" />
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
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <>
          {/* Thông báo cho giáo viên nếu không có lịch dạy */}
          {isTeacher && !hasSchedulesToday && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <Calendar size={24} className="text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    Không có lịch dạy hôm nay
                  </h3>
                  <p className="text-blue-700 mt-1">
                    Bạn không có lịch dạy nào trong ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}. 
                    Hãy chọn ngày khác hoặc liên hệ quản lý để kiểm tra lịch dạy.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Danh sách lịch dạy */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              {isTeacher ? 'Lịch dạy của bạn' : 'Lịch dạy'} ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedDateSchedules.length > 0 ? (
                selectedDateSchedules.map((schedule) => {
                  const classInfo = classes.find(c => c.id === schedule.classId);
                  const scheduleAttendance = attendance.filter(a => a.scheduleId === schedule.id);
                  const attendanceCount = scheduleAttendance.length;
                  const totalStudents = classInfo?.studentIds.length || 0;
                  
                  return (
                    <button
                      key={schedule.id}
                      onClick={() => openAttendanceSheet(schedule.id)}
                      className="w-full p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all text-left bg-white hover:bg-blue-50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {classInfo?.name}
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTimeSlotColor(schedule.timeSlot)}`}>
                          {getTimeSlotLabel(schedule.timeSlot)}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock size={16} />
                          <span>{schedule.startTime} - {schedule.endTime}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users size={16} />
                          <span>{totalStudents} học sinh</span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <span className="text-sm text-gray-600">Điểm danh:</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${
                              attendanceCount === totalStudents ? 'text-green-600' :
                              attendanceCount > 0 ? 'text-yellow-600' : 'text-gray-500'
                            }`}>
                              {attendanceCount}/{totalStudents}
                            </span>
                            {attendanceCount === totalStudents ? (
                              <CheckCircle size={16} className="text-green-600" />
                            ) : attendanceCount > 0 ? (
                              <Clock size={16} className="text-yellow-600" />
                            ) : (
                              <AlertCircle size={16} className="text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                          <Edit size={16} />
                          <span>Nhấn để điểm danh</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-8">
                  <Calendar className="mx-auto mb-4 text-gray-300" size={48} />
                  <p className="text-gray-500">
                    {isTeacher 
                      ? 'Bạn không có lịch dạy trong ngày này'
                      : 'Không có lịch dạy trong ngày này'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Xuất dữ liệu điểm danh</h2>
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