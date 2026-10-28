import React, { useState } from 'react';
import { Menu, MessageCircle, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { BusinessInfo } from '../types/lighting';
import { buildWhatsAppUrl } from '../utils/catalogLogic';

export type ActivePage = 'home' | 'products' | 'categories' | 'about' | 'contact' | 'product-detail';

interface NavbarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  businessInfo: BusinessInfo;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigate,
  onOpenSearch,
  onOpenAdmin,
  businessInfo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActivePage; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'products', label: 'Products' },
    { id: 'categories', label: 'Categories' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (page: ActivePage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const whatsappDirectUrl = buildWhatsAppUrl(
    businessInfo.whatsapp,
    `Assalam o Alaikum ${businessInfo.name}, I would like to inquire about your Fanus and home lighting collection.`,
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E6DFD3] bg-[#FAF7F2]/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="inline-flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus:outline-none"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#181615] text-[#D4AF37] border border-[#C69C47]/40">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-[#181615]">
            {businessInfo.name}
          </span>
        </button>

        {/* Zone 2: 5 Clean Single-Line Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive =
              activePage === item.id || (activePage === 'product-detail' && item.id === 'products');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#181615] font-semibold after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#C69C47]'
                    : 'text-[#5C554E] hover:text-[#181615]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Search, Admin & Primary WhatsApp / Explore Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search Fanus products"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E2D9C8] bg-white text-[#181615] transition-colors hover:border-[#C69C47] hover:text-[#9A7420]"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onOpenAdmin}
            aria-label="Manage Products and Prices"
            className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-[#E2D9C8] bg-white px-3 py-2 text-xs font-medium text-[#3D3833] transition-colors hover:border-[#C69C47] hover:text-[#181615] whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#9A7420]" />
            <span>Manage Catalog</span>
          </button>

          <a
            href={whatsappDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#181615] px-4 py-2.5 text-xs font-semibold text-[#FAF7F2] transition-colors hover:bg-[#2C2622] whitespace-nowrap shrink-0"
          >
            <MessageCircle className="h-4 w-4 text-[#D4AF37]" />
            <span>WhatsApp Us</span>
          </a>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E2D9C8] bg-white text-[#181615] md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[#E6DFD3] bg-[#FAF7F2] px-4 pt-3 pb-5 md:hidden">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-base font-medium ${
                  activePage === item.id
                    ? 'bg-[#181615] text-[#FAF7F2]'
                    : 'text-[#2C2622] hover:bg-[#EFE9DD]'
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#7A5B18] hover:bg-[#EFE9DD]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Manage Catalog &amp; PKR Prices</span>
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2.5 border-t border-[#E6DFD3] pt-4">
            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#181615] px-4 py-3 text-sm font-semibold text-[#FAF7F2]"
            >
              <MessageCircle className="h-4 w-4 text-[#D4AF37]" />
              <span>Order / Ask on WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={() => handleNavClick('products')}
              className="inline-flex w-full items-center justify-center rounded-lg border border-[#C69C47] bg-white px-4 py-2.5 text-sm font-semibold text-[#181615]"
            >
              View All Fanus Products
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
