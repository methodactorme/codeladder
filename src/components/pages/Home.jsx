import React from 'react';
import { Link } from 'react-router-dom';

export const Home = () => {
  const features = [
    {
      icon: <i className="fas fa-rocket text-3xl"></i>,
      title: "Dynamic Collaboration",
      description: "Real-time collaboration with friends and teammates on coding challenges",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=240&fit=crop",
      stats: "10k+ collaborations"
    },
    {
      icon: <i className="fas fa-chart-line text-3xl"></i>,
      title: "Advanced Analytics", 
      description: "Visual progress tracking with detailed insights and performance metrics",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=240&fit=crop",
      stats: "Real-time insights"
    },
    {
      icon: <i className="fas fa-brain text-3xl"></i>,
      title: "Smart Organization",
      description: "AI-powered problem categorization and personalized learning paths",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=240&fit=crop",
      stats: "ML-driven"
    }
  ];

  const stats = [
    { value: "50K+", label: "Problems Solved", icon: "fas fa-code" },
    { value: "15K+", label: "Active Users", icon: "fas fa-users" },
    { value: "1K+", label: "Ladders Created", icon: "fas fa-layer-group" },
    { value: "500+", label: "Companies", icon: "fas fa-building" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b754?w=60&h=60&fit=crop&crop=face",
      quote: "CodeLadder transformed my interview prep. The collaborative features helped me learn faster than ever."
    },
    {
      name: "Alex Kumar", 
      role: "Senior Dev at Microsoft",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
      quote: "The AI-powered organization is incredible. It knows exactly what I need to practice next."
    },
    {
      name: "Maya Rodriguez",
      role: "Tech Lead at Meta",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face", 
      quote: "Best coding practice platform I've used. The team collaboration features are unmatched."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient"></div>
        <div className="hero-pattern absolute inset-0"></div>

        <div className="relative max-w-7xl mx-auto container-padding section-padding">
          <div className="text-center">
            
            

            {/* Main Hero Content */}
            <div className="mb-8 relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&h=120&fit=crop&crop=center"
                alt="CodeLadder"
                className="relative w-24 h-24 mx-auto rounded-2xl shadow-2xl object-cover border-4 border-white transform hover:scale-110 transition-all duration-500"
              />
            </div>

            <h1 className="section-header animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Master Coding with
              <span className="text-gradient block mt-2">
                CodeLadder
              </span>
            </h1>

            <p className="section-subheader mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Join thousands of developers using our AI-powered platform to accelerate their coding journey.
              <span className="font-semibold text-gray-900"> Practice smarter, collaborate better, achieve more.</span>
            </p>

            {/* CTA Buttons */}
            

            
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full animate-float-gentle"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-purple-200/30 rounded-full animate-float-gentle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-indigo-200/30 rounded-full animate-float-gentle" style={{ animationDelay: '2s' }}></div>
      </section>

      

      
      

      
       {/* Welcome Section */}
<section className="section-padding bg-white border-b border-gray-100">
  <div className="max-w-5xl mx-auto text-center container-padding">
    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
      Welcome to <span className="text-gradient">CodeLadder</span>
    </h2>
    <p className="text-gray-700 text-lg leading-relaxed mb-6">
      This project is a prototype of what I call the <strong>Dynamic Ladder</strong>.
    </p>
    <p className="text-gray-600 leading-relaxed mb-6">
      Ever wanted to share a list of coding questions with friends or collaborate on building a problem ladder? 
      While tools like Google Sheets or Docs can be used, they often feel clunky and repetitive.
    </p>
    <p className="text-gray-600 leading-relaxed mb-6">
      <strong>CodeLadder</strong> makes collaboration easy—track questions, avoid duplicates, and enjoy a much better UI experience. 
      Whether you're studying solo or with a team, this tool helps you organize, share, and solve more efficiently.
    </p>
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-6 py-4 text-yellow-800 mb-4">
      ⚠️ <strong>Please note:</strong> Some operations might take a couple of seconds to respond. We recommend waiting 1–2 seconds before attempting another update.
    </div>
    <div className="bg-red-50 border border-red-200 rounded-lg px-6 py-4 text-red-800">
      🔁 <strong>If refreshing the page doesn't work</strong>, it's likely due to a known render hosting issue. 
      To continue using the site, please return to the homepage at <a className="underline font-semibold" href="https://frontendcodeladder.onrender.com/" target="_blank" rel="noopener noreferrer">https://frontendcodeladder.onrender.com/</a>.
    </div>
    <p className="text-gray-500 mt-6">
      For any bugs, issues, or suggestions, feel free to reach out at <a className="underline" href="mailto:methodactorme@gmail.com">methodactorme@gmail.com</a>.
    </p>
    <p className="mt-4 font-semibold text-blue-700">Happy Coding! 🚀</p>
  </div>
</section>

    </div>
  );
}

export default Home;
