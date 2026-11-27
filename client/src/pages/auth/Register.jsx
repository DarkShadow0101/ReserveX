import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../utils/errors';
import { CURATED_STOCK_IMAGES } from '../../mocks/eventImages';
import AuthStageShell from '../../components/auth/AuthStageShell';
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
    <AuthStageShell
      mode="register"
      redirectUrl={redirectUrl}
      backgroundImage={CURATED_STOCK_IMAGES[1]}
      displayTitle="Claim Front Row"
      displaySerif="Your Nights, Reserved."
      subtitle="Create one account to book concerts, festivals, comedy, or host your own events."
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
          label="Full Name"
          type="text"
          required
          theme="dark"
          autoComplete="name"
          placeholder="Your full name"
          icon={User}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Input
          label="Email Address"
          type="email"
          required
          theme="dark"
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
          theme="dark"
          autoComplete="new-password"
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

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full rounded-xl bg-[#D9381E] hover:bg-[#C92C12] text-white py-3 text-sm sm:text-base mt-1"
        >
          <span>Create ReserveX Account</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        <p className="pt-1 text-center text-xs text-slate-300">
          Already registered?{' '}
          <Link
            to={`/login${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="text-[#FF6B4A] font-semibold hover:text-white hover:underline"
          >
            Sign In
          </Link>
        </p>
      </form>
    </AuthStageShell>
  );
}
