import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen auth-page-bg bg-dots-pattern flex items-center justify-center px-6 lg:px-12 py-12">
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        {/* Left: Stacked text and form */}
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-3">
            <h1 className="text-5xl lg:text-6xl font-semibold text-[var(--text)] tracking-tight leading-tight whitespace-nowrap">
              Welcome back
            </h1>
            <p className="text-lg text-[var(--text-muted)] leading-relaxed">
              Sign in to your account to continue to{' '}
              <span className="font-semibold text-[var(--accent)] drop-shadow-[0_2px_6px_rgba(79,70,229,0.3)]">
                StartupX
              </span>
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="text-center text-sm">
                <span className="text-[var(--text-muted)]">Don't have an account? </span>
                <Link to="/signup" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors">
                  Sign up
                </Link>
              </div>
            </form>
          </Card>
        </div>

        {/* Right: Large StartupX */}
        <div className="hidden lg:flex relative flex-shrink-0 items-center justify-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-[var(--text)] font-black text-8xl lg:text-[10rem] leading-none tracking-tight"
            style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 2px 8px rgba(79, 70, 229, 0.3)) drop-shadow(0 8px 24px rgba(79, 70, 229, 0.25))',
            }}
          >
            StartupX
          </motion.h1>
        </div>
      </div>
    </div>
  );
};

export default Login;
