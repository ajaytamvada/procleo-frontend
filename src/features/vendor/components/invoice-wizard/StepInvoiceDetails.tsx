import React from 'react';
import { FileText, Building2 } from 'lucide-react';
import OcrFieldWrapper from './OcrFieldWrapper';

interface StepInvoiceDetailsProps {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  paymentTerms: string;
  remarks: string;
  supplierGstin: string;
  supplierPan: string;
  billingAddress: string;
  shippingAddress: string;
  ocrFilledFields: Set<string>;
  minInvoiceDate?: string;
  onFieldChange: (field: string, value: string) => void;
}

const StepInvoiceDetails: React.FC<StepInvoiceDetailsProps> = ({
  invoiceNumber,
  invoiceDate,
  dueDate,
  currency,
  paymentTerms,
  remarks,
  supplierGstin,
  supplierPan,
  billingAddress,
  shippingAddress,
  ocrFilledFields,
  minInvoiceDate,
  onFieldChange,
}) => {
  const inputCls =
    'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500';

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Invoice Details */}
      <div className='bg-white border rounded-lg overflow-hidden shadow-sm'>
        <div className='p-4 border-b bg-gray-50 flex items-center gap-2'>
          <FileText className='w-5 h-5 text-violet-600' />
          <h2 className='text-lg font-semibold text-gray-900'>
            Invoice Details
          </h2>
        </div>
        <div className='p-6 grid grid-cols-1 md:grid-cols-3 gap-6'>
          <OcrFieldWrapper
            label='Invoice Number'
            fieldName='invoiceNumber'
            ocrFilledFields={ocrFilledFields}
            required
          >
            <input
              type='text'
              value={invoiceNumber}
              onChange={e => onFieldChange('invoiceNumber', e.target.value)}
              className={inputCls}
              placeholder='Enter invoice number'
            />
          </OcrFieldWrapper>

          <OcrFieldWrapper
            label='Invoice Date'
            fieldName='invoiceDate'
            ocrFilledFields={ocrFilledFields}
            required
          >
            <input
              type='date'
              value={invoiceDate}
              onChange={e => onFieldChange('invoiceDate', e.target.value)}
              min={minInvoiceDate}
              className={inputCls}
            />
          </OcrFieldWrapper>

          <OcrFieldWrapper
            label='Due Date'
            fieldName='dueDate'
            ocrFilledFields={ocrFilledFields}
          >
            <input
              type='date'
              value={dueDate}
              onChange={e => onFieldChange('dueDate', e.target.value)}
              className={inputCls}
            />
          </OcrFieldWrapper>

          <OcrFieldWrapper
            label='Currency'
            fieldName='currency'
            ocrFilledFields={ocrFilledFields}
          >
            <select
              value={currency}
              onChange={e => onFieldChange('currency', e.target.value)}
              className={inputCls}
            >
              <option value='INR'>INR - Indian Rupee</option>
              <option value='USD'>USD - US Dollar</option>
              <option value='EUR'>EUR - Euro</option>
              <option value='GBP'>GBP - British Pound</option>
            </select>
          </OcrFieldWrapper>

          <OcrFieldWrapper
            label='Payment Terms'
            fieldName='paymentTerms'
            ocrFilledFields={ocrFilledFields}
          >
            <input
              type='text'
              value={paymentTerms}
              onChange={e => onFieldChange('paymentTerms', e.target.value)}
              className={inputCls}
              placeholder='e.g., Net 30'
            />
          </OcrFieldWrapper>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Remarks
            </label>
            <input
              type='text'
              value={remarks}
              onChange={e => onFieldChange('remarks', e.target.value)}
              className={inputCls}
              placeholder='Optional remarks'
            />
          </div>
        </div>
      </div>

      {/* Supplier & Address Details */}
      <div className='bg-white border rounded-lg overflow-hidden shadow-sm'>
        <div className='p-4 border-b bg-gray-50 flex items-center gap-2'>
          <Building2 className='w-5 h-5 text-violet-600' />
          <h2 className='text-lg font-semibold text-gray-900'>
            Supplier & Address Details
          </h2>
        </div>
        <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
          <OcrFieldWrapper
            label='Supplier GSTIN'
            fieldName='supplierGstin'
            ocrFilledFields={ocrFilledFields}
          >
            <input
              type='text'
              value={supplierGstin}
              onChange={e => onFieldChange('supplierGstin', e.target.value)}
              className={inputCls}
              placeholder='e.g., 27AABCU9603R1ZM'
              maxLength={15}
            />
          </OcrFieldWrapper>

          <OcrFieldWrapper
            label='Supplier PAN'
            fieldName='supplierPan'
            ocrFilledFields={ocrFilledFields}
          >
            <input
              type='text'
              value={supplierPan}
              onChange={e => onFieldChange('supplierPan', e.target.value)}
              className={inputCls}
              placeholder='e.g., AABCU9603R'
              maxLength={10}
            />
          </OcrFieldWrapper>

          <OcrFieldWrapper
            label='Billing Address'
            fieldName='billingAddress'
            ocrFilledFields={ocrFilledFields}
          >
            <textarea
              value={billingAddress}
              onChange={e => onFieldChange('billingAddress', e.target.value)}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder='Billing address'
            />
          </OcrFieldWrapper>

          <OcrFieldWrapper
            label='Shipping Address'
            fieldName='shippingAddress'
            ocrFilledFields={ocrFilledFields}
          >
            <textarea
              value={shippingAddress}
              onChange={e => onFieldChange('shippingAddress', e.target.value)}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder='Shipping address'
            />
          </OcrFieldWrapper>
        </div>
      </div>
    </div>
  );
};

export default StepInvoiceDetails;
