'use client';

import { cn } from '@/lib/utils';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const MemoTooltipPrimitiveContent = React.memo(TooltipPrimitive.Content);
const TooltipContent = React.memo(
  React.forwardRef<
    React.ElementRef<typeof MemoTooltipPrimitiveContent>,
    React.ComponentPropsWithoutRef<typeof MemoTooltipPrimitiveContent>
  >(({ className, sideOffset = 4, ...props }, ref) => (
    <MemoTooltipPrimitiveContent
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded-md bg-white px-3 py-1.5 text-sm text-slate-950 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-slate-950 dark:text-slate-50',
        className,
      )}
      {...props}
    />
  )),
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
