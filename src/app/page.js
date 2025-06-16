'use client'

import { useEffect, useState } from 'react';
import Swiper from 'swiper';
import { fetchData } from '@/utils/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import LottieImage from '@/components/LottieBackground';
import { 
  FaPlane, 
  FaStethoscope, 
  FaAmbulance, 
  FaArrowRight, 
  FaRobot, 
  FaUserMd, 
  FaVideo, 
  FaPills,
  FaClipboardList, 
  FaChevronDown, 
  FaChevronUp, 
  FaHeartbeat,  
  FaComments, 
  FaFileMedicalAlt,
  FaChild, 
  FaBrain, 
  FaPhoneAlt  } from 'react-icons/fa';

import { 
  consult, 
  doctorIcon, 
  medicMask, 
  pngwing1, 
  roboDoc,
  aidoc,
  userIcon } from '@/assets';
import SimpleCarousel from '@/components/gabriel/SimpleCarousel';
import Button from '@/components/gabriel/Button';
import { cards } from '@/data/cards';
import { blogs } from '@/data/blogs';
import { faqItems } from '@/data/faqData';
import { useMediaQuery } from 'react-responsive'; 
import TypewriterEffect from '@/components/gabriel/TypewriterEffect';
import { useRouter } from 'next/navigation';
import { openChatBot, triggerChatbotAttention } from '@/store/popUpSlice';

import { useDispatch } from 'react-redux';


