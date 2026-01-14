import React from 'react';

type ButtonColor = 'purple' | 'blue' | 'pink' | 'amber' | 'red' | 'green' | 'emerald' | 'teal' | 'cyan' | 'gray';

interface NeonButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  color?: ButtonColor;
  className?: string;
  fullWidth?: boolean;
  square?: boolean;
}

const colorStyles: Record<ButtonColor, { base: string; border: string; glow: string; text: string }> = {
  purple: {
    base: "bg-gradient-to-br from-purple-500 to-purple-700",
    border: "border-b-purple-900",
    glow: "shadow-purple-500/50",
    text: "text-white"
  },
  blue: {
    base: "bg-gradient-to-br from-blue-500 to-blue-700",
    border: "border-b-blue-900",
    glow: "shadow-blue-500/50",
    text: "text-white"
  },
  pink: {
    base: "bg-gradient-to-br from-pink-500 to-pink-700",
    border: "border-b-pink-900",
    glow: "shadow-pink-500/50",
    text: "text-white"
  },
  amber: {
    base: "bg-gradient-to-br from-amber-500 to-amber-700",
    border: "border-b-amber-900",
    glow: "shadow-amber-500/50",
    text: "text-white"
  },
  red: {
    base: "bg-gradient-to-br from-red-500 to-red-700",
    border: "border-b-red-900",
    glow: "shadow-red-500/50",
    text: "text-white"
  },
  green: {
    base: "bg-gradient-to-br from-green-500 to-green-700",
    border: "border-b-green-900",
    glow: "shadow-green-500/50",
    text: "text-white"
  },
  emerald: {
    base: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    border: "border-b-emerald-900",
    glow: "shadow-emerald-500/50",
    text: "text-white"
  },
  teal: {
    base: "bg-gradient-to-br from-teal-500 to-teal-700",
    border: "border-b-teal-900",
    glow: "shadow-teal-500/50",
    text: "text-white"
  },
  cyan: {
    base: "bg-gradient-to-br from-cyan-500 to-cyan-700",
    border: "border-b-cyan-900",
    glow: "shadow-cyan-500/50",
    text: "text-white"
  },
  gray: {
    base: "bg-gradient-to-br from-slate-600 to-slate-800",
    border: "border-b-slate-950",
    glow: "shadow-slate-500/30",
    text: "text-gray-100"
  }
};

const NeonButton: React.FC<NeonButtonProps> = ({ 
  onClick, 
  children, 
  color = 'purple',
  className = '',
  fullWidth = false,
  square = false
}) => {
  
  const styles = colorStyles[color];

  return (
    <button
      onClick={onClick}
      className={`
        relative 
        group
        ${fullWidth ? 'w-full' : ''}
        ${square ? 'aspect-square flex flex-col justify-center items-center p-2' : 'py-4 px-6'}
        rounded-2xl 
        font-bold 
        text-lg
        tracking-wide
        border-b-[6px]
        active:border-b-0 
        active:translate-y-[6px] 
        transition-all 
        duration-100
        ${styles.base}
        ${styles.border}
        ${styles.text}
        ${className}
      `}
      style={{
        boxShadow: square ? 'none' : undefined // Let the wrapper handle glow for squares or add below
      }}
    >
      {/* Outer Glow Layer */}
      <div className={`
        absolute -inset-0.5 rounded-2xl opacity-40 blur-md transition-opacity duration-300 group-hover:opacity-75 -z-10
        ${styles.glow.replace('shadow-', 'bg-')}
      `}></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-2 w-full h-full">
        {children}
      </div>
    </button>
  );
};

export default NeonButton;