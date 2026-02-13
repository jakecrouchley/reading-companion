import type { ReadingStatus } from '@/types';

interface StatusBadgeProps {
  status: ReadingStatus;
}

const statusConfig: Record<ReadingStatus, { label: string; className: string }> = {
  not_started: {
    label: 'Not Started',
    className: 'bg-gray-100 text-gray-700',
  },
  reading: {
    label: 'Reading',
    className: 'bg-blue-100 text-blue-700',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-700',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
