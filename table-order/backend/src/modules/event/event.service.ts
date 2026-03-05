import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface OrderEvent {
  type: 'ORDER_CREATED' | 'ORDER_STATUS_CHANGED' | 'ORDER_DELETED' | 'SESSION_COMPLETED';
  storeId: number;
  tableId?: number;
  data: any;
}

@Injectable()
export class EventService {
  private readonly eventSubject = new Subject<OrderEvent>();

  /** 관리자용: 매장 전체 주문 이벤트 구독 */
  subscribeToStoreOrders(storeId: number): Observable<MessageEvent> {
    return this.eventSubject.asObservable().pipe(
      filter((e) => e.storeId === storeId),
      map((e) => ({ data: JSON.stringify({ type: e.type, ...e.data }) }) as MessageEvent),
    );
  }

  /** 고객용: 특정 테이블 주문 이벤트 구독 */
  subscribeToTableOrders(storeId: number, tableId: number): Observable<MessageEvent> {
    return this.eventSubject.asObservable().pipe(
      filter((e) => e.storeId === storeId && (e.tableId === tableId || !e.tableId)),
      map((e) => ({ data: JSON.stringify({ type: e.type, ...e.data }) }) as MessageEvent),
    );
  }

  emitOrderCreated(storeId: number, order: any): void {
    this.eventSubject.next({
      type: 'ORDER_CREATED', storeId, tableId: order.tableId,
      data: { order },
    });
  }

  emitOrderStatusChanged(storeId: number, order: any): void {
    this.eventSubject.next({
      type: 'ORDER_STATUS_CHANGED', storeId, tableId: order.tableId,
      data: { orderId: order.id, status: order.status },
    });
  }

  emitOrderDeleted(storeId: number, orderId: number, tableId: number): void {
    this.eventSubject.next({
      type: 'ORDER_DELETED', storeId, tableId,
      data: { orderId },
    });
  }

  emitSessionCompleted(storeId: number, tableId: number, sessionId: number): void {
    this.eventSubject.next({
      type: 'SESSION_COMPLETED', storeId, tableId,
      data: { tableId, sessionId },
    });
  }
}
