import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFeed, getScroll, likeReel } from '../api/reels.api';
import toast from 'react-hot-toast';

// Hooks for fetching and mutating reels data
export const useFeed = (page=1) =>
    useQuery({
        queryKey: ['feed', page],
        queryFn: () => getFeed(page),
    });

// Hook for fetching scroll reels data
export const useScrollReels = (page=1) =>
    useQuery({
        queryKey: ['scroll', page],
        queryFn: () => getScroll(page),
    });

// Hook for liking a reel
export const useLikeReel = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: id => likeReel(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
        onError: () => toast.error('Failed to like'),
    });
}