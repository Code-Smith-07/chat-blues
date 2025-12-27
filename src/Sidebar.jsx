import React, { useState } from 'react';

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const MessageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
);

const HelpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const PinIcon = ({ filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="17" x2="12" y2="22"></line>
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const Sidebar = ({ 
    isOpen, 
    toggleSidebar, 
    darkMode, 
    onNewChat, 
    chatHistory = [], 
    onLoadChat, 
    onDeleteChat,
    onRenameChat,
    onPinChat,
    onSettings, 
    onHelp, 
    onActivity 
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');

    const startEditing = (e, chat) => {
        e.stopPropagation();
        setEditingId(chat.id);
        setEditTitle(chat.title);
    };

    const saveEdit = (e, chatId) => {
        e.stopPropagation();
        if (editTitle.trim()) {
            onRenameChat(chatId, editTitle.trim());
        }
        setEditingId(null);
    };

    const cancelEdit = (e) => {
        e.stopPropagation();
        setEditingId(null);
    };

    const filteredHistory = chatHistory
        .filter(chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.date) - new Date(a.date);
        });

    return (
        <div 
            className={`${isOpen ? 'w-72' : 'w-0'} fixed inset-y-0 left-0 z-50 h-full transition-all duration-300 ease-in-out overflow-hidden ${darkMode ? 'bg-gray-900/95 border-r border-gray-800' : 'bg-white/95 border-r border-gray-200'} backdrop-blur-xl shadow-2xl`}
        >
            <div className="w-72 h-full flex flex-col">
                {/* Header */}
                <div className="p-4 flex items-center justify-between">
                    <button 
                        onClick={toggleSidebar}
                        className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
                    >
                        <MenuIcon />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="px-4 mb-2">
                    <button 
                        onClick={onNewChat}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 ${
                            darkMode 
                                ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                    >
                        <PlusIcon />
                        <span className="text-sm font-medium">New chat</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-4 mb-4">
                    <div className={`flex items-center px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-800/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                        <SearchIcon />
                        <input 
                            type="text"
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="ml-2 w-full bg-transparent border-none outline-none text-sm placeholder-gray-500"
                        />
                    </div>
                </div>

                {/* Recent Chats List */}
                <div className="flex-1 overflow-y-auto px-2">
                    <div className={`px-4 py-2 text-xs font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Recent
                    </div>
                    <div className="space-y-1">
                        {filteredHistory.length > 0 ? (
                            filteredHistory.map((item) => (
                                <div
                                    key={item.id}
                                    className={`group relative w-full flex items-center gap-3 px-4 py-2 rounded-full text-left transition-colors cursor-pointer ${
                                        darkMode 
                                            ? 'text-gray-300 hover:bg-gray-800' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                    onClick={() => onLoadChat(item)}
                                >
                                    {editingId === item.id ? (
                                        <div className="flex items-center w-full gap-2" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                className={`flex-1 bg-transparent border-b ${darkMode ? 'border-blue-500 text-white' : 'border-blue-500 text-gray-900'} outline-none text-sm`}
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveEdit(e, item.id);
                                                    if (e.key === 'Escape') cancelEdit(e);
                                                }}
                                            />
                                            <button onClick={(e) => saveEdit(e, item.id)} className="text-green-500 hover:text-green-600"><CheckIcon /></button>
                                            <button onClick={cancelEdit} className="text-red-500 hover:text-red-600"><XIcon /></button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex-shrink-0">
                                                {item.pinned ? <PinIcon filled={true} /> : <MessageIcon />}
                                            </div>
                                            <span className="text-sm truncate flex-1">{item.title}</span>
                                            
                                            {/* Hover Actions */}
                                            <div className={`absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} pl-2`}>
                                                <button 
                                                    onClick={(e) => onPinChat(item.id, e)}
                                                    className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${item.pinned ? 'text-blue-500' : 'text-gray-400'}`}
                                                    title={item.pinned ? "Unpin" : "Pin"}
                                                >
                                                    <PinIcon filled={item.pinned} />
                                                </button>
                                                <button 
                                                    onClick={(e) => startEditing(e, item)}
                                                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500"
                                                    title="Rename"
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button 
                                                    onClick={(e) => onDeleteChat(item.id, e)}
                                                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500"
                                                    title="Delete"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className={`px-4 py-2 text-sm italic ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                {searchQuery ? 'No chats found' : 'No recent chats'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className={`p-2 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <button 
                        onClick={onHelp}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <HelpIcon />
                        <span className="text-sm">Help</span>
                    </button>
                    <button 
                        onClick={onActivity}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <HistoryIcon />
                        <span className="text-sm">Activity</span>
                    </button>
                    <button 
                        onClick={onSettings}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <SettingsIcon />
                        <span className="text-sm">Settings</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;