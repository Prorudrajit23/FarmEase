import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export function useUserType() {
  const { user } = useAuth();
  const [userType, setUserType] = useState<string | null>(() => {
    // Try to get from localStorage first for immediate value
    const cachedType = localStorage.getItem('farmease-user-type');
    return cachedType;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUserType() {
      if (!user) {
        setUserType(null);
        localStorage.removeItem('farmease-user-type');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // First try to get the user type from the user metadata
        const metadataUserType = user.user_metadata?.userType;
        if (metadataUserType) {
          setUserType(metadataUserType);
          localStorage.setItem('farmease-user-type', metadataUserType);
          setIsLoading(false);
          return;
        }

        // If not in metadata, fetch from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        const fetchedUserType = data?.user_type || null;
        setUserType(fetchedUserType);
        
        // Cache the user type
        if (fetchedUserType) {
          localStorage.setItem('farmease-user-type', fetchedUserType);
        } else {
          localStorage.removeItem('farmease-user-type');
        }
      } catch (err) {
        console.error('Error fetching user type:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserType();
  }, [user]);

  // Add a function to refresh the user type if needed
  const refreshUserType = async () => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      const fetchedUserType = data?.user_type || null;
      setUserType(fetchedUserType);
      
      if (fetchedUserType) {
        localStorage.setItem('farmease-user-type', fetchedUserType);
      } else {
        localStorage.removeItem('farmease-user-type');
      }
      
      return fetchedUserType;
    } catch (err) {
      console.error('Error refreshing user type:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { userType, isLoading, error, refreshUserType };
} 