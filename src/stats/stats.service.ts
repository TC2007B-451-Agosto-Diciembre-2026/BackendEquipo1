import { Injectable } from '@nestjs/common';
import { StatsRepository } from './stats.repository';

@Injectable()
export class StatsService {
  constructor(private readonly repository: StatsRepository) {}

  async getSummary() {
    return this.repository.getSummary();
  }

  async getByCategory() {
    return this.repository.getByCategory();
  }

  async getByStatus() {
    return this.repository.getByStatus();
  }

  async getMonthly() {
    return this.repository.getMonthly();
  }
}