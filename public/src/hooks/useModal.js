import { useState, useCallback } from 'react';

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);

  const open = useCallback((modalData = null) => {
    setData(modalData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  };
};

export const useMultipleModals = (modalNames = []) => {
  const [modals, setModals] = useState(
    modalNames.reduce((acc, name) => {
      acc[name] = { isOpen: false, data: null };
      return acc;
    }, {})
  );

  const openModal = useCallback((modalName, data = null) => {
    setModals(prev => ({
      ...prev,
      [modalName]: { isOpen: true, data }
    }));
  }, []);

  const closeModal = useCallback((modalName) => {
    setModals(prev => ({
      ...prev,
      [modalName]: { isOpen: false, data: null }
    }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals(
      modalNames.reduce((acc, name) => {
        acc[name] = { isOpen: false, data: null };
        return acc;
      }, {})
    );
  }, [modalNames]);

  const getModalState = useCallback((modalName) => {
    return modals[modalName] || { isOpen: false, data: null };
  }, [modals]);

  const isAnyModalOpen = useCallback(() => {
    return Object.values(modals).some(modal => modal.isOpen);
  }, [modals]);

  return {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    getModalState,
    isAnyModalOpen,
  };
};
