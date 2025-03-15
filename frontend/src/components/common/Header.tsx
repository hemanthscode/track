import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa'
import { useAuthStore } from '../../store/authStore'

interface NavItem {
  label: string
  href: string
}

interface CtaButton {
  label: string
  route: string
  style: string
  onClick?: () => void
}

const navItems: NavItem[] = [
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
]

const publicButtons: CtaButton[] = [
  { label: 'Login', route: '/login', style: 'bg-transparent border border-gray-600 hover:bg-gray-800' },
  { label: 'Sign Up', route: '/register', style: 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:scale-105' },
]

const NavLink = ({ label, href, onClick }: NavItem & { onClick?: () => void }) => {
  const navigate = useNavigate()
  const handleClick = () => {
    navigate('/')
    setTimeout(() => {
      const element = document.querySelector(href)
      if (element) element.scrollIntoView({ behavior: 'smooth' })
    }, 100)
    onClick?.()
  }
  return (
    <button onClick={handleClick} className="text-gray-300 hover:text-indigo-400 transition-colors duration-200 text-base">
      {label}
    </button>
  )
}

const CtaButton = ({
  label,
  route,
  style,
  onClick,
  fullWidth = false,
}: CtaButton & { fullWidth?: boolean }) => {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => {
        navigate(route)
        onClick?.()
      }}
      className={`px-4 py-2 text-white font-medium rounded-md transition-all duration-300 text-base ${style} ${fullWidth ? 'w-full text-left' : ''}`}
    >
      {label}
    </button>
  )
}

const Header = () => {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev)

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    navigate('/')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  const navStyles = 'fixed top-0 left-0 w-full bg-gray-900 border-b border-gray-800 text-white py-4 z-20 shadow-lg'

  const authenticatedButtons: CtaButton[] = [
    { label: 'Dashboard', route: '/dashboard', style: 'bg-transparent border border-gray-600 hover:bg-gray-800' },
    { label: 'Logout', route: '#', style: 'bg-red-600 hover:bg-red-700 shadow-md', onClick: handleLogout },
  ]

  const ctaButtons = isAuthenticated ? authenticatedButtons : publicButtons

  return (
    <header className={navStyles}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link
          to="/"
          onClick={handleLogoClick}
          className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text hover:from-indigo-500 hover:to-purple-600 transition-all duration-300"
        >
          Track
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
          {isAuthenticated && user && (
            <div className="flex items-center text-indigo-400">
              <FaUserCircle className="mr-2" />
              <span>{user.username}</span>
            </div>
          )}
        </nav>
        <div className="hidden md:flex items-center space-x-3">
          {ctaButtons.map((btn) => (
            <CtaButton key={btn.route} {...btn} />
          ))}
        </div>
        <button className="md:hidden text-gray-300 hover:text-indigo-400" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-6">
          <nav className="flex flex-col space-y-4">
            {isAuthenticated && user && (
              <div className="flex items-center text-indigo-400 mb-2">
                <FaUserCircle className="mr-2" />
                <span>{user.username}</span>
              </div>
            )}
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} onClick={toggleMobileMenu} />
            ))}
            {ctaButtons.map((btn) => (
              <CtaButton
                key={btn.label}
                {...btn}
                fullWidth
                onClick={() => {
                  toggleMobileMenu()
                  btn.onClick?.()
                }}
              />
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header