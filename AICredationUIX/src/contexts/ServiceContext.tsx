import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { ServiceFactory } from '../services/ServiceFactory';
import { IAccreditationService } from '../services/AccreditationService';

interface ServiceContextValue {
  accreditationService: IAccreditationService;
}

const ServiceContext = createContext<ServiceContextValue | undefined>(undefined);

interface ServiceProviderProps {
  children: ReactNode;
  baseUrl?: string;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children, baseUrl }) => {
  // Single point for dependency wiring (Dependency Inversion)
  const services = useMemo(() => {
    const factory = ServiceFactory.getInstance(baseUrl);
    return {
      accreditationService: factory.getAccreditationService()
    };
  }, [baseUrl]);

  return (
    <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>
  );
};

export const useServices = (): ServiceContextValue => {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error('useServices must be used within ServiceProvider');
  return ctx;
};
