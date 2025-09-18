import {useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navigation from '../components/Navigation';
import VortexDemoSecond from '../components/AnimatedBackground';
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import { FaGithub, FaXTwitter, FaEnvelope } from 'react-icons/fa6';
import { LampDemo } from '@/components/lampdemo';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const [fadeIn, setFadeIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setFadeIn(true);
    }, 100);

    const checkLoginStatus = async () => {
      const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loginStatus);

      if (loginStatus) {
        router.push('/knowledge');
      }
    };

    checkLoginStatus();
    return () => clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const isLoggedIn = !!user;
      setIsLoggedIn(isLoggedIn);
      if (isLoggedIn) {
        router.push('/knowledge');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading || isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-2xl">
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        {/* Example: Add a CDNJS link for Animate.css */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
        {/* Add more CDNJS links here as needed */}
      </Head>
      <div className={`relative min-h-screen transition-all duration-1000 scroll-smooth ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <div className="relative">
          <div className="fixed top-0 left-0 right-0 h-screen">
            <VortexDemoSecond/>
          </div>

          <Navigation isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

          <div className={`relative z-10 transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
            <section id="home" className="min-h-screen flex flex-col items-center justify-center p-8">
              <header className="text-center mb-12">
                <h1 className="flex flex-col items-center">
                  <span className="text-8xl font-bold text-white mb-4">XREPO</span>
                  <span className="text-3xl text-white mt-4">(Quantum Collaboration Platform)</span>
                </h1>
                <p className="text-center text-xl max-w-3xl mx-auto mt-8 text-white leading-relaxed">
                  Revolutionizing quantum computing collaboration through an innovative platform
                  that brings together researchers, developers, and enthusiasts.
                </p>
              </header>
            </section>

            <div className="bg-black">
              <section id="about" className="min-h-screen p-16">
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-4xl font-bold text-white mb-8">About X-Repo</h2>
                  <Separator className="my-8" />
                  <div className="grid md:grid-cols-2 gap-12">
                    <CardSpotlight color="rgba(193, 161, 161, 0.05)">
                      <CardHeader>
                        <CardTitle className="text-white">Our Mission</CardTitle>
                        <CardDescription className="text-white">
                          Advancing quantum computing through collaboration
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-gray-400">
                        <p className='text-white'>
                          X-Repo is a cutting-edge platform designed to accelerate quantum computing research and development through collaborative innovation.
                        </p>
                        <p className=" text-white mt-4">
                          Our platform combines version control, real-time collaboration, and quantum circuit simulation in one unified interface.
                        </p>
                      </CardContent>
                    </CardSpotlight>

                    <CardSpotlight color="rgba(255, 255, 255, 0.05)">
                      <CardHeader>
                        <CardTitle className="text-white">Key Features</CardTitle>
                        <CardDescription className="text-white">
                          What sets us apart
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-white space-y-2">
                          <li>• Quantum Algorithm Repository</li>
                          <li>• Circuit Design & Simulation</li>
                          <li>• Knowledge Sharing Platform</li>
                        </ul>
                      </CardContent>
                    </CardSpotlight>
                  </div>
                </div>
              </section>

              <section id="features" className="min-h-screen p-15 pb-8">
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-4xl font-bold text-white mb-8">Platform Features</h2>
                  <Separator className="my-8" />
                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      {
                        title: "Repository System",
                        description: "Advanced version control specifically designed for quantum algorithms and circuits."
                      },
                      {
                        title: "Circuit Designer",
                        description: "Interactive quantum circuit design interface with real-time simulation capabilities."
                      },
                      {
                        title: "Knowledge Hub",
                        description: "Comprehensive documentation, tutorials, and community-driven resources."
                      }
                    ].map((feature, index) => (
                      <CardSpotlight key={index} color="rgba(107, 95, 95, 0.05)">
                        <CardHeader>
                          <CardTitle className="text-white">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-400">{feature.description}</p>
                        </CardContent>
                      </CardSpotlight>
                    ))}
                  </div>
                </div>
              </section>

              <footer className="bg-black text-gray-400 p-8 border-t border-gray-800">
                <LampDemo />
                <br />
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Branding */}
                  <div>
                    <h3 className="text-xl font-semibold text-white">XREPO</h3>
                    <p className="mt-2 text-sm">
                      Advancing Quantum Computing Through Collaboration.
                    </p>
                  </div>

                  {/* Quick Links */}
                  <div>
                    <h4 className="text-md font-semibold text-white mb-2">Quick Links</h4>
                    <ul className="space-y-1 text-sm text-white">
                      <li><a href="#home" className="hover:underline">Home</a></li>
                      <li><a href="#about" className="hover:underline">About</a></li>
                      <li><a href="#features" className="hover:underline">Features</a></li>
                      <li><a href="#home" className="hover:underline">Login</a></li>
                    </ul>
                  </div>

                  {/* Contact / Socials */}
                  <div>
                <h4 className="text-md font-semibold text-white mb-2">Connect With Us</h4>
                <ul className="space-y-2 text-sm text-white">
                  <li className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    <a href="mailto:odathernihaal@gmail.com" className="hover:underline">contact@xrepo.io</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaXTwitter className="text-gray-400" />
                    <a href="https://twitter.com/xrepo" target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Twitter / X
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaGithub className="text-white" />
                    <a href="https://github.com/iprasannamb/QOSC.git" target="_blank" rel="noopener noreferrer" className="hover:underline">
                      GitHub
                    </a>
                  </li>
                </ul>
              </div>
                </div>

                {/* Footer Bottom */}
                <div className="mt-8 border-t border-gray-800 pt-4 text-center text-sm text-white">
                  &copy; {new Date().getFullYear()} XREPO. All rights reserved.
                </div>
              </footer> 
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
