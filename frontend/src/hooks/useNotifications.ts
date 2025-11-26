import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, Notification, NotificationsResponse } from '../services/api';
import { toast } from 'sonner';

const NOTIFICATIONS_QUERY_KEY = ['notifications'];
const POLLING_INTERVAL = 30000; // 30 seconds

export const useNotifications = () => {
  const queryClient = useQueryClient();

  // Fetch notifications with polling
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<NotificationsResponse>({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: notificationsApi.getAll,
    refetchInterval: POLLING_INTERVAL,
    staleTime: 20000, // Consider data stale after 20 seconds
    retry: 1,
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error('Failed to mark notification as read');
      console.error('Mark as read error:', error);
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: (data) => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      if (data.count > 0) {
        toast.success(`Marked ${data.count} notification${data.count > 1 ? 's' : ''} as read`);
      }
    },
    onError: (error: any) => {
      toast.error('Failed to mark all notifications as read');
      console.error('Mark all as read error:', error);
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      toast.success('Notification deleted');
    },
    onError: (error: any) => {
      toast.error('Failed to delete notification');
      console.error('Delete notification error:', error);
    },
  });

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unread_count || 0,
    isLoading,
    error,
    refetch,
    markAsRead: (notificationId: string) => markAsReadMutation.mutate(notificationId),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    deleteNotification: (notificationId: string) => deleteMutation.mutate(notificationId),
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
