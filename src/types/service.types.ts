export interface TimeSlotInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxBookings?: number;
}

export interface CreateServiceInput {
  name: string;
  description: string;
  price: number;
  duration: number;
  location?: string;
  categoryId: string;
  slots?: TimeSlotInput[];
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  location?: string;
  categoryId?: string;
  isActive?: boolean;
}
