import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAllRead } from '../api/notifications.api';
import toast from 'react-hot-toast';

// Hook to fetch notifications
export const useNotifications = () =>
    useQuery({
        queryKey: ['notifications'],
        queryFn:  getNotifications,
    });

// Hook to mark all notifications as read
export const useMarkAllRead = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: markAllRead,
        onSuccess:  () => {
            qc.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('All marked as read');
        },
    });
}