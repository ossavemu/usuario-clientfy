'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

const MemoLabelPrimitiveRoot = React.memo(LabelPrimitive.Root);
const Label = React.memo(
  React.forwardRef<
    React.ElementRef<typeof MemoLabelPrimitiveRoot>,
    React.ComponentPropsWithoutRef<typeof MemoLabelPrimitiveRoot> &
      VariantProps<typeof labelVariants>
  >(({ className, ...props }, ref) => (
    <MemoLabelPrimitiveRoot
      ref={ref}
      className={cn(labelVariants(), className)}
      {...props}
    />
  )),
);
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
