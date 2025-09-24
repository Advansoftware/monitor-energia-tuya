'use client';

import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  title?: string;
  titleIcon?: ReactNode;
  actions?: ReactNode;
}

export default function PageLayout({ 
  children, 
  className = '', 
  title, 
  titleIcon,
  actions 
}: PageLayoutProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {(title || titleIcon || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {(title || titleIcon) && (
            <div className="flex items-center space-x-3">
              {titleIcon}
              {title && (
                <h1 className="text-2xl font-bold text-slate-50">{title}</h1>
              )}
            </div>
          )}
          {actions && (
            <div className="flex flex-wrap gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}