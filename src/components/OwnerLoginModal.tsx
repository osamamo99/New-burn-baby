import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const OwnerLoginModal: React.FC<OwnerLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Barah-e-karam password darj karein');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.login(password);
      setPassword('');
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ghalat password. Dobara koshish karein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-w-md w-full rounded-3xl bg-white p-7 sm:p-8 shadow-2xl border border-rose-200 text-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-slate-900">
            Owner Portal Login
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Yeh private dashboard sirf website ke mutamid walidain (owner) ke liye mehfooz hai.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Owner Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter owner secret password..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Dashboard Kholein</span>
              </>
            )}
          </button>
        </form>

        {/* Quick hint for the user on first run */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1 font-semibold text-amber-800">
            <span>💡 Pehli Dafa Setup Hint:</span>
          </div>
          <p>
            Default owner password: <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">BabyLove2026!</code>
          </p>
          <p className="text-[10px] text-slate-400">
            Login karne ke baad Dashboard ke "Security" tab se apna naya password tabdeel kar sakte hain.
          </p>
        </div>

      </div>
    </div>
  );
};
