import { Controller, Param, Sse, ParseIntPipe } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EventService } from './event.service';

@Controller('stores/:storeId')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  /** 관리자용 SSE: 매장 전체 주문 이벤트 */
  @Sse('events/orders')
  subscribeStoreOrders(
    @Param('storeId', ParseIntPipe) storeId: number,
  ): Observable<MessageEvent> {
    return this.eventService.subscribeToStoreOrders(storeId);
  }

  /** 고객용 SSE: 특정 테이블 주문 이벤트 */
  @Sse('tables/:tableId/events/orders')
  subscribeTableOrders(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('tableId', ParseIntPipe) tableId: number,
  ): Observable<MessageEvent> {
    return this.eventService.subscribeToTableOrders(storeId, tableId);
  }
}
