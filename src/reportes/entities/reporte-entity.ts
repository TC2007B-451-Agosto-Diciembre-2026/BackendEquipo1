export class Report {
  id!: number;
  userId!: number;
  adminId?: number | null;
  categoryId!: number;
  statusId!: number;
  caseType!: string;
  title!: string;
  description!: string;
  fraudProbability?: number | null;
  createdAt!: Date;
  updatedAt!: Date;
  approvedAt?: Date | null;
  deletedAt?: Date | null;
}