import React from 'react'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom';
import { Link, Element } from 'react-scroll';
import { motion } from 'framer-motion';
import astra from "../assets/imgs/ASTRA.png"
import astrap2 from "../assets/imgs/astraabout.png"
import astrap from "../assets/imgs/astraabout2.png"
import space from "../assets/videos/space.mp4"
import Businessman from '../assets/imgs/businessman.png';
import Navigation from '../components/spline/Navigation';
import Chervons from '../components/Chervons';
import Countup from '../components/Countup';
import stars from '../assets/videos/stars.mp4'
import Review from '../components/Review';
import half_astra from '../assets/imgs/half-astra.png'
import astra_planet from "../assets/imgs/astra_on_planet.png"

//COLLEAGUES IMAGES 
import big_yacine from "../assets/imgs/big-yacine.jpg";
import ouma from "../assets/imgs/ouma.jpg";
import nouha from "../assets/imgs/nouha.jpg";
import petit_yacine from "../assets/imgs/yacine.jpg";
import hana from "../assets/imgs/hana.png";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay,EffectFade  } from 'swiper/modules';
import 'swiper/css';

export default function Landing() {
  
  
  const reviews = [
    {
      review: '"This chat app made my team communication so easy!"',
      name: 'big yacine',
      rating: 5,
      avatar: big_yacine,
    },
    {
      review: '"I love the sleek UI and how fast it is."',
      name: 'petit yacine',
      rating: 4,
      avatar: petit_yacine,
    },
    {
      review: '"The best messaging experience I\'ve ever had."',
      name: 'nouha',
      rating: 5,
      avatar: nouha,
    },
    {
      review: '"The notifications are instant and reliable."',
      name: 'ouma',
      rating: 4,
      avatar: ouma,
    },
    {
      review: '"Easy to onboard my team and start using."',
      name: 'hanae',
      rating: 5,
      avatar: hana,
    },
  ];
  
  const teamMembers = [
    {
      name: "Mouhyieddine Snane",
      role: "full-stack Developer",
      description: "Creates engaging user interfaces with React and a strong focus on UX.",
      avatar: big_yacine,
      facebook: "#",
      instagram: "#",
      github: "https://github.com/mouhyieddine",
      linkedin: "https://linkedin.com/in/mouhyieddine"
    },
    // {
    //   name: "yassin chwiya",
    //   role: "Backend Developer",
    //   description: "Builds fast and scalable server-side apps using Node.js and MongoDB.",
    //   avatar: petit_yacine,
    //   github: "https://github.com/sara",
    //   linkedin: "https://linkedin.com/in/sara"
    // },
    // {
    //   name: "oumaima siad",
    //   role: ouma,
    //   description: "Handles WebSocket integration and ensures stable real-time performance.",
    //   avatar: "/images/youssef.jpg",
    //   github: "https://github.com/youssef",
    //   linkedin: "https://linkedin.com/in/youssef"
    // }
  ];
  
      const containerVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            when: "beforeChildren",
            staggerChildren: 0.2
          }
        }
      };
      
      const itemVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 }
      };
    
    
      const containerVariants2 = {
        hidden: { opacity: 0, x: -50 },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            when: "beforeChildren",
            staggerChildren: 0.2
          }
        }
      };
      
      const itemVariants2 = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 }
      };
      return (
        <>
           <div>
          {/* Navigation */}
          <Navigation></Navigation>
          {/* Sections */}
          <Element name="section1" className="row full-screen-section section1">
          <video className="video-bg p-0" autoPlay loop muted>
            <source src={space} type="video/mp4" />
          </video>
          <Chervons></Chervons>
    
    
          <motion.div
            className="col-md text"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: .3 }}
            transition={{ delay: 0.2 }}
    
          >
            <motion.h1 variants={itemVariants}>
              <span>Welcome to</span> Caller
            </motion.h1>
            <motion.p variants={itemVariants}>
              Caller is your go-to real-time chat app for fast, secure, and seamless communication. Whether you’re catching up with friends or collaborating with teammates, Caller keeps you connected anytime, anywhere.
            </motion.p>
            <motion.div variants={itemVariants}>
              <RouterLink to="#">Get Started</RouterLink>
            </motion.div>
          </motion.div>
    
          <motion.div
            className="col-md img-section p-0"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: .5 }}
            transition={{ delay: 0.2 }}
          >
            {/* <FloatingObject /> */}
            <img src={astra} alt="astra" />
          </motion.div>
        </Element>
         {/* section2 */}
          <Element name="section2" className="row full-screen-section section2" >
          <motion.div
            className="col-md text"
            variants={containerVariants2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: .3 }}
          >
    
            <motion.h2  variants={itemVariants2} className="section-title mb-4">
              About Caller
            </motion.h2>
            <motion.p variants={itemVariants2}>
            Caller is a modern real-time chat app designed to connect people instantly and securely. Whether you're catching up with friends, collaborating with colleagues, or chatting in a community, Caller delivers a smooth messaging experience with zero lag, end-to-end encryption, and intuitive design.
            <br /><br />
            With powerful features like media sharing, group chats, and online presence tracking, Caller ensures you stay connected —<strong> no matter where you are. </strong>         </motion.p>
            <motion.div variants={itemVariants2}>
              <RouterLink to="#">Get Started</RouterLink>
            </motion.div>
          </motion.div>
    
          <motion.div
            className="col-md img-section p-0"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: .3 }}
            transition={{ delay: 0.2 }}
          >
           <video className="video-bg p-0" autoPlay loop muted>
            <source src={stars} type="video/mp4" />
          </video>
            {/* <FloatingObject /> */}
            <img src={astrap2} alt="business-man" />
          </motion.div>
          </Element>
    
          {/* section3 */}
    <Element name="section3" className="row full-screen-section section3 ">
      <motion.div
        className="col-md text d-flex flex-column justify-content-center"
        variants={containerVariants2}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
      >
        <h2 className="section-title text-center mb-2">What Users Are Saying</h2>
      <div style={{ height: '400px', margin: '0 auto' ,overflow: 'hidden'}}>
          <Swiper
          style={{ height: '100%',padding:'20px' }}
      modules={[Autoplay]}
      direction="vertical"
      effect='fade'
      spaceBetween={20}
      slidesPerView={3}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      loop={true}
          >
            {reviews.map((src, index) => (
              <SwiperSlide key={index}>
                <Review  user={src} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
    
      </motion.div>
    
      <motion.div
        className="col-md img-section d-flex align-items-center justify-content-center"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ delay: 0.2 }}
      >
        <img src={half_astra} alt="User Feedback Illustration" className="img-fluid w-75" />
        <Countup></Countup>
      </motion.div>
    </Element>
    
    
          {/* section4 */}
          <Element name="section4" className="row full-screen-section section4">
          <motion.div
            className="col-md-5 text"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: .3 }}
            transition={{ delay: 0.2 }}
    
          >
            
            <motion.h2 variants={itemVariants}>
              MEET OUR TEAM
              <img src={astra_planet} alt="" />
            </motion.h2>
            <motion.p variants={itemVariants}>
              Our team is all about one thing: giving you an experience that’s <b>fast</b>, smooth, and unforgettable.        
            </motion.p>
            <motion.h4 variants={itemVariants}>
              <span> !</span>
              YOU HAVE QUESTION ??!!
            </motion.h4>
            <motion.p variants={itemVariants}>
              You will find us at :
              <ul>
                <li>mohysanane@gmail.com</li>
              </ul>
              We are available 24/7 to answer your questions.
              
            </motion.p>
            <motion.div variants={itemVariants}>
            </motion.div>
          </motion.div>
    
          <motion.div
            className="col-md img-section "
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: .3 }}
            transition={{ delay: 0.2 }}
          >
               {teamMembers.map((member, index) => (
        <div className="team-card">
          <img src={member.avatar} alt={member.name} className="avatar" />
          <h3>{member.name}</h3>
          <p className="role">{member.role}</p>
          <p className="desc">{member.description}</p>
          <div className="socials">
            <a href={member.facebook} target="_blank" rel="noreferrer"><i className="fab fa-facebook-f"></i></a>
            <a href={member.instagram} target="_blank" rel="noreferrer"><i className="fab fa-instagram"></i></a>
            <a href={member.github} target="_blank" rel="noreferrer"><i className="fab fa-github"></i></a>
            <a href={member.linkedin} target="_blank" rel="noreferrer"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>
          ))}
             </motion.div>
          </Element>
        </div>
    
        </>
      )
  
}
