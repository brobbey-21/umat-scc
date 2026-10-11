import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
import loginBg from '../assets/images/IMG_1767.jpg';

interface AdminLoginProps {
  onLogin: (password: string) => Promise<void>;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
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
    <section
      className="relative min-h-svh w-full overflow-hidden bg-[#0b0b0b]"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dim + cool the photo so the glass reads cleanly */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0b]/55 via-[#0b0b0b]/35 to-[#0b0b0b]/70" />
      <div className="absolute inset-0 bg-[#121212]/25" />

      <div className="relative z-10 min-h-svh flex items-center justify-center px-4 py-16">
        <div className="animate-fade-in w-full max-w-md rounded-[2rem] border border-white/25 bg-white/10 backdrop-blur-2xl shadow-[0_24px_70px_rgba(10,10,10,0.5)] p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-white/15 border border-white/30 text-white mx-auto flex items-center justify-center backdrop-blur-md">
              <ShieldCheck className="w-8 h-8 text-[#fff187]" />
            </div>
            <div>
              <h2 className="font-heading text-3xl font-bold text-white">
                SCC Administrator Login
              </h2>
              <p className="text-sm text-[#f8f8f2]/70 mt-1">
                Enter the council admin password to access the portal.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#f8f8f2]/85 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#f8f8f2]/55" />
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full h-12 px-4 pr-12 bg-white/15 border border-white/30 rounded-xl text-sm text-white placeholder-white/50 focus:outline-none focus:border-[#f5e11d] focus:ring-2 focus:ring-[#f5e11d]/40 backdrop-blur-md"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-[#FFC9C9] bg-[#BA1A1A]/25 border border-[#FFC9C9]/25 rounded-lg px-3 py-2 backdrop-blur-md">
                {error}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !password.trim()}
                className="w-full py-3 text-sm font-semibold text-[#141414] bg-[#f5e11d] hover:bg-[#fff187] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0b0b0b]/30"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign In to Portal</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Hint */}
          <div className="pt-2 border-t border-white/20 text-[11px] text-[#f8f8f2]/50 text-center">
            Default password is set in <code className="bg-white/15 px-1.5 py-0.5 rounded text-[#fff187]">.env.local</code> as <code className="bg-white/15 px-1.5 py-0.5 rounded text-[#fff187]">ADMIN_PASSWORD</code>
          </div>
        </div>
      </div>
    </section>
  );
};
