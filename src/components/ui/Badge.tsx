interface BadgeProps {
  label: string;
  size?: 'sm' | 'md';
  variant?: 'default' | 'primary';
}

export function Badge({ label, size = 'md', variant = 'default' }: BadgeProps) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const variantStyles = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-100 text-primary-700',
  };

  return (
    <span className={`inline-flex items-center justify-center text-center rounded-full font-medium ${sizeStyles[size]} ${variantStyles[variant]}`}>
      {label}
    </span>
  );
}
