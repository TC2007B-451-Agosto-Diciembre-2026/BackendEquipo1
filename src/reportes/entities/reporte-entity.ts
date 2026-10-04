export class Report {
  id!: number;
  userId!: number;
  adminId?: number | null;
  categoryId!: number;
  statusId!: number;
  categoryName?: string | null; 
  statusName?: string | null;   
  caseType!: string;
  title!: string;
  description!: string;
  imagePath?: string | null;
  fraudProbability?: number | null;
  createdAt!: Date;
  updatedAt!: Date;
  approvedAt?: Date | null;
  deletedAt?: Date | null;
}