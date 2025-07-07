import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const router = useRouter();

  return (
    <>        
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full w-72 bg-black text-white 
          p-8 transform transition-all duration-300 ease-in-out shadow-2xl z-40 
          border-r border-gray-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-12">
          {/* Repository Section */}
          <Link 
            href="/Repository" 
            className="block group"
          >
            <div className={`p-1 rounded-xl 
              ${router.pathname === '/repository' 
                ? 'bg-gray-800 border-gray-600' 
                : 'hover:bg-gray-900'
              } border border-transparent hover:border-gray-700`}
            >
              <div className="text-xl font-medium group-hover:text-gray-200 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-400">
                  <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 8h8v8H8z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                Repository
              </div>
              <div className="text-sm text-gray-400 group-hover:text-gray-300">
                Quantum Algorithm Collection
              </div>
            </div>
          </Link>

          {/* Playground Section */}
          <Link 
            href="/playground" 
            className="block group"
          >
            <div className={`p-1 rounded-xl 
              ${router.pathname === '/playground' 
                ? 'bg-gray-800 border-gray-600' 
                : 'hover:bg-gray-900'
              } border border-transparent hover:border-gray-700`}
            >
              <div className="text-xl font-medium group-hover:text-gray-200 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-400">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Playground
              </div>
              <div className="text-sm text-gray-400 group-hover:text-gray-300">
                Circuit Design & Simulation
              </div>
            </div>
          </Link>

          {/* Knowledge Section */}
          <Link 
            href="/knowledge" 
            className="block group"
          >
            <div className={`p-1 rounded-xl 
              ${router.pathname === '/knowledge' 
                ? 'bg-gray-800 border-gray-600' 
                : 'hover:bg-gray-900'
              } border border-transparent hover:border-gray-700`}
            >
              <div className="text-xl font-medium group-hover:text-gray-200  mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-cyan-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                Knowledge
              </div>
              <div className="text-sm text-gray-400 group-hover:text-gray-300">
                Community Resources
              </div>
            </div>
          </Link>

          {/* Divider */}
          <div className="border-t border-gray-800 my-5" />
           {/* Footer */}
          <div className="absolute bottom-8 left-8 right-8">
            <Link 
            href="/terms" 
            className="block group"
          >
            <div className={`p-1 rounded-xl 
              ${router.pathname === '/terms' 
                ? 'bg-gray-800 border-gray-600' 
                : 'hover:bg-gray-900'
              } border border-transparent hover:border-gray-700`}
            >
              <div className="text-xl font-medium group-hover:text-gray-200  mb-2">
                Terms and Conditions
              </div>
              <div className="text-sm text-gray-400 group-hover:text-gray-300">
                Community Resources
              </div>
            </div>
          </Link>
          <br />
           <Link 
            href="/profile" 
            className="block group"
          >
            <div className={`p-1 rounded-xl 
              ${router.pathname === '/profile' 
                ? 'bg-gray-800 border-gray-600' 
                : 'hover:bg-gray-900'
              } border border-transparent hover:border-gray-700`}
            >
              <div className="text-xl font-medium group-hover:text-gray-200  mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" />
                </svg>
                Profile
              </div>
              </div>
          </Link>
          </div> 
            <div className="text-sm text-gray-400 text-center">
              
             
            </div>
          </div>
        </div>
      
    </>
  );
}
