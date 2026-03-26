import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Sparkles } from "lucide-react";

export default function Pricing() {
  const nav = useNavigate();
  const [hoveredPlan, setHoveredPlan] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0, rotate: -2 },
    visible: {
      y: 0,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
      },
    },
    hover: {
      y: -15,
      scale: 1.05,
      rotate: 2,
      transition: { type: "spring", stiffness: 300 },
    },
  };

  return (
    <div className="min-h-screen bg-yellow-50 text-black font-sans selection:bg-black selection:text-white overflow-hidden relative">
      {/* Background Decor - Funky Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-block mb-4 px-4 py-1.5 bg-black text-white rounded-full text-sm font-bold tracking-wider transform -rotate-2">
            NORS ACCS ✨
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            Don't let bills <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
              break the friendship.
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Track expenses, split bills, and settle up without the awkward texts.
            Choose a flavor that fits your squad.
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-8 lg:gap-12 items-start"
        >
          {/* Plan 1: The Casual */}
          <PricingCard
            title="The Casual"
            price="₹0"
            description="For occasional hangouts."
            icon={<Zap className="w-6 h-6" />}
            color="bg-white"
            borderColor="border-black"
            shadowColor="shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            buttonColor="bg-yellow-400 hover:bg-yellow-300"
            features={["Unlimited Groups", "Basic Expense Splitting", "Up to 3 Friends"]}
            onClick={() => nav("/register")}
          />

          {/* Plan 2: The Socialite (Popular) */}
          <div className="relative">
             <motion.div 
               initial={{ rotate: 12, scale: 0 }}
               animate={{ rotate: 12, scale: 1 }}
               transition={{ delay: 0.5, type: 'spring' }}
               className="absolute -top-6 -right-6 z-20 bg-pink-500 text-white font-black px-4 py-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-12"
             >
               MOST POPULAR
             </motion.div>
            <PricingCard
              title="The Socialite"
              price="₹200"
              description="For the weekend warriors."
              icon={<Sparkles className="w-6 h-6" />}
              color="bg-purple-100"
              borderColor="border-black"
              shadowColor="shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
              buttonColor="bg-pink-500 text-white hover:bg-pink-400"
              features={["Receipt Scanning", "Export to CSV", "Unlimited Friends", "Priority Support"]}
              isPopular={true}
              onClick={() => nav("/register")}
            />
          </div>

          {/* Plan 3: The Accountant */}
          <PricingCard
            title="The Accountant"
            price="Custom"
            description="For massive trips & flatmates."
            icon={<Crown className="w-6 h-6" />}
            color="bg-blue-50"
            borderColor="border-black"
            shadowColor="shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            buttonColor="bg-cyan-400 hover:bg-cyan-300"
            features={["Recurring Bills", "Bank Integration", "Spending Analytics", "Dedicated Agent"]}
            onClick={() => console.log("Contact sales")}
          />
        </motion.div>
      </div>
    </div>
  );
}

// Reusable Card Component
function PricingCard({ 
  title, 
  price, 
  description, 
  icon, 
  color, 
  borderColor, 
  shadowColor, 
  buttonColor, 
  features, 
  onClick,
  isPopular 
}) {
  return (
    <motion.div
      variants={{
        hidden: { y: 50, opacity: 0 },
        visible: { y: 0, opacity: 1 },
        hover: { y: -10 }
      }}
      whileHover="hover"
      className={`relative ${color} border-4 ${borderColor} ${shadowColor} p-8 rounded-2xl h-full flex flex-col transition-all`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-black uppercase tracking-tighter">{title}</h3>
        <div className="p-2 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {icon}
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-5xl font-black mb-2">{price}<span className="text-lg font-bold text-gray-500 ml-1">/mo</span></p>
        <p className="text-gray-600 font-medium leading-tight">{description}</p>
      </div>

      <div className="flex-grow mb-8 space-y-3">
        {features.map((feature, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="bg-green-400 border border-black rounded-full p-0.5 min-w-[20px] flex items-center justify-center">
               <Check size={12} strokeWidth={4} />
            </div>
            <span className="font-bold text-gray-800 text-sm">{feature}</span>
          </div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02, x: 2, y: 2, boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)" }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`w-full py-4 ${buttonColor} border-2 border-black rounded-xl font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all`}
      >
        Choose Plan
      </motion.button>
    </motion.div>
  );
}