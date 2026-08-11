import React, { useState, useRef } from 'react';
import { Download, Upload, HardDrive, CheckCircle2, AlertCircle, X, HelpCircle, FileArchive } from 'lucide-react';
import { exportMediaBackupFile, importMediaBackupFile } from '../services/mediaStorage';

interface MediaBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
}

export const MediaBackupModal: React.FC<MediaBackupModalProps> = ({ isOpen, onClose, onDataRestored }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setMessage(null);
      const count = await exportMediaBackupFile();
      if (count === 0) {
        setMessage({
          text: 'Chưa có file MP3 hoặc MOV tùy chỉnh nào được tải lên để sao lưu.',
          type: 'info',
        });
      } else {
        setMessage({
          text: `Đã xuất thành công gói sao lưu bao gồm ${count} file media (audio/video)!`,
          type: 'success',
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        text: 'Có lỗi xảy ra khi xuất file sao lưu. Vui lòng thử lại.',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setMessage(null);
      const count = await importMediaBackupFile(file);
      setMessage({
        text: `Khôi phục thành công ${count} file MP3/MOV vào bộ nhớ web này! Đang cập nhật...`,
        type: 'success',
      });
      if (onDataRestored) {
        setTimeout(() => {
          onDataRestored();
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setMessage({
        text: 'File sao lưu không đúng định dạng. Vui lòng chọn đúng file .pinyinpack đã xuất.',
        type: 'error',
      });
    } finally {
      setIsImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E8E4DF] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#F9F7F2] border-b border-[#E8E4DF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A5D4E] flex items-center justify-center text-white shadow-xs">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#2D2A26] text-base leading-tight font-serif">
                Sao Lưu & Chuyển Đổi Media (MP3 / MOV)
              </h3>
              <p className="text-xs text-gray-500">Mang video & âm thanh cá nhân sang web hoặc máy khác</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#E8E4DF] rounded-xl text-gray-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status Message */}
          {message && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : message.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Explanation Box */}
          <div className="bg-[#F9F7F2] border border-[#E8E4DF] p-4 rounded-xl space-y-2 text-xs text-gray-600 leading-relaxed">
            <div className="font-bold text-[#4A5D4E] flex items-center gap-1.5 text-xs">
              <HelpCircle className="w-4 h-4 text-[#4A5D4E]" />
              <span>Cách Chuyển File Sang Mọi Địa Chỉ Web Khác:</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1">
              <li>
                <strong>Trình duyệt này:</strong> Mọi file MP3/MOV bạn tải lên đã được <em>tự động lưu vĩnh viễn</em> tại địa chỉ này.
              </li>
              <li>
                <strong>Mở Web khác / Máy khác:</strong> Bấm nút <strong>"Xuất File Sao Lưu"</strong> bên dưới để tải file <code>.pinyinpack</code> về máy.
              </li>
              <li>
                <strong>Khôi phục:</strong> Truy cập địa chỉ Web mới, mở bảng này và bấm <strong>"Nhập File Sao Lưu"</strong>. Toàn bộ MP3/MOV sẽ lập tức hiển thị!
              </li>
            </ol>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex flex-col items-center justify-center p-4 bg-[#4A5D4E] hover:bg-[#3B4A3E] text-white rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-6 h-6 mb-1.5 animate-bounce" />
              <span className="font-bold text-xs">1. XUẤT FILE SAO LƯU</span>
              <span className="text-[10px] text-white/80 mt-0.5">Tải tệp .pinyinpack về máy</span>
            </button>

            {/* Import Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex flex-col items-center justify-center p-4 bg-white hover:bg-gray-50 text-[#2D2A26] border-2 border-[#4A5D4E] rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-6 h-6 text-[#4A5D4E] mb-1.5" />
              <span className="font-bold text-xs text-[#4A5D4E]">2. NHẬP FILE SAO LƯU</span>
              <span className="text-[10px] text-gray-500 mt-0.5">Khôi phục tệp trên web mới</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="*/*"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F9F7F2] border-t border-[#E8E4DF] text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white hover:bg-gray-100 text-[#2D2A26] font-bold rounded-xl text-xs border border-[#E8E4DF] cursor-pointer"
          >
            Đóng Bảng
          </button>
        </div>
      </div>
    </div>
  );
};
