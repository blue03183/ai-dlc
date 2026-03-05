import type { OrderStatus } from '@/types';
import { formatOrderStatus } from '@/utils/format';

const statusColors: Record<OrderStatus, string> = {
  PENDING: '#ff9800',
  PREPARING: '#2196f3',
  COMPLETED: '#4caf50',
};

interface Props {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: Props) {
  return (
    <span
      data-testid="order-status-badge"
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: 600,
        color: '#fff',
        backgroundColor: statusColors[status],
      }}
    >
      {formatOrderStatus(status)}
    </span>
  );
}
