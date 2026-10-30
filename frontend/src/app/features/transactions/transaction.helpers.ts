import { BadgeVariant } from '../../shared/badge/badge.component';
import { SourceType, StatusType } from '../../models/transaction.model';

export function statusVariant(status: StatusType): BadgeVariant {
  const map: Record<StatusType, BadgeVariant> = {
    completed: 'success',
    pending:   'warning',
    failed:    'danger',
    refunded:  'info',
    cancelled: 'neutral',
    unknown:   'neutral',
  };
  return map[status] ?? 'neutral';
}

export function sourceLabel(source: SourceType): string {
  const map: Record<SourceType, string> = {
    stripe:        'Stripe',
    paypal:        'PayPal',
    bank_transfer: 'Transferencia bancaria',
    unknown:       'Desconocida',
  };
  return map[source] ?? source;
}
