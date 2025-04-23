'use client'

import { useState, useEffect } from 'react'
import { CheckIcon } from '@heroicons/react/20/solid'
import { fetchData } from '@/utils/api'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function LandingPage() {
  const [packages, setPackages] = useState([])
  const [activeIndex, setActiveIndex] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    async function fetchPackages() {
      try {
        const data = await fetchData('tour/get-all/no-pagination')
        setPackages(data)
      } catch (error) {
        console.error('Failed to fetch packages:', error)
      }
    }

    fetchPackages()
  }, [])

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div
        className="relative px-6 lg:px-8"
        style={{
          backgroundImage: "url('/images/Medical-tourism.jpg')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >

        <div className="mx-auto max-w-2xl py-32 sm:py-48 relative z-5 text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-gray sm:text-7xl">
            Explore Global Medical Solutions
          </h1>
          <p className="mt-8 text-lg font-medium text-gray sm:text-xl">
            Get world-class treatment at affordable prices in top destinations.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Browse Packages
            </a>
            <a href="#" className="text-sm font-semibold text-gray">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="relative isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold text-indigo-600">Medical Tourism Packages</h2>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
            Choose a treatment plan that fits your needs
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-gray-600 sm:text-xl">
          Explore affordable, high-quality medical treatment options tailored for international patients.
        </p>

        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-4xl lg:grid-cols-3">
          {packages.map((_package, index) => {
            const isActive = activeIndex === index
            return (
              <div
                key={_package._id}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => !isMobile && setActiveIndex(index)}
                onMouseLeave={() => !isMobile && setActiveIndex(null)}
                className={classNames(
                  'group cursor-pointer transition-all duration-500 ease-in-out',
                  isActive ? 'bg-gray-900 shadow-2xl text-white' : 'bg-white/60 text-gray-900',
                  'rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10'
                )}
              >
                <h3 className={classNames('text-base font-semibold', isActive ? 'text-indigo-400' : 'text-indigo-600')}>
                  {_package.name}
                </h3>
                <p className="mt-4 flex items-baseline gap-x-2">
                  <span className={classNames('text-4xl font-semibold', isActive ? 'text-white' : 'text-gray-900')}>
                    ${Number(_package.price).toFixed(0)}
                  </span>
                </p>

                <p className={classNames('mt-6 text-base', isActive ? 'text-gray-300' : 'text-gray-600')}>
                  {_package.description}
                </p>
                <ul className={classNames('mt-8 space-y-3 text-sm', isActive ? 'text-gray-300' : 'text-gray-600')}>
                  {(_package.services || []).map((service) => (
                    <li key={service} className="flex gap-x-3">
                      <CheckIcon className={classNames('h-6 w-5 flex-none', isActive ? 'text-indigo-400' : 'text-indigo-600')} />
                      {service}
                    </li>
                  ))}
                </ul>
                <a
                  href={`medical-tourism/package/${_package._id}`}
                  className={classNames(
                    'mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold transition-colors duration-300 sm:mt-10',
                    isActive
                      ? 'bg-indigo-500 text-white hover:bg-indigo-400'
                      : 'text-indigo-600 ring-1 ring-indigo-200 hover:bg-gray-900 hover:text-white hover:ring-gray-900/0'
                  )}
                >
                  View Package
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
