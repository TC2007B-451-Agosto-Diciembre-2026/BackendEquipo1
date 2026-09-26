export class Report {
    id: string | undefined;
    ownerId: string | undefined;
    title: string | undefined;
    evidenceUrl: string | undefined;
    description?: string;
    status: string | undefined; // 1-En revision, 2-Fraude, 3-Confiable
    createdAt: Date | undefined;
}