import React from 'react';
import { Calendar, FileText, Users, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const iconMap = {
  calendar: Calendar,
  fileText: FileText,
  users: Users,
  alert: AlertCircle
};

export const EmptyState = ({
  icon = 'calendar',
  title = 'No records found',
  description = 'There are no active entries in this section at the moment.',
  actionText = null,
  actionLink = null,
  onActionClick = null
}) => {
  const IconComponent = iconMap[icon] || AlertCircle;

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mb-4 ring-8 ring-slate-50">
        <IconComponent className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}

      {actionText && onActionClick && !actionLink && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
