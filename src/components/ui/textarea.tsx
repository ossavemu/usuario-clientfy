import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Resetear la altura para obtener el scrollHeight correcto
    textarea.style.height = 'auto';
    // Establecer la nueva altura basada en el contenido
    textarea.style.height = `${textarea.scrollHeight}px`;
    // Asegurar que el contenido sea visible
    textarea.scrollTop = textarea.scrollHeight;
  }, []);

  // Ajustar altura inicial y cuando cambie el contenido
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Ajuste inicial
    adjustHeight();

    // Observar cambios en el contenido
    const observer = new MutationObserver(adjustHeight);
    observer.observe(textarea, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    // Eventos adicionales que podrían requerir ajuste
    textarea.addEventListener('input', adjustHeight);
    window.addEventListener('resize', adjustHeight);

    return () => {
      observer.disconnect();
      textarea.removeEventListener('input', adjustHeight);
      window.removeEventListener('resize', adjustHeight);
    };
  }, [adjustHeight]);

  return (
    <textarea
      className={cn(
        'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none overflow-hidden',
        className
      )}
      ref={(element) => {
        // Mantener ambas referencias
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
        textareaRef.current = element;
      }}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
