import React, { useEffect, useState } from 'react';
import { activityService } from '@/services/activityService';
import { UserActivity } from '@/types/activity';
import AuthService from '@/services/auth';
import { format } from 'date-fns';
import { Clock, Activity } from 'lucide-react';

const RecentActivityWidget: React.FC = () => {
    const [activities, setActivities] = useState<UserActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const user = AuthService.getStoredUser();
                if (user) {
                    // Use user.id (Login ID) as backend now expects Long userId
                    const data = await activityService.getRecentActivities(String(user.id));
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

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Recent Activity
                </h3>
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-100 rounded"></div>
                    <div className="h-12 bg-gray-100 rounded"></div>
                    <div className="h-12 bg-gray-100 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Recent Activity
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {!activities || activities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No recent activity.</p>
                    </div>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                            <div className="mt-1 min-w-[32px] h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold">
                                {activity.module}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                        {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecentActivityWidget;
