"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, UserButton, useUser, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { 
  Map as MapIcon, 
  PlusCircle, 
  Trophy, 
  User, 
  ShieldCheck, 
  Crown,
  Menu,
  X,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ADMIN_USER_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS || '').split(',').filter(Boolean);

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isAdmin = user && ADMIN_USER_IDS.includes(user.id);
  const isPro = user?.publicMetadata?.isPro === true;

  const navLinks = [
    { name: 'Карта', href: '/map', icon: MapIcon },
    { name: 'Преживявания', href: '/experiences', icon: Trophy },
    { name: 'Добави място', href: '/add', icon: PlusCircle, highlight: true },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[9999] p-4 pointer-events-none">
      <nav className="mx-auto max-w-7xl glass-pro rounded-[2.5rem] px-6 h-16 flex items-center justify-between pointer-events-auto transition-all animate-pro ring-1 ring-white/20">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1.2rem] bg-emerald-600 text-white shadow-[0_8px_20px_rgba(5,150,105,0.3)] transition-all group-hover:scale-110 group-active:scale-95 group-hover:rotate-3">
               <span className="text-2xl">🚐</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-black tracking-tighter text-gray-900 group-hover:text-emerald-700 transition-colors">
                АЙЛЯК
              </span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5 ml-0.5">Bulgaria</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "rounded-[1.2rem] px-5 h-10 font-black text-sm transition-all flex items-center gap-2",
                    isActive 
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700" 
                      : link.highlight 
                        ? "text-emerald-600 hover:bg-emerald-50"
                        : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <link.icon className={cn("h-4 w-4", !isActive && "text-emerald-600/70")} />
                  {link.name}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              
              {/* Pro Badge - Elite Version */}
              {isPro && (
                <div className="hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 shadow-lg shadow-amber-200 ring-1 ring-white/30">
                  <Crown className="h-3.5 w-3.5 text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Pro</span>
                </div>
              )}

              {/* Action Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-[1.2rem] bg-gray-50/50 hover:bg-gray-100 relative group">
                    <Menu className="h-6 w-6 text-gray-600 group-hover:text-gray-900 transition-colors" />
                    {isAdmin && (
                      <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 border-2 border-white"></span>
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-[2rem] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-none bg-white/95 backdrop-blur-2xl animate-pro">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-3 p-3 rounded-2xl focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer transition-all">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-sm">Профил</span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Настройки и история</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/spots" className="flex items-center gap-3 p-3 rounded-2xl focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-all mt-1">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          <ShieldCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-sm">Админ Панел</span>
                          <span className="text-[10px] text-blue-400 uppercase font-bold tracking-tight">Управление на места</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator className="my-2 bg-gray-100" />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/manifesto" className="flex items-center gap-3 p-3 rounded-2xl focus:bg-gray-100 cursor-pointer transition-all">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-gray-400" />
                      </div>
                      <span className="font-black text-sm text-gray-600">Манифесто</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-11 w-11 rounded-[1.2rem] border-4 border-white shadow-xl ring-1 ring-black/5 hover:scale-105 transition-all",
                  }
                }}
              />
            </div>
          ) : (
            <SignInButton mode="modal">
              <Button className="rounded-[1.2rem] bg-gray-900 hover:bg-black text-white font-black px-8 h-11 shadow-2xl transition-all hover:scale-105 active:scale-95">
                Вход
              </Button>
            </SignInButton>
          )}

          {/* Mobile Overlay Menu Button */}
          <button 
            className="md:hidden rounded-2xl p-2.5 text-gray-600 hover:bg-gray-100 transition-all bg-gray-50/50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Elite Version */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[88px] z-[-1] p-4 bg-gray-900/10 backdrop-blur-sm animate-pro">
          <div className="glass-pro rounded-[3rem] p-6 shadow-3xl animate-pro flex flex-col gap-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className={cn(
                    "flex items-center gap-4 p-5 rounded-[1.5rem] font-black text-lg transition-all",
                    isActive ? "bg-emerald-600 text-white shadow-xl shadow-emerald-200" : "bg-white text-gray-700 hover:bg-gray-50"
                  )}>
                    <link.icon className={cn("h-6 w-6", isActive ? "text-white" : "text-emerald-600")} />
                    {link.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
