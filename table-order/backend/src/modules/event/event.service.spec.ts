import { EventService } from './event.service';
import { take } from 'rxjs';

describe('EventService', () => {
  let service: EventService;

  beforeEach(() => {
    service = new EventService();
  });

  describe('subscribeToStoreOrders', () => {
    it('매장 이벤트를 수신한다', (done) => {
      service.subscribeToStoreOrders(1).pipe(take(1)).subscribe((event) => {
        const data = JSON.parse(event.data as string);
        expect(data.type).toBe('ORDER_CREATED');
        expect(data.order.id).toBe(1);
        done();
      });
      service.emitOrderCreated(1, { id: 1, tableId: 3 });
    });

    it('다른 매장 이벤트는 수신하지 않는다', (done) => {
      let received = false;
      service.subscribeToStoreOrders(1).pipe(take(1)).subscribe(() => { received = true; });
      service.emitOrderCreated(2, { id: 1, tableId: 3 });
      setTimeout(() => { expect(received).toBe(false); done(); }, 100);
    });
  });

  describe('subscribeToTableOrders', () => {
    it('해당 테이블 이벤트를 수신한다', (done) => {
      service.subscribeToTableOrders(1, 3).pipe(take(1)).subscribe((event) => {
        const data = JSON.parse(event.data as string);
        expect(data.type).toBe('ORDER_STATUS_CHANGED');
        done();
      });
      service.emitOrderStatusChanged(1, { id: 1, tableId: 3, status: 'PREPARING' });
    });

    it('다른 테이블 이벤트는 수신하지 않는다', (done) => {
      let received = false;
      service.subscribeToTableOrders(1, 3).pipe(take(1)).subscribe(() => { received = true; });
      service.emitOrderStatusChanged(1, { id: 1, tableId: 5, status: 'PREPARING' });
      setTimeout(() => { expect(received).toBe(false); done(); }, 100);
    });
  });

  describe('emitOrderDeleted', () => {
    it('주문 삭제 이벤트를 발행한다', (done) => {
      service.subscribeToStoreOrders(1).pipe(take(1)).subscribe((event) => {
        const data = JSON.parse(event.data as string);
        expect(data.type).toBe('ORDER_DELETED');
        expect(data.orderId).toBe(5);
        done();
      });
      service.emitOrderDeleted(1, 5, 3);
    });
  });

  describe('emitSessionCompleted', () => {
    it('세션 완료 이벤트를 발행한다', (done) => {
      service.subscribeToTableOrders(1, 3).pipe(take(1)).subscribe((event) => {
        const data = JSON.parse(event.data as string);
        expect(data.type).toBe('SESSION_COMPLETED');
        expect(data.tableId).toBe(3);
        done();
      });
      service.emitSessionCompleted(1, 3, 10);
    });
  });
});
