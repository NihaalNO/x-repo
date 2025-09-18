
  import React, { useEffect, useState } from 'react';
  import { motion } from 'framer-motion';

  const TypingMachine = ({ text, speed = 90, fontSize = 'text-2xl', color = 'text-gray-800', fontStyle = '' }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
      if (currentIndex < text.length) {
        const timeoutId = setTimeout(() => {
          setDisplayedText((prev) => prev + text[currentIndex]);
          setCurrentIndex((prev) => prev + 1);
        }, speed); // Adjust typing speed for smooth effect

        return () => clearTimeout(timeoutId);
      } else {
        setIsComplete(true);
      }
    }, [currentIndex, text, speed]);

    return (
      <div className="flex items-center justify-center min-h-52">
        <motion.div
          className={`font-mono ${fontSize} ${color} ${fontStyle}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {displayedText.split('').map((char, index) => (
            <motion.span key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
              {char}
            </motion.span>
          ))}
          {!isComplete && (
            <motion.span  
              className="animate-blink"  // Add Tailwind Config
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              |
            </motion.span>
          )}
        </motion.div>
      </div>
    );
  };

  const ExampleUsageTypingMachine = () => {
    return (
        <div className="min-h-52 flex flex-col items-center justify-center space-y-4 text-center">
          <TypingMachine text="Page is under developement sorry for the inconvenience" speed={90} fontSize="text-4xl" color="text-white" fontStyle="" />
        </div>
    );
  };

  function App() {
    return (
      <div className="h-screen text-center py-20">
        <ExampleUsageTypingMachine />
      </div>
    );
  }

  export default App;
            