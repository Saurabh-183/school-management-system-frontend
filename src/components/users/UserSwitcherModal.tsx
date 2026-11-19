'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { User } from '@/lib/types';
import { Check, UserPlus, Mail, Phone } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface UserSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  activeUserId: string;
  onSelectUser: (user: User) => void;
  onOpenCreateUser: () => void;
}

export function UserSwitcherModal({
  isOpen,
  onClose,
  users,
  activeUserId,
  onSelectUser,
  onOpenCreateUser,
}: UserSwitcherModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Switch Active Student"
      description="Choose which student profile to use for booking and viewing session history."
    >
      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
        {users.map((user) => {
          const isSelected = user._id === activeUserId;
          return (
            <button
              key={user._id}
              onClick={() => {
                onSelectUser(user);
                onClose();
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                  : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs ${
                    isSelected
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'bg-zinc-100 text-zinc-800'
                  }`}
                >
                  {getInitials(user.fullName)}
                </div>
                <div>
                  <h4 className="text-xs font-semibold leading-tight">{user.fullName}</h4>
                  <div
                    className={`flex items-center gap-2 text-[11px] mt-0.5 ${
                      isSelected ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    <span>{user.email}</span>
                    <span>•</span>
                    <span>{user.phone}</span>
                  </div>
                </div>
              </div>

              {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-zinc-100 flex items-center justify-between mt-3">
        <span className="text-xs text-zinc-500">Need a different student?</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onClose();
            onOpenCreateUser();
          }}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Create New Student
        </Button>
      </div>
    </Modal>
  );
}
