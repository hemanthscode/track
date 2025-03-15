// src/components/common/Footer.tsx
import { FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn, FaEnvelope } from 'react-icons/fa'

const Footer = () => {
  // Data objects consolidated and simplified
  const sections = [
    {
      title: "Quick Links",
      links: [
        { href: '#home', label: 'Home' },
        { href: '#features', label: 'Features' },
        { href: '#about', label: 'About' },
        { href: '#contact', label: 'Contact' },
      ]
    },
    {
      title: "Support",
      links: [
        { href: 'mailto:support@trackapp.com', label: 'support@trackapp.com', icon: <FaEnvelope className="text-indigo-400" /> },
        { href: 'tel:+15551234567', label: 'Phone: +1 (555) 123-4567' },
        { href: '#faq', label: 'FAQ' },
        { href: '#privacy', label: 'Privacy Policy' },
      ]
    }
  ]

  const socialIcons = [
    { href: 'https://twitter.com', icon: <FaTwitter /> },
    { href: 'https://facebook.com', icon: <FaFacebookF /> },
    { href: 'https://instagram.com', icon: <FaInstagram /> },
    { href: 'https://linkedin.com', icon: <FaLinkedinIn /> },
  ]

  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text">
              Track
            </h3>
            <p className="text-sm leading-relaxed">
              Your all-in-one expense tracker for smarter financial decisions. Take control of your money with ease.
            </p>
            <div className="flex space-x-4">
              {socialIcons.map((item, i) => (
                <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" 
                   className="p-2 bg-gray-800 rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-300">
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-lg font-semibold text-gray-200 mb-4">{section.title}</h4>
              <ul className="space-y-3 text-sm">
                {section.links.map((link) => (
                  <li key={link.href} className="flex items-center gap-2">
                    {link.icon}
                    <a href={link.href} className="hover:text-indigo-400 transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Signup */}
          <div>
            <h4 className="text-lg font-semibold text-gray-200 mb-4">Stay Updated</h4>
            <p className="text-sm mb-4">Subscribe to our newsletter for tips and updates.</p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-gray-800 text-center text-sm">
          <p>© {new Date().getFullYear()} Track. All rights reserved. Designed with <span className="text-indigo-400">♥</span> by the Track Team.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer