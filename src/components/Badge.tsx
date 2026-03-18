import { cn } from "@/src/lib/utils";
import { Priority, Status } from "@/src/types";

interface BadgeProps {
  type: 'priority' | 'status';
  value: Priority | Status;
  className?: string;
}

export function Badge({ type, value, className }: BadgeProps) {
  const getStyles = () => {
    if (type === 'priority') {
      switch (value) {
        case 'high': return 'bg-rose-50 text-rose-600 border-rose-200/50 shadow-sm shadow-rose-500/5';
        case 'medium': return 'bg-amber-50 text-amber-600 border-amber-200/50 shadow-sm shadow-amber-500/5';
        case 'low': return 'bg-emerald-50 text-emerald-600 border-emerald-200/50 shadow-sm shadow-emerald-500/5';
      }
    } else {
      switch (value) {
        case 'todo': return 'bg-slate-50 text-slate-500 border-slate-200/50';
        case 'in-progress': return 'bg-blue-50 text-blue-600 border-blue-200/50 shadow-sm shadow-blue-500/5';
        case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-200/50 shadow-sm shadow-emerald-500/5';
        case 'overdue': return 'bg-rose-50 text-rose-600 border-rose-200/50 shadow-sm shadow-rose-500/5';
      }
    }
  };

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider transition-all",
      getStyles(),
      className
    )}>
      {value.replace('-', ' ')}
    </span>
  );
}
