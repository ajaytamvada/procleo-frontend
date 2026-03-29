import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Unplug,
  Loader2,
} from 'lucide-react';
import {
  useEmailConnections,
  useDisconnectEmail,
  usePollNow,
} from '../hooks/useEmailConnection';
import { getConnectUrl } from '../services/email.service';
import type { EmailConnection } from '../types/email.types';

const EmailSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [connecting, setConnecting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: connections, isLoading, refetch } = useEmailConnections();
  const disconnectMutation = useDisconnectEmail();
  const pollMutation = usePollNow();

  // Handle OAuth callback redirect params
  useEffect(() => {
    const connected = searchParams.get('connected');
    const email = searchParams.get('email');
    const error = searchParams.get('error');

    if (connected === 'true' && email) {
      setSuccessMessage(`Successfully connected: ${email}`);
      refetch();
      // Clean up URL params
      window.history.replaceState({}, '', '/settings/email');
    }
    if (error) {
      setErrorMessage(
        error === 'callback_failed'
          ? 'Failed to connect mailbox. Please try again.'
          : `Connection error: ${error}`
      );
      window.history.replaceState({}, '', '/settings/email');
    }
  }, [searchParams, refetch]);

  const handleConnect = async () => {
    setConnecting(true);
    setErrorMessage(null);
    try {
      const response = await getConnectUrl();
      // Redirect to Microsoft OAuth
      window.location.href = response.authorizationUrl;
    } catch (err) {
      setErrorMessage('Failed to initiate connection. Please try again.');
      setConnecting(false);
    }
  };

  const handleDisconnect = (id: number) => {
    if (window.confirm('Are you sure you want to disconnect this mailbox?')) {
      disconnectMutation.mutate(id, {
        onSuccess: () => setSuccessMessage('Mailbox disconnected.'),
        onError: () => setErrorMessage('Failed to disconnect.'),
      });
    }
  };

  const handlePollNow = () => {
    setSuccessMessage(null);
    pollMutation.mutate(undefined, {
      onSuccess: () => setSuccessMessage('Email check completed.'),
      onError: () => setErrorMessage('Email check failed.'),
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const activeConnections =
    connections?.filter(c => c.status === 'ACTIVE') || [];
  const hasActiveConnection = activeConnections.length > 0;

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Header */}
      <div className='lg:px-8 py-2'>
        <h1 className='text-2xl font-bold text-slate-800'>
          <button
            className='p-1.5 mr-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            onClick={() => navigate('/settings')}
          >
            <ArrowLeft size={20} />
          </button>
          Email Integration
        </h1>
      </div>

      <div className='px-6 lg:px-8 py-6 max-w-3xl'>
        {/* Success / Error alerts */}
        {successMessage && (
          <div className='mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700'>
            <CheckCircle2 size={16} />
            {successMessage}
            <button
              className='ml-auto text-green-500 hover:text-green-700'
              onClick={() => setSuccessMessage(null)}
            >
              &times;
            </button>
          </div>
        )}
        {errorMessage && (
          <div className='mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700'>
            <XCircle size={16} />
            {errorMessage}
            <button
              className='ml-auto text-red-500 hover:text-red-700'
              onClick={() => setErrorMessage(null)}
            >
              &times;
            </button>
          </div>
        )}

        {/* Description */}
        <div className='mb-6'>
          <p className='text-sm text-slate-500'>
            Connect your invoice mailbox to automatically import invoices. When
            an invoice email arrives, the system extracts the PDF, runs OCR, and
            creates an invoice record automatically.
          </p>
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='h-6 w-6 animate-spin text-violet-600' />
            <span className='ml-2 text-slate-500'>Loading...</span>
          </div>
        ) : hasActiveConnection ? (
          /* Connected State */
          activeConnections.map(connection => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              onDisconnect={handleDisconnect}
              onPollNow={handlePollNow}
              isPolling={pollMutation.isPending}
              formatDate={formatDate}
            />
          ))
        ) : (
          /* Not Connected State */
          <div className='bg-white rounded-xl border border-slate-200 p-8 text-center'>
            <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-50'>
              <Mail className='h-7 w-7 text-violet-600' />
            </div>
            <h3 className='text-lg font-semibold text-slate-800 mb-2'>
              Connect Your Invoice Mailbox
            </h3>
            <p className='text-sm text-slate-500 mb-6 max-w-md mx-auto'>
              Connect a dedicated invoice email address (e.g.,
              invoices@yourcompany.com) to automatically import invoices from
              vendor emails.
            </p>
            <button
              onClick={handleConnect}
              disabled={connecting}
              className='inline-flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {connecting ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Mail className='h-4 w-4' />
              )}
              Connect with Microsoft 365
            </button>
            <p className='mt-4 text-xs text-slate-400'>
              Gmail and IMAP support coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface ConnectionCardProps {
  connection: EmailConnection;
  onDisconnect: (id: number) => void;
  onPollNow: () => void;
  isPolling: boolean;
  formatDate: (d: string | null) => string;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  onDisconnect,
  onPollNow,
  isPolling,
  formatDate,
}) => {
  const statusColor =
    connection.status === 'ACTIVE'
      ? 'text-green-600 bg-green-50'
      : connection.status === 'EXPIRED'
        ? 'text-amber-600 bg-amber-50'
        : 'text-red-600 bg-red-50';

  const StatusIcon =
    connection.status === 'ACTIVE'
      ? CheckCircle2
      : connection.status === 'EXPIRED'
        ? AlertCircle
        : XCircle;

  return (
    <div className='bg-white rounded-xl border border-slate-200 p-6'>
      {/* Status header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-violet-50'>
            <Mail className='h-5 w-5 text-violet-600' />
          </div>
          <div>
            <h3 className='text-base font-semibold text-slate-800'>
              {connection.emailAddress}
            </h3>
            <p className='text-xs text-slate-400'>
              {connection.provider.replace('_', ' ')}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor}`}
        >
          <StatusIcon size={12} />
          {connection.status}
        </span>
      </div>

      {/* Stats grid */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        <div className='rounded-lg bg-slate-50 p-3'>
          <p className='text-xs text-slate-400 mb-1'>Last Checked</p>
          <p className='text-sm font-medium text-slate-700'>
            {formatDate(connection.lastPolledAt)}
          </p>
        </div>
        <div className='rounded-lg bg-slate-50 p-3'>
          <p className='text-xs text-slate-400 mb-1'>Invoices Ingested</p>
          <p className='text-sm font-medium text-slate-700'>
            {connection.invoicesIngested}
          </p>
        </div>
        <div className='rounded-lg bg-slate-50 p-3'>
          <p className='text-xs text-slate-400 mb-1'>Connected On</p>
          <p className='text-sm font-medium text-slate-700'>
            {formatDate(connection.createdAt)}
          </p>
        </div>
      </div>

      {/* Error alert */}
      {connection.lastError && (
        <div className='mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600'>
          <AlertCircle size={16} className='mt-0.5 shrink-0' />
          <span>{connection.lastError}</span>
        </div>
      )}

      {/* Actions */}
      <div className='flex items-center gap-3'>
        <button
          onClick={onPollNow}
          disabled={isPolling}
          className='inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition-colors'
        >
          <RefreshCw size={14} className={isPolling ? 'animate-spin' : ''} />
          {isPolling ? 'Checking...' : 'Check Now'}
        </button>
        <button
          onClick={() => onDisconnect(connection.id)}
          className='inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors'
        >
          <Unplug size={14} />
          Disconnect
        </button>
      </div>
    </div>
  );
};

export default EmailSettingsPage;
