import React from 'react';
import {
  Users,
  Building,
  Landmark,
  FileSpreadsheet,
  CalendarDays,
  Shield,
  LayoutGrid,
  Bell,
  ArrowRight,
  User,
  Briefcase,
  FileText,
} from 'lucide-react';

export function SearchResultItem({ item, isSelected, onClick }) {
  const getIcon = () => {
    if (item.icon) {
      const CustomIcon = item.icon;
      return <CustomIcon size={15} />;
    }
    switch (item.type) {
      case 'employee':
        return <User size={14} />;
      case 'department':
        return <Building size={14} />;
      case 'payrun':
      case 'payroll':
        return <Landmark size={14} />;
      case 'payslip':
        return <FileSpreadsheet size={14} />;
      case 'leave':
        return <CalendarDays size={14} />;
      case 'audit':
        return <Shield size={14} />;
      case 'announcement':
        return <Bell size={14} />;
      default:
        return <LayoutGrid size={14} />;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer border-none ${
        isSelected
          ? 'bg-[var(--primary-soft)] text-[var(--primary)] font-semibold shadow-xs'
          : 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            isSelected
              ? 'bg-[var(--primary)] text-white'
              : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border border-[var(--border)]'
          }`}
        >
          {getIcon()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-[var(--text-primary)] truncate flex items-center gap-2">
            <span>{item.title}</span>
            {item.badge && (
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-[var(--surface-soft)] text-[var(--text-muted)] border border-[var(--border)] shrink-0">
                {item.badge}
              </span>
            )}
          </div>
          {item.subtitle && (
            <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
              {item.subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        {item.status && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              item.status === 'Active' || item.status === 'VALIDATED' || item.status === 'Validated'
                ? 'bg-[var(--success-soft)] text-[var(--success)]'
                : item.status === 'PENDING_APPROVAL' || item.status === 'COMPUTED'
                ? 'bg-[var(--warning-soft)] text-[var(--warning)]'
                : 'bg-[var(--surface-soft)] text-[var(--text-muted)]'
            }`}
          >
            {item.status}
          </span>
        )}
        <ArrowRight
          size={13}
          className={`text-[var(--text-muted)] transition-transform duration-150 ${
            isSelected ? 'translate-x-0.5 opacity-100 text-[var(--primary)]' : 'opacity-40'
          }`}
        />
      </div>
    </button>
  );
}
