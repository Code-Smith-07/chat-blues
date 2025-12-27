import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Routes, Route } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Editor from '@monaco-editor/react';
import { transform } from '@babel/standalone';
import Sidebar from './Sidebar.jsx';

// Capacitor imports for mobile functionality
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

const GlobalStyles = () => (
    <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 8px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #3b82f6, #60a5fa); border-radius: 8px; }
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(135deg, #2563eb, #3b82f6); }
        body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        
        /* Mobile-specific overflow handling */
        @media (max-width: 640px) {
            html, body {
                overflow: hidden;
                height: 100vh;
                position: fixed;
                width: 100%;
            }
            
            /* Prevent zoom on input focus */
            input[type="text"], textarea {
                font-size: 16px !important;
            }
            
            /* Ensure proper spacing on mobile */
            .mobile-safe-area {
                padding-bottom: env(safe-area-inset-bottom, 20px);
            }
        }
        
        @keyframes jumpingDot {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-8px); }
        }
        
        .jumping-dot {
            animation: jumpingDot 1.4s infinite ease-in-out;
        }
        
        .jumping-dot:nth-child(1) { animation-delay: 0s; }
        .jumping-dot:nth-child(2) { animation-delay: 0.2s; }
        .jumping-dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }
        
        .pulse-light {
            animation: pulse 2s ease-in-out infinite;
        }
    `}</style>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13  2 9 22 2"></polygon>
    </svg>
);

const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
);

const MicOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="2" y1="2" x2="22" y2="22"></line>
        <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"></path>
        <path d="M5 10v2a7 7 0 0 0 12 5"></path>
        <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"></path>
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
);

const CodeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16,18 22,12 16,6"></polyline>
        <polyline points="8,6 2,12 8,18"></polyline>
    </svg>
);

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23,4 23,10 17,10"></polyline>
        <polyline points="1,20 1,14 7,14"></polyline>
        <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"></path>
    </svg>
);

const ExpandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15,3 21,3 21,9"></polyline>
        <polyline points="9,21 3,21 3,15"></polyline>
        <line x1="21" y1="3" x2="14" y2="10"></line>
        <line x1="3" y1="21" x2="10" y2="14"></line>
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7,10 12,15 17,10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
        <circle cx="9" cy="9" r="2"></circle>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const RobotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="10" x="3" y="11" rx="2" ry="2"/>
        <circle cx="12" cy="5" r="2"/>
        <path d="M12 7v4"/>
        <line x1="8" y1="16" x2="8" y2="16"/>
        <line x1="16" y1="16" x2="16" y2="16"/>
    </svg>
);

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6,9 12,15 18,9"></polyline>
    </svg>
);

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

// SVG Icons for Local AI models (used in model selection)
const ModelIcons = {
    // Default box/cube icon for local models
    cube: (color) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
    ),
    // Server icon
    server: (color) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
            <line x1="6" y1="6" x2="6.01" y2="6"></line>
            <line x1="6" y1="18" x2="6.01" y2="18"></line>
        </svg>
    ),
    // CPU/Chip icon
    cpu: (color) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            <rect x="9" y="9" width="6" height="6"></rect>
            <line x1="9" y1="1" x2="9" y2="4"></line>
            <line x1="15" y1="1" x2="15" y2="4"></line>
            <line x1="9" y1="20" x2="9" y2="23"></line>
            <line x1="15" y1="20" x2="15" y2="23"></line>
            <line x1="20" y1="9" x2="23" y2="9"></line>
            <line x1="20" y1="14" x2="23" y2="14"></line>
            <line x1="1" y1="9" x2="4" y2="9"></line>
            <line x1="1" y1="14" x2="4" y2="14"></line>
        </svg>
    ),
    // Llama icon
    llama: (color) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v2"></path>
            <path d="M16 3v2"></path>
            <path d="M12 3v2"></path>
            <path d="M4 7h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"></path>
            <circle cx="8" cy="12" r="1"></circle>
            <circle cx="16" cy="12" r="1"></circle>
            <path d="M8 18v3"></path>
            <path d="M16 18v3"></path>
        </svg>
    ),
    // Sparkles icon (for Qwen, etc)
    sparkles: (color) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
            <path d="M5 3v4"></path>
            <path d="M19 17v4"></path>
            <path d="M3 5h4"></path>
            <path d="M17 19h4"></path>
        </svg>
    ),
    // Brain icon
    brain: (color) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
        </svg>
    )
};

const OVIcoSVG = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontWeight="bold" fontSize="12" fontFamily="Inter, sans-serif">OV</text>
    </svg>
);

const FullscreenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h6m-6 0v6"></path>
        <path d="M21 3h-6m6 0v6"></path>
        <path d="M21 21h-6m6 0v-6"></path>
        <path d="M3 21h6m-6 0v-6"></path>
    </svg>
);

const ExitFullscreenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3v3a2 2 0 0 0 2 2h3"></path>
        <path d="M21 8h-3a2 2 0 0 0-2 2v3"></path>
        <path d="M3 16h3a2 2 0 0 0 2-2v-3"></path>
        <path d="M16 21v-3a2 2 0 0 0-2-2H11"></path>
    </svg>
);

const UserIconSVG = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const CopyIcon = ({ size = 14 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
    </svg>
);

const TrashIcon = ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

const ImageViewer = ({ imageUrl, imagePrompt, darkMode, onClose }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const imageRef = useRef(null);

    const handleDownload = async () => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `generated-image-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            if (imageRef.current.requestFullscreen) {
                imageRef.current.requestFullscreen();
            } else if (imageRef.current.webkitRequestFullscreen) {
                imageRef.current.webkitRequestFullscreen();
            } else if (imageRef.current.mozRequestFullScreen) {
                imageRef.current.mozRequestFullScreen();
            } else if (imageRef.current.msRequestFullscreen) {
                imageRef.current.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    const imageContent = (
        <div className={`relative h-full w-full ${isFullscreen ? 'bg-black' : ''}`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-4 ${isFullscreen ? 'absolute top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm' : 'border-b border-gray-700/30'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <ImageIcon />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-white">Generated Image</h1>
                        <p className="text-sm text-gray-400">AI Image Generation</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownload}
                        className="w-10 h-10 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
                        title="Download Image"
                    >
                        <DownloadIcon />
                    </button>
                    <button
                        onClick={toggleFullscreen}
                        className="w-10 h-10 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
                        title={isFullscreen ? "Exit Fullscreen" : "View Fullscreen"}
                    >
                        {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
                    </button>
                    {!isFullscreen && (
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
                            title="Close"
                        >
                            <CloseIcon />
                        </button>
                    )}
                </div>
            </div>

            {/* Image Container */}
            <div className={`${isFullscreen ? 'absolute inset-0 pt-20' : 'flex-1'} flex items-center justify-center p-4 bg-gray-900/50`}>
                {isLoading && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-400">Loading image...</p>
                    </div>
                )}
                
                {hasError && (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                        </div>
                        <div>
                            <p className="text-red-400 font-medium">Failed to load image</p>
                            <p className="text-gray-500 text-sm mt-1">The generated image could not be displayed</p>
                        </div>
                    </div>
                )}

                <img
                    ref={imageRef}
                    src={imageUrl}
                    alt={imagePrompt}
                    className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl ${isLoading || hasError ? 'hidden' : 'block'}`}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setHasError(true);
                    }}
                />
            </div>

            {/* Prompt Display */}
            {imagePrompt && !isFullscreen && (
                <div className="p-4 border-t border-gray-700/30">
                    <p className="text-sm text-gray-400 mb-1">Prompt:</p>
                    <p className="text-white text-sm leading-relaxed">{imagePrompt}</p>
                </div>
            )}
        </div>
    );

    if (isFullscreen) {
        return createPortal(imageContent, document.body);
    }

    return (
        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 rounded-2xl overflow-hidden flex flex-col">
            {imageContent}
        </div>
    );
};

const MultiFileEditor = ({ initialCode, initialCSS, onUpdate }) => {
    const iframeRef = useRef(null);

    useEffect(() => {
        if (iframeRef.current) {
            const iframe = iframeRef.current;
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            
            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Multi File Editor</title>
    
    <!-- CodeMirror CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/dracula.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/fold/foldgutter.min.css">
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1a1a1a;
            color: white;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .tabs {
            display: flex;
            background: #2a2a2a;
            border-bottom: 1px solid #444;
        }
        
        .tab {
            padding: 12px 20px;
            background: #2a2a2a;
            color: #888;
            border: none;
            cursor: pointer;
            font-size: 14px;
            border-right: 1px solid #444;
            transition: all 0.2s;
        }
        
        .tab:hover {
            color: white;
            background: #333;
        }
        
        .tab.active {
            background: #1a1a1a;
            color: white;
            border-bottom: 2px solid #3b82f6;
        }
        
        .editor-container {
            flex: 1;
            position: relative;
        }
        
        .editor-pane {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: none;
        }
        
        .editor-pane.active {
            display: block;
        }
        
        .CodeMirror {
            height: 100% !important;
            font-size: 14px;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace !important;
            resize: none !important;
        }
        
        /* Hide the resize handle */
        .CodeMirror-scroll {
            resize: none !important;
        }
        
        /* Remove resize handle completely */
        .CodeMirror .CodeMirror-resize-handle {
            display: none !important;
        }
    </style>
</head>
<body>
    <div class="tabs">
        <button class="tab active" onclick="switchTab('main')">Main</button>
        <button class="tab" onclick="switchTab('css')">CSS</button>
        <button class="tab" onclick="switchTab('js')">JavaScript</button>
    </div>
    
    <div class="editor-container">
        <div class="editor-pane active" id="main-pane">
            <textarea id="main-editor">${(initialCode || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
        </div>
        <div class="editor-pane" id="css-pane">
            <textarea id="css-editor">${(initialCSS || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
        </div>
        <div class="editor-pane" id="js-pane">
            <textarea id="js-editor"></textarea>
        </div>
    </div>
    
    <!-- CodeMirror JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/xml/xml.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/css/css.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/javascript/javascript.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/htmlmixed/htmlmixed.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/closebrackets.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/matchbrackets.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/selection/active-line.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/fold/foldcode.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/fold/foldgutter.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/fold/xml-fold.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/fold/brace-fold.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/matchtags.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/search/searchcursor.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/search/match-highlighter.min.js"></script>
    
    <script>
        let editors = {};
        let currentTab = 'main';
        
        function initEditors() {
            // Main editor (HTML/JSX)
            editors.main = CodeMirror.fromTextArea(document.getElementById('main-editor'), {
                mode: 'htmlmixed',
                theme: 'dracula',
                lineNumbers: true,
                lineWrapping: true,
                autoCloseBrackets: true,
                matchBrackets: true,
                styleActiveLine: true,
                indentUnit: 2,
                tabSize: 2,
                extraKeys: {
                    "Ctrl-Space": "autocomplete"
                },
                matchTags: true,
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                highlightSelectionMatches: true,
                viewportMargin: Infinity
            });
            
            // CSS editor
            editors.css = CodeMirror.fromTextArea(document.getElementById('css-editor'), {
                mode: 'css',
                theme: 'dracula',
                lineNumbers: true,
                lineWrapping: true,
                autoCloseBrackets: true,
                matchBrackets: true,
                styleActiveLine: true,
                indentUnit: 2,
                tabSize: 2,
                extraKeys: {
                    "Ctrl-Space": "autocomplete"
                },
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                highlightSelectionMatches: true,
                viewportMargin: Infinity
            });
            
            // JavaScript editor
            editors.js = CodeMirror.fromTextArea(document.getElementById('js-editor'), {
                mode: 'javascript',
                theme: 'dracula',
                lineNumbers: true,
                lineWrapping: true,
                autoCloseBrackets: true,
                matchBrackets: true,
                styleActiveLine: true,
                indentUnit: 2,
                tabSize: 2,
                extraKeys: {
                    "Ctrl-Space": "autocomplete"
                },
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                highlightSelectionMatches: true,
                viewportMargin: Infinity
            });
            
            // Refresh editors
            setTimeout(() => {
                Object.values(editors).forEach(editor => editor.refresh());
            }, 100);
        }
        
        function switchTab(tab) {
            // Update active tab
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelector(\`[onclick="switchTab('\${tab}')"]\`).classList.add('active');
            
            // Update active pane
            document.querySelectorAll('.editor-pane').forEach(p => p.classList.remove('active'));
            document.getElementById(tab + '-pane').classList.add('active');
            
            currentTab = tab;
            
            // Refresh editor
            if (editors[tab]) {
                setTimeout(() => editors[tab].refresh(), 10);
            }
        }
        
        // Initialize when CodeMirror loads
        if (typeof CodeMirror !== 'undefined') {
            initEditors();
        } else {
            window.addEventListener('load', initEditors);
        }
    </script>
</body>
</html>`;

            doc.open();
            doc.write(htmlContent);
            doc.close();
        }
    }, [initialCode, initialCSS]);

    return (
        <div className="w-full h-full">
            <iframe
                ref={iframeRef}
                className="w-full h-full border-0 bg-gray-900"
                title="Multi File Editor"
            />
        </div>
    );
};

