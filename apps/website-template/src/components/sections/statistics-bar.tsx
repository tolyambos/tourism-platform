'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface Stat {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

interface StatisticsBarProps {
  content: {
    title?: string;
    stats: Stat[];
    backgroundColor?: string;
    textColor?: string;
  };
}

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);
      
      if (progress < 1) {
        setCount(Math.floor(value * progress));
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration, isInView]);
  
  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function StatisticsBar({ content }: StatisticsBarProps) {
  const {
    title,
    stats,
    backgroundColor = 'bg-primary',
    textColor = 'text-white'
  } = content;
  
  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${backgroundColor} ${textColor}`}>
      <div className="max-w-7xl mx-auto">
        {title && (
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h2>
        )}
        
        <div className={`grid grid-cols-2 lg:grid-cols-${stats.length} gap-8`}>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                {stat.prefix}
                <AnimatedCounter value={stat.value} />
                {stat.suffix}
              </div>
              <div className="text-sm sm:text-base opacity-80">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}