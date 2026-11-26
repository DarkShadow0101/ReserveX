import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../utils/errors';
import Logo from '../../components/common/Logo';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await login({ email, password });
      if (res.success) {
        navigate(redirectUrl);
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid email or password'));
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
            'radial-gradient(circle at 20% 20%, rgba(91, 76, 242, 0.24), transparent 45%), radial-gradient(circle at 80% 80%, rgba(255, 90, 95, 0.12), transparent 45%)'
        }}
      />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Logo light={true} />
          <h1 className="text-3xl font-serif font-bold text-white pt-2">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-400">
            Sign in to manage your tickets, bookings, and organizer events.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/15 border border-rose-400/30 rounded-2xl text-xs text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-[#12172A]/90 backdrop-blur-xl rounded-3xl p-8 border border-white/15 shadow-2xl space-y-5"
        >
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
            placeholder="••••••••"
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

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                className="rounded border-white/20 bg-brand-navy text-brand-purple focus:ring-brand-purple"
              />
              <span>Remember me</span>
            </label>
            <Link to="/" className="text-slate-400 hover:text-white transition-colors">
              Back to Home
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full rounded-2xl bg-brand-purple hover:bg-indigo-500 shadow-glow py-3.5"
          >
            Sign In <ArrowRight className="w-4 h-4 ml-1" />
          </Button>

          <div className="pt-2 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link
              to={`/register${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="text-indigo-300 font-bold hover:text-white hover:underline"
            >
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
