import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { User, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    role: 'user' as 'user' | 'admin',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const user = await signup(formData);
      if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/profile-wizard');
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'Signup failed. Please try again.' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (role: 'user' | 'admin') => {
    setFormData({ ...formData, role });
  };

  return (
    <div className="min-h-screen auth-page-bg bg-dots-pattern flex items-center justify-center px-6 lg:px-12 py-12">
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        {/* Left: Stacked text and form */}
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[var(--text)] tracking-tight leading-tight mb-4 whitespace-nowrap">
              Create your account
            </h1>
            <p className="text-lg text-[var(--text-muted)] leading-relaxed">
              Join the startup ecosystem and accelerate your growth
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
                label="Full Name"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                placeholder="Enter your full name"
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="Enter your email"
              />

              <Input
                label="Username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                placeholder="Choose a username"
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Create a password"
              />

              <div className="space-y-3">
                <label className="block text-sm font-medium text-[var(--text-muted)]">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('user')}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      formData.role === 'user'
                        ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]'
                        : 'border-[var(--border)] bg-[var(--bg-muted)] text-[var(--text-muted)] hover:border-[var(--accent-muted-border)]'
                    }`}
                  >
                    <User className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">User</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('admin')}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      formData.role === 'admin'
                        ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]'
                        : 'border-[var(--border)] bg-[var(--bg-muted)] text-[var(--text-muted)] hover:border-[var(--accent-muted-border)]'
                    }`}
                  >
                    <Shield className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Admin</span>
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Create Account
              </Button>

              <div className="text-center text-sm">
                <span className="text-[var(--text-muted)]">Already have an account? </span>
                <Link to="/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors">
                  Sign in
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
            }}
          >
            StartupX
          </motion.h1>
        </div>
      </div>
    </div>
  );
};

export default Signup;
