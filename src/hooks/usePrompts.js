import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

const API_URL = '/api/prompts';

export const usePrompts = () => {
    const [prompts, setPrompts] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const { getToken } = useAuth();

    const fetchPrompts = useCallback(async () => {
        try {
            const token = await getToken();
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const response = await fetch(API_URL, { headers });
            if (response.ok) {
                const data = await response.json();
                setPrompts(data);
            } else {
                console.error('Failed to fetch prompts');
            }
        } catch (error) {
            console.error('Error fetching prompts:', error);
        } finally {
            setIsLoaded(true);
        }
    }, [getToken]);

    useEffect(() => {
        fetchPrompts();
    }, [fetchPrompts]);

    const addPrompt = async (prompt) => {
        try {
            const token = await getToken();
            if (!token) return;
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(prompt)
            });
            if (response.ok) {
                const newPrompt = await response.json();
                setPrompts(prev => [newPrompt, ...prev]);
            }
        } catch (error) {
            console.error('Error adding prompt:', error);
        }
    };

    const toggleFavorite = async (id) => {
        try {
            const token = await getToken();
            if (!token) return;
            const response = await fetch(`${API_URL}/${id}/favorite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const { isFavorite } = await response.json();
                setPrompts(prev => prev.map(p =>
                    p.id === id ? { ...p, isFavorite } : p
                ));
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const deletePrompt = async (id) => {
        try {
            const token = await getToken();
            if (!token) return;
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setPrompts(prev => prev.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error('Error deleting prompt:', error);
        }
    };

    const updatePrompt = async (updatedPrompt) => {
        try {
            const token = await getToken();
            if (!token) return;
            const response = await fetch(`${API_URL}/${updatedPrompt.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedPrompt)
            });
            if (response.ok) {
                const newPrompt = await response.json();
                setPrompts(prev => prev.map(p =>
                    p.id === newPrompt.id ? newPrompt : p
                ));
            }
        } catch (error) {
            console.error('Error updating prompt:', error);
        }
    };

    return { prompts, addPrompt, toggleFavorite, deletePrompt, updatePrompt, isLoaded };
};
