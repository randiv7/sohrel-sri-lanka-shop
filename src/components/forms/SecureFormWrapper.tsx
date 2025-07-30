import React, { useState, useEffect } from 'react';
import { checkRateLimit } from '@/utils/securityUtils';

interface SecureFormWrapperProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  maxSubmissions?: number;
  rateLimitWindow?: number;
  formId: string;
  className?: string;
}

export const SecureFormWrapper: React.FC<SecureFormWrapperProps> = ({
  children,
  onSubmit,
  maxSubmissions = 5,
  rateLimitWindow = 60000, // 1 minute
  formId,
  className = ""
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || rateLimited) return;

    // Check rate limit
    const rateLimitKey = `form_${formId}_${Date.now().toString().slice(0, -5)}`; // Per minute bucket
    if (!checkRateLimit(rateLimitKey, maxSubmissions, rateLimitWindow)) {
      setRateLimited(true);
      setTimeout(() => setRateLimited(false), rateLimitWindow);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
      {rateLimited && (
        <div className="text-sm text-destructive mt-2">
          Too many submissions. Please wait before trying again.
        </div>
      )}
    </form>
  );
};