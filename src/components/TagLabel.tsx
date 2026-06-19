import styles from '../styles/TagLabel.module.css';

interface TagLabelProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TagLabel({ name, color, size = 'md', selected = false, onClick, className = '' }: TagLabelProps) {
  const sizeClass = styles[size] || styles.md;

  const baseClassName = `${styles.tagLabel} ${sizeClass} ${styles.outlined} ${className}`;
  const interactiveStyles = onClick ? 'cursor-pointer transition-all' : '';

  const selectedStyles = selected
    ? 'scale-105 shadow-md'
    : onClick ? 'opacity-60 hover:opacity-80' : '';

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`${baseClassName} ${interactiveStyles} ${selectedStyles}`}
      style={{
        borderColor: color,
        color: color,
        backgroundColor: selected ? `${color}30` : `${color}15`,
      }}
    >
      {name}
    </Component>
  );
}
