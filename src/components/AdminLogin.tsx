import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (password: string) => Promise<void>;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await onLogin(password);
    } catch (err: any) {
      setError(err.message || 'Invalid password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-[#FFFFFF] border border-[#E2E5DC] rounded-3xl p-8 shadow-sanctuary-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#EDF7F1] border border-[#BEE5CE] text-[#1D5C3E] mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-heading text-3xl font-bold text-[#18221D]">
              SCC Administrator Login
            </h2>
            <p className="text-sm text-[#5C6861] mt-1">
              Enter the council admin password to access the portal.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#18221D] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#8C9790]" />
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full h-12 px-4 pr-12 bg-[#FFFFFF] border border-[#D2DDD6] rounded-xl text-sm text-[#18221D] placeholder-[#8C9790] focus:outline-none focus:border-[#2E7D56] focus:ring-2 focus:ring-[#C59B4B]/30"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C9790] hover:text-[#5C6861] p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-[#BA1A1A] bg-[#FDF3F3] border border-[#F5D6D6] rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full py-3 text-sm font-semibold text-white bg-[#1B3B2B] hover:bg-[#142C20] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#C59B4B]" />
                  <span>Sign In to Portal</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 text-xs font-semibold text-[#5C6861] hover:text-[#18221D] flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          </div>
        </form>

        {/* Hint */}
        <div className="pt-2 border-t border-[#EEF2EF] text-[11px] text-[#8C9790] text-center">
          Default password is set in <code className="bg-[#F3F4EE] px-1.5 py-0.5 rounded">.env.local</code> as <code className="bg-[#F3F4EE] px-1.5 py-0.5 rounded">ADMIN_PASSWORD</code>
        </div>
      </div>
    </div>
  );
};
