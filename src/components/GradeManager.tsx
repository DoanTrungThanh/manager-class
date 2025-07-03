import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
  BookOpen,
  Users,
  BarChart3,
  FileText,
  Settings,
  Target,
  Award,
  TrendingUp,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  Calculator,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { GradePeriod, GradeColumn, Grade } from '../types';
import { exportGrades } from '../lib/excelExport';

export default function GradeManager() {
  const { 
    gradePeriods, 
    gradeColumns, 
    grades, 
    classes, 
    students,
    subjects,
    addGradePeriod,
    updateGradePeriod,
    deleteGradePeriod,
    addGradeColumn,
    updateGradeColumn,
    deleteGradeColumn,
    upsertGrade,
    loading 
  } = useData();
  const { user } = useAuth();
  const toast = useToastContext();

  const [activeTab, setActiveTab] = useState<'periods' | 'columns' | 'grades'>('periods');
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<GradePeriod | null>(null);
  const [editingColumn, setEditingColumn] = useState<GradeColumn | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGradeInput, setShowGradeInput] = useState(false);
  const [gradeInputs, setGradeInputs] = useState<{[key: string]: number | ''}>({});
  const [isExporting, setIsExporting] = useState(false);

  const [periodFormData, setPeriodFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isActive: false,
  });

  const [columnFormData, setColumnFormData] = useState({
    name: '',
    classId: '',
    gradePeriodId: '',
    maxScore: 10,
    weight: 1,
    description: '',
  });

  const canManageGrades = user?.role !== 'teacher' || user?.role === 'teacher';

  // Filter data based on user role
  const getFilteredClasses = () => {
    if (user?.role === 'teacher') {
      // For teachers, only show classes they are assigned to teach
      return classes.filter(c => c.teacherId === user.id);
    }
    return classes;
  };

  const getFilteredColumns = () => {
    if (user?.role === 'teacher') {
      // For teachers, only show columns they are assigned to
      return gradeColumns.filter(c => c.teacherId === user.id);
    }
    return gradeColumns;
  };

  const filteredClasses = getFilteredClasses();
  const filteredColumns = getFilteredColumns();

  // Reset forms
  const resetPeriodForm = () => {
    setPeriodFormData({
      name: '',
      startDate: '',
      endDate: '',
      isActive: false,
    });
    setEditingPeriod(null);
  };

  const resetColumnForm = () => {
    setColumnFormData({
      name: '',
      classId: '',
      gradePeriodId: '',
      maxScore: 10,
      weight: 1,
      description: '',
    });
    setEditingColumn(null);
  };

  // Period operations
  const handlePeriodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPeriod) {
        await updateGradePeriod(editingPeriod.id, periodFormData);
        toast.success('Cập nhật đợt điểm thành công!');
      } else {
        await addGradePeriod(periodFormData);
        toast.success('Tạo đợt điểm thành công!');
      }
      setShowPeriodModal(false);
      resetPeriodForm();
    } catch (error) {
      console.error('Error saving period:', error);
      toast.error('Có lỗi xảy ra khi lưu đợt điểm!');
    }
  };

  const handleEditPeriod = (period: GradePeriod) => {
    setEditingPeriod(period);
    setPeriodFormData({
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
      isActive: period.isActive,
    });
    setShowPeriodModal(true);
  };

  const handleDeletePeriod = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đợt điểm "${name}" không?`)) {
      try {
        await deleteGradePeriod(id);
        toast.success('Xóa đợt điểm thành công!');
      } catch (error) {
        console.error('Error deleting period:', error);
        toast.error('Có lỗi xảy ra khi xóa đợt điểm!');
      }
    }
  };

  // Column operations
  const handleColumnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const columnData = {
        ...columnFormData,
        teacherId: user?.id || '',
      };

      if (editingColumn) {
        await updateGradeColumn(editingColumn.id, columnData);
        toast.success('Cập nhật cột điểm thành công!');
      } else {
        await addGradeColumn(columnData);
        toast.success('Tạo cột điểm thành công!');
      }
      setShowColumnModal(false);
      resetColumnForm();
    } catch (error) {
      console.error('Error saving column:', error);
      toast.error('Có lỗi xảy ra khi lưu cột điểm!');
    }
  };

  const handleEditColumn = (column: GradeColumn) => {
    setEditingColumn(column);
    setColumnFormData({
      name: column.name,
      classId: column.classId,
      gradePeriodId: column.gradePeriodId || '',
      maxScore: column.maxScore,
      weight: column.weight,
      description: column.description || '',
    });
    setShowColumnModal(true);
  };

  const handleDeleteColumn = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa cột điểm "${name}" không? Tất cả điểm số trong cột này sẽ bị xóa.`)) {
      try {
        await deleteGradeColumn(id);
        toast.success('Xóa cột điểm thành công!');
      } catch (error) {
        console.error('Error deleting column:', error);
        toast.error('Có lỗi xảy ra khi xóa cột điểm!');
      }
    }
  };

  // Grade operations
  const getStudentsForGrading = () => {
    if (!selectedClass) return [];
    const classInfo = classes.find(c => c.id === selectedClass);
    if (!classInfo) return [];
    
    return students.filter(s => classInfo.studentIds.includes(s.id));
  };

  const getGradeForStudent = (studentId: string, columnId: string) => {
    return grades.find(g => g.gradeColumnId === columnId && g.studentId === studentId);
  };

  const handleGradeChange = (studentId: string, columnId: string, score: number | '') => {
    const key = `${studentId}-${columnId}`;
    setGradeInputs(prev => ({
      ...prev,
      [key]: score,
    }));
  };

  const saveGrade = async (studentId: string, columnId: string) => {
    const key = `${studentId}-${columnId}`;
    const score = gradeInputs[key];
    
    if (score === '' || score === undefined) return;
    
    try {
      await upsertGrade({
        gradeColumnId: columnId,
        studentId: studentId,
        score: typeof score === 'number' ? score : parseFloat(score.toString()),
        notes: '',
      });
      
      // Remove from inputs after saving
      setGradeInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[key];
        return newInputs;
      });
      
      toast.success('Lưu điểm thành công!');
    } catch (error) {
      console.error('Error saving grade:', error);
      toast.error('Có lỗi xảy ra khi lưu điểm!');
    }
  };

  const calculateAverage = (studentId: string) => {
    if (!selectedClass) return 0;
    
    const classColumns = filteredColumns.filter(c => c.classId === selectedClass);
    if (classColumns.length === 0) return 0;
    
    let totalScore = 0;
    let totalWeight = 0;
    
    classColumns.forEach(column => {
      const grade = getGradeForStudent(studentId, column.id);
      if (grade && grade.score !== null && grade.score !== undefined) {
        totalScore += (grade.score / column.maxScore) * column.weight;
        totalWeight += column.weight;
      }
    });
    
    return totalWeight > 0 ? (totalScore / totalWeight) * 10 : 0;
  };

  const getClassName = (classId: string) => {
    const classInfo = classes.find(c => c.id === classId);
    return classInfo?.name || 'Không xác định';
  };

  const getPeriodName = (periodId: string) => {
    const period = gradePeriods.find(p => p.id === periodId);
    return period?.name || 'Không có đợt';
  };

  const getSubjectName = (classId: string) => {
    const classInfo = classes.find(c => c.id === classId);
    if (!classInfo || !classInfo.subjectId) return '';
    
    const subject = subjects.find(s => s.id === classInfo.subjectId);
    return subject?.name || '';
  };

  const studentsForGrading = getStudentsForGrading();
  const selectedClassColumns = selectedClass ? filteredColumns.filter(c => c.classId === selectedClass) : [];
  
  const handleExportGrades = async () => {
    try {
      setIsExporting(true);
      await exportGrades(grades, gradeColumns, students, classes, subjects, selectedClass);
      toast.success('Xuất bảng điểm thành công!');
    } catch (error) {
      console.error('Error exporting grades:', error);
      toast.error('Có lỗi xảy ra khi xuất bảng điểm!');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý điểm số</h1>
          <p className="text-gray-600 mt-1">
            Tạo đợt điểm, cột điểm và nhập điểm cho học sinh
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'grades' && selectedClass && (
            <button
              onClick={handleExportGrades}
              disabled={isExporting}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
            >
              <Download size={18} />
              {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
          )}
          {activeTab === 'periods' && canManageGrades && (
            <button
              onClick={() => setShowPeriodModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Tạo đợt điểm
            </button>
          )}
          {activeTab === 'columns' && canManageGrades && (
            <button
              onClick={() => setShowColumnModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Tạo cột điểm
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('periods')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
              activeTab === 'periods'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Calendar size={16} className="inline mr-2" />
            Đợt điểm ({gradePeriods.length})
          </button>
          <button
            onClick={() => setActiveTab('columns')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
              activeTab === 'columns'
                ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Target size={16} className="inline mr-2" />
            Cột điểm ({filteredColumns.length})
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
              activeTab === 'grades'
                ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Award size={16} className="inline mr-2" />
            Nhập điểm
          </button>
        </div>

        <div className="p-6">
          {/* Periods Tab */}
          {activeTab === 'periods' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm đợt điểm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gradePeriods
                  .filter(period => period.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((period) => (
                    <div key={period.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{period.name}</h3>
                        <div className="flex items-center gap-2">
                          {period.isActive && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                              Đang hoạt động
                            </span>
                          )}
                          {canManageGrades && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditPeriod(period)}
                                className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-100"
                                title="Chỉnh sửa"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeletePeriod(period.id, period.name)}
                                className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-100"
                                title="Xóa"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <span className="text-sm">
                            {new Date(period.startDate).toLocaleDateString('vi-VN')} - {new Date(period.endDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <Target size={16} />
                          <span className="text-sm">
                            {gradeColumns.filter(c => c.gradePeriodId === period.id).length} cột điểm
                          </span>
                        </div>

                        <div className="pt-3 border-t border-gray-200">
                          <span className="text-xs text-gray-500">
                            Tạo: {new Date(period.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {gradePeriods.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="mx-auto mb-4 text-gray-300" size={48} />
                  <p className="text-gray-500 mb-4">Chưa có đợt điểm nào</p>
                  {canManageGrades && (
                    <button
                      onClick={() => setShowPeriodModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                    >
                      Tạo đợt điểm đầu tiên
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Columns Tab */}
          {activeTab === 'columns' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm cột điểm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tất cả lớp</option>
                  {filteredClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>

                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tất cả đợt</option>
                  {gradePeriods.map((period) => (
                    <option key={period.id} value={period.id}>{period.name}</option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên cột</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Lớp</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Môn học</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Đợt điểm</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Điểm tối đa</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Hệ số</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Đã nhập</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredColumns
                      .filter(column => {
                        const matchesSearch = column.name.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesClass = !selectedClass || column.classId === selectedClass;
                        const matchesPeriod = !selectedPeriod || column.gradePeriodId === selectedPeriod;
                        return matchesSearch && matchesClass && matchesPeriod;
                      })
                      .map((column) => {
                        const classInfo = classes.find(c => c.id === column.classId);
                        const totalStudents = classInfo?.studentIds.length || 0;
                        const gradedStudents = grades.filter(g => g.gradeColumnId === column.id && g.score !== null).length;
                        const subjectName = getSubjectName(column.classId);
                        
                        return (
                          <tr key={column.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-gray-900">{column.name}</p>
                                {column.description && (
                                  <p className="text-sm text-gray-600">{column.description}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">{getClassName(column.classId)}</td>
                            <td className="py-3 px-4">{subjectName}</td>
                            <td className="py-3 px-4">{getPeriodName(column.gradePeriodId || '')}</td>
                            <td className="py-3 px-4">{column.maxScore}</td>
                            <td className="py-3 px-4">{column.weight}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {gradedStudents}/{totalStudents}
                                </span>
                                {gradedStudents === totalStudents && totalStudents > 0 ? (
                                  <CheckCircle size={16} className="text-green-600" />
                                ) : (
                                  <AlertCircle size={16} className="text-orange-600" />
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {canManageGrades && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditColumn(column)}
                                    className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-100"
                                    title="Chỉnh sửa"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteColumn(column.id, column.name)}
                                    className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-100"
                                    title="Xóa"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {filteredColumns.length === 0 && (
                <div className="text-center py-8">
                  <Target className="mx-auto mb-4 text-gray-300" size={48} />
                  <p className="text-gray-500 mb-4">Chưa có cột điểm nào</p>
                  {canManageGrades && (
                    <button
                      onClick={() => setShowColumnModal(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
                    >
                      Tạo cột điểm đầu tiên
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Grades Tab */}
          {activeTab === 'grades' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn lớp để nhập điểm</option>
                  {filteredClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>

                {selectedClass && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {studentsForGrading.length} học sinh • {selectedClassColumns.length} cột điểm
                    </span>
                  </div>
                )}
              </div>

              {selectedClass && selectedClassColumns.length > 0 && studentsForGrading.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 border-r border-gray-200 sticky left-0 bg-gray-50">
                          Học sinh
                        </th>
                        {selectedClassColumns.map((column) => (
                          <th key={column.id} className="text-center py-3 px-4 font-semibold text-gray-700 border-r border-gray-200 min-w-[120px]">
                            <div>
                              <p className="text-sm">{column.name}</p>
                              <p className="text-xs text-gray-500">/{column.maxScore} (x{column.weight})</p>
                            </div>
                          </th>
                        ))}
                        <th className="text-center py-3 px-4 font-semibold text-gray-700 min-w-[100px]">
                          Trung bình
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsForGrading.map((student) => (
                        <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 border-r border-gray-200 sticky left-0 bg-white">
                            <div>
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-sm text-gray-600">{student.id}</p>
                            </div>
                          </td>
                          {selectedClassColumns.map((column) => {
                            const existingGrade = getGradeForStudent(student.id, column.id);
                            const inputKey = `${student.id}-${column.id}`;
                            const hasUnsavedInput = inputKey in gradeInputs;
                            
                            return (
                              <td key={column.id} className="py-3 px-4 border-r border-gray-200 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max={column.maxScore}
                                    step="0.1"
                                    value={hasUnsavedInput ? gradeInputs[inputKey] : (existingGrade?.score || '')}
                                    onChange={(e) => handleGradeChange(student.id, column.id, e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0"
                                  />
                                  {hasUnsavedInput && (
                                    <button
                                      onClick={() => saveGrade(student.id, column.id)}
                                      className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-100"
                                      title="Lưu điểm"
                                    >
                                      <Save size={14} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                          <td className="py-3 px-4 text-center">
                            <span className="font-semibold text-blue-600">
                              {calculateAverage(student.id).toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="mx-auto mb-4 text-gray-300" size={48} />
                  <p className="text-gray-500">
                    {!selectedClass 
                      ? 'Chọn lớp để bắt đầu nhập điểm'
                      : selectedClassColumns.length === 0
                      ? 'Lớp này chưa có cột điểm nào'
                      : 'Lớp này chưa có học sinh nào'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Period Modal */}
      {showPeriodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPeriod ? 'Chỉnh sửa đợt điểm' : 'Tạo đợt điểm mới'}
              </h2>
              <button
                onClick={() => {
                  setShowPeriodModal(false);
                  resetPeriodForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handlePeriodSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên đợt điểm *
                </label>
                <input
                  type="text"
                  value={periodFormData.name}
                  onChange={(e) => setPeriodFormData({ ...periodFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: Giữa kỳ 1, Cuối kỳ 1..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    value={periodFormData.startDate}
                    onChange={(e) => setPeriodFormData({ ...periodFormData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    value={periodFormData.endDate}
                    onChange={(e) => setPeriodFormData({ ...periodFormData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={periodFormData.isActive}
                  onChange={(e) => setPeriodFormData({ ...periodFormData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Đợt điểm đang hoạt động
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPeriodModal(false);
                    resetPeriodForm();
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
                  {editingPeriod ? 'Cập nhật' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Column Modal */}
      {showColumnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingColumn ? 'Chỉnh sửa cột điểm' : 'Tạo cột điểm mới'}
              </h2>
              <button
                onClick={() => {
                  setShowColumnModal(false);
                  resetColumnForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleColumnSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên cột điểm *
                </label>
                <input
                  type="text"
                  value={columnFormData.name}
                  onChange={(e) => setColumnFormData({ ...columnFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: Kiểm tra 15 phút, Bài tập về nhà..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lớp học *
                </label>
                <select
                  value={columnFormData.classId}
                  onChange={(e) => setColumnFormData({ ...columnFormData, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn lớp học</option>
                  {filteredClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đợt điểm
                </label>
                <select
                  value={columnFormData.gradePeriodId}
                  onChange={(e) => setColumnFormData({ ...columnFormData, gradePeriodId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Không thuộc đợt nào</option>
                  {gradePeriods.map((period) => (
                    <option key={period.id} value={period.id}>{period.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Điểm tối đa *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={columnFormData.maxScore}
                    onChange={(e) => setColumnFormData({ ...columnFormData, maxScore: parseFloat(e.target.value) || 10 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hệ số *
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={columnFormData.weight}
                    onChange={(e) => setColumnFormData({ ...columnFormData, weight: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={columnFormData.description}
                  onChange={(e) => setColumnFormData({ ...columnFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Mô tả về cột điểm này..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowColumnModal(false);
                    resetColumnForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {editingColumn ? 'Cập nhật' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}