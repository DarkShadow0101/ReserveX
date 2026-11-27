import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../utils/errors';
import Logo from '../../components/common/Logo';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await register({ fullName, email, password });
      if (res.success) {
        navigate(redirectUrl);
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Registration failed. Email might already be in use.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-navy text-white relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 45% at 50% 0%, rgba(255, 77, 45, 0.14), transparent 65%)'
        }}
      />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Logo light={true} />
          <h1 className="font-display uppercase text-3xl sm:text-4xl font-bold text-white pt-2">
            Create Your Account
          </h1>
          <p className="text-sm text-slate-400">
            Join ReserveX to book live events or launch your own venue shows.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/15 border border-rose-400/30 rounded-xl text-xs text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-[#101219] rounded-2xl p-8 border border-white/15 shadow-card space-y-5"
        >
          <Input
            label="Full Name"
            type="text"
            required
            theme="dark"
            placeholder="John Doe"
            icon={User}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            required
            theme="dark"
            placeholder="you@example.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            theme="dark"
            placeholder="Min. 6 characters"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <div className="text-xs text-slate-300 space-y-1.5 pt-1">
            <p className="flex items-center gap-2 text-[#10B981]">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Instant digital QR passes in your wallet</span>
            </p>
            <p className="flex items-center gap-2 text-[#10B981]">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>10-minute checkout seat reservation</span>
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full rounded-xl bg-[#FF4D2D] hover:bg-[#E63E20] shadow-glow py-3.5"
          >
            Create Account <ArrowRight className="w-4 h-4 ml-1" />
          </Button>

          <div className="pt-2 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link
              to={`/login${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="text-[#FF4D2D] font-bold hover:text-white hover:underline"
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
