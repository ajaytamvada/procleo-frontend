import React, { useState, useEffect } from 'react';

interface LiveSourcingEvent {
  id: string;
  title: string;
  startPrice: number;
  currentLowest: number;
  savedPercentage: number;
  timeLeft: number; // in seconds
  isLive: boolean;
}

interface LiveSourcingCardProps {
  event: LiveSourcingEvent;
}

// Format time as HH:MM:SS
const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Format currency in Indian format
const formatCurrency = (amount: number): string => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

const LiveSourcingCard: React.FC<LiveSourcingCardProps> = ({ event }) => {
  const [timeLeft, setTimeLeft] = useState(event.timeLeft);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div className='bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200'>
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
        <div className='flex items-center gap-1.5 text-slate-500'>
          <span className='text-sm font-mono font-medium text-slate-700'>
            {formatTime(timeLeft)}
          </span>
          <span className='text-sm'>left</span>
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
          <p className='text-2xl font-bold text-slate-800'>
            {formatCurrency(event.currentLowest)}
          </p>
        </div>
        <div className='text-right'>
          <span className='text-sm font-semibold text-emerald-600'>
            {event.savedPercentage}% Saved
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Component with sample data
const LiveSourcingEvents: React.FC = () => {
  const events: LiveSourcingEvent[] = [
    {
      id: '1',
      title: 'Packaging Material - Corrugated Boxes',
      startPrice: 1200000,
      currentLowest: 1050000,
      savedPercentage: 12.5,
      timeLeft: 2535, // 00:42:15
      isLive: true,
    },
    {
      id: '2',
      title: 'Logistics Contract - North Zone',
      startPrice: 1200000,
      currentLowest: 1050000,
      savedPercentage: 8.2,
      timeLeft: 4500, // 01:15:00
      isLive: true,
    },
  ];

  return (
    <div className='space-y-5'>
      {/* Section Header */}
      <h2 className='text-xl font-semibold text-slate-800'>
        Live Sourcing Events
      </h2>

      {/* Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {events.map(event => (
          <LiveSourcingCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default LiveSourcingEvents;
