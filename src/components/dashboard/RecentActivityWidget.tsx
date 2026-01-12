import React, { useEffect, useState } from 'react';
import { activityService } from '@/services/activityService';
import { UserActivity } from '@/types/activity';
import AuthService from '@/services/auth';
import { format } from 'date-fns';
import {
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  FileText,
  Edit,
  Trash2,
  Plus,
  Eye,
  ChevronRight,
} from 'lucide-react';

const RecentActivityWidget: React.FC = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const user = AuthService.getStoredUser();
        if (user) {
          const data = await activityService.getRecentActivities(
            String(user.id)
          );
          setActivities(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch user activities', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Poll every 60 seconds
    const interval = setInterval(fetchActivities, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get icon and colors based on action type
  const getActionConfig = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'accepted':
        return {
          icon: CheckCircle2,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          badgeBg: 'bg-green-50',
          badgeText: 'text-green-700',
          badgeBorder: 'border-green-200',
        };
      case 'rejected':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          badgeBg: 'bg-red-50',
          badgeText: 'text-red-700',
          badgeBorder: 'border-red-200',
        };
      case 'created':
        return {
          icon: Plus,
          bgColor: 'bg-violet-50',
          iconColor: 'text-violet-600',
          badgeBg: 'bg-violet-50',
          badgeText: 'text-violet-700',
          badgeBorder: 'border-violet-200',
        };
      case 'updated':
        return {
          icon: Edit,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          badgeBg: 'bg-blue-50',
          badgeText: 'text-blue-700',
          badgeBorder: 'border-blue-200',
        };
      case 'deleted':
        return {
          icon: Trash2,
          bgColor: 'bg-gray-100',
          iconColor: 'text-gray-600',
          badgeBg: 'bg-gray-100',
          badgeText: 'text-gray-700',
          badgeBorder: 'border-gray-200',
        };
      case 'viewed':
        return {
          icon: Eye,
          bgColor: 'bg-amber-50',
          iconColor: 'text-amber-600',
          badgeBg: 'bg-amber-50',
          badgeText: 'text-amber-700',
          badgeBorder: 'border-amber-200',
        };
      default:
        return {
          icon: FileText,
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-600',
          badgeBg: 'bg-gray-50',
          badgeText: 'text-gray-700',
          badgeBorder: 'border-gray-200',
        };
    }
  };

  // Get module badge color
  const getModuleBadgeColor = (module: string) => {
    switch (module.toUpperCase()) {
      case 'PR':
        return 'bg-violet-100 text-violet-700 border-violet-200';
      case 'RFP':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PO':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'GRN':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        {/* Header */}
        <div className='px-5 py-4 border-b border-gray-200 flex items-center justify-between'>
          <h3 className='text-base font-semibold text-gray-900'>
            Recent Activity
          </h3>
          <span className='text-sm text-violet-600 flex items-center gap-1'>
            View All <ChevronRight size={16} />
          </span>
        </div>
        <div className='p-5'>
          <div className='space-y-4'>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className='flex items-start gap-3 animate-pulse'>
                <div className='w-9 h-9 rounded-full bg-gray-100'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-4 bg-gray-100 rounded w-3/4'></div>
                  <div className='h-3 bg-gray-100 rounded w-1/2'></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
      {/* Header */}
      <div className='px-5 py-4 border-b border-gray-200 flex items-center justify-between'>
        <h3 className='text-base font-semibold text-gray-900'>
          Recent Activity
        </h3>
        <button className='text-sm font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1'>
          View All <ChevronRight size={16} />
        </button>
      </div>

      {/* Content */}
      {!activities || activities.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 px-5'>
          <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
            <Activity className='w-6 h-6 text-gray-400' />
          </div>
          <p className='text-gray-600 font-medium'>No recent activity</p>
          <p className='text-gray-400 text-sm mt-1'>
            Your activities will appear here
          </p>
        </div>
      ) : (
        <div className='divide-y divide-gray-100'>
          {activities.map(activity => {
            const config = getActionConfig(activity.actionType);
            const IconComponent = config.icon;

            return (
              <div
                key={activity.id}
                className='px-5 py-4 hover:bg-gray-50 transition-colors'
              >
                <div className='flex items-start gap-3'>
                  {/* Icon */}
                  <div
                    className={`w-9 h-9 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}
                  >
                    <IconComponent size={16} className={config.iconColor} />
                  </div>

                  {/* Content */}
                  <div className='flex-1 min-w-0'>
                    {/* Description */}
                    <p className='text-sm text-gray-900 leading-snug'>
                      {activity.description}
                    </p>

                    {/* Meta info */}
                    <div className='flex items-center gap-2 mt-2 flex-wrap'>
                      {/* Module Badge */}
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded border ${getModuleBadgeColor(
                          activity.module
                        )}`}
                      >
                        {activity.module}
                      </span>

                      {/* Action Badge */}
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
                      >
                        {activity.actionType}
                      </span>

                      {/* Timestamp */}
                      <div className='flex items-center gap-1 text-gray-400'>
                        <Clock size={12} />
                        <span className='text-xs'>
                          {format(
                            new Date(activity.timestamp),
                            'MMM d, h:mm a'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivityWidget;
