import api from "./api";

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const getMyNotifications = async (
  page = 0,
  size = 20,
): Promise<PageResponse<NotificationResponse>> => {
  const response = await api.get<PageResponse<NotificationResponse>>(
    `/api/notifications?page=${page}&size=${size}`,
  );
  return response.data;
};

export const getMyUnreadNotifications = async (): Promise<
  NotificationResponse[]
> => {
  const response = await api.get<NotificationResponse[]>(
    "/api/notifications/unread",
  );
  return response.data;
};

export const markNotificationAsRead = async (
  id: string,
): Promise<NotificationResponse> => {
  const response = await api.patch<NotificationResponse>(
    `/api/notifications/${id}/read`,
  );
  return response.data;
};

export const markAllNotificationsAsRead = async (): Promise<{
  message: string;
}> => {
  const response = await api.patch<{ message: string }>(
    "/api/notifications/read-all",
  );
  return response.data;
};
