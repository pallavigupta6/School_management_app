import React from "react";
import { Link, useLocation } from "react-router-dom";
import { School } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const navigation = [
    { name: "Analytics", href: "/" },
    { name: "Classes", href: "/classes" },
    { name: "Teachers", href: "/teachers" },
    { name: "Students", href: "/students" },
    // { name: "Analytics", href: "/analytics" },
  ];

  return (
    <header className="bg-white shadow">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <School className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                SchoolCRM
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                  location.pathname === item.href
                    ? "border-blue-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Placeholder (Optional for Future Use) */}
          <div className="flex sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {/* Add a mobile menu icon (e.g., MenuIcon from Lucide or Heroicons) */}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
