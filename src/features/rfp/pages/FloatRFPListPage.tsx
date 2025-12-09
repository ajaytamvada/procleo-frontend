import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Send,
    Loader2,
    AlertCircle,
    Package,
} from 'lucide-react';
import type { RFP, RFPFilterParams } from '../types';
import { RFPStatus } from '../types';
import { rfpApi } from '../services/rfpApi';

const FloatRFPListPage: React.FC = () => {
    const navigate = useNavigate();
    const [rfps, setRfps] = useState<RFP[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRFPs();
    }, []);

    const fetchRFPs = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch only CREATED RFPs as they are the ones ready to be floated
            const params: RFPFilterParams = {
                page: 0,
                size: 100, // Fetch more items since we're filtering specific status
                sortBy: 'createdDate',
                sortDirection: 'DESC',
                status: RFPStatus.CREATED,
            };

            const response = await rfpApi.getAllRFPs(params);
            setRfps(response.content);
        } catch (err) {
            console.error('Error fetching RFPs:', err);
            setError('Failed to load RFPs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFloat = (id: number) => {
        navigate(`/rfp/${id}/float`);
    };

    const filteredRFPs = rfps.filter(
        rfp =>
            !searchTerm ||
            (rfp.rfpNumber && rfp.rfpNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (rfp.remarks && rfp.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className='flex items-center justify-center h-screen'>
                <Loader2 className='w-8 h-8 animate-spin text-purple-600' />
                <span className='ml-2 text-gray-600'>Loading RFPs...</span>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex justify-between items-center'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-900'>Float RFP</h1>
                    <p className='text-sm text-gray-500 mt-1'>
                        Select an RFP to float to suppliers
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
                <div className='relative max-w-md'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                    <input
                        type='text'
                        placeholder='Search by RFP Number or Remarks...'
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start'>
                    <AlertCircle className='w-5 h-5 text-red-600 mt-0.5 mr-3' />
                    <p className='text-red-700'>{error}</p>
                </div>
            )}

            {/* RFP List */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full'>
                        <thead className='bg-gray-50 border-b border-gray-200'>
                            <tr>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    RFP Details
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Dates
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Items
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Status
                                </th>
                                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className='bg-white divide-y divide-gray-200'>
                            {filteredRFPs.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className='px-6 py-12 text-center text-gray-500'
                                    >
                                        <div className='flex flex-col items-center justify-center'>
                                            <Package className='w-12 h-12 text-gray-300 mb-3' />
                                            <p className='text-lg font-medium text-gray-900'>
                                                No RFPs found
                                            </p>
                                            <p className='text-sm text-gray-500'>
                                                {searchTerm
                                                    ? 'Try adjusting your search terms'
                                                    : 'There are no RFPs ready to be floated (Status: CREATED)'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRFPs.map(rfp => (
                                    <tr
                                        key={rfp.id}
                                        className='hover:bg-gray-50 transition-colors'
                                    >
                                        <td className='px-6 py-4'>
                                            <div className='flex flex-col'>
                                                <span className='text-sm font-medium text-purple-600'>
                                                    {rfp.rfpNumber}
                                                </span>
                                                {rfp.remarks && (
                                                    <span className='text-sm text-gray-900 mt-1'>
                                                        {rfp.remarks}
                                                    </span>
                                                )}
                                                <span className='text-xs text-gray-500 mt-1'>
                                                    Dept: {rfp.department || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <div className='flex flex-col space-y-1'>
                                                <div className='flex items-center text-xs text-gray-600'>
                                                    <span className='w-16'>Created:</span>
                                                    <span className='font-medium'>
                                                        {rfp.createdDate ? new Date(rfp.createdDate).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className='flex items-center text-xs text-gray-600'>
                                                    <span className='w-16'>Closing:</span>
                                                    <span className='font-medium'>
                                                        {rfp.closingDate ? new Date(rfp.closingDate).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                                                {rfp.items?.length || 0} items
                                            </span>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'>
                                                {rfp.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-right'>
                                            <button
                                                onClick={() => handleFloat(rfp.id!)}
                                                className='inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm'
                                            >
                                                <Send className='w-4 h-4 mr-2' />
                                                Float RFP
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FloatRFPListPage;
