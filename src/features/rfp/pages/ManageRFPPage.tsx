/**
 * Manage RFP Page - Shows only DRAFT RFPs for editing and submission
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Send,
    RefreshCw,
} from 'lucide-react';
import { rfpApi } from '../services/rfpApi';
import type { RFP } from '../types';
import toast from 'react-hot-toast';

const ManageRFPPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch only draft RFPs
    const { data: draftRFPs = [], isLoading, refetch } = useQuery({
        queryKey: ['rfps', 'drafts'],
        queryFn: () => rfpApi.getRFPsByStatus('DRAFT'),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => rfpApi.deleteRFP(id),
        onSuccess: () => {
            toast.success('RFP deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['rfps', 'drafts'] });
        },
        onError: () => {
            toast.error('Failed to delete RFP');
        },
    });

    // Filter RFPs based on search
    const filteredRFPs = draftRFPs.filter(
        rfp =>
            !searchTerm ||
            rfp.rfpNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rfp.remarks?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this RFP draft?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleFloatRFP = (rfp: RFP) => {
        navigate(`/rfp/${rfp.id}/float`);
    };

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex justify-between items-center'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-900'>Manage RFP</h1>
                    <p className='text-sm text-gray-500 mt-1'>
                        View and manage draft RFPs
                    </p>
                </div>
                <button
                    onClick={() => navigate('/rfp/create')}
                    className='flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
                >
                    <Plus className='w-5 h-5 mr-2' />
                    Create RFP
                </button>
            </div>

            {/* Search and Filters */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
                <div className='flex items-center gap-4'>
                    <div className='flex-1 relative'>
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                        <input
                            type='text'
                            placeholder='Search by RFP Number or Remarks...'
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                        />
                    </div>
                    <button
                        onClick={() => refetch()}
                        className='flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
                    >
                        <RefreshCw className='w-5 h-5 mr-2' />
                        Refresh
                    </button>
                </div>
            </div>

            {/* RFP Table */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full'>
                        <thead className='bg-gray-50 border-b border-gray-200'>
                            <tr>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    RFP Number
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    RFP Date
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Closing Date
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Items
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Status
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className='bg-white divide-y divide-gray-200'>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className='px-6 py-4 text-center text-gray-500'>
                                        <div className='flex items-center justify-center'>
                                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600'></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRFPs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                                        <p className='text-lg font-medium'>No draft RFPs found</p>
                                        <p className='text-sm mt-1'>
                                            Create a new RFP and save it as draft to see it here.
                                        </p>
                                        <button
                                            onClick={() => navigate('/rfp/create')}
                                            className='mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
                                        >
                                            Create RFP
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                filteredRFPs.map(rfp => (
                                    <tr key={rfp.id} className='hover:bg-gray-50 transition-colors'>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <div className='text-sm font-medium text-gray-900'>
                                                {rfp.rfpNumber}
                                            </div>
                                            {rfp.prNumber && (
                                                <div className='text-xs text-gray-500'>
                                                    PR: {rfp.prNumber}
                                                </div>
                                            )}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                            {rfp.requestDate
                                                ? new Date(rfp.requestDate).toLocaleDateString()
                                                : '-'}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                            {rfp.closingDate
                                                ? new Date(rfp.closingDate).toLocaleDateString()
                                                : '-'}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                                                {rfp.items?.length || 0}
                                            </span>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'>
                                                DRAFT
                                            </span>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm'>
                                            <div className='flex items-center space-x-3'>
                                                <button
                                                    onClick={() => navigate(`/rfp/${rfp.id}/edit`)}
                                                    className='text-blue-600 hover:text-blue-800 transition-colors'
                                                    title='Edit'
                                                >
                                                    <Edit className='w-4 h-4' />
                                                </button>
                                                <button
                                                    onClick={() => handleFloatRFP(rfp)}
                                                    className='text-purple-600 hover:text-purple-800 transition-colors'
                                                    title='Float RFP'
                                                >
                                                    <Send className='w-4 h-4' />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(rfp.id!)}
                                                    className='text-red-600 hover:text-red-800 transition-colors'
                                                    title='Delete'
                                                >
                                                    <Trash2 className='w-4 h-4' />
                                                </button>
                                            </div>
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

export default ManageRFPPage;
