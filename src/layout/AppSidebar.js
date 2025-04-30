"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/admin/SidebarContext";
import { fetchData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useUser  } from "@/context/UserContext"
import {
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  DocsIcon,
  ShoppingBagIcon,
  BeakerIcon,
  OrderIcon,
  ShippingIcon,
  PlaneIcon,
  CalenderIcon,
  UserIcon
} from "../icons/index";

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, toggleMobileSidebar, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState({});
  const subMenuRefs = useRef({});

  const [unverifiedLabCount, setUnverifiedLabCount] = useState(0);
  const [unverifiedPharmCount, setUnverifiedPharmCount] = useState(0);
  const [pendingUploadedPrescriptionCount, setPendingUploadedPrescriptionCount] = useState(0);
  const [pendingLinkedPrescriptionCount, setPendingLinkedPrescriptionCount] = useState(0);

  const isActive = useCallback((path) => path === pathname, [pathname]);

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const { user } = useUser()
  

  const toggleSubmenu = (key) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleClick = () => {
    if (window.innerWidth < 1024) {
      toggleMobileSidebar();
    }
  };

  useEffect(() => {
    Object.keys(subMenuRefs.current).forEach((key) => {
      if (subMenuRefs.current[key]) {
        subMenuRefs.current[key].style.height = openSubmenus[key]
          ? `${subMenuRefs.current[key].scrollHeight}px`
          : "0px";
      }
    });
  }, [openSubmenus]);

  useEffect(() => {
    console.log("Session token:", token); // 👈 Add this
  
    if (!token) return; // prevent running fetches without token
  
    // Function to fetch unverified labs - requires either "admin" or "labAdmin" role
  const fetchUnverifiedLabs = async (roles) => {
    try {
      if (roles.some(role => user?.role === role)) {
        const data = await fetchData("laboratories/get-all/no-pagination?status=unverified", token);
        setUnverifiedLabCount(data.length || 0);
      }
    } catch (err) {
      console.error("Failed to fetch unverified lab count", err);
    }
  };

  // Function to fetch unverified pharmacies - requires either "admin" or "pharmacyAdmin" role
  const fetchUnverifiedPharmacies = async (roles) => {
    try {
      if (roles.some(role => user?.role === role)) {
        const data = await fetchData("pharmacies/get-all/no-pagination?status=unverified", token);
        setUnverifiedPharmCount(data.length || 0);
      }
    } catch (err) {
      console.error("Failed to fetch unverified pharmacy count", err);
    }
  };

  // Function to fetch pending uploaded prescriptions - requires either "admin" or "prescriptionManager" role
  const fetchPendingUploadedPrescription = async (roles) => {
    try {
      if (roles.some(role => user?.role === role)) {
        const data = await fetchData("prescriptions/by/status?status=pending", token);
        setPendingUploadedPrescriptionCount(data.length || 0);
      }
    } catch (err) {
      console.error("Failed to fetch pending uploaded prescription count", err);
    }
  };

  // Function to fetch pending linked prescriptions - requires either "admin" or "cartManager" role
  const fetchPendingLinkedPrescription = async (roles) => {
    try {
      if (roles.some(role => user?.role === role)) {
        const data = await fetchData("cart/linked-prescriptions/by/status?status=pending", token);
        setPendingLinkedPrescriptionCount(data.length || 0);
      }
    } catch (err) {
      console.error("Failed to fetch pending linked prescription count", err);
    }
  };

  
    fetchUnverifiedLabs(["admin"]); 
    fetchUnverifiedPharmacies(["admin"]); 
    fetchPendingUploadedPrescription(["admin", "pharmacyAdmin", "pharmacyEmployee"]); 
    fetchPendingLinkedPrescription(["admin", "pharmacyAdmin", "pharmacyEmployee"]);

  }, [token]);
  
  

  const getNavItems = () => {
    const role = session?.user?.role;

    const filterByRole = (items) => {
      return items
        .filter(item => !item.roles || item.roles.includes(role)) // 👈 Filter based on roles
        .map(item => {
          if (item.subItems) {
            const filteredSub = filterByRole(item.subItems);
            return { ...item, subItems: filteredSub };
          }
          return item;
        })
        .filter(item => !item.subItems || item.subItems.length > 0); // remove empty submenus
    };

    const items =  [
      // dashboard
      {
        icon: <GridIcon />,
        name: "Dashboard",
        path: "/admin",
        roles: ["admin", "user", "specialist", "consultant"]
      },
      // availability
      {
        icon: <UserIcon />,
        name: "Specialists",
        path: "/admin/specialists",
        roles: ["admin"]
      },
      // availability
      {
        icon: <CalenderIcon />,
        name: "Availabilities",
        path: "/admin/availabilities",
        roles: ["admin", "specialist", "consultant"]
      },
      // products
      {
        icon: <BoxCubeIcon />,
        name: "Products",
        subItems: [
          { name: "All Products", path: "/admin/products" },
          { name: "Add Product", path: "/admin/products/add" },
          { name: "Brands", path: "/admin/brands" },
          { name: "Categories", path: "/admin/categories" },
        ],
        roles: ["admin", "pharmacyAdmin", "pharmacyEmployee"]
      },
      // prescriptions
      {
        icon: <DocsIcon />,
        name: "Prescriptions",
        isUnverified: pendingUploadedPrescriptionCount > 0 || pendingLinkedPrescriptionCount > 0,
        subItems: [
          {
            name: "Uploads",
            isUnverified: pendingUploadedPrescriptionCount > 0,
            subItems: [
              { name: "Pending Approvals", path: "/admin/prescriptions/uploads?status=pending", badge: pendingUploadedPrescriptionCount },
              { name: "Approved", path: "/admin/prescriptions/uploads?status=approved" },
              { name: "Rejected", path: "/admin/prescriptions/uploads?status=rejected" },
            ],
          },
          {
            name: "Linked Prescriptions",
            isUnverified: pendingLinkedPrescriptionCount > 0,
            subItems: [
              { name: "Pending Approvals", path: "/admin/prescriptions/linked?status=pending", badge: pendingLinkedPrescriptionCount,  },
              { name: "Approved", path: "/admin/prescriptions/linked?status=approved" },
              { name: "Rejected", path: "/admin/prescriptions/linked?status=rejected" },
            ],
          },
        ],
        roles: ["admin", "pharmacyAdmin", "pharmacyEmployee", "labAdmin", "labEmployee"]
      },
      // pharmacy
      {
        icon: <ShoppingBagIcon />,
        name: "Pharmacies",
        isUnverified: unverifiedPharmCount > 0, 
        subItems: [
          { name: "My Pharmacy", path: "/admin/pharmacies?my-pharmacy", roles: ["pharmacyAdmin"] },
          { name: "Verified", path: "/admin/pharmacies?status=verified", roles: ["admin"] },
          { 
            name: "Unverified", 
            path: "/admin/pharmacies?status=unverified", 
            badge: unverifiedPharmCount,
            roles: ["admin"]
          },
        ],
        roles: ["admin", "pharmacyAdmin", "user"]
      },
      // laboratories
      {
        icon: <BeakerIcon />,
        name: "Laboratories",
        isUnverified: unverifiedLabCount > 0,
        subItems: [
          { name: "Verified", path: "/admin/laboratories?status=verified", roles: ["admin"] },
          {
            name: "Unverified",
            path: "/admin/laboratories?status=unverified",
            badge: unverifiedLabCount,
            roles: ["admin"]
          },
          { name: "Services", path: "/admin/laboratories/services", roles: ["labAdmin", "labEmployee", "admin"] },
          { name: "Results", path: "/admin/laboratories/results", roles: ["labAdmin", "labEmployee", "admin"] },
          { name: "My Results", path: "/admin/laboratories/my-results", roles: ["user"] },
        ],
        roles: ["admin", "labAdmin", "labEmployee", "user"]
      },
      // orders
      {
        icon: <OrderIcon />,
        name: "Orders",
        subItems: [
          // General
          { name: "All Orders", path: "/admin/orders" },

          // By Category
          { name: "Medication Orders", path: "/admin/orders?category=Medication" },
          { name: "Lab Service Orders", path: "/admin/orders?category=LabService" },
      
          // By Status
          { name: "Pending Orders", path: "/admin/orders?status=pending" },
          { name: "Paid Orders", path: "/admin/orders?status=paid" },
          { name: "Shipped Orders", path: "/admin/orders?status=shipped" },
          { name: "Completed Orders", path: "/admin/orders?status=completed" },
          { name: "Cancelled Orders", path: "/admin/orders?status=cancelled" },
      
          // By Payment Status
          { name: "Payment Pending", path: "/admin/orders?paymentStatus=pending" },
          { name: "Payment Failed", path: "/admin/orders?paymentStatus=failed" },
          { name: "Refunded Orders", path: "/admin/orders?paymentStatus=refunded" }
        ],
        roles: ["admin", "labAdmin", "labEmployee", "pharmacyAdmin", "pharmacyEmployee", "user"]
      },
      // shipping addresses
      {
        icon: <ShippingIcon />,
        name: "Shipping Addresses",
        path: "/admin/shipping-addresses" ,
        roles: ["admin", "user"]
      },
      // medical tourisms
      {
        icon: <PlaneIcon />,
        name: "Medical Tourism",
        subItems: [
          { name: "Packages", path: "/admin/medical-tourism/packages"},
          { name: "Appointments", path: "/admin/medical-tourism/consultations/appointments"},
          { name: "Documentations", path: "/admin/medical-tourism/consultations/documentations"}
        ],
        roles: ["admin", "consultant"]
      },
      // Appointments
      {
        icon: <CalenderIcon />,
        name: "Appointments",
        path: "/admin/appointments",
        roles: ["admin", "specialist", "user"]
      },
      {
        icon: <CalenderIcon />,
        name: "Appointments",
        path: "/admin/medical-tourism/consultations/appointments",
        roles: ["admin"]
      },
    ];

    return filterByRole(items);
  };
  

  const renderMenuItems = (items, parentKey = "") => (
    <ul className="flex flex-col">
      {items.map((item, index) => {
        const itemKey = parentKey ? `${parentKey}-${item.name}` : item.name;

        const isOpen = openSubmenus[itemKey];
  
        return (
          <li key={itemKey} className="relative">
            {item.subItems ? (
              <button
                onClick={() => toggleSubmenu(itemKey)}
                className={`menu-item group flex items-center w-full ${isOpen ? "menu-item-active" : "menu-item-inactive"}`}
              >
                <span className="menu-item-icon">{item.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{item.name}</span>
                )}

                <span
                  className={`relative right-0 top-0 z-10 h-2 w-2 rounded-full bg-orange-400 ${
                    !item.isUnverified ? "hidden" : "flex"
                  }`}
                >
                  <span className="relative inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
                </span>
                  

                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform ${isOpen ? "rotate-180 text-brand-500" : ""}`}
                  />
                )}
              </button>
            ) : (
              <Link
                href={item.path}
                className={`menu-item group flex items-center ${isActive(item.path) ? "menu-item-active" : "menu-item-inactive"} transition-all duration-300`}
                onClick={handleClick}
              >
                <span className="menu-item-icon">{item.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text flex items-center gap-2">
                    {item.name}
                    {item.badge > 0 && (
                      <span className="bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            )}
  
            {item.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => (subMenuRefs.current[itemKey] = el)}
                className="overflow-hidden transition-[height] duration-300 ease-in-out"
                style={{ height: isOpen ? "auto" : "0px"}}
              >
                <ul className="mt-2 ml-5 border-l border-gray-200 dark:border-gray-700">
                  {renderMenuItems(item.subItems, itemKey)}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
  
  

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen z-50 transition-all duration-300 border-r border-gray-200
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
            <img
              width={154}
              height={32}
              className="dark:hidden"
              src="/images/logo/logo.png"
              alt="Logo"
            />
            <img
              width={154}
              height={32}
              className="hidden dark:block"
              src="/images/logo/logo-dark.png"
              alt="Logo"
            />
          </Link>
      </div>
      <div className="flex flex-col overflow-y-auto no-scrollbar">
        <nav className="mb-6">
          <h2 className={`mb-4 text-xs uppercase flex text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
            {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
          </h2>
          {renderMenuItems(getNavItems())}
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
