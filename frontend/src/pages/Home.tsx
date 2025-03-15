// src/pages/Home.tsx

import { FaChartLine, FaWallet, FaRegCalendarAlt, FaShieldAlt, FaMobileAlt, FaCloudDownloadAlt } from 'react-icons/fa'
import { BiCategoryAlt, BiPieChartAlt, BiTrendingUp } from 'react-icons/bi'

const Home = () => {
  return (
    <div className="bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4 py-12">
        <div className="container mx-auto flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Take Control of Your Finances
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mb-8 leading-relaxed">
            Track is your ultimate expense tracker. Monitor spending, set budgets, and uncover financial trends with stunning charts—all in one seamless, modern app.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-md">
            <button className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
              Get Started
            </button>
            <button className="flex-1 px-6 py-3 bg-transparent border border-indigo-400 hover:bg-indigo-900/30 text-indigo-400 font-semibold rounded-lg transition-all duration-300">
              Watch Demo
            </button>
          </div>
          {/* Removed placeholder image */}
          <div className="mt-12 w-full max-w-4xl bg-gray-800/60 backdrop-blur-sm p-4 rounded-2xl shadow-2xl h-64 flex items-center justify-center">
            <p className="text-gray-400 italic">Dashboard Preview Coming Soon</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4 py-12 scroll-mt-16">
        <div className="container mx-auto flex flex-col items-center justify-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-gray-100">Our Story</h2>
          <p className="text-center text-gray-400 max-w-2xl mx-auto mb-12 text-sm md:text-base">
            The journey behind Track and our mission to revolutionize personal finance.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 w-full">
            <div className="lg:col-span-3 order-2 lg:order-1">
              <h3 className="text-2xl md:text-3xl font-semibold mb-6 bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text">
                Empowering Financial Freedom
              </h3>
              <div className="space-y-4 text-gray-300 text-sm md:text-base">
                <p>Track simplifies personal finance management, making it accessible to everyone in a complex financial world.</p>
                <p>Built by financial experts and developers, we’re dedicated to empowering users with tools for financial control.</p>
                <p>Thousands trust Track to transform their money habits, from young professionals to families planning ahead.</p>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-600/20 p-2 rounded-lg">
                    <FaShieldAlt className="text-indigo-400 text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm md:text-base">Bank-Level Security</h4>
                    <p className="text-gray-400 text-xs md:text-sm">Your data is always safe</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-600/20 p-2 rounded-lg">
                    <FaMobileAlt className="text-indigo-400 text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm md:text-base">Access Anywhere</h4>
                    <p className="text-gray-400 text-xs md:text-sm">Web, mobile, desktop</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Removed placeholder image */}
            <div className="lg:col-span-2 order-1 lg:order-2 bg-gray-800/60 backdrop-blur-sm p-4 rounded-2xl shadow-2xl h-96 flex items-center justify-center">
              <p className="text-gray-400 italic">Team Image Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4 py-12 scroll-mt-16">
        <div className="container mx-auto flex flex-col items-center justify-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-gray-100">Powerful Features</h2>
          <p className="text-center text-gray-400 max-w-2xl mx-auto mb-12 text-sm md:text-base">
            Track offers everything you need to manage your finances with confidence and clarity.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {[
              { icon: <FaWallet className="text-indigo-400 text-2xl" />, title: "Transaction Management", desc: "Easily create, categorize, and manage all your financial transactions with our intuitive interface." },
              { icon: <FaRegCalendarAlt className="text-indigo-400 text-2xl" />, title: "Recurring Transactions", desc: "Set up and manage recurring payments and income with automatic tracking." },
              { icon: <BiCategoryAlt className="text-indigo-400 text-2xl" />, title: "Budget Planning", desc: "Create custom budgets and track your progress in real-time with alerts." },
              { icon: <FaChartLine className="text-indigo-400 text-2xl" />, title: "Dashboard Analytics", desc: "Get a complete overview with summary stats, trends, and insights." },
              { icon: <BiPieChartAlt className="text-indigo-400 text-2xl" />, title: "Detailed Reports", desc: "Generate reports to analyze spending patterns and cash flow." },
              { icon: <FaCloudDownloadAlt className="text-indigo-400 text-2xl" />, title: "Data Export", desc: "Export your transactions and budgets for external use." },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 border border-gray-800"
              >
                <div className="bg-indigo-600/20 p-3 rounded-lg w-fit mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-indigo-400 mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Advanced Trend Analysis */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 w-full">
            <div className="flex flex-col justify-center order-2 md:order-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-100">Advanced Trend Analysis</h3>
              <p className="text-gray-400 mb-6 text-sm md:text-base leading-relaxed">
                Understand your spending with powerful analytics and actionable insights.
              </p>
              <ul className="space-y-3">
                {["Monthly spending comparisons", "Category-based trends", "Savings rate tracking", "Income vs. expense visualization"].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-300 text-sm md:text-base">
                    <span className="h-5 w-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <BiTrendingUp className="text-indigo-400 text-sm" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Removed placeholder image */}
            <div className="order-1 md:order-2 bg-gray-800/60 backdrop-blur-sm p-4 rounded-2xl shadow-2xl h-64 flex items-center justify-center">
              <p className="text-gray-400 italic">Analytics Preview Coming Soon</p>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mt-16 w-full">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 text-gray-100">What Our Users Say</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Alex Rivera", role: "Freelance Designer", text: "Track transformed how I manage my income. The recurring transactions feature is a game-changer." },
                { name: "Sarah Johnson", role: "Young Professional", text: "I’ve saved $300 monthly by cutting unnecessary expenses, thanks to Track’s insights." },
                { name: "Michael Chen", role: "Family Planner", text: "Budgeting and analytics make family planning easy—it’s like a financial advisor in my pocket." },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:shadow-indigo-500/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <span className="font-bold text-indigo-400">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm md:text-base">{testimonial.name}</h4>
                      <p className="text-gray-400 text-xs md:text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm md:text-base italic">"{testimonial.text}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 w-full">
            <div className="bg-gradient-to-r from-indigo-800 to-purple-800 rounded-2xl shadow-2xl p-6 md:p-10 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">Ready to Master Your Money?</h2>
              <p className="text-gray-200 mb-8 text-sm md:text-lg max-w-2xl mx-auto">
                Join thousands who’ve transformed their finances with Track. Start today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto">
                <button className="flex-1 px-6 py-3 bg-white text-indigo-800 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
                  Sign Up for Free
                </button>
                <button className="flex-1 px-6 py-3 bg-transparent border border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300">
                  Learn More
                </button>
              </div>
              <p className="mt-6 text-gray-300 text-xs md:text-sm">
                No credit card required. Start tracking in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home