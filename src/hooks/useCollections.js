import { useState, useEffect } from 'react';

const INITIAL_COLLECTIONS = [
    {
        id: '1',
        name: 'Product Launch',
        description: 'Essential prompts for launching a new product.',
        promptIds: ['16', '8', '29'] // Viral Thread, Minimalist App, Co-Founder
    },
    {
        id: '2',
        name: 'Creative Writing',
        description: 'Inspiration for storytelling and character design.',
        promptIds: ['17', '19', '6'] // Unexpected Perspective, Sensory, Double Exposure
    }
];

export const useCollections = () => {
    const [collections, setCollections] = useState(() => {
        const saved = localStorage.getItem('collections');
        return saved ? JSON.parse(saved) : INITIAL_COLLECTIONS;
    });

    useEffect(() => {
        localStorage.setItem('collections', JSON.stringify(collections));
    }, [collections]);

    const createCollection = (name, description) => {
        const newCollection = {
            id: crypto.randomUUID(),
            name,
            description,
            promptIds: []
        };
        setCollections([...collections, newCollection]);
        return newCollection.id;
    };

    const deleteCollection = (id) => {
        setCollections(collections.filter(c => c.id !== id));
    };

    const addPromptToCollection = (collectionId, promptId) => {
        setCollections(collections.map(c => {
            if (c.id === collectionId && !c.promptIds.includes(promptId)) {
                return { ...c, promptIds: [...c.promptIds, promptId] };
            }
            return c;
        }));
    };

    const removePromptFromCollection = (collectionId, promptId) => {
        setCollections(collections.map(c => {
            if (c.id === collectionId) {
                return { ...c, promptIds: c.promptIds.filter(id => id !== promptId) };
            }
            return c;
        }));
    };

    return {
        collections,
        createCollection,
        deleteCollection,
        addPromptToCollection,
        removePromptFromCollection
    };
};
