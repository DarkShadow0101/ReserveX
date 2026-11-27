import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../utils/errors';
import { HERO_IMAGE } from '../../mocks/eventImages';
import AuthStageShell from '../../components/auth/AuthStageShell';
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
    <AuthStageShell
      mode="login"
      redirectUrl={redirectUrl}
      backgroundImage={HERO_IMAGE}
      displayTitle="Welcome Back"
      displaySerif="Step Inside the Gate."
      subtitle="Access your live QR entry passes, active seat holds, bookings, and Organizer Studio."
    >
      {error && (
        <div
          role="alert"
          className="p-3.5 bg-rose-500/15 border border-rose-400/30 rounded-xl text-xs text-rose-200 flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          required
          autoComplete="current-password"
          placeholder="Enter your password"
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

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full rounded-xl bg-[#D9381E] hover:bg-[#C92C12] text-white py-3 text-sm sm:text-base mt-1"
        >
          <span>Sign In to ReserveX</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        <p className="pt-1 text-center text-xs text-slate-300">
          New to ReserveX?{' '}
          <Link
            to={`/register${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="text-[#FF6B4A] font-semibold hover:text-white hover:underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthStageShell>
  );
}