function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [packages, setPackages] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const dispatch = useDispatch()

  const router = useRouter()

  const [selectedService, setSelectedService] = useState(null);
  // const iconlist = ['Medical Tourism Solutions', 'Medical Equipment', 'Air Ambulance Services'];
  const iconlist = ['Medical Tourism Solutions', 'Medical Equipment', 'Air Ambulance Services'];

  const services = [
    {
      icon: <FaHeartbeat className="text-5xl text-[var(--color-primary-6)]" />,
      title: "Free Symptoms Checker",
      description: "Utilize our advanced self-assessment tools to quickly and accurately identify possible health concerns based on your symptoms, helping you make informed decisions about your next steps.",
      animation: "M10 10 L50 50 L90 10",
      link: "ai"
    },
    {
      icon: <FaComments className="text-5xl text-[var(--color-primary-6)]" />,
      title: "Real-time Medical Consultation",
      description: "Connect instantly with licensed healthcare professionals through secure video or chat, receiving expert medical advice, diagnosis, and personalized treatment recommendations anytime, anywhere.",
      animation: "M10 50 Q50 10 90 50 Q50 90 10 50",
      link: "/admin/available-specialists"
    },
    {
      icon: <FaFileMedicalAlt className="text-5xl text-[var(--color-primary-6)]" />,
      title: "Medical Certificates and Referral Letters",
      description: "Easily obtain official medical certificates, referral letters, and other important documentation from certified doctors to support your health, employment, or insurance needs without unnecessary delays.",
      animation: "M10 30 Q50 60 90 30 Q50 0 10 30",
      link: "/cert"
    },
  ];  

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function fetchGalleries() {
      try {
        const data = await fetchData('galleries/get-all/no-pagination');
        setGalleries(data || []);
        console.log(data)
      } catch (error) {
        console.error('Failed to fetch galleries:', error);
      }
    }

    async function fetchHospitals() {
      try {
        const data = await fetchData('hospitals');
        setHospitals(data.data || []);
        console.log(data.data)
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
      }
    }

    async function fetchDoctors() {
      try {
        const data = await fetchData('users/get-all/doctors/no-pagination');
        setSpecialists(data || []);
        console.log("doctors", data)
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      }
    }

    async function fetchPackages() {
      try {
        const data = await fetchData('tour/get-all/no-pagination');
        setPackages(data);
        console.log(data)
      } catch (error) {
        console.error('Failed to fetch packages:', error);
      }
    }

    fetchDoctors();
    fetchGalleries();
    fetchHospitals();
    fetchPackages();
  }, []);

  const handleChat = () => {
    dispatch(triggerChatbotAttention());
    dispatch(openChatBot(true));
  };
  
  const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);
  
    const faqs = faqItems
  
    const toggleAccordion = (index) => {
      setActiveIndex(activeIndex === index ? null : index);
    };
  
    return (
      <section className="relative faq-section py-20 bg-white rounded-3xl mx-4 mt-8 mb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-primary-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-gray-50 rounded-2xl overflow-hidden shadow-md"
              >
                <button
                  className="w-full p-6 flex justify-between items-center text-left focus:outline-none"
                  onClick={() => toggleAccordion(index)}
                >
                  <h3 className="text-lg font-semibold text-primary-9">{faq.question}</h3>
                  {activeIndex === index ? 
                    <FaChevronUp className="text-secondary-6" /> : 
                    <FaChevronDown className="text-secondary-6" />
                  }
                </button>
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-gray-600">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderServiceCard = (card) => (
    <div key={card.id} className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
      <div className="relative h-48">
        <img src={card.image.src} alt={card.content} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <h3 className="text-white font-bold text-xl p-4">{card.content}</h3>
        </div>
      </div>
    </div>
  );

  const renderBlogPost = (blog) => (
    <div key={blog.id} className="w-full">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[320px] flex flex-col">
        <img src={blog.image} alt={blog.title} className="w-full h-40 object-cover" />
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-lg mb-2 text-primary-10 line-clamp-2">{blog.title}</h3>
          <p className="text-gray-600 text-sm mb-2 flex-grow overflow-hidden line-clamp-2">{blog.content}</p>
          <Link href={ `${blog.link}` } className="text-secondary-6 font-semibold hover:underline inline-flex items-center mt-auto">
            Read More <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );

  const serviceTitles = ['Free Symptoms Checker', ...services.map(service => service.title)];

  const handleServiceClick = (service) => {
    setSelectedService(service);
    // You can add more logic here, like opening a modal or navigating to a service page
    console.log(`Selected service: ${service}`);
  };

  return (
    <div className='px-4'>
      {/* <ChatBot /> */}
      <section className="Hero relative min-h-screen bg-gradient-to-b from-[var(--color-primary-6)] to-white transition-colors overflow-hidden flex items-center rounded-3xl">
        <div className="intro-text p-6 sm:p-10 md:pl-20 flex flex-col justify-center items-start text-left w-full max-w-4xl z-10">
          <h2 className="font-extrabold text-4xl md:text-5xl lg:text-6xl  mb-6">
            <span className="bg-gradient-to-r from-white to-[var(--color-secondary-1)] text-transparent bg-clip-text">Step into the next generation</span>
            <span className="text-white block mt-2">Healthcare Services</span>
            <span className="text-[var(--color-secondary-1)] block mt-2">with our</span>
          </h2>
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8">
            <TypewriterEffect words={serviceTitles} typingSpeed={100} erasingSpeed={50} delayBetweenWords={2000} />
          </div>
          <Button
            className="transition-all py-8 px-8 duration-300 hover:scale-105 hover:shadow-xl mt-4 text-lg sm:text-xl font-bold relative overflow-hidden group flex items-center justify-center"
            borderRadius='rounded-small'
            border="border-2 border-white rounded-lg"
            background='bg-gradient-to-r from-[var(--color-primary-6)] to-[var(--color-primary-8)]'
            textColor='text-white'
            onClick={() => router.push('/auth/sign-up')}
          >
            <span className="relative z-10">Sign Up for Free</span>
          </Button> 
        </div>
        <img src={aidoc.src} alt="robo doctor" className="absolute right-0 bottom-0 w-lg max-w-lg opacity-30 md:opacity-100" />
      </section>

      <section className="services-section py-8 bg-white rounded-3xl mx-4 mt-8">
        <div className="container mx-auto mt-16 px-4">
          <SimpleCarousel items={cards.map(renderServiceCard)} autoplay={true} autoplayInterval={2000} />
          <div className="text-center mt-12">
            <Button
              className="py-6 px-8 text-lg mx-auto hover:shadow-lg transition-all duration-300"
              borderRadius="rounded-full"
              background="bg-[var(--color-secondary-6)]"
              textColor="text-white"
              onClick={() => router.push('/doctors')}
            >
              Our Consultants
            </Button>
          </div>
        </div>
      </section>


      <section className="relative comprehensive-services py-20 bg-white text-white mb-20 rounded-3xl mx-4 mt-8 overflow-hidden">
        {/* Lottie Background */}
        <div className="absolute inset-0 w-full opacity-5 h-full z-15">
          <LottieImage
            src="/background.json"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-[var(--color-primary-7)] text-3xl md:text-4xl font-bold text-center mb-12">
            Our Comprehensive Services
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden flex flex-col justify-between"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div>
                  <div className="flex justify-center mb-4">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--color-primary-10)] text-center mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-center">{service.description}</p>
                </div>

                <button
                  onClick={() =>
                    service.link === "ai" ? handleChat() : (window.location.href = service.link)
                  }
                  className="mt-6 w-full py-2 px-4 bg-[var(--color-primary-6)] text-white rounded-xl hover:bg-[var(--color-primary-7)] transition"
                >
                  Get Started
                </button>

                <motion.svg
                  className="absolute bottom-0 left-0 w-full h-12 text-primary-1 opacity-10"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d={service.animation}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  />
                </motion.svg>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

       <section className="bg-[var(--color-primary-9)] py-16 px-6 lg:px-20 mx-0 text-white">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">
          Secure Online Video call with Irish Registered Doctors
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          
          {/* Card 1 */}
          <div className="border border-white rounded-lg p-6 flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center text-orange-400 text-6xl pr-2">
              <FaHeartbeat />
            </div>
            <div className="border-l-2 border-white px-6">
              <h3 className="font-bold text-lg">GP Consultation</h3>
              <p className="text-sm mt-1 text-white/90">
                Obtain accurate diagnoses and treatment plans specifically tailored to your health concerns.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="border border-white rounded-lg p-6 flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center text-orange-400 text-5xl pr-2">
              <FaChild />
            </div>
            <div className="border-l-2 border-white px-6">
              <h3 className="font-bold text-lg">Children Consultation</h3>
              <p className="text-sm mt-1 text-white/90">
                Connect with experienced paediatric professionals to get medical advice for your child.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="border border-white rounded-lg p-6 flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center text-orange-400 text-5xl pr-2">
              <FaBrain />
            </div>
            <div className="border-l-2 border-white px-6">
              <h3 className="font-bold text-lg">Same Day Appointment</h3>
              <p className="text-sm mt-1 text-white/90">
                Receive accurate assessments, and develop personalised treatment plans.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="border border-white rounded-lg p-6 flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center text-orange-400 text-5xl pr-2">
              <FaUserMd />
            </div>
            <div className="border-l-2 border-white px-6">
              <h3 className="font-bold text-lg">Primary Dermatology Consultation</h3>
              <p className="text-sm mt-1 text-white/90">
                Receive comprehensive care for your skin health needs, including acne and other infections.
              </p>
            </div>
          </div>

          {/* Card 5 */}
          <div className="border border-white rounded-lg p-6 flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center text-orange-400 text-5xl pr-2">
              <FaPhoneAlt />
            </div>
            <div className="border-l-2 border-white px-6">
              <h3 className="font-bold text-lg">Urgent Consultation</h3>
              <p className="text-sm mt-1 text-white/90">
                Get experienced GP opinion promptly for your emergent medical situations.
              </p>
            </div>
          </div>

          {/* Card 6 */}
          <div className="border border-white rounded-lg p-6 flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center text-orange-400 text-5xl pr-2">
              <FaClipboardList />
            </div>
            <div className="border-l-2 border-white px-6">
              <h3 className="font-bold text-lg">Sick Leave Consultation</h3>
              <p className="text-sm mt-1 text-white/90">
                Create a customised plan for a successful return to work through expert advice.
              </p>
            </div>
          </div>

        </div>
      </section>


      <section className="relative comprehensive-services py-20 bg-white text-white mb-20 rounded-3xl mx-4 mt-8 overflow-hidden">
        {/* Lottie Background */}
        <div className="absolute inset-0 w-full  h-full z-10">
          <LottieImage
            src="/background.json"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-15">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
            Sozo DigiCare has designed a streamlined, user-friendly and secure process for your Video or Phone Consultation. Here’s how it works, simplified into three easy steps:
          </p>

          <div className="relative max-w-6xl mx-auto z-10">
            {/* Arrows between steps */}
            <div className="hidden md:block absolute top-5 left-[20%] w-[25%] pointer-events-none z-0">
              <svg className="w-full h-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,10 C30,0 70,20 100,10" stroke="#F59E0B" strokeWidth="2" fill="none" strokeDasharray="4,4" markerEnd="url(#arrowhead1)" />
                <defs>
                  <marker id="arrowhead1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#F59E0B" />
                  </marker>
                </defs>
              </svg>
            </div>

            <div className="hidden md:block absolute top-5 left-[55%] w-[25%] pointer-events-none z-0">
              <svg className="w-full h-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,10 C30,0 70,20 100,10" stroke="#F59E0B" strokeWidth="2" fill="none" strokeDasharray="4,4" markerEnd="url(#arrowhead2)" />
                <defs>
                  <marker id="arrowhead2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#F59E0B" />
                  </marker>
                </defs>
              </svg>
            </div>

            {/* Steps */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-12">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center w-full md:w-1/3 relative z-10">
                <div className="bg-blue-900 text-orange-500 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-lg">
                  1
                </div>
                <h3 className="text-xl text-gray-600 font-semibold mt-4">Book an Appointment</h3>
                <p className="text-gray-600 mt-2">Choose your service and fill out your details.</p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center w-full md:w-1/3 relative z-10">
                <div className="bg-blue-900 text-orange-500 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-lg">
                  2
                </div>
                <h3 className="text-xl text-gray-600 font-semibold mt-4">Receive a Confirmation</h3>
                <p className="text-gray-600 mt-2">Get an email confirming your appointment.</p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center w-full md:w-1/3 relative z-10">
                <div className="bg-blue-900 text-orange-500 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-lg">
                  3
                </div>
                <h3 className="text-xl text-gray-600 font-semibold mt-4">Get a Consultation</h3>
                <p className="text-gray-600 mt-2">Talk with our doctor at the scheduled time.</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-12">
            <a href="#" className="bg-blue-900 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-blue-800 transition inline-flex items-center">
              Book an Appointment
            </a>
          </div>
        </div>
      </section>

      {/* <InteractiveChoice /> */}
      <section className="relative become-specialist py-20 bg-[var(--color-primary-9)] text-white rounded-3xl mx-4 mt-8 mb-8">
        <Image
            src="/images/health.gif"
            alt="Background Overlay"
            fill
            className="object-cover opacity-10 pointer-events-none z-0"
          />
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Become One of Our Specialists</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join our team of expert specialists and help us deliver cutting-edge healthcare services.</p>
          <Button
            className="py-3 px-8 text-lg hover:shadow-lg mx-auto transition-all duration-300"
            borderRadius='rounded-full'
            background={'bg-[var(--color-secondary-6)]'}
            textColor='text-white'
            onClick={() => router.push("/auth/sign-up?role=specialist")}
          >
            Apply Now
          </Button>
        </div>
      </section>

      <section className='py-20 bg-gray-50 rounded-3xl mx-4 mt-8'>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-primary-10">Latest Blog Posts</h2>
          <SimpleCarousel items={blogs.map(renderBlogPost)} autoplay={true} autoplayInterval={7000} />
          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center text-secondary-6 font-semibold text-lg hover:underline"
            >
              View All Posts <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <FAQ />

      
    </div>
  );
}
