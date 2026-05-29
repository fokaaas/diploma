import { Injectable } from '@nestjs/common';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { WarehouseRepository } from '../../infrastructure/database/repos/warehouse.repo';
import type { WarehouseResponse } from './responses/warehouse.response';

@Injectable()
export class WarehousesService {
  constructor(private readonly warehouses: WarehouseRepository) {}

  async list(actor: UserPrincipal): Promise<WarehouseResponse[]> {
    const records = await this.warehouses.findManyByFoundation(
      actor.foundationId,
    );
    return records.map((w) => ({ id: w.id, name: w.name }));
  }
}
