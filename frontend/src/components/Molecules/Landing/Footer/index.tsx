import Image from 'next/image';
import Link from 'next/link';
import { Twitter, Github, MessageCircle, Pill } from 'lucide-react';
import HorizontalLogo from "../../../../assets/images/logo-horizontal.png";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0A0A] text-white py-12 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="flex justify-center md:justify-start">
            <Image src={HorizontalLogo} alt="SWquery Logo" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">Learn</h3>
            <ul className="space-y-2">
              <li><Link href="/soon" className="text-gray-400 hover:text-[#9945FF]">SWquery FAQ</Link></li>
              <li><Link href="/soon" className="text-gray-400 hover:text-[#9945FF]">SWquery Whitepaper</Link></li>
              <li><Link href="/soon" className="text-gray-400 hover:text-[#9945FF]">Blog</Link></li>
              <li><Link href="/soon" className="text-gray-400 hover:text-[#9945FF]">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">Developers</h3>
            <ul className="space-y-2">
              <li><Link href="https://bretasarthur1.gitbook.io/swquery/" className="text-gray-400 hover:text-[#9945FF]">Documentation</Link></li>
              <li><Link href="/soon" className="text-gray-400 hover:text-[#9945FF]">Apply to Build</Link></li>
              <li><Link href="https://github.com/vict0rcarvalh0/swquery" className="text-gray-400 hover:text-[#9945FF]">GitHub</Link></li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li><Link href="/soon" className="text-gray-400 hover:text-[#9945FF]">SWquery Dashboard</Link></li>
              <li><Link href="/soon" className="text-gray-400 hover:text-[#9945FF]">Join the Newsletter</Link></li>
              <li><Link href="/soon" className="text-gray-400 hover:text-[#9945FF]">Join the Discord</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-800 pt-8">
          <p className="text-gray-400 text-sm mb-4 md:mb-0 text-center md:text-left">
            © {currentYear} SWquery. Powered by <span className="text-[#9945FF]">Solana</span>. All rights reserved.
          </p>
          <div className="flex justify-center md:justify-end space-x-6">
            <a href="https://x.com/swquery" className="text-gray-400 hover:text-[#9945FF]">
              <Twitter size={24} />
            </a>
            <a href="/t.me/ofcswquery" className="text-gray-400 hover:text-[#9945FF]">
              <MessageCircle size={24} />
            </a>
            <a href="https://github.com/vict0rcarvalh0/swquery" className="text-gray-400 hover:text-[#9945FF]">
              <Github size={24} />
            </a>
            <a href="https://pump.fun/coin/EwdcspW8mEjp4UswrcjmHPV3Y4GdGQPMG6RMTDV2pump" className="text-gray-400 hover:text-[#9945FF]">
              <Pill size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
