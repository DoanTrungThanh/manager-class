import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { Plus, Search, Edit, Trash2, Calendar, Phone, ExternalLink, X, Save, User, UserCheck, UserX, CreditCard, Scale as Male, Scale as Female, Users, Filter, BookOpen, Heart, Download } from 'lucide-react';
import { Student } from '../types';
import { exportStudents } from '../lib/excelExport';

export default function StudentsManager() {
  const { students, classes, addStudent, updateStudent, deleteStudent, updateClass, refreshData } = useData();
  const { user } = useAuth();
  const toast = useToastContext();
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female' | 'other'>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    gender: 'male' as 'male' | 'female' | 'other',
    parentName: '',
    motherName: '',
    parentPhone: '',
    parentIdCard: '',
    parentIdCard2: '',
    status: 'active' as 'active' | 'inactive',
    driveLink: '',
    classId: '',
  });
  const [isExporting, setIsExporting] = useState(false);

  const canManageStudents = user?.role === 'admin';

  // Apply all filters
  const filteredStudents = students.filter(student => {
    // Search filter
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.motherName && student.motherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.parentIdCard && student.parentIdCard.includes(searchTerm)) ||
      (student.parentIdCard2 && student.parentIdCard2.includes(searchTerm));
    
    // Status filter
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    
    // Gender filter
    const matchesGender = filterGender === 'all' || student.gender === filterGender;
    
    // Class filter
    const matchesClass = filterClass === 'all' || student.classId === filterClass;
    
    return matchesSearch && matchesStatus && matchesGender && matchesClass;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      birthDate: '',
      gender: 'male',
      parentName: '',
      motherName: '',
      parentPhone: '',
      parentIdCard: '',
      parentIdCard2: '',
      status: 'active',
      driveLink: '',
      classId: '',
    });
    setEditingStudent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingStudent) {
        // Nếu đang chỉnh sửa học sinh
        const oldClassId = editingStudent.classId;
        const newClassId = formData.classId;
        
        // Cập nhật thông tin học sinh
        await updateStudent(editingStudent.id, formData);
        
        // Nếu lớp học thay đổi, cập nhật danh sách học sinh trong lớp
        if (oldClassId !== newClassId) {
          // Xóa học sinh khỏi lớp cũ
          if (oldClassId) {
            const oldClass = classes.find(c => c.id === oldClassId);
            if (oldClass) {
              const updatedStudentIds = oldClass.studentIds.filter(id => id !== editingStudent.id);
              await updateClass(oldClassId, { studentIds: updatedStudentIds });
            }
          }
          
          // Thêm học sinh vào lớp mới
          if (newClassId) {
            const newClass = classes.find(c => c.id === newClassId);
            if (newClass) {
              // Kiểm tra xem học sinh đã có trong lớp chưa
              if (!newClass.studentIds.includes(editingStudent.id)) {
                const updatedStudentIds = [...newClass.studentIds, editingStudent.id];
                await updateClass(newClassId, { studentIds: updatedStudentIds });
              }
            }
          }
        }
        
        // Refresh data to ensure everything is in sync
        await refreshData();
        
        toast.success('Cập nhật học sinh thành công!');
      } else {
        // Nếu đang thêm học sinh mới
        const newStudentData = { ...formData };
        
        // Thêm học sinh mới
        const newStudent = await addStudent(newStudentData);
        
        // Nếu có chọn lớp, thêm học sinh vào lớp đó
        if (formData.classId) {
          const selectedClass = classes.find(c => c.id === formData.classId);
          if (selectedClass) {
            // Thêm ID học sinh vào lớp
            const updatedStudentIds = [...selectedClass.studentIds, newStudent.id];
            await updateClass(formData.classId, { studentIds: updatedStudentIds });
          }
        }
        
        // Refresh data to ensure everything is in sync
        await refreshData();
        
        toast.success('Thêm học sinh thành công!');
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('Có lỗi xảy ra khi lưu thông tin học sinh. Vui lòng thử lại!');
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      birthDate: student.birthDate,
      gender: student.gender || 'male',
      parentName: student.parentName,
      motherName: student.motherName || '',
      parentPhone: student.parentPhone,
      parentIdCard: student.parentIdCard || '',
      parentIdCard2: student.parentIdCard2 || '',
      status: student.status || 'active',
      driveLink: student.driveLink || '',
      classId: student.classId || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa học sinh này?')) {
      try {
        // Tìm học sinh cần xóa
        const studentToDelete = students.find(s => s.id === id);
        
        // Xóa học sinh khỏi lớp nếu có
        if (studentToDelete?.classId) {
          const studentClass = classes.find(c => c.id === studentToDelete.classId);
          if (studentClass) {
            const updatedStudentIds = studentClass.studentIds.filter(studentId => studentId !== id);
            await updateClass(studentToDelete.classId, { studentIds: updatedStudentIds });
          }
        }
        
        // Xóa học sinh
        await deleteStudent(id);
        
        // Refresh data to ensure everything is in sync
        await refreshData();
        
        toast.success('Xóa học sinh thành công!');
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Có lỗi xảy ra khi xóa học sinh. Vui lòng thử lại!');
      }
    }
  };

  const getClassName = (classId: string) => {
    const classInfo = classes.find(c => c.id === classId);
    return classInfo?.name || 'Chưa phân lớp';
  };

  // Lấy danh sách lớp có thể chọn (tất cả lớp)
  const getAvailableClasses = () => {
    return classes;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Đang học';
      case 'inactive': return 'Nghỉ học';
      default: return status;
    }
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male': return <Male size={16} className="text-blue-500" />;
      case 'female': return <Female size={16} className="text-pink-500" />;
      default: return <Users size={16} className="text-purple-500" />;
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      default: return 'Khác';
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'male': return 'bg-blue-100 text-blue-800';
      case 'female': return 'bg-pink-100 text-pink-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  // Get student counts by status
  const activeStudentsCount = students.filter(s => s.status === 'active').length;
  const inactiveStudentsCount = students.filter(s => s.status === 'inactive').length;

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await exportStudents(filteredStudents, classes);
      toast.success('Xuất dữ liệu thành công!');
    } catch (error) {
      console.error('Error exporting students:', error);
      toast.error('Có lỗi xảy ra khi xuất dữ liệu!');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý học sinh</h1>
          <p className="text-gray-600 mt-1">
            Tổng cộng {students.length} học sinh ({activeStudentsCount} đang học, {inactiveStudentsCount} nghỉ học)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <Download size={20} />
            {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
          {canManageStudents && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Thêm học sinh
            </button>
          )}
        </div>
      </div>

      {/* Filter cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status filter card */}
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Filter size={16} />
            Lọc theo trạng thái
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === 'all' 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả ({students.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === 'active' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <UserCheck size={14} className="inline mr-1" />
              Đang học ({activeStudentsCount})
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === 'inactive' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              <UserX size={14} className="inline mr-1" />
              Nghỉ học ({inactiveStudentsCount})
            </button>
          </div>
        </div>

        {/* Gender filter card */}
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Filter size={16} />
            Lọc theo giới tính
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterGender('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterGender === 'all' 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả ({students.length})
            </button>
            <button
              onClick={() => setFilterGender('male')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterGender === 'male' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <Male size={14} className="inline mr-1" />
              Nam ({students.filter(s => s.gender === 'male').length})
            </button>
            <button
              onClick={() => setFilterGender('female')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterGender === 'female' 
                  ? 'bg-pink-600 text-white' 
                  : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
              }`}
            >
              <Female size={14} className="inline mr-1" />
              Nữ ({students.filter(s => s.gender === 'female').length})
            </button>
          </div>
        </div>

        {/* Class filter card */}
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <BookOpen size={16} />
            Lọc theo lớp
          </h3>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">Tất cả lớp ({students.length})</option>
            <option value="">Chưa phân lớp ({students.filter(s => !s.classId).length})</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.studentIds.length})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm học sinh, phụ huynh, CCCD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-responsive">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Mã HS</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên học sinh</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Giới tính</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ngày sinh</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Phụ huynh</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">SĐT</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">CCCD</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Lớp</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{student.id}</td>
                  <td className="py-3 px-4 font-medium">{student.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getGenderColor(student.gender || 'other')}`}>
                      {getGenderIcon(student.gender || 'other')}
                      {getGenderLabel(student.gender || 'other')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(student.birthDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="flex items-center gap-1">
                        <Male size={14} className="text-blue-500" />
                        <span>{student.parentName}</span>
                      </div>
                      {student.motherName && (
                        <div className="flex items-center gap-1 mt-1">
                          <Female size={14} className="text-pink-500" />
                          <span>{student.motherName}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      {student.parentPhone}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">
                    {student.parentIdCard && (
                      <div className="flex items-center gap-1">
                        <CreditCard size={14} className="text-gray-400" />
                        {student.parentIdCard}
                      </div>
                    )}
                    {student.parentIdCard2 && (
                      <div className="flex items-center gap-1 mt-1">
                        <CreditCard size={14} className="text-gray-400" />
                        {student.parentIdCard2}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(student.status || 'active')}`}>
                      {student.status === 'active' ? <UserCheck size={12} /> : <UserX size={12} />}
                      {getStatusLabel(student.status || 'active')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      student.classId 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getClassName(student.classId || '')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {student.driveLink && (
                        <a
                          href={student.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700"
                          title="Xem hồ sơ"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      {canManageStudents && (
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterGender !== 'all' || filterClass !== 'all'
                ? 'Không tìm thấy học sinh nào phù hợp với bộ lọc' 
                : 'Chưa có học sinh nào'}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingStudent ? 'Chỉnh sửa học sinh' : 'Thêm học sinh mới'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên học sinh *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới tính *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh *
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="active">Đang học</option>
                    <option value="inactive">Nghỉ học</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên phụ huynh (Ba) *
                  </label>
                  <div className="flex items-center">
                    <Male size={16} className="text-blue-500 mr-2" />
                    <input
                      type="text"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên phụ huynh (Mẹ)
                  </label>
                  <div className="flex items-center">
                    <Female size={16} className="text-pink-500 mr-2" />
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên mẹ"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CCCD phụ huynh (Ba)
                  </label>
                  <input
                    type="text"
                    value={formData.parentIdCard}
                    onChange={(e) => setFormData({ ...formData, parentIdCard: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập số CCCD"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CCCD phụ huynh (Mẹ)
                  </label>
                  <input
                    type="text"
                    value={formData.parentIdCard2}
                    onChange={(e) => setFormData({ ...formData, parentIdCard2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập số CCCD"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lớp học
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn lớp học</option>
                    {getAvailableClasses().map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  {formData.classId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Lớp được chọn: {getClassName(formData.classId)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đường dẫn hồ sơ (Google Drive)
                </label>
                <input
                  type="url"
                  value={formData.driveLink}
                  onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://drive.google.com/..."
                />
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
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {editingStudent ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}