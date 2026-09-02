import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
  actionText?: string;
  actionHref?: string;
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      q: 'When is UdupiPages Beach Run 2026?',
      a: 'The event is planned for 6th December 2026.'
    },
    {
      q: 'Where is the Beach Run conducted?',
      a: 'The UdupiPages Beach Run route is from the Padukere ground near Malpe to Kaup Beach.'
    },
    {
      q: 'How many participants are expected?',
      a: 'The event is planned for approximately 1,500 runners, along with around 2,000 spectators and visitors.'
    },
    {
      q: 'What are the race categories?',
      a: 'The event will have 3K, 5K, 10K and 15K categories.'
    },
    {
      q: 'Can beginners participate?',
      a: 'Yes. The 3K and 5K categories are designed to encourage beginners, children, families and recreational runners.'
    },
    {
      q: 'Can people from outside Udupi participate?',
      a: 'Absolutely. We welcome runners from Mangaluru, Bengaluru, Mysuru, Shivamogga, Madikeri, Hyderabad and other cities and states.'
    },
    {
      q: 'What facilities are available at the Kapu Light House finish line?',
      a: 'The finish line at Kapu Light House features baggage retrieval, medical recovery tents, fresh tender coconut stations, finisher medal distribution, and shuttle buses back to Padukere Ground.'
    },
    {
      q: 'Where do race proceeds go?',
      a: 'All net registration funds are dedicated directly toward Udupi coastal river filtration barriers, quarterly beach cleanups, and community marine conservation awareness campaigns.'
    },
    {
      q: 'Can I make a weekend trip from the Beach Run?',
      a: 'Yes. Participants are encouraged to combine the run with a Udupi tourism experience covering beaches, temples, islands, food and local attractions.'
    },
    {
      q: 'How can my company become a sponsor?',
      a: 'Reach more audience from Udupi, Mangalore, Bangalore, Mysore, Kerala, and Hyderabad. Contact the UdupiPages Beach Run sponsorship team to receive sponsorship packages and branding opportunities.',
      actionText: 'BECOME A SPONSOR',
      actionHref: '#partners'
    },
    {
      q: 'How can I volunteer?',
      a: 'We would love to get more volunteers for the events. Sports clubs, Youth clubs, Women groups and other social groups. Register through the volunteer form on the website.',
      actionText: 'BECOME A VOLUNTEER',
      actionHref: '#register'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-slate-50 text-[#0A0A0A] border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-semibold tracking-widest text-[#00A3FF] uppercase block">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="font-thunder text-4xl sm:text-6xl font-extrabold text-[#0A0A0A] uppercase">
            UDUPI MARATHON <span className="text-gradient">FAQ'S</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-700 font-normal">
            Everything you need to know about UdupiPages Beach Run 2026.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                className="bg-white border border-slate-200 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left flex items-center justify-between space-x-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="font-sans text-base sm:text-lg font-bold text-[#0A0A0A]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#FF7A30] flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-sm text-slate-700 font-normal border-t border-slate-200 pt-4 leading-relaxed bg-amber-50/30">
                        <p>{faq.a}</p>
                        {faq.actionText && faq.actionHref && (
                          <div className="mt-4 pt-2">
                            <a
                              href={faq.actionHref}
                              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-sunset-gradient text-white text-xs font-extrabold uppercase tracking-wider shadow-sm hover:scale-105 transition-transform"
                            >
                              <span>[ {faq.actionText} ]</span>
                              <ArrowRight className="w-4 h-4" />
                            </a>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
