import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Users,
  Monitor,
  Settings,
  CheckCircle,
  AlertCircle,
  Wrench,
  X,
  Save,
  Building,
  Download,
} from 'lucide-react';
import { Classroom } from '../types';
import { exportClassrooms } from '../lib/excelExport';

export default function ClassroomManager() {
  const { classrooms, addClassroom, updateClassroom, deleteClassroom } = useData();
  const { user } = useAuth();
  const toast = useToastContext();
  const [showModal, setShowModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'occupied' | 'maintenance'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 30,
    location: '',
    equipment: [] as string[],
    status: 'available' as 'available' | 'occupied' | 'maintenance',
    description: '',
  });

  const canManageClassrooms = user?.role !== 'teacher';

  const equipmentOptions = [
    'Máy chiếu',
    'Bảng thông minh',
    'Bảng trắng',
    'Điều hòa',
    'Micro',
    'Loa',
    'Máy tính',
    'Wifi',
    'Camera',
    'Đèn LED',
    'Quạt trần',
    'Ổ cắm điện',
  ];

  const filteredClassrooms = classrooms.filter(classroom => {
    const matchesSearch = classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classroom.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || classroom.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      capacity: 30,
      location: '',
      equipment: [],
      status: 'available',
      description: '',
    });
    setEditingClassroom(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingClassroom) {
        updateClassroom(editingClassroom.id, formData);
        toast.success('Cập nhật phòng học thành công!');
      } else {
        // Chỉ tạo phòng học với tên, các thông tin khác sẽ có giá trị mặc định
        const classroomData = {
          name: formData.name,
          capacity: 30,
          location: '',
          equipment: [],
          status: 'available' as const,
          description: '',
        };
        addClassroom(classroomData);
        toast.success('Thêm phòng học thành công!');
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving classroom:', error);
      toast.error('Có lỗi xảy ra khi lưu thông tin phòng học!');
    }
  };

  const handleEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    setFormData({
      name: classroom.name,
      capacity: classroom.capacity,
      location: classroom.location,
      equipment: classroom.equipment,
      status: classroom.status,
      description: classroom.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string, classroomName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phòng học "${classroomName}" không?`)) {
      try {
        deleteClassroom(id);
        toast.success('Xóa phòng học thành công!');
      } catch (error) {
        console.error('Error deleting classroom:', error);
        toast.error('Có lỗi xảy ra khi xóa phòng học!');
      }
    }
  };

  const handleEquipmentToggle = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...prev.equipment, equipment]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return CheckCircle;
      case 'occupied':
        return Users;
      case 'maintenance':
        return Wrench;
      default:
        return AlertCircle;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Có sẵn';
      case 'occupied':
        return 'Đang sử dụng';
      case 'maintenance':
        return 'Bảo trì';
      default:
        return status;
    }
  };

  const getStatusStats = () => {
    return {
      available: classrooms.filter(c => c.status === 'available').length,
      occupied: classrooms.filter(c => c.status === 'occupied').length,
      maintenance: classrooms.filter(c => c.status === 'maintenance').length,
    };
  };

  const stats = getStatusStats();

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await exportClassrooms(filteredClassrooms);
      toast.success('Xuất dữ liệu thành công!');
    } catch (error) {
      console.error('Error exporting classrooms:', error);
      toast.error('Có lỗi xảy ra khi xuất dữ liệu!');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý phòng học</h1>
          <p className="text-gray-600 mt-1">
            Quản lý và theo dõi tình trạng các phòng học
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
          {canManageClassrooms && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Thêm phòng học
            </button>
          )}
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng phòng học</p>
              <p className="text-2xl font-bold text-gray-900">{classrooms.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-100">
              <Building size={24} className="text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Có sẵn</p>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Đang sử dụng</p>
              <p className="text-2xl font-bold text-blue-600">{stats.occupied}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Bảo trì</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <Wrench size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm phòng học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="available">Có sẵn</option>
            <option value="occupied">Đang sử dụng</option>
            <option value="maintenance">Bảo trì</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassrooms.map((classroom) => {
            const StatusIcon = getStatusIcon(classroom.status);
            return (
              <div key={classroom.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{classroom.name}</h3>
                      {classroom.location && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin size={14} />
                          {classroom.location}
                        </p>
                      )}
                    </div>
                  </div>
                  {canManageClassrooms && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(classroom)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(classroom.id, classroom.name)}
                        className="text-red-600 hover:text-red-700"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sức chứa:</span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      <Users size={14} />
                      {classroom.capacity} người
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trạng thái:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(classroom.status)}`}>
                      <StatusIcon size={12} />
                      {getStatusLabel(classroom.status)}
                    </span>
                  </div>

                  {classroom.equipment.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600 mb-2 block">Thiết bị:</span>
                      <div className="flex flex-wrap gap-1">
                        {classroom.equipment.slice(0, 3).map((item, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {item}
                          </span>
                        ))}
                        {classroom.equipment.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{classroom.equipment.length - 3} khác
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {classroom.description && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">{classroom.description}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredClassrooms.length === 0 && (
          <div className="text-center py-8">
            <Building className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Không tìm thấy phòng học nào' 
                : 'Chưa có phòng học nào'}
            </p>
          </div>
        )}
      </div>

      {/* Modal thêm/sửa phòng học - Cải thiện hiển thị */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9998] overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-md my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingClassroom ? 'Chỉnh sửa phòng học' : 'Thêm phòng học mới'}
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
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Chỉ có trường tên phòng học cho form tạo mới */}
                {!editingClassroom ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên phòng học *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      placeholder="VD: Phòng A101"
                      required
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Chỉ cần nhập tên phòng học. Các thông tin khác có thể chỉnh sửa sau.
                    </p>
                  </div>
                ) : (
                  /* Form đầy đủ cho chỉnh sửa */
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên phòng học *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                        placeholder="VD: Phòng A101"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sức chứa *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={formData.capacity}
                          onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 30 })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trạng thái *
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                          required
                        >
                          <option value="available">Có sẵn</option>
                          <option value="occupied">Đang sử dụng</option>
                          <option value="maintenance">Bảo trì</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vị trí
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                        placeholder="VD: Tầng 1, Tòa A"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thiết bị có sẵn
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                        {equipmentOptions.map((equipment) => (
                          <label key={equipment} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={formData.equipment.includes(equipment)}
                              onChange={() => handleEquipmentToggle(equipment)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{equipment}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Đã chọn: {formData.equipment.length} thiết bị
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base resize-none"
                        rows={3}
                        placeholder="Mô tả thêm về phòng học..."
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <Save size={16} />
                    {editingClassroom ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}