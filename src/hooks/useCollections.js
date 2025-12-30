import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

const API_URL = '/api/collections';

export const useCollections = () => {
    const [collections, setCollections] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const { getToken } = useAuth();

    const fetchCollections = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) {
                setCollections([]);
                setIsLoaded(true);
                return;
            }

            const response = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                // Ensure promptIds is always an array
                const normalized = data.map(c => ({
                    ...c,
                    promptIds: Array.isArray(c.promptIds) ? c.promptIds : []
                }));
                setCollections(normalized);
            } else {
                console.error('Failed to fetch collections');
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
        } finally {
            setIsLoaded(true);
        }
    }, [getToken]);

    useEffect(() => {
        fetchCollections();
    }, [fetchCollections]);

    const createCollection = async (name, description) => {
        try {
            const token = await getToken();
            if (!token) return null;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, description })
            });

            if (response.ok) {
                const newCollection = await response.json();
                newCollection.promptIds = newCollection.promptIds || [];
                setCollections(prev => [newCollection, ...prev]);
                return newCollection.id;
            }
        } catch (error) {
            console.error('Error creating collection:', error);
        }
        return null;
    };

    const deleteCollection = async (id) => {
        try {
            const token = await getToken();
            if (!token) return;

            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setCollections(prev => prev.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error('Error deleting collection:', error);
        }
    };

    const addPromptToCollection = async (collectionId, promptId) => {
        try {
            const token = await getToken();
            if (!token) return;

            const response = await fetch(`${API_URL}/${collectionId}/prompts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ promptId })
            });

            if (response.ok) {
                const { promptIds } = await response.json();
                setCollections(prev => prev.map(c =>
                    c.id === collectionId ? { ...c, promptIds } : c
                ));
            }
        } catch (error) {
            console.error('Error adding prompt to collection:', error);
        }
    };

    const removePromptFromCollection = async (collectionId, promptId) => {
        try {
            const token = await getToken();
            if (!token) return;

            const response = await fetch(`${API_URL}/${collectionId}/prompts/${promptId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const { promptIds } = await response.json();
                setCollections(prev => prev.map(c =>
                    c.id === collectionId ? { ...c, promptIds } : c
                ));
            }
        } catch (error) {
            console.error('Error removing prompt from collection:', error);
        }
    };

    const regenerateAICollections = async () => {
        try {
            const token = await getToken();
            if (!token) return false;

            const response = await fetch(`${API_URL}/regenerate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const normalized = data.map(c => ({
                    ...c,
                    promptIds: Array.isArray(c.promptIds) ? c.promptIds : []
                }));
                setCollections(normalized);
                return true;
            }
        } catch (error) {
            console.error('Error regenerating collections:', error);
        }
        return false;
    };

    return {
        collections,
        isLoaded,
        createCollection,
        deleteCollection,
        addPromptToCollection,
        removePromptFromCollection,
        regenerateAICollections,
        refreshCollections: fetchCollections
    };
};
