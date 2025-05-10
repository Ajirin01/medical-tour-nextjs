'use client'

import '/aos.css'; // Import AOS styles
import AOS from 'aos';
import { useEffect, useState } from 'react';
import Swiper from 'swiper';
import { fetchData } from '@/utils/api';
import Link from 'next/link';
import Footer from '@/components/Footer';
import FaqSection from '@/components/FAQs';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [packages, setPackages] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setActiveTab(1);
    setIsClient(true);
    AOS.init();
  }, []);

  useEffect(() => {
    const swiper = new Swiper('.init-swiper', {
      loop: true,
      speed: 600,
      autoplay: {
        delay: 5000,
      },
      slidesPerView: 'auto',
      centeredSlides: true,
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true,
      },
      breakpoints: {
        320: { slidesPerView: 1, spaceBetween: 0 },
        768: { slidesPerView: 3, spaceBetween: 20 },
        1200: { slidesPerView: 5, spaceBetween: 20 },
      },
    });

    return () => swiper.destroy();
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

  if (!isClient) return <div>Loading...</div>;

  return (
    <>
      {/* Now paste the homepage HTML structure here */}
      <main className="main">

        {/* <!-- Hero Section  */}
        <section id="hero" className="hero section">

        <div id="hero-carousel" className="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="5000">

          <div className="carousel-item active">
            <img src="assets/img/hero-carousel/hero-carousel-1.jpg" alt="Healthcare Consultation" />
            <div className="container">
              <h2>Welcome to SozoDigiCare</h2>
              <p>Breaking barriers in healthcare access worldwide, SozoDigiCare connects individuals with the urgent medical care they need, promoting global health equity and better outcomes for all.</p>
              <a href="#about" className="btn-get-started">Learn More</a>
            </div>
          </div>{/* <!-- End Carousel Item  */}

          <div className="carousel-item">
            <img src="assets/img/hero-carousel/hero-carousel-2.jpg" alt="Medical Tourism" />
            <div className="container">
              <h2>Global Healthcare Access</h2>
              <p>We bridge geographical, bureaucratic, and financial barriers, offering timely medical consultations and expert care, regardless of where you are in the world.</p>
              <a href="#about" className="btn-get-started">Learn More</a>
            </div>
          </div>{/* <!-- End Carousel Item  */}

          <div className="carousel-item">
            <img src="assets/img/hero-carousel/hero-carousel-3.jpg" alt="Expert Medical Care" />
            <div className="container">
              <h2>Your Health, Our Priority</h2>
              <p>Our diverse team of medical experts and support professionals ensures that you receive immediate attention, no matter your location or financial situation.</p>
              <a href="#about" className="btn-get-started">Learn More</a>
            </div>
          </div>{/* <!-- End Carousel Item  */}

          <a className="carousel-control-prev" href="#hero-carousel" role="button" data-bs-slide="prev">
            <span className="carousel-control-prev-icon bi bi-chevron-left" aria-hidden="true"></span>
          </a>

          <a className="carousel-control-next" href="#hero-carousel" role="button" data-bs-slide="next">
            <span className="carousel-control-next-icon bi bi-chevron-right" aria-hidden="true"></span>
          </a>

          <ol className="carousel-indicators"></ol>

        </div>

        </section>{/* <!-- /Hero Section  */}


        {/* <!-- Featured Services Section  */}
        <section id="featured-services" className="featured-services section">

        <div className="container">

          <div className="row gy-4">

            <div className="col-xl-3 col-md-6 d-flex" data-aos="fade-up" data-aos-delay="100">
              <div className="service-item position-relative">
                <div className="icon"><i className="fas fa-user-md icon"></i></div>
                <h4><a href="" className="stretched-link">Expert Medical Consultations</a></h4>
                <p>Access top-tier medical professionals from various specialties for consultations, diagnosis, and advice, no matter where you are.</p>
              </div>
            </div>{/* <!-- End Service Item  */}

            <div className="col-xl-3 col-md-6 d-flex" data-aos="fade-up" data-aos-delay="200">
              <div className="service-item position-relative">
                <div className="icon"><i className="fas fa-hospital-alt icon"></i></div>
                <h4><a href="" className="stretched-link">Medical Tourism</a></h4>
                <p>Plan and coordinate your medical tourism journey with the help of our comprehensive services, including travel and accommodations.</p>
              </div>
            </div>{/* <!-- End Service Item  */}

            <div className="col-xl-3 col-md-6 d-flex" data-aos="fade-up" data-aos-delay="300">
              <div className="service-item position-relative">
                <div className="icon"><i className="fas fa-stethoscope icon"></i></div>
                <h4><a href="" className="stretched-link">Remote Health Monitoring</a></h4>
                <p>Stay on top of your health with our remote monitoring services, offering ongoing care and health tracking through digital tools.</p>
              </div>
            </div>{/* <!-- End Service Item  */}

            <div className="col-xl-3 col-md-6 d-flex" data-aos="fade-up" data-aos-delay="400">
              <div className="service-item position-relative">
                <div className="icon"><i className="fas fa-pills icon"></i></div>
                <h4><a href="" className="stretched-link">Affordable Medication</a></h4>
                <p>Get access to necessary medications at affordable rates through our partnered pharmacies and healthcare providers.</p>
              </div>
            </div>{/* <!-- End Service Item  */}

          </div>

        </div>

        </section>{/* <!-- /Featured Services Section  */}

        {/* <!-- Call To Action Section  */}
        <section id="call-to-action" className="call-to-action section accent-background">

        <div className="container">
          <div className="row justify-content-center" data-aos="zoom-in" data-aos-delay="100">
            <div className="col-xl-10">
              <div className="text-center">
                <h3>Need Immediate Medical Attention?</h3>
                <p>If you're facing a medical emergency or need urgent care, don't wait. SozoDigiCare connects you with the right medical experts immediately to ensure you get the care you deserve, wherever you are.</p>
                <Link className="cta-btn" href="/consultation/book">Connect with a Doctor Now</Link>
              </div>
            </div>
          </div>
        </div>

        </section>{/* <!-- /Call To Action Section  */}


        {/* <!-- About Section  */}
        <section id="about" className="about section">

        {/* <!-- Section Title  */}
        <div className="container section-title" data-aos="fade-up">
          <h2>About SozoDigiCare<br/></h2>
          <p>Bridging the healthcare gap for a healthier, more equitable world.</p>
        </div>{/* <!-- End Section Title  */}

        <div className="container">

          <div className="row gy-4">
            <div className="col-lg-6 position-relative align-self-start" data-aos="fade-up" data-aos-delay="100">
              <img src="assets/img/about.jpg" className="img-fluid" alt="" />
              {/* Optionally, add a video link if needed */}
              <a href="https://www.youtube.com/watch?v=Y7f98aduVJ8" className="glightbox pulsating-play-btn"></a>
            </div>
            <div className="col-lg-6 content" data-aos="fade-up" data-aos-delay="200">
              <h3>Empowering Global Health Equity</h3>
              <p className="fst-italic">
                SozoDigiCare aims to overcome geographic, bureaucratic, and financial barriers to healthcare, ensuring immediate access to world-class medical expertise for individuals in need.
              </p>
              <ul>
                <li><i className="bi bi-check2-all"></i> <span>Breaking down barriers to timely healthcare access.</span></li>
                <li><i className="bi bi-check2-all"></i> <span>Connecting patients to a network of global medical professionals.</span></li>
                <li><i className="bi bi-check2-all"></i> <span>Ensuring care delivery in emergency and routine medical situations.</span></li>
              </ul>
              <p>
                At SozoDigiCare, we believe in a future where healthcare is accessible to all, regardless of their circumstances. Our mission is to provide essential healthcare services through a seamless and immediate connection to medical professionals, ensuring better health outcomes for marginalized communities worldwide.
              </p>

              <div className="flex justify-center mt-8">
                <Link
                  className="cta-btn px-6 py-3 rounded-full text-white font-semibold bg-cyan-600 hover:bg-cyan-700 shadow-lg border-2 border-cyan-400 hover:shadow-cyan-500/50 transition-all duration-300 animate-pulse"
                  href="/auth/sign-up?role=specialist"
                >
                  Join Our Medical Experts today
                </Link>
              </div>


            </div>
          </div>

        </div>

        </section>{/* <!-- /About Section  */}


        {/* <!-- Stats Section  */}
        <section id="stats" className="stats section">

          <div className="container" data-aos="fade-up" data-aos-delay="100">

            <div className="row gy-4">

              <div className="col-lg-3 col-md-6">
                <div className="stats-item d-flex align-items-center w-100 h-100">
                  <i className="fas fa-user-md flex-shrink-0"></i>
                  <div>
                    <span data-purecounter-start="0" data-purecounter-end="25" data-purecounter-duration="1" className="purecounter"></span>
                    <p>Doctors</p>
                  </div>
                </div>
              </div>{/* <!-- End Stats Item  */}

              <div className="col-lg-3 col-md-6">
                <div className="stats-item d-flex align-items-center w-100 h-100">
                  <i className="far fa-hospital flex-shrink-0"></i>
                  <div>
                    <span data-purecounter-start="0" data-purecounter-end="15" data-purecounter-duration="1" className="purecounter"></span>
                    <p>Departments</p>
                  </div>
                </div>
              </div>{/* <!-- End Stats Item  */}

              <div className="col-lg-3 col-md-6">
                <div className="stats-item d-flex align-items-center w-100 h-100">
                  <i className="fas fa-flask flex-shrink-0"></i>
                  <div>
                    <span data-purecounter-start="0" data-purecounter-end="8" data-purecounter-duration="1" className="purecounter"></span>
                    <p>Research Labs</p>
                  </div>
                </div>
              </div>{/* <!-- End Stats Item  */}

              <div className="col-lg-3 col-md-6">
                <div className="stats-item d-flex align-items-center w-100 h-100">
                  <i className="fas fa-award flex-shrink-0"></i>
                  <div>
                    <span data-purecounter-start="0" data-purecounter-end="150" data-purecounter-duration="1" className="purecounter"></span>
                    <p>Awards</p>
                  </div>
                </div>
              </div>{/* <!-- End Stats Item  */}

            </div>

          </div>

        </section>{/* <!-- /Stats Section  */}

        {/* <!-- Features Section  */}
        <section id="features" className="features section">

        <div className="container">

          <div className="row justify-content-around gy-4">
            <div className="features-image col-lg-6" data-aos="fade-up" data-aos-delay="100"><img src="assets/img/features.jpg" alt="" /></div>

            <div className="col-lg-5 d-flex flex-column justify-content-center" data-aos="fade-up" data-aos-delay="200">
              <h3>Connecting You to World-Class Healthcare</h3>
              <p>At SozoDigiCare, we provide you with seamless access to essential healthcare services through a global network of medical professionals. We bridge the gap between patients and the healthcare they need, no matter their location or circumstances.</p>

              <div className="icon-box d-flex position-relative" data-aos="fade-up" data-aos-delay="300">
                <i className="fa-solid fa-hand-holding-medical flex-shrink-0"></i>
                <div>
                  <h4><a href="" className="stretched-link">Immediate Medical Support</a></h4>
                  <p>Access to urgent care with a click, ensuring you never have to wait for life-saving medical attention.</p>
                </div>
              </div>{/* <!-- End Icon Box  */}

              <div className="icon-box d-flex position-relative" data-aos="fade-up" data-aos-delay="400">
                <i className="fa-solid fa-suitcase-medical flex-shrink-0"></i>
                <div>
                  <h4><a href="" className="stretched-link">Expert Medical Professionals</a></h4>
                  <p>Connect with certified medical experts who are ready to provide world-class consultation and care.</p>
                </div>
              </div>{/* <!-- End Icon Box  */}

              <div className="icon-box d-flex position-relative" data-aos="fade-up" data-aos-delay="500">
                <i className="fa-solid fa-staff-snake flex-shrink-0"></i>
                <div>
                  <h4><a href="" className="stretched-link">Global Network</a></h4>
                  <p>Breaking down geographical barriers, our extensive global network ensures you get the best care, regardless of your location.</p>
                </div>
              </div>{/* <!-- End Icon Box  */}

              <div className="icon-box d-flex position-relative" data-aos="fade-up" data-aos-delay="600">
                <i className="fa-solid fa-lungs flex-shrink-0"></i>
                <div>
                  <h4><a href="" className="stretched-link">Comprehensive Healthcare Services</a></h4>
                  <p>From routine checkups to emergency interventions, we offer a full range of services designed to meet your needs.</p>
                </div>
              </div>{/* <!-- End Icon Box  */}

            </div>
          </div>

        </div>

        </section>{/* <!-- /Features Section  */}

        {/* <!-- Services Section  */}
        <section id="services" className="services section">

        {/* <!-- Section Title  */}
        <div className="container section-title" data-aos="fade-up">
          <h2>Our Services</h2>
          <p>Bringing you world-class healthcare services with a focus on immediate access and comprehensive care.</p>
        </div>{/* <!-- End Section Title  */}

        <div className="container">

          <div className="row gy-4">

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="service-item position-relative">
                <div className="icon">
                  <i className="fas fa-heartbeat"></i>
                </div>
                <a href="#" className="stretched-link">
                  <h3>Immediate Medical Support</h3>
                </a>
                <p>Get emergency medical assistance with just a click, ensuring you never wait for urgent care.</p>
              </div>
            </div>{/* <!-- End Service Item  */}

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="service-item position-relative">
                <div className="icon">
                  <i className="fas fa-pills"></i>
                </div>
                <a href="/pharmacy" className="stretched-link">
                  <h3>Online Drug Store</h3>
                </a>
                <p>Access prescription medications and over-the-counter drugs with the convenience of online ordering.</p>
              </div>
            </div>{/* <!-- End Service Item  */}

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="300">
              <div className="service-item position-relative">
                <div className="icon">
                  <i className="fas fa-hospital-user"></i>
                </div>
                <a href="#" className="stretched-link">
                  <h3>Expert Medical Consultation</h3>
                </a>
                <p>Consult with experienced medical professionals from around the world, regardless of your location.</p>
              </div>
            </div>{/* <!-- End Service Item  */}

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="400">
              <div className="service-item position-relative">
                <div className="icon">
                  <i className="fas fa-dna"></i>
                </div>
                <a href="/laboratory" className="stretched-link">
                  <h3>Lab Services</h3>
                </a>
                <p>Access diagnostic tests and lab services with prompt results to support your medical needs.</p>
              </div>
            </div>{/* <!-- End Service Item  */}

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="500">
              <div className="service-item position-relative">
                <div className="icon">
                  <i className="fas fa-wheelchair"></i>
                </div>
                <a href="#" className="stretched-link">
                  <h3>Healthcare for Mobility</h3>
                </a>
                <p>Specialized services for patients requiring mobility support, including equipment and care assistance.</p>
              </div>
            </div>{/* <!-- End Service Item  */}

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="600">
              <div className="service-item position-relative">
                <div className="icon">
                  <i className="fas fa-notes-medical"></i>
                </div>
                <a href="#" className="stretched-link">
                  <h3>Medical Documentation</h3>
                </a>
                <p>Efficient medical record management, ensuring you always have access to your health history when you need it.</p>
              </div>
            </div>{/* <!-- End Service Item  */}

          </div>

        </div>

        </section>{/* <!-- /Services Section  */}
       

        {/* <!-- Tabs Section  */}
        <section id="treatments" className="tabs section">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row">
              <div className="col-lg-3">
                <ul className="nav nav-tabs flex-column" role="tablist">
                  {["Cardiology", "Neurology", "Hepatology", "Pediatrics", "Ophthalmologists"].map((department, index) => (
                    <li key={index} className="nav-item" role="presentation">
                      <a
                        className={`nav-link ${activeTab === index + 1 ? 'active show' : ''}`}
                        data-bs-toggle="tab"
                        href={`#tabs-tab-${index + 1}`}
                        aria-selected={activeTab === index + 1 ? 'true' : 'false'}
                        role="tab"
                        onClick={() => setActiveTab(index + 1)}
                      >
                        {department}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-lg-9 mt-4 mt-lg-0">
                <div className="tab-content">
                  {["Cardiology", "Neurology", "Hepatology", "Pediatrics", "Ophthalmologists"].map((department, index) => (
                    <div
                      key={index}
                      className={`tab-pane ${activeTab === index + 1 ? 'active show' : ''}`}
                      id={`tabs-tab-${index + 1}`}
                    >
                      <div className="row">
                        <div className="col-lg-8 details order-2 order-lg-1">
                          <h3>{department}</h3>
                          <p className="fst-italic">
                            {department === "Cardiology" && "Cardiology focuses on diagnosing and treating heart conditions..."}
                            {department === "Neurology" && "Neurology deals with the diagnosis and treatment of disorders..."}
                            {department === "Hepatology" && "Hepatology specializes in the care of patients with liver diseases..."}
                            {department === "Pediatrics" && "Pediatrics provides care for children, from infancy to adolescence..."}
                            {department === "Ophthalmologists" && "Ophthalmology is focused on diagnosing and treating eye conditions..."}
                          </p>
                        </div>
                        <div className="col-lg-4 text-center order-1 order-lg-2">
                          <img
                            src={`assets/img/departments-${index + 1}.jpg`}
                            alt={department}
                            className="img-fluid"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>{/* <!-- /Tabs Section */}


        {/* <!-- Testimonials Section  */}
        <section id="testimonials" className="testimonials section">
          {/* Section Title */}
          <div className="container section-title" data-aos="fade-up">
            <h2>Testimonials</h2>
            <p>What our clients say about us</p>
          </div>

          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="swiper testimonials-swiper">
              <div className="swiper-wrapper">
                {/* Testimonial Item 1 */}
                <div className="swiper-slide">
                  <div className="testimonial-item">
                    <p>
                      <i className="bi bi-quote quote-icon-left"></i>
                      <span>
                        "The service provided by SozoDigiCare was exceptional. The booking process was smooth, and the consultation was thorough and highly professional. I feel well cared for and informed about my health options." - Michael Thompson
                      </span>
                      <i className="bi bi-quote quote-icon-right"></i>
                    </p>
                    <img src="assets/img/testimonials/testimonials-1.jpg" className="testimonial-img" alt="Michael Thompson" />
                    <h3>Michael Thompson</h3>
                    <h4>Business Executive</h4>
                  </div>
                </div>
                {/* Testimonial Item 2 */}
                <div className="swiper-slide">
                  <div className="testimonial-item">
                    <p>
                      <i className="bi bi-quote quote-icon-left"></i>
                      <span>
                        "I had the most comfortable experience with SozoDigiCare. Their team was very understanding and professional. They provided me with the best options, and I’m now well on my way to recovery." - Linda Roberts
                      </span>
                      <i className="bi bi-quote quote-icon-right"></i>
                    </p>
                    <img src="assets/img/testimonials/testimonials-2.jpg" className="testimonial-img" alt="Linda Roberts" />
                    <h3>Linda Roberts</h3>
                    <h4>Teacher</h4>
                  </div>
                </div>
                {/* Testimonial Item 3 */}
                <div className="swiper-slide">
                  <div className="testimonial-item">
                    <p>
                      <i className="bi bi-quote quote-icon-left"></i>
                      <span>
                        "The medical staff at SozoDigiCare were incredibly supportive. They helped me through every step of my treatment, and their telemedicine services made it easy for me to access care, even from home." - David Green
                      </span>
                      <i className="bi bi-quote quote-icon-right"></i>
                    </p>
                    <img src="assets/img/testimonials/testimonials-3.jpg" className="testimonial-img" alt="David Green" />
                    <h3>David Green</h3>
                    <h4>Software Engineer</h4>
                  </div>
                </div>
                {/* Testimonial Item 4 */}
                <div className="swiper-slide">
                  <div className="testimonial-item">
                    <p>
                      <i className="bi bi-quote quote-icon-left"></i>
                      <span>
                        "SozoDigiCare’s team was very caring and attentive. I felt like I was in good hands throughout my entire consultation. I highly recommend them for anyone in need of quality healthcare." - Emily Davis
                      </span>
                      <i className="bi bi-quote quote-icon-right"></i>
                    </p>
                    <img src="assets/img/testimonials/testimonials-4.jpg" className="testimonial-img" alt="Emily Davis" />
                    <h3>Emily Davis</h3>
                    <h4>Freelancer</h4>
                  </div>
                </div>
                {/* Testimonial Item 5 */}
                <div className="swiper-slide">
                  <div className="testimonial-item">
                    <p>
                      <i className="bi bi-quote quote-icon-left"></i>
                      <span>
                        "My experience with SozoDigiCare has been wonderful. They have a user-friendly platform, and the medical professionals are top-notch. The whole process was seamless, and I felt well-supported." - John Wilson
                      </span>
                      <i className="bi bi-quote quote-icon-right"></i>
                    </p>
                    <img src="assets/img/testimonials/testimonials-5.jpg" className="testimonial-img" alt="John Wilson" />
                    <h3>John Wilson</h3>
                    <h4>Entrepreneur</h4>
                  </div>
                </div>
              </div>
              <div className="swiper-pagination"></div>
            </div>
          </div>
        </section>
        {/* <!-- /Testimonials Section */}


        {/* <!-- Doctors Section  */}
        <section id="doctors" className="doctors section light-background">

        {/* <!-- Section Title  */}
        <div className="container section-title" data-aos="fade-up">
          <h2>Meet Our Doctors</h2>
          <p>Our team of dedicated healthcare professionals are here to support your journey to better health.</p>
        </div>{/* <!-- End Section Title  */}

        <div className="container">
          <div className="row gy-4">
            {specialists.map((spec, idx) => (
              <div
                className="col-lg-3 col-md-6 d-flex align-items-stretch"
                data-aos="fade-up"
                data-aos-delay={100 * (idx + 1)}
                key={spec._id}
              >
                <div className="team-member">
                  <div className="member-img">
                    <img
                      src={
                        spec.profileImage
                          ? `${process.env.NEXT_PUBLIC_NODE_BASE_URL}${spec.profileImage}`
                          : spec.gender === "female"
                            ? "/images/placeholder-female.jpg"
                            : "/images/placeholder-male.jpg"
                      }
                      className="img-fluid"
                      alt={`${spec.firstName} ${spec.lastName}`}
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = spec.gender === "female"
                          ? "/images/placeholder-female.jpg"
                          : "/images/placeholder-male.jpg";
                      }}
                    />
                  </div>
                  <div className="member-info">
                    <h4>{`Dr. ${spec.firstName} ${spec.lastName}`}</h4>
                    <span>{spec.specialty || "Medical Specialist"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        </section>{/* <!-- /Doctors Section */}


        {/* <!-- Gallery Section  */}
        <section id="gallery" className="gallery section">
          {/* <!-- Section Title  */}
          <div className="container section-title" data-aos="fade-up">
            <h2>Gallery</h2>
            <p>Experience our healthcare facilities and services through these images</p>
          </div>

          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="swiper init-swiper">
              <div className="swiper-wrapper align-items-center">
                {galleries.map((item, index) => (
                  <div className="swiper-slide" key={index}>
                    <a
                      className="glightbox"
                      data-gallery="images-gallery"
                      href={`${process.env.NEXT_PUBLIC_NODE_BASE_URL}/${item.photo}`}
                      title={item.title}
                    >
                      <img src={`${process.env.NEXT_PUBLIC_NODE_BASE_URL}/${item.photo}`} className="img-fluid" alt={item.title || ''} />
                    </a>
                  </div>
                ))}
              </div>
              <div className="swiper-pagination"></div>
            </div>
          </div>

        </section>
        {/* <!-- /Gallery Section */}

        {/* <!-- Faq Section  --> */}
        <section className="faq section light-background">

          {/* <!-- Section Title  --> */}
          <div id="faq" className="container section-title" data-aos="fade-up">
            <h2>Frequently Asked Questions</h2>
            <p>Find answers to some of the most common questions regarding SozoDigicare services.</p>
          </div>{/* <!-- End Section Title  */}

          <FaqSection />

        </section> {/* <!-- End Faq Section --> */}


        {/* <!-- Contact Section  --> */}
        <section id="contact" className="contact section">

        {/* <!-- Section Title  --> */}
        <div className="container section-title" data-aos="fade-up">
          <h2>Contact</h2>
          <p>Feel free to reach out to us for any inquiries or support. We are here to assist you!</p>
        </div>{/* <!-- End Section Title  */}

        <div className="mb-5" data-aos="fade-up" data-aos-delay="200">
          <iframe style={{border:"0", width: "100%", height: '370px'}} src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d48389.78314118045!2d-74.006138!3d40.710059!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a22a3bda30d%3A0xb89d1fe6bc499443!2sDowntown%20Conference%20Center!5e0!3m2!1sen!2sus!4v1676961268712!5m2!1sen!2sus" frameBorder="0" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>{/* <!-- End Google Maps  */}

        <div className="container" data-aos="fade-up" data-aos-delay="100">

          <div className="row gy-4">
            <div className="col-lg-6">
              <div className="row gy-4">

                <div className="col-lg-12">
                  <div className="info-item d-flex flex-column justify-content-center align-items-center" data-aos="fade-up" data-aos-delay="200">
                    <i className="bi bi-geo-alt"></i>
                    <h3>Address</h3>
                    <p>A108 Adam Street, New York, NY 535022</p>
                  </div>
                </div>{/* <!-- End Info Item  */}

                <div className="col-md-6">
                  <div className="info-item d-flex flex-column justify-content-center align-items-center" data-aos="fade-up" data-aos-delay="300">
                    <i className="bi bi-telephone"></i>
                    <h3>Call Us</h3>
                    <p>+1 5589 55488 55</p>
                  </div>
                </div>{/* <!-- End Info Item  */}

                <div className="col-md-6">
                  <div className="info-item d-flex flex-column justify-content-center align-items-center" data-aos="fade-up" data-aos-delay="400">
                    <i className="bi bi-envelope"></i>
                    <h3>Email Us</h3>
                    <p>info@sozodigicare.com</p>
                  </div>
                </div>{/* <!-- End Info Item  */}

              </div>
            </div>

            <div className="col-lg-6">
              <form action="forms/contact.php" method="post" className="php-email-form" data-aos="fade-up" data-aos-delay="500">
                <div className="row gy-4">

                  <div className="col-md-6">
                    <input type="text" name="name" className="form-control" placeholder="Your Name" required="" />
                  </div>

                  <div className="col-md-6 ">
                    <input type="email" className="form-control" name="email" placeholder="Your Email" required="" />
                  </div>

                  <div className="col-md-12">
                    <input type="text" className="form-control" name="subject" placeholder="Subject" required="" />
                  </div>

                  <div className="col-md-12">
                    <textarea className="form-control" name="message" rows="4" placeholder="Message" required="" ></textarea>
                  </div>

                  <div className="col-md-12 text-center">
                    <div className="loading">Loading</div>
                    <div className="error-message"></div>
                    <div className="sent-message">Your message has been sent. Thank you!</div>

                    <button type="submit">Send Message</button>
                  </div>

                </div>
              </form>
            </div>{/* <!-- End Contact Form  */}

          </div>

        </div>

        </section>{/* <!-- /Contact Section  */}
      </main>

      {/* <!-- Scroll Top  */}
      <a href="#" id="scroll-top" className="scroll-top d-flex text-white align-items-center justify-content-center"><i className="bi bi-arrow-up-short"></i></a>

      {/* <!-- Preloader  */}
      {/* <div id="preloader"></div> */}

      
    </>
  )
}
