export interface TaskEntry {
  id: string;
  date: string;
  title: string;
  description: string | null;
  category: 'Learning' | 'Setup' | 'Meeting' | 'Documentation' | 'Development' | 'Other';
  status: 'NotStarted' | 'InProgress' | 'Completed' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  userId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IssueEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'InProgress' | 'Resolved' | 'Closed';
  resolutionNotes: string | null;
  userId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackEntry {
  id: string;
  date: string;
  subject: string;
  type: 'Positive' | 'Suggestion' | 'Concern';
  details: string;
  userId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteEntry {
  id: string;
  date: string;
  title: string;
  content: string | null;
  tags: string[];
  userId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
