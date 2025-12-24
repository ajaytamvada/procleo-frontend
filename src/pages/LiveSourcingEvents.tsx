import React, { useState, useEffect } from 'react';

import { SourcingEvent } from '@/features/dashboard/types';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LiveSourcingCardProps {
  event: SourcingEvent;
}

// Format time as HH:MM:SS
// Format time as human readable string
const formatTime = (seconds: number): string => {
  const days = Math.floor(seconds / (3600 * 24));
  const hrs = Math.floor((seconds % (3600 * 24)) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hrs}h`;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m ${seconds % 60}s`;
};

// Format currency in Indian format
const formatCurrency = (amount: number): string => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

const LiveSourcingCard: React.FC<LiveSourcingCardProps> = ({ event }) => {
  const [timeLeft, setTimeLeft] = useState(event.timeLeftSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div className='bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200 relative overflow-hidden'>
      {/* Left Accent Border */}
      <div className='absolute top-0 left-0 w-[3px] h-full bg-violet-600' />
      {/* Header Row - Live Badge & Timer */}
      <div className='flex items-center justify-between mb-4'>
        {event.isLive && (
          <span className='inline-flex items-center px-2.5 py-1 rounded-md bg-red-50 border border-red-200'>
            <span className='w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-pulse'></span>
            <span className='text-xs font-semibold text-red-600 uppercase tracking-wide'>
              Live
            </span>
          </span>
        )}
        <div className='flex items-center gap-1.5'>
          <span
            className={`text-sm font-bold ${
              timeLeft < 14400
                ? 'text-red-600'
                : timeLeft < 86400
                  ? 'text-amber-600'
                  : 'text-slate-700'
            }`}
          >
            {formatTime(timeLeft)}
          </span>
          <span className='text-sm text-slate-500'>left</span>
        </div>
      </div>

      {/* Title */}
      <h3 className='text-base font-semibold text-slate-800 mb-1 leading-snug'>
        {event.title}
      </h3>

      {/* Start Price */}
      <p className='text-sm text-slate-500 mb-4'>
        Start Price:{' '}
        <span className='font-medium'>
          ₹{event.startPrice.toLocaleString('en-IN')}
        </span>
      </p>

      {/* Current Lowest & Saved */}
      <div className='flex items-end justify-between'>
        <div>
          <p className='text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1'>
            Current Lowest
          </p>
          <p
            className={`text-2xl font-bold ${
              event.savedPercentage > 0 ? 'text-emerald-700' : 'text-slate-800'
            }`}
          >
            {formatCurrency(event.currentLowest)}
          </p>
        </div>
        <div className='text-right'>
          <span
            className={`text-sm font-semibold ${
              event.savedPercentage > 0 ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            {event.savedPercentage}% Saved
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Component accepting events as props
interface LiveSourcingEventsProps {
  events: SourcingEvent[];
}

const LiveSourcingEvents: React.FC<LiveSourcingEventsProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className='space-y-5'>
      {/* Section Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-slate-800'>
          Live Sourcing Events
        </h2>
        <Link
          to='/rfp/float'
          className='text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1'
        >
          View All <ChevronRight className='w-4 h-4' />
        </Link>
      </div>

      {/* Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {events.slice(0, 3).map(event => (
          <LiveSourcingCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default LiveSourcingEvents;
