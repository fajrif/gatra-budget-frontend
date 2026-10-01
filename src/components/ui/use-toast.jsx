import toast from 'react-hot-toast';

export const useToast = () => {
  return {
    toast: ({ title, description, variant = 'default' }) => {
      const message = description || title;

      if (variant === 'success') {
        toast.success(message, {
          duration: 3000,
          style: {
            background: '#10b981',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
        });
      } else if (variant === 'destructive') {
        // Long errors (e.g. a list of rejected references) need time to be read;
        // short ones keep the usual 4s.
        const duration = Math.max(4000, Math.min(15000, String(message ?? '').length * 60));
        toast.error(message, {
          duration,
          style: {
            background: '#ef4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
          whiteSpace: 'pre-line',
          maxWidth: '480px',
        });
      } else {
        toast(message, {
          duration: 3000,
          style: {
            background: '#3b82f6',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
        });
      }
    },
  };
};
