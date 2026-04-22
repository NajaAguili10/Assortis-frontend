/**
 * Contact History Service
 * Gère les opérations liées à l'historique des contacts
 */

import { ContactHistoryDTO, ContactHistoryListDTO, ContactStatusEnum } from '../types/ContactHistory.dto';
import { JobOfferTypeEnum } from '../types/JobOffer.dto';

// Simulated data storage
let contactHistoryStore: ContactHistoryDTO[] = [];

/**
 * Get contact history by job offer type
 */
export const getContactHistoryByType = async (
  offerType: JobOfferTypeEnum
): Promise<ContactHistoryListDTO[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Filter by offer type - in real app, this would be done on backend
  // For now, we'll return all contacts and filter on frontend if needed
  
  return contactHistoryStore.map(contact => ({
    id: contact.id,
    jobOfferId: contact.jobOfferId,
    jobOfferTitle: contact.jobOfferTitle,
    organizationName: contact.organizationName,
    subject: contact.subject,
    messageExcerpt: contact.message.substring(0, 100) + (contact.message.length > 100 ? '...' : ''),
    contactDate: contact.contactDate,
    status: contact.status,
    isRead: contact.status !== ContactStatusEnum.SENT && contact.status !== ContactStatusEnum.DELIVERED,
    hasReply: !!contact.replyMessage,
  }));
};

/**
 * Get contact history details by ID
 */
export const getContactHistoryById = async (id: string): Promise<ContactHistoryDTO | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const contact = contactHistoryStore.find(c => c.id === id);
  return contact || null;
};

/**
 * Add new contact to history
 */
export const addContactToHistory = async (
  jobOfferId: string,
  jobOfferTitle: string,
  organizationName: string,
  subject: string,
  message: string,
  senderName: string,
  senderEmail: string,
  recipientEmail?: string
): Promise<ContactHistoryDTO> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const newContact: ContactHistoryDTO = {
    id: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    jobOfferId,
    jobOfferTitle,
    organizationName,
    subject,
    message,
    contactDate: new Date().toISOString(),
    status: ContactStatusEnum.SENT,
    senderName,
    senderEmail,
    recipientEmail,
  };

  contactHistoryStore.push(newContact);
  
  // Simulate status update after a delay (would be done by backend in real app)
  setTimeout(() => {
    const contact = contactHistoryStore.find(c => c.id === newContact.id);
    if (contact) {
      contact.status = ContactStatusEnum.DELIVERED;
    }
  }, 2000);

  return newContact;
};

/**
 * Update contact status
 */
export const updateContactStatus = async (
  id: string,
  status: ContactStatusEnum
): Promise<ContactHistoryDTO | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const contact = contactHistoryStore.find(c => c.id === id);
  if (!contact) return null;

  contact.status = status;
  
  if (status === ContactStatusEnum.READ && !contact.readDate) {
    contact.readDate = new Date().toISOString();
  }

  return contact;
};

/**
 * Add reply to contact
 */
export const addReplyToContact = async (
  id: string,
  replyMessage: string
): Promise<ContactHistoryDTO | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const contact = contactHistoryStore.find(c => c.id === id);
  if (!contact) return null;

  contact.replyMessage = replyMessage;
  contact.replyDate = new Date().toISOString();
  contact.status = ContactStatusEnum.REPLIED;

  return contact;
};

/**
 * Delete contact from history
 */
export const deleteContactFromHistory = async (id: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const index = contactHistoryStore.findIndex(c => c.id === id);
  if (index === -1) return false;

  contactHistoryStore.splice(index, 1);
  return true;
};

/**
 * Get contact history statistics
 */
export const getContactHistoryStats = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    total: contactHistoryStore.length,
    sent: contactHistoryStore.filter(c => c.status === ContactStatusEnum.SENT).length,
    delivered: contactHistoryStore.filter(c => c.status === ContactStatusEnum.DELIVERED).length,
    read: contactHistoryStore.filter(c => c.status === ContactStatusEnum.READ).length,
    replied: contactHistoryStore.filter(c => c.status === ContactStatusEnum.REPLIED).length,
    archived: contactHistoryStore.filter(c => c.status === ContactStatusEnum.ARCHIVED).length,
  };
};

// Export for testing/debugging
export const clearContactHistory = () => {
  contactHistoryStore = [];
};