const TableIcon = ({ size = 16 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18M3 9l18 0"></path>
    </svg>
);

const InChatTable = ({ data, darkMode, title }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    if (!data || !data.headers || !data.rows) return null;

    // Clean title to remove Markdown heading syntax (### Title)
    const displayTitle = title ? title.replace(/^#+\s*/, '') : '';

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const formatCellContent = (text) => {
        if (typeof text !== 'string') return { __html: text };
        
        // Escape HTML first to prevent XSS
        let processed = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        // Bold (**text**)
        processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
        
        // Italic (*text*)
        processed = processed.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
        
        return { __html: processed };
    };

    const tableContent = (
        <div className={`rounded-xl overflow-hidden shadow-lg border ${darkMode ? 'border-gray-600/50 bg-gray-800/50' : 'border-gray-200/50 bg-white/50'} ${isFullscreen ? 'h-full' : ''}`}>
            {displayTitle && (
                <div className={`px-4 py-3 border-b ${darkMode ? 'bg-gray-700/50 border-gray-600/50 text-white' : 'bg-gray-50/50 border-gray-200/50 text-gray-900'} relative`}>
                    <div className="flex items-center gap-2">
                        <TableIcon size={18} />
                        <h3 className="font-semibold text-lg">{displayTitle}</h3>
                    </div>
                    {/* Fullscreen Button */}
                    <button
                        onClick={toggleFullscreen}
                        className={`absolute top-2 right-2 w-8 h-8 rounded-full ${darkMode ? 'bg-gray-600/50 hover:bg-gray-500/50' : 'bg-gray-200/50 hover:bg-gray-300/50'} backdrop-blur-sm flex items-center justify-center transition-all`}
                        title={isFullscreen ? "Close Fullscreen" : "View Fullscreen"}
                    >
                        {isFullscreen ? <CloseIcon /> : <FullscreenIcon />}
                    </button>
                </div>
            )}
            <div className={`overflow-auto ${isFullscreen ? 'h-full' : 'overflow-x-auto'}`}>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-black">
                            {data.headers.map((header, index) => (
                                <th 
                                    key={index} 
                                    className="px-4 py-3 text-left text-white font-semibold text-sm border-r border-gray-600 last:border-r-0"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((row, rowIndex) => (
                            <tr 
                                key={rowIndex} 
                                className={`border-b transition-colors duration-200 hover:bg-opacity-50 ${
                                    darkMode 
                                        ? 'border-gray-600/30 hover:bg-gray-700/30' 
                                        : 'border-gray-200/30 hover:bg-gray-100/50'
                                } ${rowIndex % 2 === 0 ? (darkMode ? 'bg-gray-700/20' : 'bg-gray-50/30') : ''}`}
                            >
                                {row.map((cell, cellIndex) => (
                                    <td 
                                        key={cellIndex} 
                                        className={`px-4 py-3 text-sm border-r ${darkMode ? 'text-gray-200 border-gray-600/30' : 'text-gray-800 border-gray-200/30'} last:border-r-0`}
                                        dangerouslySetInnerHTML={formatCellContent(cell)}
                                    />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (isFullscreen) {
        return createPortal(
            <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full h-full max-w-7xl">
                    {tableContent}
                </div>
            </div>,
            document.body
        );
    }

    return (
        <div className="my-4">
            {tableContent}
        </div>
    );
};

const CodeBlock = ({ language = "javascript", code, darkMode, onPreview, onSetupGuide }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error("Copy failed:", err);
        }
    };

    // Check if Python code is Pyodide-compatible
    const isPyodideCompatible = () => {
        if (language !== 'python' && !code.includes('print(') && !code.includes('def ') && !code.includes('import ')) {
            return false;
        }
        
        // Libraries/frameworks that require local Python setup
        const requiresLocalSetup = [
            'django', 'flask', 'fastapi', 'tornado', 'aiohttp', 'bottle', 'pyramid',
            'tensorflow', 'torch', 'pytorch', 'keras', 'sklearn', 'cv2', 'opencv',
            'selenium', 'beautifulsoup4', 'scrapy', 'requests-html',
            'pygame', 'tkinter', 'pyqt', 'kivy', 'wxpython',
            'multiprocessing', 'threading', 'asyncio.subprocess',
            'os.system', 'subprocess', 'sys.exit',
            'sqlite3', 'pymongo', 'sqlalchemy', 'psycopg2', 'mysql',
            'docker', 'kubernetes', 'boto3', 'azure', 'google-cloud'
        ];
        
        // Check for imports or usage that require local setup
        const codeLines = code.toLowerCase();
        const hasUnsupportedLibrary = requiresLocalSetup.some(lib => 
            codeLines.includes(`import ${lib}`) || 
            codeLines.includes(`from ${lib}`) ||
            codeLines.includes(`${lib}.`) ||
            (lib === 'cv2' && codeLines.includes('import cv2')) ||
            (lib === 'tkinter' && (codeLines.includes('import tkinter') || codeLines.includes('from tkinter')))
        );
        
        // Check for file operations that won't work in browser
        const hasFileOperations = codeLines.includes('open(') && (codeLines.includes("'w'") || codeLines.includes('"w"') || codeLines.includes("'r'") || codeLines.includes('"r"'));
        
        // Check for user input operations that won't work in browser
        const hasUserInput = codeLines.includes('input(');
        
        // Check for system operations
        const hasSystemOps = codeLines.includes('os.') || codeLines.includes('sys.') || codeLines.includes('subprocess');
        
        // Check for network operations that might not work
        const hasNetworking = codeLines.includes('socket') || codeLines.includes('urllib') || codeLines.includes('requests.');
        
        return !hasUnsupportedLibrary && !hasFileOperations && !hasUserInput && !hasSystemOps && !hasNetworking;
    };

    const isPythonCode = language === 'python' || code.includes('print(') || code.includes('def ') || code.includes('import ');
    const pyodideCompatible = isPyodideCompatible();

    const isWebpageCode = () => {
        const codeLines = code.split('\n').length;
        const hasReactImport = code.includes('import React') || code.includes('from "react"') || code.includes('React.') || code.includes('ReactDOM');
        const hasJSXElements = /<[A-Z]/.test(code) || /<div|<span|<p|<h1|<h2|<h3|<button/.test(code);
        const hasComponent = /function\s+\w+|const\s+\w+\s*=.*=>|export\s+default/.test(code);
        const isHTML = code.trim().startsWith('<!DOCTYPE') || code.trim().startsWith('<html') || language === 'html';
        const isCSS = (language === 'css') || (code.includes('{') && (code.includes('background') || code.includes('color') || code.includes('margin')));
        const hasMultipleFiles = code.includes('```') && (code.match(/```/g) || []).length >= 4; // At least 2 code blocks
        
        // Enhanced React/JSX detection
        const hasReactJSX = code.includes('React.') || code.includes('ReactDOM') || code.includes('type="text/babel"') || 
                           code.includes('useState') || code.includes('useEffect') || code.includes('className=') ||
                           /return\s*\([\s\S]*</.test(code); // Return statement with JSX
        
        // Better language detection for React
        const isReactCode = language === 'jsx' || language === 'react' || hasReactImport || hasReactJSX;
        
        // Support web languages + Pyodide-compatible Python + compiled languages that can run in browser
        const isSupportedLanguage = language === 'html' || language === 'css' || language === 'javascript' || language === 'typescript' || language === 'jsx' || language === 'react' || language === 'c' || language === 'cpp' || language === 'c++' || language === 'rust' || language === 'java' || (language === 'python' && pyodideCompatible);
        
        return codeLines > 3 && isSupportedLanguage && (hasReactImport || hasJSXElements || hasComponent || isHTML || isCSS || hasMultipleFiles || isReactCode || language === 'python' || language === 'javascript' || language === 'typescript' || language === 'c' || language === 'cpp' || language === 'c++' || language === 'rust' || language === 'java');
    };

    return (
        <div className="rounded-2xl overflow-hidden shadow-md my-3">
            {/* Header with Action Buttons */}
            <div className="bg-[#2d2d2d] border-b border-gray-600 px-3 sm:px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                        {language || 'code'}
                    </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    {isWebpageCode() && onPreview && (
                        <button
                            onClick={() => onPreview(code, language)}
                            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                        >
                            <EyeIcon />
                            <span className="hidden sm:inline">Live Preview</span>
                            <span className="sm:hidden">Preview</span>
                        </button>
                    )}
                    {isPythonCode && !pyodideCompatible && onSetupGuide && (
                        <button
                            onClick={() => onSetupGuide(code, language)}
                            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors duration-200"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                            </svg>
                            <span className="hidden sm:inline">Setup Guide</span>
                            <span className="sm:hidden">Setup</span>
                        </button>
                    )}
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-gray-600 text-gray-200 hover:bg-gray-500 rounded-md transition-colors duration-200"
                    >
                        <CopyIcon size={14} />
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>
            </div>

            {/* Code Syntax Highlighting */}
            <div className="bg-[#1e1e1e]">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: "0.75rem",
                        fontSize: "12px",
                        background: "transparent",
                    }}
                    wrapLines={true}
                    wrapLongLines={true}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

const UserMessage = ({ content, darkMode, attachment }) => (
    <div className="flex flex-col items-end">
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-2 border ${darkMode ? 'bg-white/10 border-white/20' : 'bg-white/40 border-black/10'}`}>
            <UserIconSVG className={darkMode ? 'text-white/70' : 'text-gray-700'} />
        </div>
        <div className="rounded-3xl py-2 sm:py-3 px-3 sm:px-4 max-w-[85%] sm:max-w-[80%] shadow-md bg-gradient-to-br from-blue-500 to-blue-600">
            {attachment && attachment.preview && (
                <img 
                    src={attachment.preview} 
                    alt={attachment.name} 
                    className="max-w-full max-h-48 rounded-xl mb-2 object-contain"
                />
            )}
            {attachment && !attachment.preview && (
                <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded-lg bg-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <span className="text-xs text-white/90">{attachment.name}</span>
                </div>
            )}
            <p className="text-sm sm:text-base text-white whitespace-pre-wrap break-words">{content}</p>
        </div>
    </div>
);

const LivePreview = ({ code, language, darkMode, onClose, onSync, isFullscreen, onToggleFullscreen, isSetupGuide, additionalCSS = '', isCombined = false }) => {
    const [previewCode, setPreviewCode] = useState(code);
    const [viewMode, setViewMode] = useState('preview'); // 'code', 'preview'
    const [previewContent, setPreviewContent] = useState('');
    const [error, setError] = useState(null);
    const [isIframeFullscreen, setIsIframeFullscreen] = useState(false);
    const iframeRef = useRef(null);

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            const fullscreenElement = document.fullscreenElement || 
                                    document.webkitFullscreenElement || 
                                    document.mozFullScreenElement || 
                                    document.msFullscreenElement;
            setIsIframeFullscreen(fullscreenElement === iframeRef.current);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    // Update preview code when external code changes (from AI edits)
    useEffect(() => {
        if (code !== previewCode) {
            setPreviewCode(code);
        }
    }, [code, previewCode]); // Added previewCode to deps to ensure comparison works properly



    const parseMultipleFiles = (inputCode) => {
        const files = {};
        // Match code blocks with optional filename comments
        const codeBlockRegex = /```(\w+)?\s*(?:\/\/ (.+\.(?:js|jsx|css|html))\s*)?\n([\s\S]*?)```/g;
        let match;
        
        while ((match = codeBlockRegex.exec(inputCode)) !== null) {
            const [, lang, filename, content] = match;
            if (filename) {
                files[filename] = { language: lang || 'javascript', content: content.trim() };
            } else if (lang) {
                // If no filename but has language, try to infer
                if (lang === 'css') {
                    files['styles.css'] = { language: 'css', content: content.trim() };
                } else if (lang === 'jsx' || lang === 'javascript') {
                    files['App.jsx'] = { language: 'jsx', content: content.trim() };
                } else if (lang === 'html') {
                    files['index.html'] = { language: 'html', content: content.trim() };
                }
            }
        }
        
        // Also try to match filename patterns in the text
        const filenamePatterns = [
            /(?:^|\n)(?:\/\/\s*)?(\w+\.(?:jsx?|css|html))\s*:?\s*\n```(\w+)?\n([\s\S]*?)```/g,
            /(?:^|\n)(?:\/\/\s*)?File:\s*(\w+\.(?:jsx?|css|html))\s*\n```(\w+)?\n([\s\S]*?)```/g
        ];
        
        filenamePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(inputCode)) !== null) {
                const [, filename, lang, content] = match;
                files[filename] = { 
                    language: lang || filename.split('.').pop(), 
                    content: content.trim() 
                };
            }
        });
        
        return files;
    };

    const generateReactHTML = (inputCode) => {
        try {
            return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Preview</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { margin: 0; padding: 0; height: 100%; overflow-x: hidden; }
        body { padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; }
        #root { min-height: calc(100vh - 40px); border-radius: 16px; overflow: hidden; }
        
        /* Add rounded corners to common content containers */
        .quiz-container, .container, .app, .main, .content, 
        div[class*="container"], div[class*="wrapper"], 
        div[class*="quiz"], div[class*="app"] {
            border-radius: 16px !important;
            overflow: hidden;
        }
        
        /* Style common quiz/content elements with rounded corners */
        .question, .options, .option, .card, .panel,
        button, input, select, textarea {
            border-radius: 8px !important;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect, useRef } = React;
        
        ${inputCode}
        
        // Try to find and render the main component
        const AppComponent = typeof App !== 'undefined' ? App : 
                           typeof Component !== 'undefined' ? Component :
                           typeof Quiz !== 'undefined' ? Quiz :
                           Object.values(window).find(val => 
                               typeof val === 'function' && 
                               val.toString().includes('return') && 
                               val.toString().includes('<')
                           );
        
        if (AppComponent) {
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(React.createElement(AppComponent));
        } else {
            // Try to find any function that looks like a component
            const allFunctions = Object.getOwnPropertyNames(window).filter(name => 
                typeof window[name] === 'function' && 
                name[0] === name[0].toUpperCase() &&
                name !== 'React' && name !== 'ReactDOM' && name !== 'Babel'
            );
            
            console.log('Available functions:', allFunctions);
            
            if (allFunctions.length > 0) {
                const root = ReactDOM.createRoot(document.getElementById('root'));
                root.render(React.createElement(window[allFunctions[0]]));
            } else {
                document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;"><h3>No React component found</h3><p>Make sure to define a component function like App, Component, or Quiz.</p><p>Available functions: ' + Object.getOwnPropertyNames(window).filter(n => typeof window[n] === 'function').join(', ') + '</p></div>';
            }
        }
    </script>
</body>
</html>`;
        } catch (error) {
            console.error('Error generating React HTML:', error);
            return `
<!DOCTYPE html>
<html>
<head><title>React Error</title></head>
<body><div style="color: red; padding: 20px; font-family: monospace;">
    <h3>React Preview Error:</h3>
    <pre>${error.message}</pre>
</div></body>
</html>`;
        }
    };

    const generateMultiFileHTML = (files) => {
        let cssContent = '';
        let jsContent = '';
        let htmlContent = '';
        
        // Extract CSS from all CSS files
        Object.entries(files).forEach(([filename, file]) => {
            if (filename.endsWith('.css')) {
                cssContent += file.content + '\n';
            } else if (filename.endsWith('.html')) {
                // If there's an HTML file, use it as the base
                htmlContent = file.content;
            }
        });
        
        // If we have an HTML file, enhance it with extracted CSS
        if (htmlContent) {
            // Check if HTML already has styling
            if (!htmlContent.includes('<style') && !htmlContent.includes('stylesheet') && cssContent) {
                // Add extracted CSS to the HTML
                htmlContent = htmlContent.replace(
                    /<head[^>]*>/i,
                    `<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Basic reset */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { margin: 0; padding: 0; min-height: 100%; overflow-x: hidden; overflow-y: auto; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; }
        
        /* Extracted CSS */
        ${cssContent}
    </style>`
                );
            } else if (cssContent) {
                // Add CSS to existing style section or create new one
                if (htmlContent.includes('</head>')) {
                    htmlContent = htmlContent.replace(
                        '</head>',
                        `    <style>\n        ${cssContent}\n    </style>\n</head>`
                    );
                }
            }
            return htmlContent;
        }
        
        // Find the main React component
        const reactFiles = Object.entries(files).filter(([filename]) => 
            filename.endsWith('.jsx') || filename.endsWith('.js')
        );
        
        if (reactFiles.length > 0) {
            const [, mainFile] = reactFiles[0]; // Take the first React file
            
            try {
                // Transform JSX to regular JavaScript
                const transformedCode = transform(mainFile.content, {
                    presets: ['react'],
                    filename: 'component.jsx'
                }).code;
                
                jsContent = transformedCode;
            } catch (error) {
                console.error('Babel transformation error:', error);
                jsContent = `
                    console.error('Error transforming JSX:', ${JSON.stringify(error.message)});
                    document.body.innerHTML = '<div style="padding: 20px; color: red;">Error transforming JSX: ${error.message}</div>';
                `;
            }
        }
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Multi-File React Preview</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { margin: 0; padding: 0; height: 100%; overflow-x: hidden; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        ${cssContent}
    </style>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
</head>
<body>
    <div id="root"></div>
    <script>
        try {
            ${jsContent}
        } catch (error) {
            console.error('Runtime error:', error);
            document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">Runtime Error: ' + error.message + '</div>';
        }
    </script>
</body>
</html>`;
    };

    const generatePreviewHTML = (inputCode, additionalCSS = '') => {
        try {
            console.log('Generating preview for:', { language, codePreview: inputCode.substring(0, 200) });
            
            // Check if it's already a complete HTML document
            if (inputCode.trim().startsWith('<!DOCTYPE') || inputCode.trim().startsWith('<html')) {
                // For complete HTML documents, check if they have proper styling
                // If not, we might want to add some basic reset CSS while preserving the structure
                if (!inputCode.includes('<style') && !inputCode.includes('stylesheet')) {
                    // Add basic styling to the head if no styling is present
                    return inputCode.replace(
                        /<head[^>]*>/i,
                        `<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Basic reset for better preview */
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; min-height: 100%; overflow-x: hidden; overflow-y: auto; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; }
    </style>`
                    );
                }
                return inputCode;
            }
            
            // Check for multiple files first
            const files = parseMultipleFiles(inputCode);
            if (Object.keys(files).length > 0) {
                console.log('Detected multiple files:', Object.keys(files));
                return generateMultiFileHTML(files);
            }
            
            // Enhanced React/JSX detection
            const hasReactImport = inputCode.includes('import React') || inputCode.includes('from "react"');
            const hasJSXElements = /<[A-Z]/.test(inputCode) || /<div|<span|<p|<h1|<h2|<h3|<button/.test(inputCode);
            const hasReactFunction = /function\s+\w+.*{[\s\S]*return[\s\S]*</.test(inputCode);
            const hasArrowComponent = /const\s+\w+\s*=.*=>.*{[\s\S]*return[\s\S]*</.test(inputCode);
            const hasExportDefault = inputCode.includes('export default');
            const hasReactDOM = inputCode.includes('ReactDOM') || inputCode.includes('createRoot');
            
            const isReactComponent = hasReactImport || hasJSXElements || hasReactFunction || 
                                   hasArrowComponent || hasReactDOM ||
                                   (hasExportDefault && inputCode.includes('return') && inputCode.includes('<'));
            
            console.log('React detection:', { hasReactImport, hasJSXElements, hasReactFunction, hasArrowComponent, hasExportDefault, hasReactDOM, isReactComponent });
            
            // If it's a React component, handle it as React
            if (isReactComponent) {
                console.log('Detected as React component');
                return generateReactHTML(inputCode);
            }
            
            // Check if it's CSS (but not JSX)
            if (language === 'css' || (inputCode.includes('{') && inputCode.includes('}') && 
                !inputCode.includes('function') && !inputCode.includes('return') && 
                !inputCode.includes('React') && !/<[A-Z]/.test(inputCode))) {
                return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Preview</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { margin: 0; padding: 0; height: 100%; overflow-x: hidden; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; padding: 20px; }
        
        /* FORCE rounded corners on ALL elements */
        *, *::before, *::after {
            border-radius: 12px !important;
        }
        
        /* Specific targeting for common quiz elements */
        div, section, article, main, header, footer, 
        .quiz-container, .container, .app, .main, .content, 
        div[class*="container"], div[class*="wrapper"], 
        div[class*="quiz"], div[class*="app"] {
            border-radius: 16px !important;
        }
        
        /* Form elements and buttons */
        .question, .options, .option, .card, .panel,
        button, input, select, textarea {
            border-radius: 8px !important;
        }
        
        /* Apply to everything with background or border */
        [style*="background"], [class*="bg-"], [style*="border"],
        h1, h2, h3, h4, h5, h6, p, span, li, ul, ol {
            border-radius: 8px !important;
        }
        
        ${inputCode}
    </style>
</head>
<body>
    <div class="quiz-container" style="border-radius: 16px; overflow: hidden; background: white; padding: 20px;">
        <h1 style="border-radius: 8px;">CSS Preview</h1>
        <p style="border-radius: 8px;">Your CSS styles are applied to this page.</p>
        <div class="question" style="border-radius: 8px; background: #f5f5f5; padding: 10px; margin: 10px 0;">Sample question content</div>
        <div class="options" style="border-radius: 8px; margin: 10px 0;">
            <div class="options li" style="border-radius: 8px; background: #e0e0e0; padding: 8px; margin: 5px 0;">Option 1</div>
            <div class="options li" style="border-radius: 8px; background: #e0e0e0; padding: 8px; margin: 5px 0;">Option 2</div>
        </div>
        <button class="start-btn" style="border-radius: 8px; padding: 10px 20px; margin: 5px; background: #007bff; color: white; border: none;">Start Button</button>
        <button class="submit-btn" style="border-radius: 8px; padding: 10px 20px; margin: 5px; background: #28a745; color: white; border: none;">Submit Button</button>
    </div>
</body>
</html>`;
            }
            
            // Check if it's HTML (without DOCTYPE)
            if (language === 'html' || inputCode.trim().startsWith('<')) {
                console.log('Processing HTML code:', inputCode.substring(0, 200));
                
                // Extract CSS from style tags if present
                let extractedCSS = '';
                const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
                let match;
                let htmlWithoutStyles = inputCode;
                
                // Extract all style tags and their content
                while ((match = styleTagRegex.exec(inputCode)) !== null) {
                    extractedCSS += match[1] + '\n';
                    console.log('Extracted CSS:', match[1].substring(0, 100));
                    // Remove the style tag from the HTML
                    htmlWithoutStyles = htmlWithoutStyles.replace(match[0], '');
                }
                
                // Extract CSS from link tags (external CSS won't work in data: URLs, but we can note them)
                const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*>/gi;
                const linkTags = inputCode.match(linkRegex) || [];
                
                // If there are external CSS links, warn user and provide fallback
                let cssWarning = '';
                if (linkTags.length > 0) {
                    cssWarning = `
                    <!-- Note: External CSS links detected but cannot be loaded in preview. Consider inlining CSS for full preview functionality. -->
                    `;
                    console.log('Found external CSS links:', linkTags.length);
                }
                
                console.log('Final extracted CSS length:', extractedCSS.length);
                
                return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML Preview</title>
    <style>
        /* Basic reset and defaults */
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; min-height: 100%; overflow-x: hidden; overflow-y: auto; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; padding: 20px; }
        
        /* FORCE rounded corners on ALL elements */
        *, *::before, *::after {
            border-radius: 12px !important;
        }
        
        /* Specific targeting for common quiz elements */
        div, section, article, main, header, footer, 
        .quiz-container, .container, .app, .main, .content, 
        div[class*="container"], div[class*="wrapper"], 
        div[class*="quiz"], div[class*="app"] {
            border-radius: 16px !important;
            overflow: hidden !important;
        }
        
        /* Form elements and buttons */
        .question, .options, .option, .card, .panel,
        button, input, select, textarea {
            border-radius: 8px !important;
        }
        
        /* Apply to everything with background or border */
        [style*="background"], [class*="bg-"], [style*="border"],
        h1, h2, h3, h4, h5, h6, p, span, li, ul, ol {
            border-radius: 8px !important;
        }
        
        /* Extracted CSS from the original HTML */
        ${extractedCSS}
        
        /* Additional CSS from combined blocks */
        ${additionalCSS}
    </style>
    ${cssWarning}
</head>
<body>
    ${htmlWithoutStyles}
</body>
</html>`;
            }
            
            // Handle Python code
            if (language === 'python' || inputCode.includes('print(') || inputCode.includes('import ') || 
                inputCode.includes('def ') || inputCode.includes('class ') || inputCode.includes('if __name__')) {
                console.log('Detected as Python code');
                
                return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Python Code Runner</title>
    <script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 25%, #2563eb 75%, #3b82f6 100%);
            min-height: 100vh;
            color: white;
            overflow-x: hidden;
        }
        
        .container {
            max-width: 100%;
            height: 100vh;
            margin: 0;
            padding: 2rem;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .title {
            font-size: 2rem;
            font-weight: 600;
            color: white;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
        }
        
        .subtitle {
            color: #94a3b8;
            font-size: 0.875rem;
        }
        
        .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            max-height: calc(100vh - 200px);
        }
        
        .code-section, .output-section {
            background: rgba(30, 58, 138, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 1.5rem;
            padding: 1.5rem;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .section-header {
            font-size: 1.125rem;
            font-weight: 600;
            color: white;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .code-content {
            background: rgba(30, 58, 138, 0.6);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            flex: 1;
            overflow: auto;
        }
        
        .code-content pre {
            margin: 0;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            font-size: 0.875rem;
            line-height: 1.6;
            color: #e2e8f0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .output-content {
            background: rgba(30, 58, 138, 0.6);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            flex: 1;
            overflow: auto;
            min-height: 120px;
        }
        
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            color: #94a3b8;
            font-style: italic;
            height: 100%;
        }
        
        .spinner {
            width: 24px;
            height: 24px;
            border: 2px solid rgba(148, 163, 184, 0.3);
            border-top: 2px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .output-content pre {
            margin: 0;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            font-size: 0.875rem;
            line-height: 1.6;
            color: #10b981;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .error {
            color: #ef4444 !important;
        }
        
        .success-message {
            color: #10b981;
            font-style: italic;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .error .status-indicator {
            background: #ef4444;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">
                Python Code Runner
            </h1>
            <p class="subtitle">Powered by Pyodide • Running in your browser</p>
        </div>
        
        <div class="content">
            <div class="code-section">
                <div class="section-header">
                    Your Python Code
                </div>
                <div class="code-content">
                    <pre><code>${inputCode.trim()}</code></pre>
                </div>
            </div>
            
            <div class="output-section">
                <div class="section-header">
                    Output
                </div>
                <div class="output-content" id="output">
                    <div class="loading">
                        <div class="spinner"></div>
                        <span>Loading Python interpreter...</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        async function runPython() {
            const outputDiv = document.getElementById('output');
            
            try {
                // Load Pyodide
                const pyodide = await loadPyodide({
                    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
                });
                
                // Clear loading and show empty output state
                outputDiv.innerHTML = '';
                
                // Capture stdout
                let output = '';
                pyodide.runPython(\`
import sys
from io import StringIO
sys.stdout = StringIO()
                \`);
                
                // Run the user's code
                const pythonCode = \`${inputCode.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
                
                try {
                    pyodide.runPython(pythonCode);
                    
                    // Get the captured output
                    const capturedOutput = pyodide.runPython('sys.stdout.getvalue()');
                    
                    if (capturedOutput.trim()) {
                        outputDiv.innerHTML = '<pre>' + capturedOutput + '</pre>';
                    } else {
                        outputDiv.innerHTML = '<div class="success-message"><div class="status-indicator"></div>Code executed successfully (no output)</div>';
                    }
                } catch (pythonError) {
                    outputDiv.innerHTML = '<div class="error"><div class="status-indicator"></div><pre>Error: ' + pythonError.message + '</pre></div>';
                }
                
            } catch (error) {
                outputDiv.innerHTML = '<div class="error"><div class="status-indicator"></div><pre>Failed to load Python interpreter: ' + error.message + '</pre></div>';
            }
        }
        
        // Run Python code when page loads
        runPython();
    </script>
</body>
</html>`;
            }
            
            // Handle JavaScript/TypeScript code
            if (language === 'javascript' || language === 'typescript' || 
                inputCode.includes('console.log') || inputCode.includes('function ') || 
                inputCode.includes('const ') || inputCode.includes('let ') || inputCode.includes('var ')) {
                console.log('Detected as JavaScript/TypeScript code');
                
                return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JavaScript Code Runner</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 25%, #b45309 75%, #92400e 100%);
            min-height: 100vh;
            color: white;
            overflow-x: hidden;
        }
        
        .container {
            max-width: 100%;
            height: 100vh;
            margin: 0;
            padding: 2rem;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .title {
            font-size: 2rem;
            font-weight: 600;
            color: white;
            margin-bottom: 0.5rem;
        }
        
        .subtitle {
            color: #fbbf24;
            font-size: 0.875rem;
        }
        
        .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            max-height: calc(100vh - 200px);
        }
        
        .code-section, .output-section {
            background: rgba(217, 119, 6, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(251, 191, 36, 0.3);
            border-radius: 1.5rem;
            padding: 1.5rem;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .section-header {
            font-size: 1.125rem;
            font-weight: 600;
            color: white;
            margin-bottom: 1rem;
        }
        
        .code-content, .output-content {
            background: rgba(146, 64, 14, 0.6);
            border: 1px solid rgba(251, 191, 36, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            flex: 1;
            overflow: auto;
            min-height: 120px;
        }
        
        .code-content pre, .output-content pre {
            margin: 0;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            font-size: 0.875rem;
            line-height: 1.6;
            color: #fef3c7;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            color: #fbbf24;
            font-style: italic;
            height: 100%;
        }
        
        .success-message {
            color: #fbbf24;
            font-style: italic;
        }
        
        .error {
            color: #ef4444 !important;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">JavaScript Code Runner</h1>
            <p class="subtitle">Running natively in your browser</p>
        </div>
        
        <div class="content">
            <div class="code-section">
                <div class="section-header">Your JavaScript Code</div>
                <div class="code-content">
                    <pre><code>${inputCode.trim()}</code></pre>
                </div>
            </div>
            
            <div class="output-section">
                <div class="section-header">Output</div>
                <div class="output-content" id="output">
                    <div class="loading">
                        <span>Executing JavaScript...</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function runJavaScript() {
            const outputDiv = document.getElementById('output');
            
            // Override console.log to capture output
            const originalLog = console.log;
            const originalError = console.error;
            let output = [];
            
            console.log = (...args) => {
                output.push(args.join(' '));
                originalLog(...args);
            };
            
            console.error = (...args) => {
                output.push('Error: ' + args.join(' '));
                originalError(...args);
            };
            
            try {
                // Execute the JavaScript code
                const jsCode = \`${inputCode.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
                eval(jsCode);
                
                // Show output
                if (output.length > 0) {
                    outputDiv.innerHTML = '<pre>' + output.join('\\n') + '</pre>';
                } else {
                    outputDiv.innerHTML = '<div class="success-message">Code executed successfully (no output)</div>';
                }
            } catch (error) {
                outputDiv.innerHTML = '<div class="error"><pre>Error: ' + error.message + '</pre></div>';
            } finally {
                // Restore original console methods
                console.log = originalLog;
                console.error = originalError;
            }
        }
        
        // Run JavaScript code when page loads
        runJavaScript();
    </script>
</body>
</html>`;
            }
            
            // Handle C/C++ code (via Emscripten/WASM)
            if (language === 'c' || language === 'cpp' || language === 'c++' || 
                inputCode.includes('#include') || inputCode.includes('int main')) {
                console.log('Detected as C/C++ code');
                
                return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>C/C++ Code Preview</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 25%, #991b1b 75%, #7f1d1d 100%);
            min-height: 100vh;
            color: white;
            overflow-x: hidden;
        }
        
        .container {
            max-width: 100%;
            height: 100vh;
            margin: 0;
            padding: 2rem;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .title {
            font-size: 2rem;
            font-weight: 600;
            color: white;
            margin-bottom: 0.5rem;
        }
        
        .subtitle {
            color: #fca5a5;
            font-size: 0.875rem;
        }
        
        .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            max-height: calc(100vh - 200px);
        }
        
        .code-section {
            background: rgba(185, 28, 28, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(252, 165, 165, 0.3);
            border-radius: 1.5rem;
            padding: 1.5rem;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .section-header {
            font-size: 1.125rem;
            font-weight: 600;
            color: white;
            margin-bottom: 1rem;
        }
        
        .code-content {
            background: rgba(127, 29, 29, 0.6);
            border: 1px solid rgba(252, 165, 165, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            flex: 1;
            overflow: auto;
        }
        
        .code-content pre {
            margin: 0;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            font-size: 0.875rem;
            line-height: 1.6;
            color: #fecaca;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .setup-section {
            background: rgba(185, 28, 28, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(252, 165, 165, 0.3);
            border-radius: 1.5rem;
            padding: 1.5rem;
            flex: 1;
        }
        
        .setup-content {
            background: rgba(127, 29, 29, 0.6);
            border: 1px solid rgba(252, 165, 165, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            color: #fecaca;
        }
        
        .compile-note {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 1rem;
            padding: 1rem;
            margin-top: 1rem;
            color: #fca5a5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">C/C++ Code Preview</h1>
            <p class="subtitle">Ready for compilation with Emscripten</p>
        </div>
        
        <div class="content">
            <div class="code-section">
                <div class="section-header">Your C/C++ Code</div>
                <div class="code-content">
                    <pre><code>${inputCode.trim()}</code></pre>
                </div>
            </div>
            
            <div class="setup-section">
                <div class="section-header">Compilation Setup</div>
                <div class="setup-content">
                    <h3>To run this C/C++ code:</h3>
                    <br>
                    <p><strong>1. Install Emscripten:</strong></p>
                    <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 0.5rem; margin: 0.5rem 0;">
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh</pre>
                    
                    <p><strong>2. Compile to WebAssembly:</strong></p>
                    <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 0.5rem; margin: 0.5rem 0;">
emcc program.c -o program.html -s WASM=1</pre>
                    
                    <p><strong>3. Serve and run:</strong></p>
                    <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 0.5rem; margin: 0.5rem 0;">
python3 -m http.server 8000
# Open http://localhost:8000/program.html</pre>
                    
                    <div class="compile-note">
                        <strong>Note:</strong> C/C++ requires compilation to WebAssembly to run in browsers. This preview shows your code structure and compilation instructions.
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
            }
            
            // Handle Rust code (via WASM)
            if (language === 'rust' || inputCode.includes('fn main') || inputCode.includes('use std::')) {
                console.log('Detected as Rust code');
                
                return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rust Code Preview</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #b45309 0%, #92400e 25%, #78350f 75%, #451a03 100%);
            min-height: 100vh;
            color: white;
            overflow-x: hidden;
        }
        
        .container {
            max-width: 100%;
            height: 100vh;
            margin: 0;
            padding: 2rem;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .title {
            font-size: 2rem;
            font-weight: 600;
            color: white;
            margin-bottom: 0.5rem;
        }
        
        .subtitle {
            color: #fdba74;
            font-size: 0.875rem;
        }
        
        .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            max-height: calc(100vh - 200px);
        }
        
        .code-section {
            background: rgba(146, 64, 14, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(253, 186, 116, 0.3);
            border-radius: 1.5rem;
            padding: 1.5rem;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .section-header {
            font-size: 1.125rem;
            font-weight: 600;
            color: white;
            margin-bottom: 1rem;
        }
        
        .code-content {
            background: rgba(69, 26, 3, 0.6);
            border: 1px solid rgba(253, 186, 116, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            flex: 1;
            overflow: auto;
        }
        
        .code-content pre {
            margin: 0;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            font-size: 0.875rem;
            line-height: 1.6;
            color: #fed7aa;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .setup-section {
            background: rgba(146, 64, 14, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(253, 186, 116, 0.3);
            border-radius: 1.5rem;
            padding: 1.5rem;
            flex: 1;
        }
        
        .setup-content {
            background: rgba(69, 26, 3, 0.6);
            border: 1px solid rgba(253, 186, 116, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            color: #fed7aa;
        }
        
        .compile-note {
            background: rgba(180, 83, 9, 0.2);
            border: 1px solid rgba(180, 83, 9, 0.3);
            border-radius: 1rem;
            padding: 1rem;
            margin-top: 1rem;
            color: #fdba74;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">Rust Code Preview</h1>
            <p class="subtitle">Ready for WebAssembly compilation</p>
        </div>
        
        <div class="content">
            <div class="code-section">
                <div class="section-header">Your Rust Code</div>
                <div class="code-content">
                    <pre><code>${inputCode.trim()}</code></pre>
                </div>
            </div>
            
            <div class="setup-section">
                <div class="section-header">WebAssembly Setup</div>
                <div class="setup-content">
                    <h3>To run this Rust code in browser:</h3>
                    <br>
                    <p><strong>1. Install wasm-pack:</strong></p>
                    <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 0.5rem; margin: 0.5rem 0;">
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh</pre>
                    
                    <p><strong>2. Create Cargo.toml:</strong></p>
                    <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 0.5rem; margin: 0.5rem 0;">
[package]
name = "rust-wasm"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"</pre>
                    
                    <p><strong>3. Build WebAssembly:</strong></p>
                    <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 0.5rem; margin: 0.5rem 0;">
wasm-pack build --target web</pre>
                    
                    <p><strong>4. Use in HTML:</strong></p>
                    <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 0.5rem; margin: 0.5rem 0;">
import init from './pkg/rust_wasm.js';
await init();</pre>
                    
                    <div class="compile-note">
                        <strong>Note:</strong> Rust compiles to WebAssembly for high-performance browser execution. This preview shows your code structure and setup instructions.
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
            }
            
            // Handle Java code (via CheerpJ)
            if (language === 'java' || inputCode.includes('public class') || inputCode.includes('public static void main')) {
                console.log('Detected as Java code');
                
                return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Java Code Preview</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 25%, #5b21b6 75%, #4c1d95 100%);
            min-height: 100vh;
            color: white;
            overflow-x: hidden;
        }
        
        .container {
            max-width: 100%;
            height: 100vh;
            margin: 0;
            padding: 2rem;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .title {
            font-size: 2rem;
            font-weight: 600;
            color: white;
            margin-bottom: 0.5rem;
        }
        
        .subtitle {
            color: #c4b5fd;
            font-size: 0.875rem;
        }
        
        .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            max-height: calc(100vh - 200px);
        }
        
        .code-section {
            background: rgba(109, 40, 217, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(196, 181, 253, 0.3);
            border-radius: 1.5rem;
            padding: 1.5rem;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .section-header {
            font-size: 1.125rem;
            font-weight: 600;
            color: white;
            margin-bottom: 1rem;
        }
        
        .code-content {
            background: rgba(76, 29, 149, 0.6);
            border: 1px solid rgba(196, 181, 253, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            flex: 1;
            overflow: auto;
        }
        
        .code-content pre {
            margin: 0;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            font-size: 0.875rem;
            line-height: 1.6;
            color: #e9d5ff;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .setup-section {
            background: rgba(109, 40, 217, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(196, 181, 253, 0.3);
            border-radius: 1.5rem;
            padding: 1.5rem;
            flex: 1;
        }
        
        .setup-content {
            background: rgba(76, 29, 149, 0.6);
            border: 1px solid rgba(196, 181, 253, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            color: #e9d5ff;
        }
        
        .compile-note {
            background: rgba(124, 58, 237, 0.2);
            border: 1px solid rgba(124, 58, 237, 0.3);
            border-radius: 1rem;
            padding: 1rem;
            margin-top: 1rem;
            color: #c4b5fd;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">Java Code Preview</h1>
            <p class="subtitle">Ready for browser execution with CheerpJ</p>
        </div>
        
        <div class="content">
            <div class="code-section">
                <div class="section-header">Your Java Code</div>
                <div class="code-content">
                    <pre><code>${inputCode.trim()}</code></pre>
                </div>
            </div>
            
            <div class="setup-section">
                <div class="section-header">Browser Execution Setup</div>
                <div class="setup-content">
                    <h3>To run this Java code in browser:</h3>
                    <br>
                    <p><strong>1. Compile Java code:</strong></p>
                    <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 0.5rem; margin: 0.5rem 0;">
javac YourClass.java</pre>
                    
                    <p><strong>2. Add CheerpJ to your HTML:</strong></p>
                    <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 0.5rem; margin: 0.5rem 0;">
&lt;script src="https://cjrtnc.leaningtech.com/3.0/cj3loader.js"&gt;&lt;/script&gt;</pre>
                    
                    <p><strong>3. Initialize and run:</strong></p>
                    <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 0.5rem; margin: 0.5rem 0;">
&lt;script&gt;
(async function() {
    await cheerpjInit();
    await cheerpjRunMain("YourClass", "/app/");
})();
&lt;/script&gt;</pre>
                    
                    <p><strong>4. Alternative - Use TeaVM:</strong></p>
                    <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 0.5rem; margin: 0.5rem 0;">
# Compile Java to JavaScript
mvn clean compile teavm:compile</pre>
                    
                    <div class="compile-note">
                        <strong>Note:</strong> Java can run in browsers using CheerpJ (runs .class files) or TeaVM (compiles to JavaScript). This preview shows your code structure and setup options.
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
            }
            
            // Handle React/JSX code
            const transformed = transform(inputCode, {
                presets: ['react'],
                plugins: []
            }).code;

            return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Preview</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { margin: 0; padding: 0; height: 100%; overflow-x: hidden; }
        body { padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; }
        #root { min-height: calc(100vh - 40px); border-radius: 16px; overflow: hidden; }
        
        /* FORCE rounded corners on ALL elements */
        *, *::before, *::after {
            border-radius: 12px !important;
        }
        
        /* Specific targeting for common elements */
        div, section, article, main, header, footer, 
        .quiz-container, .container, .app, .main, .content, 
        div[class*="container"], div[class*="wrapper"], 
        div[class*="quiz"], div[class*="app"] {
            border-radius: 16px !important;
        }
        
        /* Form elements and buttons */
        .question, .options, .option, .card, .panel,
        button, input, select, textarea {
            border-radius: 8px !important;
        }
        
        /* Apply to text elements */
        h1, h2, h3, h4, h5, h6, p, span, li, ul, ol {
            border-radius: 8px !important;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect, useRef } = React;
        
        ${inputCode}
        
        // Try to find and render the main component
        const AppComponent = typeof App !== 'undefined' ? App : 
                           typeof Component !== 'undefined' ? Component :
                           Object.values(window).find(val => 
                               typeof val === 'function' && 
                               val.toString().includes('return') && 
                               val.toString().includes('<')
                           );
        
        if (AppComponent) {
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(React.createElement(AppComponent));
        } else {
            document.getElementById('root').innerHTML = '<p style="color: red;">No React component found. Make sure to export a component or define an App function.</p>';
        }
    </script>
</body>
</html>`;
        } catch (err) {
            setError(err.message);
            return `
<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body><div style="color: red; padding: 20px; font-family: monospace;">
    <h3>Preview Error:</h3>
    <pre>${err.message}</pre>
    <hr>
    <p>Make sure your code is valid ${language.toUpperCase()}.</p>
</div></body>
</html>`;
        }
    };

    useEffect(() => {
        const htmlContent = generatePreviewHTML(previewCode, additionalCSS);
        setPreviewContent(htmlContent);
        setError(null);
        
        // Force iframe refresh when content changes (especially for AI agent updates)
        if (iframeRef.current) {
            iframeRef.current.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
        }
    }, [previewCode, additionalCSS]);

    const handleRefresh = () => {
        const htmlContent = generatePreviewHTML(previewCode, additionalCSS);
        setPreviewContent(htmlContent);
        if (iframeRef.current) {
            iframeRef.current.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
        }
    };

    return (
        <div className="w-full h-full relative z-10 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 rounded-2xl overflow-hidden">
            {isSetupGuide ? (
                /* Setup Guide Content */
                <div className="w-full h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700/30">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                                </svg>
                            </div>
                            <h1 className="text-xl font-semibold text-white">Python Setup Guide</h1>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                    
                    {/* Setup Guide Content */}
                    <div className="flex-1 overflow-y-auto p-6 text-gray-300">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="bg-orange-900/20 border border-orange-700/30 rounded-xl p-4 mb-6">
                                <p className="text-orange-200">This Python code requires local setup because it uses libraries or features not supported in the browser.</p>
                            </div>
                            
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">To run this code locally:</h2>
                                
                                <div className="space-y-6">
                                    <div className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                                            Install Python (if not already installed)
                                        </h3>
                                        <ul className="space-y-2 ml-8 text-gray-300">
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-400 mt-1">•</span>
                                                <span>Download from <a href="https://python.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">https://python.org</a></span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-400 mt-1">•</span>
                                                <span>Or use package managers: <code className="bg-gray-700/50 text-blue-300 px-2 py-1 rounded text-sm font-mono">brew install python</code> (macOS)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-400 mt-1">•</span>
                                                <span>Or: <code className="bg-gray-700/50 text-blue-300 px-2 py-1 rounded text-sm font-mono">apt install python3</code> (Ubuntu)</span>
                                            </li>
                                        </ul>
                                    </div>
                                    
                                    <div className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                                            Install required libraries
                                        </h3>
                                        <div className="ml-8">
                                            <p className="text-gray-300 mb-3">Run this command in your terminal:</p>
                                            <div className="bg-gray-900/50 border border-gray-600/30 rounded-lg p-4">
                                                <code className="text-green-400 font-mono text-sm">
                                                    pip install {code.match(/(?:import|from)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g)?.map(m => m.split(/\s+/)[1]).filter(lib => !['sys', 'os', 'math', 'random', 'datetime', 'json', 'urllib', 'collections'].includes(lib)).join(' ') || 'library_name'}
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                                            Save the code to a file
                                        </h3>
                                        <div className="ml-8 space-y-3">
                                            <p className="text-gray-300">Create a file (e.g., <code className="bg-gray-700/50 text-blue-300 px-2 py-1 rounded text-sm font-mono">main.py</code>) and paste your code:</p>
                                            <div className="bg-gray-900/50 border border-gray-600/30 rounded-lg p-4 max-h-40 overflow-y-auto">
                                                <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">{code}</pre>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                                            Run the code
                                        </h3>
                                        <div className="ml-8">
                                            <p className="text-gray-300 mb-3">Open terminal in the same directory and run:</p>
                                            <div className="bg-gray-900/50 border border-gray-600/30 rounded-lg p-4">
                                                <code className="text-green-400 font-mono text-sm">python main.py</code>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4 mt-6">
                                    <p className="text-blue-200">
                                        <strong>Note:</strong> This code uses features like user input, file operations, system calls, or external libraries that require a full Python environment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Regular Live Preview Content */
                <>
            {/* Google AI Style Header */}
            <div className="flex flex-col p-4 pt-6 pb-4 relative">
                {/* Top bar with controls */}
                <div className="flex items-center justify-between mb-4">
                    <div></div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </div>
                
                {/* Title Section */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-normal text-white mb-2">Live Preview</h1>
                    <p className="text-gray-400 text-sm">Edit and preview your {language} code in real-time</p>
                </div>
                
                {/* Mode Toggle - Google AI Style */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-1 border border-gray-700/20">
                    <div className="flex">
                        <button
                            onClick={() => setViewMode('code')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                                viewMode === 'code'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                            }`}
                        >
                            <CodeIcon />
                            Code
                        </button>
                        <button
                            onClick={() => setViewMode('preview')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                                viewMode === 'preview'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                            }`}
                        >
                            <EyeIcon />
                            Live Preview
                        </button>
                    </div>
                </div>
                
                {/* Action Button */}
                <button
                    onClick={handleRefresh}
                    className="mt-4 bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl py-2.5 px-4 text-gray-300 hover:text-white hover:bg-gray-700/40 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                >
                    <RefreshIcon />
                    Refresh Preview
                </button>
            </div>

            {/* Content Area - Google AI Style */}
            <div className="flex-1 px-4 pb-4 h-[calc(100%-280px)]">
                {/* Code Editor - Google AI Style */}
                {viewMode === 'code' && (
                    <div className="w-full h-full bg-gray-800/20 backdrop-blur-sm border border-gray-700/20 rounded-2xl overflow-hidden">
                        <div className="h-full">
                            {/* Multi-file editor for combined code blocks */}
                            {isCombined ? (
                                <MultiFileEditor 
                                    initialCode={previewCode}
                                    initialCSS={additionalCSS}
                                    onUpdate={(combinedCode) => {
                                        setPreviewCode(combinedCode);
                                        const newContent = generatePreviewHTML(combinedCode, 'jsx', additionalCSS);
                                        setPreviewContent(newContent);
                                    }}
                                />
                            ) : (
                                <Editor
                                    height="100%"
                                    defaultLanguage={language}
                                    value={previewCode}
                                    onChange={(value) => {
                                        setPreviewCode(value || '');
                                        // Auto-update preview when code changes
                                        const newContent = generatePreviewHTML(value || '', language, additionalCSS);
                                        setPreviewContent(newContent);
                                    }}
                                    theme="vs-dark"
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        lineHeight: 20,
                                        fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
                                        wordWrap: 'on',
                                        automaticLayout: true,
                                        scrollBeyondLastLine: false,
                                        renderWhitespace: 'none',
                                        tabSize: 2,
                                        folding: false,
                                        lineNumbers: 'on',
                                        glyphMargin: false,
                                        lineDecorationsWidth: 5,
                                        lineNumbersMinChars: 3,
                                        overviewRulerLanes: 0,
                                        hideCursorInOverviewRuler: true,
                                        scrollbar: {
                                            vertical: 'auto',
                                            horizontal: 'auto',
                                            verticalScrollbarSize: 8,
                                            horizontalScrollbarSize: 8,
                                        },
                                        padding: { top: 16, bottom: 16, left: 8, right: 8 },
                                        contextmenu: false,
                                        smoothScrolling: true,
                                        cursorBlinking: 'smooth',
                                        cursorSmoothCaretAnimation: true
                                    }}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Preview - Google AI Style */}
                {viewMode === 'preview' && (
                    <div className="w-full h-full">
                        {error ? (
                            <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/30 rounded-2xl p-6 text-center">
                                <h3 className="font-semibold text-red-400 mb-3 text-lg">Preview Error</h3>
                                <pre className="text-sm text-red-300 bg-red-900/30 rounded-lg p-4 text-left overflow-auto">{error}</pre>
                            </div>
                        ) : (
                            <div className="w-full h-full bg-gray-800/20 backdrop-blur-sm border border-gray-700/20 rounded-2xl overflow-hidden relative">
                                <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                                    <iframe
                                        ref={iframeRef}
                                        src={`data:text/html;charset=utf-8,${encodeURIComponent(previewContent)}`}
                                        className="border-0 block w-full h-full bg-white"
                                        title="Live Preview"
                                        sandbox="allow-scripts allow-same-origin"
                                        style={{ 
                                            margin: 0, 
                                            padding: 0, 
                                            display: 'block',
                                            width: '100%',
                                            height: '100%',
                                            overflow: 'hidden'
                                        }}
                                    />
                                </div>
                                
                                {/* Fullscreen Button for iframe preview */}
                                <button
                                    onClick={() => {
                                        const iframe = iframeRef.current;
                                        if (iframe) {
                                            if (isIframeFullscreen) {
                                                // Exit fullscreen
                                                if (document.exitFullscreen) {
                                                    document.exitFullscreen();
                                                } else if (document.webkitExitFullscreen) {
                                                    document.webkitExitFullscreen();
                                                } else if (document.mozCancelFullScreen) {
                                                    document.mozCancelFullScreen();
                                                } else if (document.msExitFullscreen) {
                                                    document.msExitFullscreen();
                                                }
                                            } else {
                                                // Enter fullscreen
                                                if (iframe.requestFullscreen) {
                                                    iframe.requestFullscreen();
                                                } else if (iframe.webkitRequestFullscreen) {
                                                    iframe.webkitRequestFullscreen();
                                                } else if (iframe.mozRequestFullScreen) {
                                                    iframe.mozRequestFullScreen();
                                                } else if (iframe.msRequestFullscreen) {
                                                    iframe.msRequestFullscreen();
                                                }
                                            }
                                        }
                                    }}
                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-all z-10"
                                    title={isIframeFullscreen ? "Exit Fullscreen" : "View Website Fullscreen"}
                                >
                                    {isIframeFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
                                </button>

                                {/* Additional exit fullscreen button when in fullscreen mode */}
                                {isIframeFullscreen && createPortal(
                                    <button
                                        onClick={() => {
                                            if (document.exitFullscreen) {
                                                document.exitFullscreen();
                                            } else if (document.webkitExitFullscreen) {
                                                document.webkitExitFullscreen();
                                            } else if (document.mozCancelFullScreen) {
                                                document.mozCancelFullScreen();
                                            } else if (document.msExitFullscreen) {
                                                document.msExitFullscreen();
                                            }
                                        }}
                                        className="fixed top-4 right-4 w-12 h-12 rounded-full bg-black/70 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-black/90 transition-all z-[9999] shadow-lg"
                                        title="Exit Fullscreen"
                                    >
                                        <ExitFullscreenIcon />
                                    </button>,
                                    document.body
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            </>
            )}
        </div>
    );
};

const CombinedCodeBlock = ({ language, code, css, additionalJS, originalBlocks, darkMode, onPreview, onSetupGuide }) => {
    const [copied, setCopied] = useState(false);
    const [showingBlock, setShowingBlock] = useState(0); // 0 = main, 1 = css, 2 = js

    const handleCopy = async () => {
        try {
            let textToCopy = '';
            if (showingBlock === 0) {
                textToCopy = code;
            } else if (showingBlock === 1) {
                textToCopy = css;
            } else if (showingBlock === 2) {
                textToCopy = additionalJS;
            }
            
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handlePreview = () => {
        // Use the simple algorithm from the HTML Preview: HTML + <style>CSS</style> + <script>JS</script>
        
        let htmlContent = '';
        let cssContent = '';
        let jsContent = '';
        
        // Clean React component code
        const cleanReactCode = (code) => {
            // Remove HTML wrapper if present
            const cleanedCode = code
                .replace(/<!DOCTYPE html>[\s\S]*?<body[^>]*>/gi, '')
                .replace(/<\/body>[\s\S]*?<\/html>/gi, '')
                .replace(/<script[^>]*src[^>]*react[^>]*><\/script>/gi, '')
                .replace(/<script[^>]*src[^>]*babel[^>]*><\/script>/gi, '')
                .replace(/<div id="root"><\/div>/gi, '');
            
            // If it's wrapped in script tags, extract the content
            const scriptMatch = cleanedCode.match(/<script[^>]*type="text\/babel"[^>]*>([\s\S]*?)<\/script>/i);
            if (scriptMatch) {
                return scriptMatch[1].trim();
            }
            
            // If it's already clean React code, return as is
            return cleanedCode.trim();
        };
        
        // Extract CSS from within <style> tags in the main code if it exists
        if (code.includes('<style>')) {
            const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
            if (styleMatch) {
                cssContent = styleMatch[1];
                // Remove the style tags from the main code for clean HTML
                htmlContent = code.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
            }
        } else {
            htmlContent = code;
        }
        
        // Add separate CSS blocks
        if (css) {
            cssContent += css;
        }
        
        // Add separate JS blocks
        if (additionalJS) {
            jsContent += additionalJS;
        }
        
        // For JSX/React, we need to transform it
        if (language === 'jsx' || language === 'javascript' || language === 'typescript' || language === 'react') {
            // Clean React component rendering
            const reactHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React App Preview</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { height: 100%; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            background-color: #f5f5f5;
        }
        #root { 
            width: 100%; 
            height: 100%; 
            overflow: auto;
        }
        ${cssContent}
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect, useReducer, useCallback, useMemo, useRef, useContext, createContext } = React;
        
        ${cleanReactCode(htmlContent)}
        ${jsContent}
        
        // Auto-render if no explicit render call
        if (typeof App !== 'undefined') {
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
        } else if (typeof Component !== 'undefined') {
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<Component />);
        }
    </script>
</body>
</html>`;
            
            if (onPreview) {
                onPreview(reactHTML, 'jsx', cssContent, true);
            }
        } else {
            // For regular HTML, use the simple algorithm directly
            const combinedHTML = `${htmlContent}${cssContent ? `<style>${cssContent}</style>` : ''}${jsContent ? `<script>${jsContent}</script>` : ''}`;
            
            if (onPreview) {
                onPreview(combinedHTML, language, cssContent, true);
            }
        }
    };

    const blocks = [
        { name: 'Main', content: code, lang: language },
        ...(css ? [{ name: 'CSS', content: css, lang: 'css' }] : []),
        ...(additionalJS ? [{ name: 'JavaScript', content: additionalJS, lang: 'javascript' }] : [])
    ];

    const currentBlock = blocks[showingBlock];

    return (
        <div className="my-4">
            {/* Combined Preview Header */}
            <div className={`p-3 rounded-t-lg border-b ${darkMode ? 'bg-gray-800/50 border-gray-600/50' : 'bg-gray-100/50 border-gray-300/50'}`}>
                {/* Top Row - Title and Actions */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${darkMode ? 'bg-green-400' : 'bg-green-500'}`}></div>
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Combined Preview ({blocks.length} files)
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                                copied 
                                    ? 'bg-green-500 text-white' 
                                    : darkMode 
                                        ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50' 
                                        : 'bg-gray-200/50 text-gray-700 hover:bg-gray-300/50'
                            }`}
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                        
                        <button
                            onClick={handlePreview}
                            className="px-3 py-1.5 text-xs rounded-md font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-1"
                        >
                            <EyeIcon size={14} />
                            Live Preview
                        </button>
                    </div>
                </div>
                
                {/* Bottom Row - File Tabs */}
                <div className="flex gap-1 flex-wrap">
                    {blocks.map((block, index) => (
                        <button
                            key={index}
                            onClick={() => setShowingBlock(index)}
                            className={`px-3 py-1.5 text-xs rounded ${
                                showingBlock === index
                                    ? darkMode 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-blue-500 text-white'
                                    : darkMode
                                        ? 'bg-gray-700/50 text-gray-400 hover:text-gray-300'
                                        : 'bg-gray-200/50 text-gray-600 hover:text-gray-800'
                            } transition-colors`}
                        >
                            {block.name}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Code Display */}
            <div className="relative">
                <SyntaxHighlighter
                    language={currentBlock.lang}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                        borderBottomLeftRadius: '0.5rem',
                        borderBottomRightRadius: '0.5rem',
                        fontSize: '0.875rem',
                        lineHeight: '1.5'
                    }}
                    showLineNumbers={true}
                    wrapLines={true}
                    wrapLongLines={true}
                >
                    {currentBlock.content}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

const AiMessage = ({ content, darkMode, onPreview, onSetupGuide, isEditResponse, currentCode, currentLanguage }) => {
    const parseTableFromText = (text) => {
        console.log('Parsing table from text:', text.substring(0, 200));
        
        // Look for table data in various formats
        const tablePatterns = [
            // JSON table format: {"title": "...", "headers": [...], "rows": [[...]]}
            /```json\s*\n?(\{[\s\S]*?"headers"[\s\S]*?"rows"[\s\S]*?\})\s*\n?```/i,
            // Table directive format: [TABLE: title | header1,header2 | row1col1,row1col2 | row2col1,row2col2]
            /\[TABLE:\s*(.*?)\s*\|(.*?)\|((?:\s*\|.*?)*)\]/gi,
            // Markdown table format - improved to capture all table content
            /\|[^\n]*\|[\s\S]*?\n\|[^\n]*\|/g
        ];

        // Try JSON format first
        const jsonMatch = text.match(tablePatterns[0]);
        if (jsonMatch) {
            try {
                const tableData = JSON.parse(jsonMatch[1]);
                console.log('Parsed JSON table:', tableData);
                if (tableData.headers && tableData.rows) {
                    return { 
                        tableData, 
                        remainingText: text.replace(jsonMatch[0], '').trim() 
                    };
                }
            } catch (e) {
                console.log('Error parsing JSON table:', e);
            }
        }

        // Try shorthand format
        const shorthandMatch = text.match(tablePatterns[1]);
        if (shorthandMatch) {
            try {
                const match = shorthandMatch[0];
                const parts = match.split('|');
                if (parts.length >= 3) {
                    const title = parts[0].replace('[TABLE:', '').trim();
                    const headers = parts[1].split(',').map(h => h.trim());
                    const rows = parts.slice(2).map(rowText => 
                        rowText.replace(']', '').split(',').map(cell => cell.trim())
                    ).filter(row => row.length > 0);
                    
                    console.log('Parsed shorthand table:', { title, headers, rows });
                    return {
                        tableData: { title, headers, rows },
                        remainingText: text.replace(match, '').trim()
                    };
                }
            } catch (e) {
                console.log('Error parsing shorthand table:', e);
            }
        }

        // Try markdown format - more robust parsing
        const markdownMatches = text.match(/\|[^\n]*\|/g);
        if (markdownMatches && markdownMatches.length >= 2) {
            try {
                console.log('Found markdown table lines:', markdownMatches.length);
                
                // Filter out separator lines (lines with only -, |, and spaces)
                const dataLines = markdownMatches.filter(line => 
                    !line.match(/^\|[\s\-\|]+\|$/)
                );
                
                console.log('Filtered data lines:', dataLines);
                
                if (dataLines.length >= 2) {
                    // First line is headers
                    const headers = dataLines[0]
                        .split('|')
                        .map(h => h.trim())
                        .filter(h => h);
                    
                    // Rest are data rows
                    const rows = dataLines.slice(1).map(line => 
                        line.split('|')
                            .map(cell => cell.trim())
                            .filter(cell => cell)
                    ).filter(row => row.length > 0);
                    
                    console.log('Parsed markdown table:', { headers, rows });
                    
                    if (headers.length > 0 && rows.length > 0) {
                        // Extract title from context (look for text before table)
                        const beforeTable = text.split(markdownMatches[0])[0].trim();
                        const titleMatch = beforeTable.match(/([^\n]+)$/);
                        const title = titleMatch ? titleMatch[1].trim() : 'Data Table';
                        
                        return {
                            tableData: { title, headers, rows },
                            remainingText: text.replace(/\|[^\n]*\|[\s\S]*?\n(?:\|[^\n]*\|[\s\n]*)*/, '').trim()
                        };
                    }
                }
            } catch (e) {
                console.log('Error parsing markdown table:', e);
            }
        }
        
        return null;
    };

    const renderMessageContent = (text) => {
        const parts = [];
        let remainingText = text;
        
        // Check for table first
        const tableResult = parseTableFromText(text);
        if (tableResult) {
            // Add text before table if any
            if (tableResult.remainingText !== text) {
                const beforeTable = text.replace(tableResult.remainingText, '').replace(/```json[\s\S]*?```/g, '').replace(/\[TABLE:[\s\S]*?\]/g, '').replace(/\|[\s\S]*?\|(?:\s*\n\s*\|[-\s\|]*\|)?[\s\S]*$/g, '').trim();
                if (beforeTable) {
                    parts.push({
                        type: 'text',
                        content: beforeTable
                    });
                }
            }
            
            // Add table
            parts.push({
                type: 'table',
                data: tableResult.tableData
            });
            
            // Continue with remaining text
            remainingText = tableResult.remainingText;
        }
        
        if (remainingText) {
            let lastIndex = 0;
            
            // First, collect all code blocks
            const codeBlocks = [];
            const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
            let match;
            
            while ((match = codeBlockRegex.exec(remainingText)) !== null) {
                let detectedLanguage = (match[1] || 'javascript').toLowerCase();
                const content = match[2].trim();
                
                // Enhanced language detection for React/JSX code
                if (detectedLanguage === 'html' || detectedLanguage === 'javascript') {
                    // Check if it's actually React/JSX code
                    const hasReactFeatures = content.includes('React.') || content.includes('ReactDOM') || 
                                           content.includes('useState') || content.includes('useEffect') || 
                                           content.includes('className=') || content.includes('type="text/babel"') ||
                                           /return\s*\([\s\S]*</.test(content) || // Return with JSX
                                           /const\s+\w+\s*=\s*\(\)\s*=>\s*\{[\s\S]*return[\s\S]*</.test(content) || // Arrow function component
                                           /function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*return[\s\S]*</.test(content); // Function component
                    
                    if (hasReactFeatures) {
                        detectedLanguage = 'jsx';
                    }
                }
                
                // Also check for 'react' language explicitly
                if (detectedLanguage === 'react') {
                    detectedLanguage = 'jsx';
                }
                
                codeBlocks.push({
                    index: match.index,
                    length: match[0].length,
                    language: detectedLanguage,
                    content: content,
                    fullMatch: match[0]
                });
            }
            
            // Check if we have multiple related code blocks that should be combined
            const shouldCombineBlocks = codeBlocks.length > 1 && (
                // Traditional case: separate code blocks with CSS
                (codeBlocks.some(block => ['html', 'jsx', 'javascript', 'typescript'].includes(block.language)) &&
                 codeBlocks.some(block => ['css', 'scss', 'sass'].includes(block.language))) ||
                // New case: any multiple blocks that could work together
                codeBlocks.some(block => ['html', 'jsx', 'javascript', 'typescript'].includes(block.language))
            );
            
            if (shouldCombineBlocks) {
                // Find the main code block (HTML, JSX, or JS)
                const mainBlock = codeBlocks.find(block => 
                    ['html', 'jsx', 'javascript', 'typescript'].includes(block.language)
                ) || codeBlocks[0];
                
                // Find CSS blocks
                const cssBlocks = codeBlocks.filter(block => 
                    ['css', 'scss', 'sass'].includes(block.language)
                );
                
                // Find other JS/TS blocks
                const jsBlocks = codeBlocks.filter(block => 
                    ['javascript', 'typescript'].includes(block.language) && block !== mainBlock
                );
                
                // Add text before first code block
                if (codeBlocks[0].index > 0) {
                    const beforeText = remainingText.slice(0, codeBlocks[0].index);
                    if (beforeText.trim()) {
                        parts.push({
                            type: 'text',
                            content: beforeText
                        });
                    }
                }
                
                // Combine all code into one preview
                let combinedContent = mainBlock.content;
                let combinedCSS = '';
                let combinedJS = '';
                
                // Collect CSS
                if (cssBlocks.length > 0) {
                    combinedCSS = cssBlocks.map(block => block.content).join('\n\n');
                }
                
                // Also extract CSS from <style> tags within JSX/HTML blocks
                const extractStyleFromCode = (code) => {
                    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
                    let match;
                    let extractedStyles = '';
                    while ((match = styleRegex.exec(code)) !== null) {
                        extractedStyles += match[1] + '\n\n';
                    }
                    return extractedStyles;
                };
                
                // Extract CSS from main block if it contains style tags
                const inlineCSS = extractStyleFromCode(mainBlock.content);
                if (inlineCSS.trim()) {
                    combinedCSS += (combinedCSS ? '\n\n' : '') + inlineCSS;
                }
                
                // Extract CSS from other blocks that might have style tags
                codeBlocks.forEach(block => {
                    if (block !== mainBlock && ['html', 'jsx'].includes(block.language)) {
                        const blockCSS = extractStyleFromCode(block.content);
                        if (blockCSS.trim()) {
                            combinedCSS += (combinedCSS ? '\n\n' : '') + blockCSS;
                        }
                    }
                });
                
                // Collect additional JS
                if (jsBlocks.length > 0) {
                    combinedJS = jsBlocks.map(block => block.content).join('\n\n');
                }
                
                // Create combined code block
                parts.push({
                    type: 'combinedCode',
                    language: mainBlock.language,
                    content: combinedContent,
                    css: combinedCSS,
                    additionalJS: combinedJS,
                    originalBlocks: codeBlocks
                });
                
                // Add text after last code block
                const lastBlock = codeBlocks[codeBlocks.length - 1];
                const afterIndex = lastBlock.index + lastBlock.length;
                if (afterIndex < remainingText.length) {
                    const finalText = remainingText.slice(afterIndex);
                    if (finalText.trim()) {
                        parts.push({
                            type: 'text',
                            content: finalText
                        });
                    }
                }
            } else {
                // Process code blocks individually (original behavior)
                codeBlockRegex.lastIndex = 0; // Reset regex
                while ((match = codeBlockRegex.exec(remainingText)) !== null) {
                    // Add text before code block
                    if (match.index > lastIndex) {
                        const beforeText = remainingText.slice(lastIndex, match.index);
                        if (beforeText.trim()) {
                            parts.push({
                                type: 'text',
                                content: beforeText
                            });
                        }
                    }
                    
                    // Add code block
                    parts.push({
                        type: 'code',
                        language: match[1] || 'javascript',
                        content: match[2].trim()
                    });
                    
                    lastIndex = match.index + match[0].length;
                }
                
                // Add remaining text after last code block
                if (lastIndex < remainingText.length) {
                    const finalText = remainingText.slice(lastIndex);
                    if (finalText.trim()) {
                        parts.push({
                            type: 'text',
                            content: finalText
                        });
                    }
                }
                
                // If no code blocks found in remaining text, treat as plain text
                if (parts.length === 0 || (parts.length === 1 && parts[0].type === 'table')) {
                    if (remainingText.trim()) {
                        parts.push({
                            type: 'text',
                            content: remainingText
                        });
                    }
                }
            }
        }
        
        // If no parts found at all, treat as plain text
        if (parts.length === 0) {
            parts.push({
                type: 'text',
                content: text
            });
        }
        
        return parts;
    };

    const formatTextContent = (text) => {
        // 1. Escape HTML characters to prevent XSS and ensure user's HTML is rendered as text
        let processedContent = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        
        // 2. Apply Markdown formatting
        
        // Headers (H1-H6)
        processedContent = processedContent.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
            const level = hashes.length;
            const sizes = ['text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm', 'text-xs'];
            const size = sizes[level - 1] || 'text-base';
            return `<h${level} class="${size} font-bold ${darkMode ? 'text-white/95' : 'text-gray-900'} my-2">${title}</h${level}>`;
        });
        
        // Bold+Italic (***text***)
        processedContent = processedContent.replace(/\*\*\*(.*?)\*\*\*/g, `<strong class="font-semibold italic ${darkMode ? 'text-white/90' : 'text-gray-900'}">$1</strong>`);
        
        // Bold text (**text**)
        processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, `<strong class="font-semibold ${darkMode ? 'text-white/90' : 'text-gray-900'}">$1</strong>`);
        
        // Italic text (*text*)
        processedContent = processedContent.replace(/\*(.*?)\*/g, `<em class="italic ${darkMode ? 'text-white/85' : 'text-gray-800'}">$1</em>`);
        
        // Strikethrough (~~text~~)
        processedContent = processedContent.replace(/~~(.*?)~~/g, `<span class="line-through text-gray-500">$1</span>`);

        // Horizontal Rule (---)
        processedContent = processedContent.replace(/^(\s*[-*_]){3,}\s*$/gm, `<hr class="my-4 border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'} w-full" />`);

        // Inline code (`text`)
        processedContent = processedContent.replace(/`([^`]+)`/g, `<code class="px-2 py-1 rounded text-xs font-mono ${darkMode ? 'bg-gray-700/50 text-blue-300' : 'bg-gray-200 text-blue-700'}">$1</code>`);
        
        // Numbered lists
        processedContent = processedContent.replace(/^(\s*\d+\.\s+.*)/gm, (match, item) => {
            const itemContent = item.replace(/^\s*\d+\.\s+/, '').trim();
            if (!itemContent) return ''; // Skip empty items
            const numberMatch = item.match(/^\s*(\d+)\./);
            return `<div class="flex items-start space-x-2 mb-1 mt-3">
                <span class="text-blue-600 font-semibold min-w-[1.5rem] mt-0.5">${numberMatch[1]}.</span>
                <span class="flex-1">${itemContent}</span>
            </div>`;
        });
        
        // Bullet lists
        processedContent = processedContent.replace(/^(?:\s*[\-\*]\s+.*\n?)+/gm, (match) => {
            // We need to unescape the bullet points if they were escaped, but here we match raw text pattern
            // Since we escaped everything, '-' is still '-' and '*' is still '*' (unless it was part of bold/italic which we handled)
            // Wait, '*' is used for bullets too.
            
            const items = match.trim().split('\n')
                .filter(item => item.trim() && /^\s*[\-\*]\s+/.test(item)) 
                .map(item => {
                    const itemContent = item.replace(/^\s*[\-\*]\s+/, '').trim();
                    return itemContent ? `<li class="ml-4">${itemContent}</li>` : '';
                })
                .filter(Boolean) 
                .join('');
            return items ? `<ul class="list-disc list-inside space-y-1 mt-1 mb-2">${items}</ul>` : match;
        });
        
        return { __html: processedContent };
    };

    const messageParts = renderMessageContent(content);

    return (
        <div className="flex flex-col items-start">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-2 border bg-white border-gray-300/50">
                <OVIcoSVG className="text-black" />
            </div>
            <div className={`rounded-3xl py-2 sm:py-3 px-3 sm:px-4 max-w-[85%] sm:max-w-[80%] backdrop-blur-sm ${darkMode ? 'bg-gray-800/20 border-white/10' : 'bg-white/20 border-white/20'}`}>
                <div className={`text-sm sm:text-base leading-relaxed ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {messageParts.map((part, index) => {
                        if (part.type === 'code') {
                            return (
                                <CodeBlock
                                    key={index}
                                    language={part.language}
                                    code={part.content}
                                    darkMode={darkMode}
                                    onPreview={onPreview}
                                    onSetupGuide={onSetupGuide}
                                />
                            );
                        } else if (part.type === 'combinedCode') {
                            return (
                                <CombinedCodeBlock
                                    key={index}
                                    language={part.language}
                                    code={part.content}
                                    css={part.css}
                                    additionalJS={part.additionalJS}
                                    originalBlocks={part.originalBlocks}
                                    darkMode={darkMode}
                                    onPreview={onPreview}
                                    onSetupGuide={onSetupGuide}
                                />
                            );
                        } else if (part.type === 'table') {
                            return (
                                <InChatTable
                                    key={index}
                                    data={part.data}
                                    darkMode={darkMode}
                                    title={part.data.title}
                                />
                            );
                        } else {
                            return (
                                <div
                                    key={index}
                                    className="whitespace-pre-wrap break-words"
                                    dangerouslySetInnerHTML={formatTextContent(part.content)}
                                />
                            );
                        }
                    })}
                    
                    {/* Live Preview Button for AI Edit Responses */}
                    {isEditResponse && currentCode && onPreview && (
                        <div className="mt-3 pt-3 border-t border-gray-300/30">
                            <button
                                onClick={() => onPreview(currentCode, currentLanguage)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 ${darkMode ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'}`}
                            >
                                <EyeIcon />
                                View Live Preview
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ErrorMessage = ({ content }) => (
     <div className="flex flex-col items-start">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mb-2 font-bold text-sm text-white border border-white/20">!</div>
        <div className="bg-red-100 rounded-3xl p-3 max-w-[85%] backdrop-blur-sm border border-red-300">
            <p className="text-sm text-red-800 font-medium whitespace-pre-wrap break-words">{content}</p>
        </div>
    </div>
);

const LoadingIndicator = ({ darkMode }) => (
    <div className="flex flex-col items-start">
        <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2 border bg-white border-gray-300/50">
            <OVIcoSVG className="text-black animate-pulse" />
        </div>
        <div className={`rounded-3xl py-2 px-4 max-w-[85%] backdrop-blur-sm flex items-center ${darkMode ? 'bg-gray-800/20 border-white/10' : 'bg-white/20 border-white/20'}`}>
            <span className={`text-sm mr-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Thinking
            </span>
            <div className="flex space-x-1 items-end">
                <div className={`w-1.5 h-1.5 rounded-full jumping-dot ${darkMode ? 'bg-gray-300' : 'bg-gray-600'}`}></div>
                <div className={`w-1.5 h-1.5 rounded-full jumping-dot ${darkMode ? 'bg-gray-300' : 'bg-gray-600'}`}></div>
                <div className={`w-1.5 h-1.5 rounded-full jumping-dot ${darkMode ? 'bg-gray-300' : 'bg-gray-600'}`}></div>
            </div>
        </div>
    </div>
);

const Modal = ({ title, content, onClose, darkMode }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl transition-all duration-500 ${darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-white/20'}`}>
            <header className={`p-4 border-b flex justify-between items-center flex-shrink-0 ${darkMode ? 'border-gray-700/50' : 'border-black/10'}`}>
                <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
                <button onClick={onClose} className={`p-1 rounded-full transition-all duration-300 ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' : 'text-gray-500 hover:text-gray-900 hover:bg-black/10'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </header>
            <div className={`p-6 overflow-y-auto text-sm space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {content}
            </div>
        </div>
    </div>
);

const TermsContent = () => (
    <>
        <p className="font-bold">Last updated: September 3, 2025</p>
        <p>Welcome to Chat Blues. These Terms and Conditions outline the rules and regulations for the use of Official Vishwateja's application, Chat Blues.</p>
        <p>By accessing this application, we assume you accept these terms and conditions. Do not continue to use Chat Blues if you do not agree to all of the terms and conditions stated on this page.</p>
        <h3 className="font-bold text-lg pt-2">1. Acknowledgment</h3>
        <p>Chat Blues is an experimental conversational AI application. The service is provided "AS IS" and "AS AVAILABLE" for your personal, non-commercial use. You agree that your use of the service is at your sole risk.</p>
        <h3 className="font-bold text-lg pt-2">2. AI-Generated Content</h3>
        <p>The responses provided by the AI are generated automatically and are not reviewed or endorsed by Official Vishwateja. We make no warranties or representations about the accuracy, reliability, or completeness of any information provided by the AI.</p>
        <p>You acknowledge that the AI may generate content that is inaccurate, offensive, or otherwise objectionable. Official Vishwateja shall have no liability for any content generated by the AI.</p>
        <h3 className="font-bold text-lg pt-2">3. Prohibited Uses</h3>
        <p>You agree not to use the service to:</p>
        <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Engage in any activity that is illegal, harmful, or fraudulent.</li>
            <li>Generate content that is hateful, harassing, or violent.</li>
            <li>Attempt to reverse engineer or otherwise tamper with the AI model.</li>
            <li>Submit any sensitive personal information, including but not limited to financial, medical, or government identification details.</li>
        </ul>
        <h3 className="font-bold text-lg pt-2">4. Limitation of Liability</h3>
        <p>In no event shall Official Vishwateja, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.</p>
        <h3 className="font-bold text-lg pt-2">5. Changes to Terms</h3>
        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
        <h3 className="font-bold text-lg pt-2">6. Contact Us</h3>
        <p>If you have any questions about these Terms, you can contact us at: founder@officialvishwateja.com</p>
    </>
);

const PrivacyPolicyContent = () => (
    <>
        <p className="font-bold">Last updated: September 3, 2025</p>
        <p>Official Vishwateja ("We", "Us", "Our") is committed to protecting your privacy. This Privacy Policy explains how we handle information in connection with our Chat Blues application (the "Service").</p>
        <h3 className="font-bold text-lg pt-2">1. No Personal Data Collection</h3>
        <p>Our Service is designed with your privacy in mind. We do not require you to create an account, log in, or provide any personal identification information (such as your name, email address, or phone number) to use Chat Blues. We do not collect or store any personal data from our users.</p>
        <h3 className="font-bold text-lg pt-2">2. Information Processed by Third Parties</h3>
        <p>To provide responses, the text you enter into the chat is sent to a third-party API provider, OpenRouter. Your chat history within a session is sent with each new message to provide conversational context. This data is processed by OpenRouter to generate an AI response. We do not store your conversation history on our servers.</p>
        <p>We encourage you to review OpenRouter's Privacy Policy to understand how they handle your data. Official Vishwateja is not responsible for the privacy practices of third-party services.</p>
        <h3 className="font-bold text-lg pt-2">3. Non-Personal Data</h3>
        <p>We do not use cookies or any other tracking technologies to collect information about you or your device.</p>
        <h3 className="font-bold text-lg pt-2">4. Data Security</h3>
        <p>While we do not store your data, we rely on the security measures of our API provider to protect the data during transit and processing. However, no method of transmission over the Internet is 100% secure. Therefore, we strongly advise against submitting any confidential or sensitive information through the chat interface.</p>
        <h3 className="font-bold text-lg pt-2">5. Children's Privacy</h3>
        <p>Our Service is not intended for use by children under the age of 13. We do not knowingly collect any information from children under 13.</p>
        <h3 className="font-bold text-lg pt-2">6. Changes to This Privacy Policy</h3>
        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
        <h3 className="font-bold text-lg pt-2">7. Contact Us</h3>
        <p>If you have any questions about this Privacy Policy, you can contact us at: founder@officialvishwateja.com</p>
    </>
);

const InfoContent = ({ darkMode }) => (
    <div className="text-center">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Official Vishwateja</h2>
        <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Developed by Vishwateja S B</p>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Software Developer and AI Data Analyst</p>
    </div>
);

const SettingsContent = ({ 
    darkMode, 
    localEndpoint,
    setLocalEndpoint,
    localModel,
    setLocalModel,
    savedModels,
    onDeleteModel,
    hapticFeedback,
    setHapticFeedback,
    randomSeed,
    setRandomSeed,
    temperature,
    setTemperature,
    contextWindow,
    setContextWindow,
    onReset,
    onSaveConfig
}) => (
    <div className="space-y-6">
        {/* Privacy Notice */}
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-green-900/20 border-green-700/30' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={darkMode ? 'text-green-400' : 'text-green-600'}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>100% Private & Local</span>
            </div>
            <p className={`text-sm ${darkMode ? 'text-green-300/80' : 'text-green-600'}`}>
                All AI processing happens on your device. No data is sent to external servers. Your conversations stay completely private.
            </p>
        </div>

        {/* Local API Configuration */}
        <div>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Local AI Configuration</h3>
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Ollama API Endpoint
                        </label>
                        <input
                            type="text"
                            value={localEndpoint}
                            onChange={(e) => setLocalEndpoint(e.target.value)}
                            placeholder="http://localhost:11434"
                            className={`w-full px-3 py-2 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-blue-500 ${
                                darkMode 
                                    ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500' 
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                            }`}
                        />
                        <p className={`text-xs mt-1.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Default Ollama endpoint. Change if using a different port or remote server.
                        </p>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Model Name
                        </label>
                        <input
                            type="text"
                            value={localModel}
                            onChange={(e) => setLocalModel(e.target.value)}
                            placeholder="llama3.2:3b"
                            className={`w-full px-3 py-2 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-blue-500 ${
                                darkMode 
                                    ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500' 
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                            }`}
                        />
                        <p className={`text-xs mt-1.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Enter exact model name as shown by <code className="px-1 py-0.5 rounded bg-gray-700/50">ollama list</code>
                        </p>
                    </div>
                    <button
                        onClick={onSaveConfig}
                        className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                            darkMode 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                        Save & Add Model to List
                    </button>
                </div>
            </div>
        </div>

        {/* Saved Models List */}
        {savedModels.length > 0 && (
            <div>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Saved Models</h3>
                <div className={`rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="max-h-48 overflow-y-auto">
                        {savedModels.map((model, index) => (
                            <div 
                                key={index}
                                className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                                    index !== savedModels.length - 1 ? (darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200') : ''
                                } ${localModel === model 
                                    ? darkMode ? 'bg-blue-600/20' : 'bg-blue-50' 
                                    : darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
                                }`}
                                onClick={() => setLocalModel(model)}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        localModel === model 
                                            ? 'border-blue-500 bg-blue-500' 
                                            : darkMode ? 'border-gray-500' : 'border-gray-400'
                                    }`}>
                                        {localModel === model && (
                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                        )}
                                    </div>
                                    <span className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {model}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteModel(model);
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                        darkMode 
                                            ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' 
                                            : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Click to select a model. Click the trash icon to remove.
                </p>
            </div>
        )}

        {/* Chat Settings */}
        <div>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Chat Settings</h3>
            <div className={`rounded-xl border divide-y ${darkMode ? 'border-gray-700/50 divide-gray-700/50 bg-gray-800/30' : 'border-gray-200 divide-gray-200 bg-gray-50/50'}`}>
                
                {/* Haptic Feedback */}
                <div className="p-4 flex items-center justify-between">
                    <div>
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Haptic feedback</div>
                        <div className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Vibration on interactions</div>
                    </div>
                    <button 
                        onClick={() => setHapticFeedback(!hapticFeedback)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${hapticFeedback ? 'bg-green-500' : 'bg-gray-400'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${hapticFeedback ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {/* Random Seed */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Random seed</div>
                        <button 
                            onClick={() => setRandomSeed(!randomSeed)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${randomSeed ? 'bg-green-500' : 'bg-gray-400'}`}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${randomSeed ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Sets the randomization baseline; a fixed seed ensures repeatable results, while a random seed produces varied responses.
                    </p>
                </div>

                {/* Temperature */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Temperature: {temperature}</div>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1" 
                        value={temperature} 
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
                    />
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Controls the creativity of responses; lower values make answers more focused, while higher values increase randomness.
                    </p>
                </div>

                {/* Context Window */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Context window: {contextWindow.toLocaleString()}</div>
                    </div>
                    <input 
                        type="range" 
                        min="2048" 
                        max="32768" 
                        step="1024" 
                        value={contextWindow} 
                        onChange={(e) => setContextWindow(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
                    />
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Maximum number of tokens the model can process at once. Higher values use more memory but allow longer conversations.
                    </p>
                </div>
            </div>
        </div>
        
        {/* Reset Settings */}
        <div className="pt-2">
            <button
                onClick={onReset}
                className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    darkMode 
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                        : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                }`}
            >
                <TrashIcon size={16} />
                Reset to Default Settings
            </button>
        </div>
        
        {/* Help Improve - Removed */}
    </div>
);

const ActivityContent = ({ darkMode, chatHistory, messages, onLoadChat }) => {
    const totalChats = chatHistory.length;
    const totalMessages = chatHistory.reduce((acc, chat) => acc + chat.messages.length, 0) + messages.length;
    const currentSessionMessages = messages.length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700/30 border-gray-600/30' : 'bg-blue-50 border-blue-100'}`}>
                    <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Chats</div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{totalChats}</div>
                </div>
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700/30 border-gray-600/30' : 'bg-purple-50 border-purple-100'}`}>
                    <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Messages</div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{totalMessages}</div>
                </div>
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700/30 border-gray-600/30' : 'bg-green-50 border-green-100'}`}>
                    <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Session</div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{currentSessionMessages}</div>
                </div>
            </div>
            
            <div>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
                <div className={`rounded-xl border overflow-hidden ${darkMode ? 'border-gray-700/50' : 'border-gray-200'}`}>
                    {chatHistory.slice(0, 5).map((chat, index) => (
                        <div 
                            key={chat.id} 
                            onClick={() => onLoadChat(chat)}
                            className={`p-3 flex justify-between items-center border-b last:border-0 cursor-pointer transition-colors ${darkMode ? 'border-gray-700/50 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'}`}
                        >
                            <div>
                                <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{chat.title}</div>
                                <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{new Date(chat.date).toLocaleDateString()} • {chat.messages.length} messages</div>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                Open
                            </div>
                        </div>
                    ))}
                    {chatHistory.length === 0 && (
                        <div className={`p-4 text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No recent activity</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const HelpContent = ({ darkMode }) => (
    <div className="space-y-6">
        <div>
            <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Getting Started</h3>
            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Chat Blues is a powerful AI assistant that can help you with coding, writing, analysis, and image generation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700/30 border-gray-600/30' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <CodeIcon />
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Code Generation</span>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Ask for code in any language. Use "Live Preview" to see HTML/React code in action.
                    </p>
                </div>
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700/30 border-gray-600/30' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <ImageIcon />
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Image Generation</span>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Select an image model from settings and describe what you want to see.
                    </p>
                </div>
            </div>
        </div>

        <div>
            <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tips & Tricks</h3>
            <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Use <strong>"Live Preview"</strong> to test web code instantly without leaving the chat.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Switch models in <strong>Settings</strong> to find the best AI for your specific task.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Use the <strong>Microphone</strong> icon for voice input when your hands are busy.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Your chat history is saved locally in your browser for privacy.</span>
                </li>
            </ul>
        </div>
    </div>
);

export default function App() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am Chat Blues. How can I assist you today?' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        return savedDarkMode ? JSON.parse(savedDarkMode) : false;
    });
    const [modal, setModal] = useState({ isOpen: false, type: null });
    const [livePreview, setLivePreview] = useState({ isOpen: false, code: '', language: '', originalCode: '', isSetupGuide: false, additionalCSS: '', isCombined: false });
    const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(false);
    const [imageViewer, setImageViewer] = useState({ isOpen: false, imageUrl: '', imagePrompt: '' });
    const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
    const [chatHistory, setChatHistory] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [localEndpoint, setLocalEndpoint] = useState(() => {
        const saved = localStorage.getItem('localEndpoint');
        return saved || 'http://localhost:11434';
    });
    const [localModel, setLocalModel] = useState(() => {
        const saved = localStorage.getItem('localModel');
        return saved || 'llama3.2:3b';
    });
    const [savedModels, setSavedModels] = useState(() => {
        const saved = localStorage.getItem('savedModels');
        return saved ? JSON.parse(saved) : [];
    });
    const [hapticFeedback, setHapticFeedback] = useState(true);
    const [randomSeed, setRandomSeed] = useState(true);
    const [temperature, setTemperature] = useState(0.7);
    const [contextWindow, setContextWindow] = useState(8192);
    const [attachedFile, setAttachedFile] = useState(null); // { name, type, content, preview }
    const [showQuickModelPicker, setShowQuickModelPicker] = useState(false);
    const quickModelPickerRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);

    const chatContainerRef = useRef(null);

    // Close quick model picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (quickModelPickerRef.current && !quickModelPickerRef.current.contains(event.target)) {
                setShowQuickModelPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Save configuration function
    const saveLocalConfig = () => {
        localStorage.setItem('localEndpoint', localEndpoint);
        localStorage.setItem('localModel', localModel);
        
        // Add model to saved list if unique and not empty
        if (localModel.trim() && !savedModels.includes(localModel.trim())) {
            const newSavedModels = [...savedModels, localModel.trim()];
            setSavedModels(newSavedModels);
            localStorage.setItem('savedModels', JSON.stringify(newSavedModels));
            alert('Configuration saved! Model added to your list.');
        } else {
            alert('Configuration saved!');
        }
    };

    // Delete model from saved list
    const deleteModel = (modelToDelete) => {
        const newSavedModels = savedModels.filter(m => m !== modelToDelete);
        setSavedModels(newSavedModels);
        localStorage.setItem('savedModels', JSON.stringify(newSavedModels));
        
        // If the deleted model was the current model, switch to another saved model or default
        if (localModel === modelToDelete) {
            const newModel = newSavedModels.length > 0 ? newSavedModels[0] : 'llama3.2:3b';
            setLocalModel(newModel);
            localStorage.setItem('localModel', newModel);
        }
    };

    // Load history on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            try {
                setChatHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Failed to parse chat history', e);
            }
        }
    }, []);

    // Save history when it changes
    useEffect(() => {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }, [chatHistory]);

    // Auto-save chat history when messages change
    useEffect(() => {
        if (messages.length > 0) {
            // Don't save if it's just the initial greeting
            if (messages.length === 1 && messages[0].role === 'assistant' && messages[0].content.startsWith('Hello! I am Chat Blues')) {
                return;
            }

            const chatId = currentChatId || Date.now();
            if (!currentChatId) setCurrentChatId(chatId);

            setChatHistory(prevHistory => {
                const existingIndex = prevHistory.findIndex(c => c.id === chatId);
                
                const chatData = {
                    id: chatId,
                    title: messages.find(m => m.role === 'user')?.content.slice(0, 30) || 'New Chat',
                    messages: messages,
                    date: new Date().toISOString(),
                    pinned: existingIndex >= 0 ? prevHistory[existingIndex].pinned : false
                };

                if (existingIndex >= 0) {
                    const newHistory = [...prevHistory];
                    newHistory[existingIndex] = chatData;
                    return newHistory;
                } else {
                    return [chatData, ...prevHistory];
                }
            });
        }
    }, [messages]);

    const saveCurrentChat = () => {
        // Deprecated in favor of auto-save useEffect, but kept for manual triggers if needed
        if (messages.length <= 1 && messages[0].role === 'assistant') return; 
        // Logic handled by useEffect now
    };

    const handleNewChat = () => {
        saveCurrentChat();
        setMessages([{ role: 'assistant', content: 'Hello! I am Chat Blues. How can I assist you today?' }]);
        setCurrentChatId(Date.now());
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
    };

    const handleLoadChat = (chat) => {
        saveCurrentChat();
        setMessages(chat.messages);
        setCurrentChatId(chat.id);
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
    };

    const handleDeleteChat = (chatId, e) => {
        e && e.stopPropagation();
        const newHistory = chatHistory.filter(chat => chat.id !== chatId);
        setChatHistory(newHistory);
        if (currentChatId === chatId) {
            handleNewChat();
        }
    };

    const handleRenameChat = (chatId, newTitle) => {
        const newHistory = chatHistory.map(chat => 
            chat.id === chatId ? { ...chat, title: newTitle } : chat
        );
        setChatHistory(newHistory);
    };

    const handlePinChat = (chatId, e) => {
        e && e.stopPropagation();
        const newHistory = chatHistory.map(chat => 
            chat.id === chatId ? { ...chat, pinned: !chat.pinned } : chat
        );
        setChatHistory(newHistory);
    };

    // Mobile initialization with Capacitor
    useEffect(() => {
        const initializeMobile = async () => {
            if (Capacitor.isNativePlatform()) {
                try {
                    // Set status bar style for iOS
                    await StatusBar.setStyle({ style: Style.Dark });
                    await StatusBar.setBackgroundColor({ color: '#000000' });
                    
                    // Get device info
                    const deviceInfo = await Device.getInfo();
                    console.log('Device platform:', deviceInfo.platform);
                    
                    // Setup keyboard listeners
                    Keyboard.addListener('keyboardWillShow', info => {
                        setKeyboardVisible(true);
                        setKeyboardHeight(info.keyboardHeight);
                    });
                    
                    Keyboard.addListener('keyboardWillHide', () => {
                        setKeyboardVisible(false);
                        setKeyboardHeight(0);
                    });
                    
                    // Enable haptic feedback for better mobile UX
                    console.log('Mobile initialization complete');
                } catch (error) {
                    console.error('Mobile initialization error:', error);
                }
            }
        };
        
        initializeMobile();
        
        // Cleanup keyboard listeners
        return () => {
            if (Capacitor.isNativePlatform()) {
                Keyboard.removeAllListeners();
            }
        };
    }, []);

    useEffect(() => {
        const requestFullScreen = () => {
            const element = document.documentElement;
            if (element.requestFullscreen) {
                element.requestFullscreen().catch(err => {
                    console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            }
        };
        requestFullScreen();
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Clean keyboard detection for mobile - moves input above keyboard
    useEffect(() => {
        let originalViewportHeight = window.innerHeight;
        
        const handleViewportChange = () => {
            const currentViewportHeight = window.innerHeight;
            const keyboardHeight = originalViewportHeight - currentViewportHeight;
            
            if (keyboardHeight > 100) {
                // Keyboard is open
                setKeyboardVisible(true);
                setKeyboardHeight(keyboardHeight);
            } else {
                // Keyboard is closed
                setKeyboardVisible(false);
                setKeyboardHeight(0);
            }
        };

        // Use Visual Viewport API for modern browsers
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportChange);
        } else {
            // Fallback for older browsers
            window.addEventListener('resize', handleViewportChange);
        }

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                originalViewportHeight = window.innerHeight;
                setKeyboardVisible(false);
                setKeyboardHeight(0);
            }, 500);
        });

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleViewportChange);
            } else {
                window.removeEventListener('resize', handleViewportChange);
            }
            window.removeEventListener('orientationchange', handleViewportChange);
        };
    }, []);

    // Auto-focus input when keyboard becomes visible
    useEffect(() => {
        if (keyboardVisible && inputRef.current) {
            inputRef.current.focus();
        }
    }, [keyboardVisible]);

    // Voice recognition setup
    useEffect(() => {
        // Check if browser supports speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            setVoiceSupported(true);
            const recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            
            recognition.onstart = () => {
                setIsListening(true);
            };
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setUserInput(prev => prev + (prev ? ' ' : '') + transcript);
                setIsListening(false);
            };
            
            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
            
            recognition.onend = () => {
                setIsListening(false);
            };
            
            recognitionRef.current = recognition;
        } else {
            setVoiceSupported(false);
        }
        
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    // Voice recognition functions
    const startVoiceRecognition = () => {
        if (recognitionRef.current && voiceSupported && !isListening) {
            recognitionRef.current.start();
        }
    };

    const stopVoiceRecognition = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    const openModal = (type) => setModal({ isOpen: true, type });
    const closeModal = () => setModal({ isOpen: false, type: null });

    const openPreview = (code, language, additionalCSS = '', isCombined = false) => {
        setLivePreview({ isOpen: true, code, language, originalCode: code, isSetupGuide: false, additionalCSS, isCombined });
    };

    const openSetupGuide = (code, language) => {
        setLivePreview({ isOpen: true, code, language, originalCode: code, isSetupGuide: true });
    };

    const closePreview = () => {
        setLivePreview({ isOpen: false, code: '', language: '', originalCode: '', isSetupGuide: false, additionalCSS: '', isCombined: false });
        setIsFullscreenPreview(false);
    };

    const toggleFullscreenPreview = () => {
        setIsFullscreenPreview(prev => !prev);
    };

    const openImageViewer = (imageUrl, imagePrompt) => {
        setImageViewer({ isOpen: true, imageUrl, imagePrompt });
    };

    const closeImageViewer = () => {
        setImageViewer({ isOpen: false, imageUrl: '', imagePrompt: '' });
    };

    const handleSyncBack = (updatedCode) => {
        const syncMessage = {
            role: 'assistant',
            content: `Here's your updated code from the live preview:\n\n\`\`\`${livePreview.language}\n${updatedCode}\n\`\`\``
        };
        setMessages(prev => [...prev, syncMessage]);
        closePreview();
    };

    const handleCodeUpdate = (updatedCode) => {
        // Update the live preview state so both Monaco Editor and preview stay in sync
        setLivePreview(prev => ({ ...prev, code: updatedCode }));
    };

    const getModalContent = () => {
        switch (modal.type) {
            case 'terms': return { title: 'Terms & Conditions', content: <TermsContent /> };
            case 'privacy': return { title: 'Privacy Policy', content: <PrivacyPolicyContent /> };
            case 'info': return { title: 'About', content: <InfoContent darkMode={darkMode} /> };
            case 'settings': return { 
                title: 'Settings', 
                content: <SettingsContent 
                    darkMode={darkMode} 
                    localEndpoint={localEndpoint}
                    setLocalEndpoint={setLocalEndpoint}
                    localModel={localModel}
                    setLocalModel={setLocalModel}
                    savedModels={savedModels}
                    onDeleteModel={deleteModel}
                    hapticFeedback={hapticFeedback}
                    setHapticFeedback={setHapticFeedback}
                    randomSeed={randomSeed}
                    setRandomSeed={setRandomSeed}
                    temperature={temperature}
                    setTemperature={setTemperature}
                    contextWindow={contextWindow}
                    setContextWindow={setContextWindow}
                    onReset={() => {
                        resetSettings();
                        closeModal();
                    }}
                    onSaveConfig={saveLocalConfig}
                /> 
            };
            case 'activity': return { 
                title: 'Activity', 
                content: <ActivityContent 
                    darkMode={darkMode} 
                    chatHistory={chatHistory} 
                    messages={messages} 
                    onLoadChat={(chat) => {
                        handleLoadChat(chat);
                        closeModal();
                    }}
                /> 
            };
            case 'help': return { title: 'Help & Guide', content: <HelpContent darkMode={darkMode} /> };
            default: return { title: '', content: null };
        }
    };

    // Function to detect if user is requesting an image edit
    const detectImageEditRequest = (userMessage, hasRecentImage) => {
        if (!hasRecentImage || !lastGeneratedImage.url) return false;
        
        const editKeywords = [
            'change', 'modify', 'edit', 'alter', 'adjust', 'update', 'fix', 'correct',
            'make', 'turn', 'replace', 'switch', 'swap', 'redo', 'remake', 'improve',
            'different', 'instead', 'rather', 'but', 'however', 'except'
        ];
        
        const colorKeywords = ['color', 'colour', 'red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown', 'grey', 'gray'];
        const clothingKeywords = ['clothes', 'clothing', 'shirt', 'dress', 'pants', 'jacket', 'hat', 'shoes', 'outfit'];
        const appearanceKeywords = ['hair', 'face', 'eyes', 'skin', 'expression', 'pose', 'background', 'setting'];
        
        const lowerMessage = userMessage.toLowerCase();
        
        // Check if message contains edit keywords
        const hasEditKeyword = editKeywords.some(keyword => lowerMessage.includes(keyword));
        
        // Check if message is asking for specific modifications
        const hasModificationContext = [
            ...colorKeywords,
            ...clothingKeywords, 
            ...appearanceKeywords
        ].some(keyword => lowerMessage.includes(keyword));
        
        // Consider it an edit if it has edit keywords or modification context
        // and it's within 5 minutes of the last image generation
        const isRecent = lastGeneratedImage.timestamp && 
            (Date.now() - lastGeneratedImage.timestamp) < 5 * 60 * 1000; // 5 minutes
        
        return (hasEditKeyword || hasModificationContext) && isRecent;
    };

    const fetchImageFromOpenRouter = async (prompt) => {
        const API_URL = "https://openrouter.ai/api/v1/chat/completions";
        
        // Check if this is an edit request
        const isEditRequest = detectImageEditRequest(prompt, !!lastGeneratedImage.url);
        let finalPrompt = prompt;
        
        if (isEditRequest && lastGeneratedImage.prompt) {
            // Create an enhanced prompt that includes the original context
            finalPrompt = `Based on the previous image I created with the prompt: "${lastGeneratedImage.prompt}"

Now please modify that image: ${prompt}

Keep everything else the same from the original image, only change what was specifically requested.`;
            
            console.log('Detected edit request. Enhanced prompt:', finalPrompt);
            setImageEditContext({ isEditing: true, originalPrompt: lastGeneratedImage.prompt });
        } else {
            setImageEditContext({ isEditing: false, originalPrompt: null });
        }
        
        console.log('Making image generation request with:', {
            url: API_URL,
            hasApiKey: !!OPENROUTER_API_KEY,
            prompt: finalPrompt.substring(0, 100) + '...',
            model: selectedModel,
            isEdit: isEditRequest
        });
        
        if (!OPENROUTER_API_KEY) {
            throw new Error('Image API key not found. Please check your .env.local file.');
        }
        
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "https://chatblues.com/",
                    "X-Title": "Chat Blues",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": selectedModel,
                    "messages": [
                        {
                            "role": "user",
                            "content": finalPrompt
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1000
                })
            });
            
            console.log('Image API response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Image API error response:', errorText);
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText };
                }
                
                throw new Error(errorData.error?.message || errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Image API success - Full response:', result);
            console.log('Is edit request:', isEditRequest);
            console.log('Final prompt used:', finalPrompt);
            
            // Extract image URL from response - handle base64 data URLs
            let imageUrl;
            if (result.choices && result.choices[0] && result.choices[0].message) {
                console.log('Message object:', result.choices[0].message);
                
                if (result.choices[0].message.images && result.choices[0].message.images[0]) {
                    imageUrl = result.choices[0].message.images[0].image_url?.url;
                    console.log('Found image in images array:', imageUrl ? 'Yes' : 'No');
                } else if (result.choices[0].message.content) {
                    // Some models might return image URL in content
                    const urlMatch = result.choices[0].message.content.match(/https?:\/\/[^\s]+/);
                    imageUrl = urlMatch ? urlMatch[0] : null;
                    console.log('Attempted to extract URL from content:', imageUrl);
                }
            }
            
            console.log('Final extracted imageUrl:', imageUrl);
            console.log('Type of imageUrl:', typeof imageUrl);
            
            // Check if we have a valid image URL (including base64 data URLs)
            if (!imageUrl || typeof imageUrl !== 'string') {
                throw new Error(`Invalid image URL received from API. Got: ${imageUrl}`);
            }
            
            // Validate that it's either a proper URL or base64 data URL
            const isValidUrl = imageUrl.startsWith('http') || imageUrl.startsWith('data:image/');
            if (!isValidUrl) {
                throw new Error(`Invalid image format received. Expected URL or base64 data URL, got: ${imageUrl.substring(0, 100)}...`);
            }
            
            // Get the AI's natural response text
            const aiResponseText = result.choices[0].message.content || "I've created an image for you!";
            
            // Update the last generated image state for future edits
            setLastGeneratedImage({
                url: imageUrl,
                prompt: prompt, // Store the original user prompt, not the enhanced one
                timestamp: Date.now()
            });
            
            // Return the AI's natural response with the image data
            return {
                choices: [{
                    message: {
                        content: aiResponseText,
                        imageData: {
                            url: imageUrl,
                            prompt: prompt,
                            isEdit: imageEditContext.isEditing,
                            originalPrompt: imageEditContext.originalPrompt
                        }
                    }
                }]
            };
        } catch (error) {
            console.error('Image generation error:', error);
            throw error;
        }
    };

    const fetchFromLocalAI = async (messageHistory) => {
        // Ensure endpoint doesn't end with slash
        const baseUrl = localEndpoint.replace(/\/$/, '');
        const API_URL = `${baseUrl}/api/chat`;
        
        // Check if model is known to support vision (for logging purposes)
        // We still TRY to send images to any model - let the API decide
        const knownVisionModel = localModel.toLowerCase().includes('llava') || 
                              localModel.toLowerCase().includes('vision') ||
                              localModel.toLowerCase().includes('bakllava') ||
                              localModel.toLowerCase().includes('moondream') ||
                              localModel.toLowerCase().includes('cogvlm') ||
                              localModel.toLowerCase().includes('minicpm');
        
        // Check if any message has image data
        const hasImageData = messageHistory.some(msg => msg.imageDataForApi);
        
        // Transform messages for Ollama format, handling images/documents if present
        // We try sending files to ANY model - if it doesn't support them, Ollama will return an error
        const transformedMessages = messageHistory.map(msg => {
            // If this message has image/document data, always try to send it (let model decide if supported)
            if (msg.imageDataForApi) {
                // Extract base64 data from data URL (remove "data:xxx;base64," prefix)
                const base64Data = msg.imageDataForApi.includes('base64,') 
                    ? msg.imageDataForApi.split('base64,')[1] 
                    : msg.imageDataForApi;
                
                const isPdf = msg.fileType === 'pdf';
                
                // Ollama multimodal format (works for images, PDFs may need model support)
                return {
                    role: msg.role,
                    content: msg.content || (isPdf ? "Please analyze this PDF document." : "Please analyze this image."),
                    images: [base64Data]
                };
            }
            // Regular text message
            return {
                role: msg.role,
                content: msg.content
            };
        });
        
        console.log('Making Local API request with:', {
            url: API_URL,
            model: localModel,
            messageCount: transformedMessages.length,
            temperature,
            contextWindow,
            hasImageData,
            knownVisionModel
        });
        
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": localModel,
                    "messages": transformedMessages,
                    "stream": false,
                    "options": {
                        "temperature": temperature,
                        "num_ctx": contextWindow,
                        "seed": randomSeed ? undefined : 42 // If randomSeed is false, use fixed seed
                    }
                })
            });
            
            console.log('Local API response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Local API error response:', errorText);
                throw new Error(`Local API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Local API success:', result);
            
            // Transform Ollama response to match OpenRouter/OpenAI format expected by the app
            return {
                choices: [
                    {
                        message: {
                            content: result.message.content,
                            role: result.message.role
                        }
                    }
                ]
            };
        } catch (error) {
            console.error('Local Fetch error:', error);
            throw new Error(`Failed to connect to Local AI at ${localEndpoint}. Make sure Ollama/LocalAI is running. See README.md for setup instructions.`);
        }
    };

    const triggerHapticFeedback = async () => {
        if (!hapticFeedback) return;

        if (Capacitor.isNativePlatform()) {
            try {
                await Haptics.impact({ style: ImpactStyle.Light });
            } catch (error) {
                console.log('Haptic feedback not available:', error);
            }
        } else {
            // Fallback for browser
            if (navigator.vibrate) {
                navigator.vibrate(10); // Short vibration
            }
        }
    };

    const resetSettings = () => {
        setLocalEndpoint('http://localhost:11434');
        setLocalModel('llama3.2:3b');
        setHapticFeedback(true);
        setRandomSeed(true);
        setTemperature(0.7);
        setContextWindow(8192);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput && !attachedFile) return;

        // Add haptic feedback
        triggerHapticFeedback();

        // Build message content with file if attached
        let messageContent = trimmedInput;
        let userMessageDisplay = trimmedInput;
        let imageDataForApi = null; // Store image/document data for multimodal API
        let fileType = null; // Track file type for API
        
        if (attachedFile) {
            if (attachedFile.type.startsWith('image/')) {
                // For images - send to ALL models, let API decide if supported
                userMessageDisplay = trimmedInput || `[Uploaded image: ${attachedFile.name}]`;
                messageContent = trimmedInput || `Please analyze this image.`;
                imageDataForApi = attachedFile.content; // base64 image data
                fileType = 'image';
            } else if (attachedFile.type === 'application/pdf') {
                // For PDFs - send as multimodal data (many models can read PDFs)
                userMessageDisplay = trimmedInput || `[Uploaded PDF: ${attachedFile.name}]`;
                messageContent = trimmedInput || `Please analyze this PDF document.`;
                imageDataForApi = attachedFile.content; // base64 PDF data
                fileType = 'pdf';
            } else {
                // For text files, include the content directly
                userMessageDisplay = trimmedInput || `[Uploaded file: ${attachedFile.name}]`;
                messageContent = trimmedInput 
                    ? `${trimmedInput}\n\n--- File: ${attachedFile.name} ---\n${attachedFile.content}\n--- End of file ---`
                    : `Here's the content of the file ${attachedFile.name}:\n\n${attachedFile.content}`;
            }
        }

        // Message for display in the UI (also stores imageDataForApi for future API calls)
        const newUserMessage = { 
            role: 'user', 
            content: userMessageDisplay,
            attachment: attachedFile ? { name: attachedFile.name, type: attachedFile.type, preview: attachedFile.preview } : null,
            imageDataForApi: imageDataForApi, // Store for future API calls with context
            fileType: fileType // Track if it's image, pdf, or null
        };
        
        // Message for API - contains actual content and image/document data
        const apiUserMessage = {
            role: 'user',
            content: messageContent,
            imageDataForApi: imageDataForApi, // Will be used by multimodal models
            fileType: fileType // Track file type for proper API formatting
        };
        
        const newMessages = [...messages, newUserMessage];

        setMessages(newMessages);
        setUserInput('');
        const currentAttachment = attachedFile; // Save reference before clearing
        setAttachedFile(null);
        setIsLoading(true);

        try {
            // Check if user is requesting edits to the currently previewed code
            const isEditRequest = livePreview.isOpen && (
                trimmedInput.toLowerCase().includes('edit') ||
                trimmedInput.toLowerCase().includes('change') ||
                trimmedInput.toLowerCase().includes('modify') ||
                trimmedInput.toLowerCase().includes('update') ||
                trimmedInput.toLowerCase().includes('add') ||
                trimmedInput.toLowerCase().includes('remove') ||
                trimmedInput.toLowerCase().includes('fix') ||
                trimmedInput.toLowerCase().includes('improve') ||
                trimmedInput.toLowerCase().includes('make it') ||
                trimmedInput.toLowerCase().includes('can you')
            );

            let apiMessages;
            if (isEditRequest) {
                // Create AI agent context for code editing
                const codeEditContext = {
                    role: 'system',
                    content: `You are an AI code editing agent. The user is currently live previewing ${livePreview.language} code and wants to make specific edits to it.

Current code being previewed:
\`\`\`${livePreview.language}
${livePreview.code}
\`\`\`

CRITICAL INSTRUCTIONS:
1. You MUST return the COMPLETE, FULL code with the requested changes applied
2. NEVER return just a snippet or partial code - always return the entire document
3. Make ONLY the specific changes requested by the user to the existing code
4. Keep all existing functionality, structure, IDs, classes, and JavaScript intact
5. If changing styles, modify only the specific CSS properties mentioned
6. If adding elements, insert them in the most logical location within the existing structure
7. If removing elements, only remove what's specifically requested
8. Return the COMPLETE updated code wrapped in a code block with no explanations
9. The returned code must be a fully functional, complete ${livePreview.language} document

EXAMPLE: If user says "change background to blue" and current code has red background, return the ENTIRE code with only the background-color changed from red to blue, keeping everything else exactly the same.`
                };

                apiMessages = [
                    codeEditContext,
                    { role: 'user', content: `Please edit the current ${livePreview.language} code: ${trimmedInput}` }
                ];
            } else {
                // Normal conversation - add system message with React instructions
                const systemMessage = {
                    role: 'system',
                    content: `You are a helpful AI assistant. Provide clear, accurate, and helpful responses using natural text. 

IMPORTANT: Do NOT use the table format below unless the user EXPLICITLY asks for a table. For normal questions, answer with standard text and paragraphs.

TABLE GENERATION INSTRUCTIONS (Use ONLY when requested):
If the user specifically asks to create, make, or generate a TABLE, you must respond with this JSON format wrapped in a code block:

\`\`\`json
{
  "title": "Table Title Here",
  "headers": ["Column 1", "Column 2", "Column 3"],
  "rows": [
    ["Row 1 Data 1", "Row 1 Data 2", "Row 1 Data 3"],
    ["Row 2 Data 1", "Row 2 Data 2", "Row 2 Data 3"]
  ]
}
\`\`\`

CRITICAL REACT.JS INSTRUCTIONS:
When users ask for React.js websites, components, or apps, follow these EXACT guidelines for live preview compatibility:

1. NEVER include import statements like:
   - import React from 'react'
   - import { useState } from 'react'
   - import ReactDOM from 'react-dom'
   
2. ALWAYS start React components directly with:
   const ComponentName = () => {
   
3. ALWAYS end with rendering code:
   const root = ReactDOM.createRoot(document.getElementById('root'));
   root.render(<ComponentName />);

4. Use React hooks directly (useState, useEffect, etc.) without importing them

5. FOR STYLING - ALWAYS PROVIDE COMPREHENSIVE CSS:
   - NEVER use only inline styles 
   - ALWAYS include a complete <style> tag with CSS at the beginning of the component
   - Include responsive design, hover effects, animations, and modern styling
   - Use CSS classes and provide beautiful, professional styling
   - Make components visually appealing with proper colors, spacing, typography
   - Include dark mode support when appropriate

6. Keep everything in a single code block for single-file requests

CRITICAL HTML INSTRUCTIONS:
When users ask for basic HTML websites or pages, follow these EXACT guidelines:

1. ALWAYS include comprehensive CSS styling within <style> tags in the <head> section
2. NEVER deliver plain unstyled HTML
3. Include modern, professional styling with:
   - Beautiful color schemes and typography
   - Responsive design for mobile compatibility
   - Interactive elements (hover effects, transitions)
   - Proper spacing and layout
   - Modern CSS features (flexbox, grid, etc.)

4. Structure your HTML like this:
   \`\`\`html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Page Title</title>
       <style>
           /* Comprehensive CSS styles here */
           * { box-sizing: border-box; margin: 0; padding: 0; }
           body { font-family: 'Arial', sans-serif; line-height: 1.6; }
           /* Add extensive styling for all elements */
       </style>
   </head>
   <body>
       <!-- HTML content with proper class names -->
   </body>
   </html>
   \`\`\`

MANDATORY: Every HTML page MUST include comprehensive CSS styling. Never deliver unstyled HTML content.

These guidelines ensure the code works perfectly in the live preview system with beautiful styling.`
                };
                
                // Build API messages: filter out initial greeting, convert existing messages to API format, add new API message
                const previousApiMessages = messages
                    .filter(msg => msg.role !== 'assistant' || msg.content !== 'Hello! I am Chat Blues. How can I assist you today?')
                    .map(msg => ({ role: msg.role, content: msg.content, imageDataForApi: msg.imageDataForApi }));
                
                apiMessages = [systemMessage, ...previousApiMessages, apiUserMessage];
            }

            // Always use local AI (Ollama/LocalAI)
            let response = await fetchFromLocalAI(apiMessages);

            // Haptic feedback on response
            triggerHapticFeedback();

            const aiContent = response.choices[0].message.content;
            const imageData = response.choices[0].message.imageData; // Extract image data if present

            if (isEditRequest) {
                // Extract code from AI response and update live preview
                const codeBlockRegex = /```(?:\w+)?\n?([\s\S]*?)```/;
                const match = aiContent.match(codeBlockRegex);
                
                if (match && match[1]) {
                    const updatedCode = match[1].trim();
                    
                    // Update the live preview with new code - this will sync both Monaco Editor and preview
                    handleCodeUpdate(updatedCode);
                    
                    // Create a concise summary of changes made
                    const changesSummary = `Applied your requested changes to the ${livePreview.language} code. Both the code editor and live preview have been updated.`;
                    
                    // Add AI response with change summary (not the full code to avoid clutter)
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: `✅ ${changesSummary}\n\n*The changes are now live in both your code editor and preview. You can continue editing or ask for more modifications.*`,
                        isEditResponse: true,
                        currentCode: updatedCode,
                        currentLanguage: livePreview.language
                    }]);
                } else {
                    // AI didn't return proper code format, but might have provided explanation
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: aiContent + "\n\n*Note: I couldn't extract the code properly. Please try rephrasing your request or be more specific about what you'd like to change.*" 
                    }]);
                }
            } else {
                // Normal AI response
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: aiContent,
                    imageData: imageData // Include image data if present
                }]);
            }
        } catch (error) {
            console.error('API Error:', error);
            
            // Enhanced error messages for better user experience
            let errorMessage = error.message;
            if (error.message.includes('Provider returned error') || error.message.includes('rate-limited')) {
                errorMessage = "The AI service is temporarily busy. Please try again in a few moments.";
            } else if (error.message.includes('API key')) {
                errorMessage = "API configuration issue. Please check your settings.";
            }
            
            setMessages(prev => [...prev, { 
                role: 'error', 
                content: `Error: ${errorMessage}` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const mainBgClass = darkMode ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50";
    const isCanvasMode = livePreview.isOpen || imageViewer.isOpen;

    return (
        <Routes>
            <Route path="/" element={
                <>
                    <GlobalStyles />
                    <Sidebar 
                        isOpen={isSidebarOpen} 
                        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                        darkMode={darkMode}
                        onNewChat={handleNewChat}
                        chatHistory={chatHistory}
                        onLoadChat={handleLoadChat}
                        onDeleteChat={handleDeleteChat}
                        onRenameChat={handleRenameChat}
                        onPinChat={handlePinChat}
                        onSettings={() => openModal('settings')}
                        onHelp={() => openModal('help')}
                        onActivity={() => openModal('activity')}
                    />
                    
                    {/* Mobile Sidebar Overlay */}
                    {isSidebarOpen && (
                        <div 
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    {/* Desktop Menu Button - Fixed on left side when sidebar closed */}
                    {!isSidebarOpen && (
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className={`hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${darkMode ? 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700' : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                    )}

                    <div className={`${isCanvasMode ? 'h-[100dvh] flex' : 'h-[100dvh] relative flex items-center justify-center'} ${isSidebarOpen ? 'lg:ml-72' : ''} transition-all duration-300 py-10 px-4 sm:p-6 md:p-8 pb-16 sm:pb-12 md:pb-16 font-['Inter',_sans-serif] overflow-hidden ${mainBgClass}`}>
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className={`absolute top-20 -left-20 w-96 h-96 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur-3xl ${darkMode ? 'opacity-75' : 'opacity-85'}`}></div>
                    <div className={`absolute top-60 -right-20 w-80 h-80 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full blur-3xl ${darkMode ? 'opacity-75' : 'opacity-85'}`}></div>
                    <div className={`absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur-3xl ${darkMode ? 'opacity-75' : 'opacity-85'}`}></div>
                </div>
                <div className={`relative z-10 ${isCanvasMode ? 'hidden lg:flex lg:w-1/3 h-full m-4' : 'w-full max-w-sm sm:max-w-4xl md:max-w-5xl h-full'} flex flex-col rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-xl transition-all duration-500 ${darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/60 border-white/40'}`}>
                    <header className={`p-3 sm:p-4 border-b flex justify-between items-center flex-shrink-0 transition-colors duration-500 ${isCanvasMode ? 'rounded-t-2xl' : ''} ${darkMode ? 'border-gray-700/50' : 'border-white/20'}`}>
                        <div className="flex-1 flex items-center gap-2 sm:gap-3">
                            {/* Menu Button - visible only on mobile when sidebar closed */}
                            {!isSidebarOpen && (
                                <button 
                                    onClick={() => setIsSidebarOpen(true)}
                                    className={`lg:hidden p-2 -ml-1 rounded-full transition-colors ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' : 'text-gray-600 hover:text-gray-900 hover:bg-black/10'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="3" y1="12" x2="21" y2="12"></line>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <line x1="3" y1="18" x2="21" y2="18"></line>
                                    </svg>
                                </button>
                            )}
                            <div className="relative" ref={quickModelPickerRef}>
                                <div className="flex items-center gap-1">
                                    <h1 className={`text-base sm:text-lg md:text-xl font-bold ${darkMode ? 'bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent' : 'text-gray-800'}`}>
                                        Chat Blues
                                    </h1>
                                    <button 
                                        onClick={() => setShowQuickModelPicker(!showQuickModelPicker)}
                                        className={`p-1 rounded-full transition-all duration-200 ${showQuickModelPicker ? (darkMode ? 'bg-gray-700 text-green-400' : 'bg-green-100 text-green-600') : (darkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100')}`}
                                        title="Quick Model Switch"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {localModel.split('/').pop().split(':')[0]}
                                    </div>
                                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>LOCAL</span>
                                </div>
                                
                                {/* Quick Model Picker Dropdown */}
                                {showQuickModelPicker && (
                                    <div className={`absolute top-full left-0 mt-2 w-72 max-h-80 overflow-hidden rounded-xl shadow-2xl border z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                        <div className={`sticky top-0 px-3 py-2 border-b flex items-center gap-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={darkMode ? 'text-green-400' : 'text-green-600'}>
                                                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                                                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                                                <line x1="6" y1="6" x2="6.01" y2="6"></line>
                                                <line x1="6" y1="18" x2="6.01" y2="18"></line>
                                            </svg>
                                            <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Local Models (Ollama)</p>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto p-1">
                                            {savedModels.length > 0 ? (
                                                savedModels.map((model, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            setLocalModel(model);
                                                            localStorage.setItem('localModel', model);
                                                            setShowQuickModelPicker(false);
                                                        }}
                                                        className={`w-full px-3 py-2 rounded-lg flex items-center gap-3 transition-all duration-150 ${localModel === model
                                                            ? (darkMode ? 'bg-green-600/20 border border-green-500/30' : 'bg-green-50 border border-green-200') 
                                                            : (darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50')}`}
                                                    >
                                                        <span className="flex-shrink-0">
                                                            {ModelIcons.cube(localModel === model ? '#22c55e' : (darkMode ? '#9ca3af' : '#6b7280'))}
                                                        </span>
                                                        <div className="flex-1 text-left min-w-0">
                                                            <div className={`text-sm font-medium truncate ${localModel === model ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-white' : 'text-gray-900')}`}>
                                                                {model.split('/').pop().split(':')[0]}
                                                            </div>
                                                            <div className={`text-xs truncate ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                {model}
                                                            </div>
                                                        </div>
                                                        {localModel === model && (
                                                            <svg className={`flex-shrink-0 ${darkMode ? 'text-green-400' : 'text-green-600'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                            </svg>
                                                        )}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className={`px-3 py-6 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    <svg className="mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                                                        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                                                        <line x1="6" y1="6" x2="6.01" y2="6"></line>
                                                        <line x1="6" y1="18" x2="6.01" y2="18"></line>
                                                    </svg>
                                                    <p className="text-xs">No local models saved</p>
                                                    <p className="text-xs mt-1">Add models in Settings</p>
                                                </div>
                                            )}
                                            
                                            {/* Current model if not in saved list */}
                                            {localModel && !savedModels.includes(localModel) && (
                                                <div className={`mt-1 pt-1 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                    <button
                                                        onClick={() => setShowQuickModelPicker(false)}
                                                        className={`w-full px-3 py-2 rounded-lg flex items-center gap-3 transition-all duration-150 ${darkMode ? 'bg-green-600/20 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}
                                                    >
                                                        <span className="flex-shrink-0">
                                                            {ModelIcons.cube('#22c55e')}
                                                        </span>
                                                        <div className="flex-1 text-left min-w-0">
                                                            <div className={`text-sm font-medium truncate ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                                                {localModel.split('/').pop().split(':')[0]}
                                                            </div>
                                                            <div className={`text-xs truncate ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                Current • {localModel}
                                                            </div>
                                                        </div>
                                                        <svg className={`flex-shrink-0 ${darkMode ? 'text-green-400' : 'text-green-600'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                             <button onClick={() => openModal('info')} className={`text-xs sm:text-sm font-semibold transition-colors ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Open Source</button>
                            <button onClick={() => {
                                const newMode = !darkMode;
                                setDarkMode(newMode);
                                localStorage.setItem('darkMode', JSON.stringify(newMode));
                            }} className={`p-2 rounded-full transition-all duration-300 ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' : 'text-gray-600 hover:text-gray-900 hover:bg-white/20'}`}>
                                {darkMode ? <SunIcon /> : <MoonIcon />}
                            </button>
                        </div>
                    </header>
                    <div ref={chatContainerRef} className="flex-grow p-3 sm:p-4 pb-6 sm:pb-8 overflow-y-auto space-y-4 sm:space-y-6">
                        {messages.map((msg, index) => {
                            switch (msg.role) {
                                case 'user': return <UserMessage key={index} content={msg.content} darkMode={darkMode} attachment={msg.attachment} />;
                                case 'assistant': return <AiMessage 
                                    key={index} 
                                    content={msg.content} 
                                    darkMode={darkMode} 
                                    onPreview={openPreview}
                                    onSetupGuide={openSetupGuide}
                                    isEditResponse={msg.isEditResponse}
                                    currentCode={msg.currentCode}
                                    currentLanguage={msg.currentLanguage}
                                />;
                                case 'error': return <ErrorMessage key={index} content={msg.content} />;
                                default: return null;
                            }
                        })}
                        {isLoading && <LoadingIndicator darkMode={darkMode} />}
                    </div>
                    {/* Footer - hide on mobile when keyboard is visible */}
                    {!keyboardVisible && (
                        <footer className={`p-2 sm:p-3 border-t flex-shrink-0 transition-colors duration-500 ${isCanvasMode ? 'rounded-b-2xl' : ''} ${darkMode ? 'border-gray-700/50' : 'border-white/20'}`}>
                            <div className="flex justify-center items-center gap-2 sm:gap-4">
                                <button onClick={() => openModal('terms')} className={`text-xs sm:text-sm transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}>Terms & Conditions</button>
                                <div className={`w-px h-3 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                                <button onClick={() => openModal('privacy')} className={`text-xs sm:text-sm transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}>Privacy Policy</button>
                            </div>
                        </footer>
                    )}
                    <div className={`p-2 sm:p-4 ${keyboardVisible ? 'pb-1' : 'pb-4 sm:pb-8'} ${!keyboardVisible ? 'border-t' : ''} flex-shrink-0 ${isCanvasMode ? 'rounded-b-2xl' : ''} ${darkMode ? 'border-gray-700/50' : 'border-white/20'}`}>
                        {livePreview.isOpen && (
                            <div className={`hidden lg:block mb-3 rounded-xl overflow-hidden ${darkMode ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-700/30' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50'} shadow-sm`}>
                                <div className="px-4 py-3">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`text-sm font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                                                    AI Agent Mode
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                    <span className={`text-xs font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                                        ACTIVE
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`text-xs ${darkMode ? 'text-blue-400/70' : 'text-blue-600/70'}`}>
                                                Editing {livePreview.language} code
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-xs leading-relaxed ${darkMode ? 'text-blue-200/80' : 'text-blue-700/80'}`}>
                                        Ask me to modify your code with natural language commands
                                    </div>
                                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                                        {['change colors', 'add elements', 'make responsive', 'fix layout'].map((suggestion, index) => (
                                            <button 
                                                key={index} 
                                                onClick={() => setUserInput(suggestion)}
                                                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-all duration-200 hover:scale-105 cursor-pointer ${darkMode ? 'bg-blue-800/30 text-blue-300 border border-blue-700/30 hover:bg-blue-700/40 hover:border-blue-600/50' : 'bg-white/60 text-blue-600 border border-blue-200/50 hover:bg-white/80 hover:border-blue-300/70'}`}
                                            >
                                                &quot;{suggestion}&quot;
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Attached File Preview */}
                        {attachedFile && (
                            <div className={`flex items-center gap-2 mb-2 px-3 py-2 rounded-xl ${darkMode ? 'bg-gray-700/60 border border-gray-600/50' : 'bg-gray-100 border border-gray-200'}`}>
                                {attachedFile.type.startsWith('image/') && attachedFile.preview && (
                                    <img src={attachedFile.preview} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                                )}
                                {!attachedFile.type.startsWith('image/') && (
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                        </svg>
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{attachedFile.name}</p>
                                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{(attachedFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setAttachedFile(null)}
                                    className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        )}
                        <form onSubmit={handleFormSubmit} className={`flex items-center gap-2 rounded-full px-2 py-1.5 ${darkMode ? 'bg-gray-700/80 border border-gray-600/50' : 'bg-gray-100/90 border border-gray-200/80'}`}>
                            {/* File Upload Button */}
                            <input 
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept="image/*,.pdf,.txt,.doc,.docx"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        try {
                                            // Read file content
                                            const reader = new FileReader();
                                            
                                            if (file.type.startsWith('image/')) {
                                                // For images, read as base64
                                                reader.onload = () => {
                                                    setAttachedFile({
                                                        name: file.name,
                                                        type: file.type,
                                                        size: file.size,
                                                        content: reader.result,
                                                        preview: reader.result
                                                    });
                                                };
                                                reader.readAsDataURL(file);
                                            } else if (file.type === 'application/pdf') {
                                                // For PDFs, we'll send the base64 and let AI describe it
                                                reader.onload = () => {
                                                    setAttachedFile({
                                                        name: file.name,
                                                        type: file.type,
                                                        size: file.size,
                                                        content: reader.result,
                                                        preview: null
                                                    });
                                                };
                                                reader.readAsDataURL(file);
                                            } else {
                                                // For text files, read as text
                                                reader.onload = () => {
                                                    setAttachedFile({
                                                        name: file.name,
                                                        type: file.type,
                                                        size: file.size,
                                                        content: reader.result,
                                                        preview: null
                                                    });
                                                };
                                                reader.readAsText(file);
                                            }
                                        } catch (error) {
                                            console.error('Error reading file:', error);
                                            alert('Error reading file. Please try again.');
                                        }
                                        e.target.value = ''; // Reset input
                                    }
                                }}
                            />
                            <button 
                                type="button"
                                className={`w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-200 ${attachedFile ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (darkMode ? 'bg-gray-600/50 text-gray-300 hover:bg-gray-500/50' : 'bg-gray-200/80 text-gray-600 hover:bg-gray-300/80')}`}
                                onClick={() => document.getElementById('file-upload')?.click()}
                                title="Upload file"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                            
                            <input 
                                ref={inputRef}
                                type="text" 
                                value={userInput} 
                                onChange={(e) => setUserInput(e.target.value)} 
                                placeholder={
                                    livePreview.isOpen 
                                        ? "Ask me to edit your code..." 
                                        : "Ask anything"
                                } 
                                className={`flex-grow bg-transparent px-2 py-2 text-sm outline-none min-w-0 ${darkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`} 
                                autoComplete="off" 
                                disabled={isLoading} 
                            />
                            
                            {/* Voice Recognition Button */}
                            {voiceSupported && (
                                <button 
                                    type="button"
                                    onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                                    className={`w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-200 ${
                                        isListening 
                                            ? 'bg-red-500 text-white animate-pulse' 
                                            : darkMode 
                                                ? 'bg-gray-600/50 text-gray-300 hover:bg-gray-500/50' 
                                                : 'bg-gray-200/80 text-gray-600 hover:bg-gray-300/80'
                                    }`}
                                    disabled={isLoading}
                                    title={isListening ? "Stop recording" : "Start voice input"}
                                >
                                    {isListening ? <MicOffIcon /> : <MicIcon />}
                                </button>
                            )}
                            
                            {/* Send Button */}
                            <button 
                                type="submit" 
                                className={`w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
                                    userInput.trim() 
                                        ? darkMode 
                                            ? 'bg-white text-gray-900 hover:bg-gray-200' 
                                            : 'bg-gray-800 text-white hover:bg-gray-700'
                                        : darkMode 
                                            ? 'bg-gray-600/50 text-gray-400' 
                                            : 'bg-gray-200/80 text-gray-400'
                                }`} 
                                disabled={isLoading || !userInput.trim()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="19" x2="12" y2="5"></line>
                                    <polyline points="5 12 12 5 19 12"></polyline>
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
                
                {/* Canvas Area */}
                {isCanvasMode && (
                    <>
                        {/* Fullscreen Preview Overlay */}
                        {isFullscreenPreview && (
                            <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                <div className="w-full h-full max-w-7xl max-h-full">
                                    <LivePreview
                                        code={livePreview.code}
                                        language={livePreview.language}
                                        darkMode={darkMode}
                                        onClose={closePreview}
                                        onSync={handleSyncBack}
                                        isFullscreen={isFullscreenPreview}
                                        onToggleFullscreen={toggleFullscreenPreview}
                                        isSetupGuide={livePreview.isSetupGuide}
                                        additionalCSS={livePreview.additionalCSS}
                                        isCombined={livePreview.isCombined}
                                    />
                                </div>
                            </div>
                        )}
                        
                        {/* Regular Canvas Area */}
                        {!isFullscreenPreview && (
                            <div className={`${isCanvasMode ? 'w-full lg:w-2/3 h-[85vh] sm:h-[80vh] md:h-[80vh]' : ''} p-4 relative z-20`}>
                                <div className={`w-full h-full rounded-2xl shadow-2xl relative z-10 ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`} style={{ overflow: 'visible' }}>
                                    <LivePreview
                                        code={livePreview.code}
                                        language={livePreview.language}
                                        darkMode={darkMode}
                                        onClose={closePreview}
                                        onSync={handleSyncBack}
                                        isFullscreen={isFullscreenPreview}
                                        onToggleFullscreen={toggleFullscreenPreview}
                                        isSetupGuide={livePreview.isSetupGuide}
                                        additionalCSS={livePreview.additionalCSS}
                                        isCombined={livePreview.isCombined}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
                
                {/* Image Viewer */}
                {imageViewer.isOpen && (
                    <div className={`${imageViewer.isOpen ? 'w-full lg:w-2/3 h-[85vh] sm:h-[80vh] md:h-[80vh]' : ''} p-4 relative z-20`}>
                        <div className={`w-full h-full rounded-2xl shadow-2xl relative z-10 ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`} style={{ overflow: 'visible' }}>
                            <ImageViewer
                                imageUrl={imageViewer.imageUrl}
                                imagePrompt={imageViewer.imagePrompt}
                                darkMode={darkMode}
                                onClose={closeImageViewer}
                            />
                        </div>
                    </div>
                )}
      </div>
            {modal.isOpen && <Modal title={getModalContent().title} content={getModalContent().content} onClose={closeModal} darkMode={darkMode} />}
                </>
            } />
        </Routes>
    );
}
