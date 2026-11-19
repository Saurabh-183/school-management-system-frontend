'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { User } from '@/lib/types';
import { UserPlus, AlertCircle } from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { fullName: string; email: string; phone: string }) => Promise<User>;
  onUserCreated?: (user: User) => void;
}

export function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  onUserCreated,
}: CreateUserModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError('All fields are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newUser = await onSubmit({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      setFullName('');
      setEmail('');
      setPhone('');
      if (onUserCreated) onUserCreated(newUser);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create student account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Student (API 1)"
      description="Create a new user account. Email address must be unique across the platform."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            Full Name:
          </label>
          <input
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full text-xs font-medium border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            Email Address (Unique):
          </label>
          <input
            type="email"
            placeholder="e.g. rahul@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-xs font-medium border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            Phone Number:
          </label>
          <input
            type="tel"
            placeholder="e.g. +91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full text-xs font-medium border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900 transition-colors"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            <UserPlus className="w-3.5 h-3.5" />
            Create Student Account
          </Button>
        </div>
      </form>
    </Modal>
  );
}
