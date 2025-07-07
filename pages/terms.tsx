  import React, { useState } from 'react';
  import { FileText, Users, Shield, Code, AlertCircle, BookOpen, CheckCircle } from 'lucide-react';
  import Link from 'next/link';

  export default function TermsAndConditions() {
    const [activeSection, setActiveSection] = useState('overview');

    const sections = [
      { id: 'overview', title: 'Overview', icon: FileText },
      { id: 'acceptance', title: 'Acceptance of Terms', icon: CheckCircle },
      { id: 'platform', title: 'Platform Usage', icon: Code },
      { id: 'community', title: 'Community Guidelines', icon: Users },
      { id: 'intellectual', title: 'Intellectual Property', icon: Shield },
      { id: 'privacy', title: 'Privacy & Data', icon: AlertCircle },
      { id: 'liability', title: 'Liability & Disclaimers', icon: BookOpen },
    ];

    interface Section {
      id: string;
      title: string;
      icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    }

    const scrollToSection = (sectionId: string): void => {
      setActiveSection(sectionId);
      const element: HTMLElement | null = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-cyan-500 p-3 rounded-2xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Terms and Conditions
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Welcome to Xrepo, the open-source collaborative platform for quantum algorithm development. 
              Please read these terms carefully before using our services.
            </p>
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-purple-600/20 backdrop-blur-sm rounded-full border border-purple-400/30">
              <span className="text-purple-300 text-sm">Last Updated: July 7, 2025</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Navigation Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 sticky top-8">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Navigation</h3>
                <nav className="space-y-2">
                  {sections.map(({ id, title, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => scrollToSection(id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                        activeSection === id
                          ? 'bg-purple-600/30 text-purple-300 border-l-4 border-purple-400'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      <span className="text-sm">{title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 space-y-12">
                
                {/* Overview Section */}
                <section id="overview" className="scroll-mt-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <FileText className="w-6 h-6 mr-3 text-purple-400" />
                    Overview
                  </h2>
                  <div className="text-gray-300 space-y-4">
                    <p>
                      Xrepo is an open-source collaborative platform designed to revolutionize quantum computing development. 
                      Our platform provides specialized tools for quantum algorithm development, community collaboration, 
                      and educational resources for researchers, developers, and enthusiasts worldwide.
                    </p>
                    <p>
                      By accessing and using Xrepo, you agree to comply with and be bound by these Terms and Conditions. 
                      If you disagree with any part of these terms, please do not use our platform.
                    </p>
                  </div>
                </section>

                {/* Acceptance Section */}
                <section id="acceptance" className="scroll-mt-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <CheckCircle className="w-6 h-6 mr-3 text-green-400" />
                    Acceptance of Terms
                  </h2>
                  <div className="text-gray-300 space-y-4">
                    <p>
                      By creating an account, accessing our services, or using any part of the Xrepo platform, 
                      you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                    </p>
                    <p>
                      You must be at least 13 years old to use Xrepo. If you are under 18, you must have permission 
                      from a parent or guardian to use our services.
                    </p>
                    <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-4">
                      <p className="text-blue-300">
                        <strong>Important:</strong> These terms may be updated periodically. Continued use of the platform 
                        after changes constitutes acceptance of the updated terms.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Platform Usage Section */}
                <section id="platform" className="scroll-mt-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Code className="w-6 h-6 mr-3 text-cyan-400" />
                    Platform Usage
                  </h2>
                  <div className="text-gray-300 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Permitted Uses</h3>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        Developing and sharing quantum algorithms and applications
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        Collaborating with the quantum computing community
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        Using our web-based quantum circuit designer for educational and research purposes
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        Contributing to open-source quantum computing projects
                      </li>
                    </ul>
                    
                    <h3 className="text-lg font-semibold text-white mt-6">Prohibited Uses</h3>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        Using the platform for any illegal or unauthorized purpose
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        Attempting to gain unauthorized access to our systems
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        Distributing malicious code or conducting security attacks
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        Violating intellectual property rights of others
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Community Guidelines Section */}
                <section id="community" className="scroll-mt-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Users className="w-6 h-6 mr-3 text-yellow-400" />
                    Community Guidelines
                  </h2>
                  <div className="text-gray-300 space-y-4">
                    <p>
                      Xrepo fosters a collaborative and inclusive environment for quantum computing development. 
                      All community members are expected to:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-600/20 border border-green-400/30 rounded-lg p-4">
                        <h4 className="font-semibold text-green-300 mb-2">Be Respectful</h4>
                        <p className="text-sm text-green-200">
                          Treat all community members with respect and courtesy, regardless of their background or experience level.
                        </p>
                      </div>
                      <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-300 mb-2">Share Knowledge</h4>
                        <p className="text-sm text-blue-200">
                          Contribute constructively to discussions and help others learn quantum computing concepts.
                        </p>
                      </div>
                      <div className="bg-purple-600/20 border border-purple-400/30 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-300 mb-2">Follow Standards</h4>
                        <p className="text-sm text-purple-200">
                          Adhere to coding standards and best practices when contributing to projects.
                        </p>
                      </div>
                      <div className="bg-orange-600/20 border border-orange-400/30 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-300 mb-2">Report Issues</h4>
                        <p className="text-sm text-orange-200">
                          Report any violations of community guidelines or technical issues promptly.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Intellectual Property Section */}
                <section id="intellectual" className="scroll-mt-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Shield className="w-6 h-6 mr-3 text-purple-400" />
                    Intellectual Property
                  </h2>
                  <div className="text-gray-300 space-y-4">
                    <p>
                      Xrepo operates under the Apache License, Version 2.0. All contributions to the platform 
                      must be compatible with this license.
                    </p>
                    <h3 className="text-lg font-semibold text-white">Your Content</h3>
                    <p>
                      You retain ownership of any intellectual property rights that you hold in content you 
                      contribute to Xrepo. However, by submitting content, you grant us a license to use, 
                      modify, and distribute your contributions as part of the platform.
                    </p>
                    <h3 className="text-lg font-semibold text-white">Platform Content</h3>
                    <p>
                      The Xrepo platform, including its software, documentation, and design, is protected by 
                      copyright and other intellectual property laws. You may not use our content without 
                      permission, except as permitted by the Apache License.
                    </p>
                  </div>
                </section>

                {/* Privacy & Data Section */}
                <section id="privacy" className="scroll-mt-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <AlertCircle className="w-6 h-6 mr-3 text-red-400" />
                    Privacy & Data Protection
                  </h2>
                  <div className="text-gray-300 space-y-4">
                    <p>
                      We are committed to protecting your privacy and handling your data responsibly. 
                      Our data practices include:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                        <span>Collecting only necessary information for platform functionality</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                        <span>Using secure encryption for data transmission and storage</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                        <span>Not selling or sharing personal information with third parties</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                        <span>Providing users with control over their data and privacy settings</span>
                      </div>
                    </div>
                    <p>
                      For detailed information about our privacy practices, please refer to our separate Privacy Policy.
                    </p>
                  </div>
                </section>

                {/* Liability & Disclaimers Section */}
                <section id="liability" className="scroll-mt-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <BookOpen className="w-6 h-6 mr-3 text-indigo-400" />
                    Liability & Disclaimers
                  </h2>
                  <div className="text-gray-300 space-y-4">
                    <div className="bg-yellow-600/20 border border-yellow-400/30 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-300 mb-2">Service Availability</h4>
                      <p className="text-sm text-yellow-200">
                        Xrepo is provided "as is" without warranties of any kind. We do not guarantee 
                        uninterrupted or error-free service.
                      </p>
                    </div>
                    <div className="bg-red-600/20 border border-red-400/30 rounded-lg p-4">
                      <h4 className="font-semibold text-red-300 mb-2">Limitation of Liability</h4>
                      <p className="text-sm text-red-200">
                        In no event shall Xrepo be liable for any indirect, incidental, special, 
                        consequential, or punitive damages arising from your use of the platform.
                      </p>
                    </div>
                    <p>
                      You understand that quantum computing involves complex calculations and experimental 
                      algorithms. Results obtained through our platform should be independently verified 
                      for critical applications.
                    </p>
                    <h3 className="text-lg font-semibold text-white">Termination</h3>
                    <p>
                      We reserve the right to terminate or suspend your account and access to the platform 
                      at our discretion, without notice, for conduct that we believe violates these terms 
                      or is harmful to other users or the platform.
                    </p>
                  </div>
                </section>

                {/* Contact Information */}
                <section className="border-t border-white/10 pt-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Contact Us</h2>
                  <div className="text-gray-300 space-y-4">
                    <p>
                      If you have any questions about these Terms and Conditions, please contact us through 
                      our GitHub repository or community forums.
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-purple-500 to-cyan-500 p-2 rounded-lg">
                        <Code className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">GitHub Repository</p>
                        <p className="text-gray-400 text-sm">github.com/NihaalNO/x-repo</p>
                      </div>
                      
                      <Link href="/" className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-colors text-lg">Back to Home</Link>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }




