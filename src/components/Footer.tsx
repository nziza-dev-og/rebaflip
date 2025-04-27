import  { Film, Github, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center mb-6 md:mb-0">
            <Film className="text-[#e50914] h-8 w-8" />
            <span className="ml-2 text-xl font-bold">RebaFlip</span>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white">
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <Instagram className="h-6 w-6" />
            </a>
            <a href="https://github.com/nziza-dev-og" className="text-gray-400 hover:text-white">
              <Github className="h-6 w-6" />
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-gray-400 font-medium mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 hover:text-white">About Us</a></li>
              <li><a href="#" className="text-gray-500 hover:text-white">Careers</a></li>
              <li><a href="#" className="text-gray-500 hover:text-white">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-gray-400 font-medium mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 hover:text-white">FAQ</a></li>
              <li><a href="#" className="text-gray-500 hover:text-white">Help Center</a></li>
              <li><a href="#" className="text-gray-500 hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-gray-400 font-medium mb-4">Discover</h3>
            <ul className="space-y-2">
              <li><a href="/movies" className="text-gray-500 hover:text-white">Movies</a></li>
              <li><a href="#" className="text-gray-500 hover:text-white">New Releases</a></li>
              <li><a href="#" className="text-gray-500 hover:text-white">Popular</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-gray-400 font-medium mb-4">Connect</h3>
            <ul className="space-y-2">
              <li><a href="https://github.com/nziza-dev-og" className="text-gray-500 hover:text-white">Github</a></li>
              <li><a href="#" className="text-gray-500 hover:text-white">Instagram</a></li>
              <li><a href="#" className="text-gray-500 hover:text-white">Facebook</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <p className="text-gray-500 text-center">© {new Date().getFullYear()} RebaFlip. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
 
