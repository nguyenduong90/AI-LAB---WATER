import React from 'react';

interface AuthorInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthorInfoModal: React.FC<AuthorInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 m-4 text-center text-gray-800 max-w-sm w-full transform transition-all duration-300 scale-95 hover:scale-100"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h2 className="text-sm font-semibold uppercase text-blue-700 tracking-wider">Ủy Ban Nhân Dân Xã Phước Mỹ Trung</h2>
        <h1 className="text-xl font-bold text-blue-900 mt-2">Trường Tiểu Học Phước Mỹ Trung</h1>
        <p className="text-xs text-gray-600 mt-1">Địa chỉ: ấp Phước Hậu, xã Phước Mỹ Trung, tỉnh Vĩnh Long.</p>
        <p className="text-xs text-gray-600 mt-1">Số điện thoại: 02753.845.133</p>
        <div className="border-t-2 border-blue-200 my-4"></div>
        <p className="text-md text-gray-600">Giáo Viên Thực Hiện</p>
        <p className="text-2xl font-bold text-red-600 mt-1">Nguyễn Hải Dương</p>
        <button 
          onClick={onClose}
          className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};