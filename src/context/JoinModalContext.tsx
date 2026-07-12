'use client';

import React, { createContext, useContext, useState } from 'react';

interface JoinModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const JoinModalContext = createContext<JoinModalContextType | undefined>(undefined);

export function JoinModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <JoinModalContext.Provider value={{ isOpen, openModal, closeModal }}>
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
