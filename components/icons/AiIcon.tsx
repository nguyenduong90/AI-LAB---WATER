
import React from 'react';

export const AiIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full">
        {/* Head */}
        <path fill="#e0f2fe" d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z" />
        <path fill="#0284c7" d="M18 5H6C5.44772 5 5 5.44772 5 6V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V6C19 5.44772 18.5523 5 18 5ZM6 4C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6Z" />

        {/* Eyes */}
        <circle cx="9" cy="11" r="2.2" fill="white" />
        <circle cx="15" cy="11" r="2.2" fill="white" />
        <circle cx="9.2" cy="11.2" r="1" fill="#0c4a6e" />
        <circle cx="15.2" cy="11.2" r="1" fill="#0c4a6e" />

        {/* Smile */}
        <path d="M8 15.5C8.5 16.5 11.5 16.5 12 16.5C12.5 16.5 15.5 16.5 16 15.5" stroke="#0c4a6e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        
        {/* Antenna */}
        <path d="M12 4V2.5" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="1.8" r="1.2" fill="#f59e0b" />
    </svg>
);