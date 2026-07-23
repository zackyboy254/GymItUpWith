'use client';

import React, { createContext, useContext, useState } from 'react';

interface JoinModalContextType {
  isOpen: boolean;
  selectedProgram: string;
  openModal: (program?: string | React.MouseEvent<HTMLButtonElement>) => void;
  closeModal: () => void;
}

const JoinModalContext = createContext<JoinModalContextType | undefined>(undefined);

export function JoinModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('');

  const openModal = (program: string | React.MouseEvent<HTMLButtonElement> = '') => {
    if (typeof program === 'string') {
      setSelectedProgram(program);
    } else {
      const cardTitle = program.currentTarget.closest('article')?.querySelector('h3')?.textContent?.trim() || '';
      const inferredProgram = cardTitle === '90-Day Transformation' ? '90-Day Transformation Challenge' : cardTitle;
      setSelectedProgram(inferredProgram);
    }
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
    setSelectedProgram('');
  };

  return (
    <JoinModalContext.Provider value={{ isOpen, selectedProgram, openModal, closeModal }}>
      {children}
    </JoinModalContext.Provider>
  );
}

export function useJoinModal() {
  const context = useContext(JoinModalContext);
  if (!context) {
    throw new Error('useJoinModal must be used within a JoinModalProvider');
  }
  return context;
}
