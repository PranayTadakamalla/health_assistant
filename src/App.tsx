import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { MessageSquare, Gamepad, FileText, Menu } from 'lucide-react';
import Chatbot from './components/chatbot';
import Games from './components/Games';
import NearbyHospitals from './components/NearbyHospitals';

function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Navigation */}
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
              <Link to="/"> <span className="text-xl font-bold text-indigo-400">Health Assistant</span> </Link>
              </div>
              
              {/* Mobile menu button */}
              <div className="flex items-center md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-400 hover:text-white"
                >
                  <Menu size={24} />
                </button>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/" className="flex items-center space-x-2 text-gray-300 hover:text-indigo-400 transition-colors">
                  <MessageSquare size={20} />
                  <span>AI Chatbot</span>
                </Link>
                <Link to="/games" className="flex items-center space-x-2 text-gray-300 hover:text-indigo-400 transition-colors">
                  <Gamepad size={20} />
                  <span>Games</span>
                </Link>
                <Link to="/map" className="flex items-center space-x-2 text-gray-300 hover:text-indigo-400 transition-colors">
                  <FileText size={20} />
                  <span>Medical Map</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-gray-800">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  to="/"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  AI Chatbot
                </Link>
                <Link
                  to="/games"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Games
                </Link>
                <Link
                  to="/map"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  map
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Chatbot />} />
            <Route path="/games" element={<Games />} />
            <Route path="/map" element={<NearbyHospitals />} />
          </Routes>
        </main>
        <center><b><h1>Created By Pranay Tadakamalla</h1></b></center>
      </div>
    </Router>
  );
}

export default App;