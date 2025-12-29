import { Twitter, MessageCircle, User } from 'lucide-react';

export const getSourceIcon = (source, size = 14) => {
    switch (source?.toLowerCase()) {
        case 'x': return <Twitter size={size} />;
        case 'reddit': return <MessageCircle size={size} />;
        default: return <User size={size} />;
    }
};
