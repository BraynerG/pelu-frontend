export interface ServiceVariant {
  id: string;
  name: string;
  price: number;
  duration: number;
  serviceId: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  imageUrl: string | null;
  category: string;
  steps: string[];
  variants?: ServiceVariant[];
}

export interface LookbookSlide {
  id: string;
  url: string;
  title: string;
  subtitle: string;
  tag: string;
  accent?: string | null;
}

export interface OccupiedSlot {
  date: string;
  duration: number;
}
