import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import AnimatedBackground from '../layout/AnimatedBackground';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.emailOrUsername) {
      setErrors({ emailOrUsername: 'Email or username is required' });
      return;
    }
    if (!formData.password) {
      setErrors({ password: 'Password is required' });
      return;
    }

    try {
      const user = await login(formData.emailOrUsername, formData.password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'Invalid username/password' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen relative isolate overflow-hidden flex items-center justify-center px-4 sm:px-6 py-10">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[36px] bg-[radial-gradient(circle_at_18%_8%,rgba(99,102,241,0.5),rgba(59,130,246,0.3)_40%,rgba(59,130,246,0.12)_62%,transparent_78%)] blur-3xl" />
          <div className="absolute -inset-2 -z-10 rounded-[30px] border border-white/45 shadow-[0_0_0_1px_rgba(255,255,255,0.25)_inset]" />
          <Card className="relative z-10 p-7 sm:p-9 backdrop-blur-md bg-white/92 border border-white/85 shadow-[0_44px_110px_-32px_rgba(79,70,229,0.7),0_22px_56px_-26px_rgba(30,64,175,0.52),0_10px_24px_-16px_rgba(15,23,42,0.28)]">
          <div className="space-y-2 text-center mb-7">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text)] tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-muted)]">
              Sign in to continue to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {errors.general}
              </div>
            )}

            <Input
              label="Email or Username"
              name="emailOrUsername"
              type="text"
              value={formData.emailOrUsername}
              onChange={handleChange}
              error={errors.emailOrUsername}
              placeholder="Enter your email or username"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In
            </Button>

            <div className="text-center text-sm pt-1">
              <span className="text-[var(--text-muted)]">Don't have an account? </span>
              <Link to="/signup" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors">
                Sign up
              </Link>
            </div>
          </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
