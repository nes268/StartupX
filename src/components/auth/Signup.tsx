import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import AnimatedBackground from '../layout/AnimatedBackground';
import { User, Shield } from 'lucide-react';

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
    <div className="min-h-screen relative isolate overflow-hidden flex items-center justify-center px-4 sm:px-6 py-10">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-lg mx-auto">
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[36px] bg-[radial-gradient(circle_at_18%_8%,rgba(99,102,241,0.5),rgba(59,130,246,0.3)_40%,rgba(59,130,246,0.12)_62%,transparent_78%)] blur-3xl" />
          <div className="absolute -inset-2 -z-10 rounded-[30px] border border-white/45 shadow-[0_0_0_1px_rgba(255,255,255,0.25)_inset]" />
          <Card className="relative z-10 p-7 sm:p-9 backdrop-blur-md bg-white/92 border border-white/85 shadow-[0_46px_116px_-32px_rgba(79,70,229,0.7),0_24px_58px_-26px_rgba(30,64,175,0.52),0_10px_24px_-16px_rgba(15,23,42,0.28)]">
          <div className="text-center mb-7">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text)] tracking-tight mb-2">
              Create your account
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-muted)]">
              Join and get started in minutes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                      ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)] shadow-sm'
                      : 'border-[var(--border)] bg-[var(--bg-muted)] text-[var(--text-muted)] hover:border-[var(--accent-muted-border)] hover:bg-white'
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
                      ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)] shadow-sm'
                      : 'border-[var(--border)] bg-[var(--bg-muted)] text-[var(--text-muted)] hover:border-[var(--accent-muted-border)] hover:bg-white'
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

            <div className="text-center text-sm pt-1">
              <span className="text-[var(--text-muted)]">Already have an account? </span>
              <Link to="/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors">
                Sign in
              </Link>
            </div>
          </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup;
