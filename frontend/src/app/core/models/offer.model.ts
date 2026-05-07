export type OfferStatus = 'OPEN' | 'CLOSED' | 'DRAFT';

export interface JobOffer {
  id: number;
  title: string;
  description: string;
  department: string;
  location: string;
  contractType: string;
  requiredSkills?: string;
  status: OfferStatus;
  createdById?: number;
  createdByName?: string;
  createdAt: string;
  closesAt?: string;
}

export interface JobOfferFilter {
  status?: OfferStatus;
  department?: string;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
