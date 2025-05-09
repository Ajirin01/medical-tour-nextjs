"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { Dialog, DialogPanel, PopoverGroup } from "@headlessui/react";
import { 
  Bars3Icon, 
  XMarkIcon,
  SquaresPlusIcon,
  PlayCircleIcon,
  PhoneIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  CameraIcon
 } from "@heroicons/react/24/outline";
import { Hospital, UserCheck, Stethoscope } from 'lucide-react';
import { useSession, signOut } from "next-auth/react"; // Authentication
import SubNav from "@/components/SubNav";
import DropdownPopover from '@/components/DropdownPopover'
import AuthDropdown from "./AuthDropdownMenu";

const solutions = [
  {
    name: 'Packages',
    description: 'Explore curated medical tourism packages with full service details',
    href: '/medical-tourism',
    icon: SquaresPlusIcon, // Represents bundled services
  },
  {
    name: 'Hospitals',
    description: 'Discover accredited hospitals offering top-tier medical care',
    href: '/#hospitals',
    icon: Hospital, // Could signify stats or insights about hospitals
  },
  {
    name: 'Doctors',
    description: 'Browse specialists and top-rated doctors for your treatment',
    href: '/#doctors',
    icon: UserCheck, // Could imply personal care or credentials
  },
  {
    name: 'Treatments',
    description: 'Learn about procedures and treatment options we offer',
    href: '/#treatments',
    icon: Stethoscope, // Represents transformation or recovery
  }
]

const aboutUs = [
  {
    name: 'Overview',
    description: 'Learn about our medical tourism services and top healthcare providers.',
    href: '/#about',
    icon: InformationCircleIcon, // Clear, general info symbol
  },
  {
    name: 'Gallery',
    description: 'View photos of our healthcare destinations and patient experiences.',
    href: '/#gallery',
    icon: CameraIcon, // Icon representing photo collection
  },
  {
    name: 'Frequently asked questions',
    description: 'Find answers to common questions about our services and medical tourism.',
    href: '/#faq',
    icon: QuestionMarkCircleIcon, // Appropriate for FAQ
  }
];


const actions = [
  { name: 'Watch demo', href: '#', icon: PlayCircleIcon },
  { name: 'Contact sales', href: '/#contact', icon: PhoneIcon },
]

const navigation = [
  { name: "Medical Tourism", comp: DropdownPopover},
  { name: "About Us", comp: DropdownPopover },
  { name: "Laboratory", href: "/laboratory" },
  { name: "Pharmacy", href: "/pharmacy" }
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession(); // Get user session

  return (
    <header className="bg-blue-600 text-white">
      {/* Announcement Bar */}
      <div className="bg-indigo-600 text-white text-center py-2 text-sm">
        {/* Get free delivery on orders over $100 */}
        <Link
          className="cta-btn text-white font-semibold transition-all duration-300 animate-pulse"
          href="/auth/sign-up?role=specialist"
        >
          Join Our Medical Experts today
        </Link>
      </div>
      
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="text-xl font-bold">
          <Image
              src="/images/logo/logo-dark.png" // update with your actual logo path
              alt="Medical Tourism Logo"
              width={100} // adjust size as needed
              height={70}
              className="object-contain"
            />
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="size-6" aria-hidden="true" />
          </button>
        </div>
        
        <PopoverGroup className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) =>
            item.comp ? (
              <item.comp
                key={item.name}
                title={item.name}
                items={item.name === "About Us" ? aboutUs : solutions}
                callsToAction={actions}
                buttonStyle="inline-flex items-center gap-x-1 text-sm font-semibold hover:cursor-pointer !text-white"
              />
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-semibold hover:underline"
              >
                {item.name}
              </Link>
            )
          )}
        </PopoverGroup>


        {/* Authentication Links */}

        <AuthDropdown />
      </nav>
      
      {/* Mobile Menu */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <DialogPanel className="fixed inset-0 z-10 bg-blue-600 p-6 sm:max-w-sm">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-white">
              <Image
                src="/images/logo/logo-dark.png" // update with your actual logo path
                alt="Medical Tourism Logo"
                width={70} // adjust size as needed
                height={40}
                className="object-contain"
              />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-white"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="size-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="mt-6">
            {navigation.map((item) =>
              item.comp ? (
                <item.comp
                  key={item.name}
                  title={item.name}
                  items={solutions}
                  callsToAction={actions}
                  buttonStyle="inline-flex items-center gap-x-1 text-sm font-semibold ml-3 hover:cursor-pointer !text-white"
                />
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-2 text-base font-semibold text-white hover:bg-blue-700 rounded-lg px-3"
                >
                  {item.name}
                </Link>
              )
            )}

            {session ? (
              <>
                <a
                  href="/admin"
                  className="block w-full px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-500 mb-2 text-center"
                >
                  Dashboard
                </a>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="block w-full px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 text-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block w-full px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-500 text-center"
              >
                Login
              </Link>
            )}
            
            
          </div>
        </DialogPanel>
      </Dialog>

      {/* SubNav with MiniCart */}
      <SubNav />
    </header>
  );
}
