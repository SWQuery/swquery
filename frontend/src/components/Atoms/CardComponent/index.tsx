/* eslint-disable @typescript-eslint/no-empty-object-type */
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-lg border border-purple-500/20 bg-black text-white shadow-lg ${className}`}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`p-6 pt-0 ${className}`}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

export default Card;