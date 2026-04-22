/**
 * Contact History DTO
 * Définit la structure des données pour l'historique des contacts
 */

export enum ContactStatusEnum {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  REPLIED = 'REPLIED',
  ARCHIVED = 'ARCHIVED',
}

export interface ContactHistoryDTO {
  id: string;
  jobOfferId: string;
  jobOfferTitle: string;
  organizationName: string;
  subject: string;
  message: string;
  contactDate: string; // ISO date string
  status: ContactStatusEnum;
  senderName: string;
  senderEmail: string;
  recipientEmail?: string;
  readDate?: string; // ISO date string
  replyDate?: string; // ISO date string
  replyMessage?: string;
}

export interface ContactHistoryListDTO {
  id: string;
  jobOfferId: string;
  jobOfferTitle: string;
  organizationName: string;
  subject: string;
  messageExcerpt: string; // First 100 chars
  contactDate: string;
  status: ContactStatusEnum;
  isRead: boolean;
  hasReply: boolean;
}
