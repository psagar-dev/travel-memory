function Header() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-gray-800 hover:text-gray-600">
              Travel Memory
            </a>
          </div>
          <div className="flex items-center">
            <a href="/addexperience" className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              Add Experience
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
