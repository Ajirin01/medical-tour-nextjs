'use client'

import { useEffect, useState } from 'react';
import Swiper from 'swiper';
import { fetchData } from '@/utils/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlane, FaStethoscope, FaAmbulance, FaArrowRight, FaRobot, FaUserMd, FaVideo, FaPills, FaClipboardList, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { consult, doctorIcon, medicMask, pngwing1, roboDoc, userIcon } from '@/assets';
import SimpleCarousel from '@/components/gabriel/SimpleCarousel';
import { cards } from '@/data/cards';
import { blogs } from '@/data/blogs';
import { faqItems } from '@/data/faqData';
import { useMediaQuery } from 'react-responsive'; 


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

  const [selectedService, setSelectedService] = useState(null);
  const iconlist = ['Medical Tourism Solutions', 'Medical Equipment', 'Air Ambulance Services'];
  const services = [
    {
      icon: <FaPlane className="text-5xl text-primary-6" />,
      title: "Medical Tourism Solutions",
      description: "Tailored healthcare travel packages for international patients",
      animation: "M10 10 L50 50 L90 10",
    },
    {
      icon: <FaStethoscope className="text-5xl text-primary-6" />,
      title: "Medical Devices and Equipment",
      description: "State-of-the-art medical devices and supplies for healthcare facilities",
      animation: "M10 50 Q50 10 90 50 Q50 90 10 50",
    },
    {
      icon: <FaClipboardList className="text-5xl text-primary-6" />,
      title: "Laboratory Referral Services",
      description: "Streamlined access to advanced diagnostic testing",
      animation: "M10 30 Q50 60 90 30 Q50 0 10 30",
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

  const ServiceCard = ({ icon, title, description, index }) => (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
    >
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-primary-10 text-center mb-2">{title}</h3>
      <p className="text-gray-600 text-center mb-4">{description}</p>
      <div className="flex justify-center space-x-4">
        <button
          className="text-sm"
          onClick={() => console.log(`Consult Doctor for ${title}`)}
        >
          Consult Doctor
        </button>
        <button
          className="text-sm"
          onClick={() => console.log(`Use AI for ${title}`)}
        >
          Use AI
        </button>
      </div>
    </motion.div>
  );
  
  const OptionCard = ({ icon, title, description, buttonText, onClick, color }) => (
    <motion.div
      className={`bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden ${color} text-white`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex justify-center mb-4 text-6xl">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold text-center mb-4">{title}</h3>
      <p className="text-center mb-6">{description}</p>
      <div className="flex justify-center">
        <button
          className="text-lg font-semibold"
          onClick={onClick}
        >
          {buttonText} <FaArrowRight className="ml-2 inline" />
        </button>
      </div>
    </motion.div>
  );
  
  const InteractiveChoice = () => {
    // const navigate = useNavigate();
    const [hoveredOption, setHoveredOption] = useState(null);
    const isMobile = useMediaQuery({ maxWidth: 768 });
    // const dispatch = useDispatch();
  
    const handleChat = () => {
      // dispatch(triggerChatbotAttention());
      // dispatch(openChatBot(true));
    };
  
    const options = [
      {
        name: 'AI',
        image: roboDoc,
        title: 'AI Health Assistant',
        description: 'Get instant health insights powered by advanced AI',
        action: () => handleChat(),
        color: 'bg-cyan-500',
        icon: <FaRobot className="text-4xl" />,
      },
      {
        name: 'Consultant',
        image: consult,
        title: 'Consultant',
        description: 'Connect with experienced healthcare professionals',
        action: () => navigate(PATH.dashboard.consultant),
        color: 'bg-pink-500',
        icon: <FaUserMd className="text-4xl" />,
      },
    ];

    if (!hasMounted) return null;
  
    return (
      <section className="relative bg-gradient-to-br from-[var(--color-primary-8)] mt-8 py-32 px-6 sm:px-8 overflow-hidden flex items-center rounded-3xl mx-4">
        <div className="max-w-5xl mx-auto relative">
          <div className={`flex ${isMobile ? 'flex-col' : 'justify-between'} items-center gap-8`}>
            {options.map((option) => (
              <motion.div
                key={option.name}
                className={`relative ${isMobile ? 'w-64 h-64' : 'w-72 h-72'} rounded-full overflow-hidden cursor-pointer border-4 border-white shadow-lg`}
                whileHover={{ scale: 1.05 }}
                onClick={option.action}
              >
                <motion.img
                  src={option.image.src}
                  alt={option.name}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1 }}
                  animate={{ scale: hoveredOption === option.name ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  onHoverStart={() => setHoveredOption(option.name)}
                  onHoverEnd={() => setHoveredOption(null)}
                >
                  <div className={`${option.color} rounded-full p-4 mb-2`}>
                    {option.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">{option.title}</h3>
                  <p className="text-sm text-center mb-3">{option.description}</p>
                  <button
                    className="text-sm font-semibold"
                    onClick={option.action}
                  >
                    Choose {option.name}
                  </button>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
        {!isMobile && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: hoveredOption === 'AI'
                ? 'radial-gradient(circle at 25% 50%, rgba(0,255,255,0.2) 0%, rgba(0,0,0,0) 50%)'
                : hoveredOption === 'Consultant'
                  ? 'radial-gradient(circle at 75% 50%, rgba(255,105,180,0.2) 0%, rgba(0,0,0,0) 50%)'
                  : 'none'
            }}
            transition={{ duration: 0.5 }}
          />
        )}
      </section>
    );
  };
  
  const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);
  
    const faqs = faqItems
  
    const toggleAccordion = (index) => {
      setActiveIndex(activeIndex === index ? null : index);
    };
  
    return (
      <section className="faq-section py-20 bg-white rounded-3xl mx-4 mt-8 mb-8">
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

  const serviceTitles = ['Free AI Diagnosis', ...services.map(service => service.title)];

  const handleServiceClick = (service) => {
    setSelectedService(service);
    // You can add more logic here, like opening a modal or navigating to a service page
    console.log(`Selected service: ${service}`);
  };

  return (
    <div className='bg-red'>
      {/* <ChatBot /> */}
      <section className="Hero relative min-h-screen bg-gradient-to-br from-[var(--color-primary-6)] to-white transition-colors overflow-hidden flex items-center rounded-3xl">
        <div className="intro-text p-6 sm:p-10 md:pl-20 flex flex-col justify-center items-start text-left w-full max-w-3xl z-10">
          <h1 className="font-extrabold text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
            <span className="bg-gradient-to-r from-white to-[var(--color-secondary-1)] text-transparent bg-clip-text">Step into the next generation</span>
            <span className="text-white block mt-2">Healthcare Services</span>
            <span className="text-[var(--color-secondary-1)] block mt-2">with our</span>
          </h1>
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8">
            {/* <TypewriterEffect words={serviceTitles} typingSpeed={100} erasingSpeed={50} delayBetweenWords={2000} /> */}
          </div>
          {/* <button
            className="transition-all py-8 px-8 duration-300 hover:scale-105 hover:shadow-xl mt-4 text-lg sm:text-xl font-bold relative overflow-hidden group flex items-center justify-center"
            borderRadius='rounded-small'
            border="border-2 border-white rounded-lg"
            background='bg-gradient-to-r from-primary-6 to-primary-8'
            textColor='text-white'
            onClick={() => navigate(PATH.general.signUp)}
          >
            <span className="relative z-10">Sign Up for Free</span>
          </button> */}
        </div>
        <img src={roboDoc.src} alt="robo doctor" className="absolute right-0 bottom-0 w-xs max-w-lg opacity-30 md:opacity-100" />
      </section>

      <section className="services-section py-8 bg-white rounded-3xl mx-4 mt-8">
        <div className="container mx-auto mt-16 px-4">
          <SimpleCarousel items={cards.map(renderServiceCard)} autoplay={true} autoplayInterval={2000} />
          <div className="text-center mt-12">
            <button
              className="py-6 px-8 text-lg mx-auto hover:shadow-lg transition-all duration-300"
              onClick={() => navigate(PATH.general.signUp)}
            >
              Our Consultants
            </button>
          </div>
        </div>
      </section>

      <section className="comprehensive-services py-20 bg-white text-white mb-20 rounded-3xl mx-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Comprehensive Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-center mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-primary-10 text-center mb-2">{service.title}</h3>
                <p className="text-gray-600 text-center">{service.description}</p>
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

      <InteractiveChoice />

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

      <section className="become-specialist py-20 bg-[var(--color-primary-9)] text-white rounded-3xl mx-4 mt-8 mb-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Become One of Our Specialists</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join our team of expert specialists and help us deliver cutting-edge healthcare services.</p>
          <button
            className="py-3 px-8 text-lg hover:shadow-lg mx-auto transition-all duration-300"
            onClick={() => navigate(PATH.general.doctorSignUp)}
          >
            Apply Now
          </button>
        </div>
      </section>
    </div>
  );
}
