import React, { useState, useEffect } from 'react';

const ANNOUNCEMENTS = [
  'Free Shipping on US orders over $15',
  'Free Shipping on UK orders over $20',
  '30-Day Hassle-Free Returns',
  'Secure Checkout — SSL Encrypted',
  'Trusted by Customers Across the US and UK'
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % ANNOUNCEMENTS.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="announcement-bar">
      <div 
        className="announcement-text" 
        key={index}
        style={{
          animation: 'fadeInOut 3s infinite'
        }}
      >
        {ANNOUNCEMENTS[index]}
      </div>
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(5px); }
          5% { opacity: 1; transform: translateY(0); }
          95% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
