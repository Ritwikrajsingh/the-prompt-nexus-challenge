export interface Prompt {
  id: string;
  title: string;
  content: string;
  complexity: number;
  view_count: number | 0;
  tags: Tag[];
  created_at: string;
}

export type Tag = string;
