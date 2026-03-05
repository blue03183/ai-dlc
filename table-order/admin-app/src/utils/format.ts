export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

export function formatOrderStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING: '대기중',
    PREPARING: '준비중',
    COMPLETED: '완료',
  };
  return map[status] || status;
}

export function formatAdminRole(role: string): string {
  const map: Record<string, string> = {
    OWNER: '오너',
    MANAGER: '일반 관리자',
  };
  return map[role] || role;
}
