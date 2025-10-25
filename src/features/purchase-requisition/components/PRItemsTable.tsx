import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2 } from 'lucide-react';

interface PurchaseRequisitionItem {
  id: string;
  model: string;
  make: string;
  category: string;
  subCategory: string;
  uom: string;
  description: string;
  quantity: number;
  indicativePrice: number;
  subTotal: number;
}

interface PRItemsTableProps {
  items: (PurchaseRequisitionItem & { id: string })[];
  onItemUpdate: (index: number, item: Omit<PurchaseRequisitionItem, 'id' | 'subTotal'>) => void;
  onItemRemove: (index: number) => void;
  errors?: any;
}

export const PRItemsTable: React.FC<PRItemsTableProps> = ({
  items,
  onItemUpdate,
  onItemRemove,
  errors,
}) => {
  const handleInputChange = (index: number, field: string, value: any) => {
    const currentItem = items[index];
    const updatedItem = {
      model: currentItem.model,
      make: currentItem.make,
      category: currentItem.category,
      subCategory: currentItem.subCategory,
      uom: currentItem.uom,
      description: currentItem.description,
      quantity: currentItem.quantity,
      indicativePrice: currentItem.indicativePrice,
      [field]: field === 'quantity' || field === 'indicativePrice' ? Number(value) : value,
    };
    onItemUpdate(index, updatedItem);
  };

  if (items.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">No items added yet. Click "Add New Line Item" to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              S.No
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Model
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Make
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sub Category
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              UOM
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Indicative Price
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sub Total
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, index) => (
            <tr key={item.id}>
              <td className="px-3 py-2 text-center font-medium text-gray-700">
                {index + 1}
              </td>
              <td className="px-3 py-2">
                <Input
                  value={item.model}
                  onChange={(e) => handleInputChange(index, 'model', e.target.value)}
                  placeholder="Enter model"
                  className="min-w-[120px]"
                  error={errors?.[index]?.model?.message}
                />
              </td>
              <td className="px-3 py-2">
                <Input
                  value={item.make}
                  onChange={(e) => handleInputChange(index, 'make', e.target.value)}
                  placeholder="Enter make"
                  className="min-w-[120px]"
                  error={errors?.[index]?.make?.message}
                />
              </td>
              <td className="px-3 py-2">
                <select
                  value={item.category}
                  onChange={(e) => handleInputChange(index, 'category', e.target.value)}
                  className="w-full min-w-[120px] px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Software">Software</option>
                </select>
                {errors?.[index]?.category && (
                  <p className="mt-1 text-xs text-red-600">{errors[index].category.message}</p>
                )}
              </td>
              <td className="px-3 py-2">
                <select
                  value={item.subCategory}
                  onChange={(e) => handleInputChange(index, 'subCategory', e.target.value)}
                  className="w-full min-w-[120px] px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  <option value="Computers">Computers</option>
                  <option value="Printers">Printers</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Stationery">Stationery</option>
                </select>
                {errors?.[index]?.subCategory && (
                  <p className="mt-1 text-xs text-red-600">{errors[index].subCategory.message}</p>
                )}
              </td>
              <td className="px-3 py-2">
                <select
                  value={item.uom}
                  onChange={(e) => handleInputChange(index, 'uom', e.target.value)}
                  className="w-full min-w-[80px] px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  <option value="PC">PC</option>
                  <option value="SET">SET</option>
                  <option value="UNIT">UNIT</option>
                  <option value="BOX">BOX</option>
                  <option value="KG">KG</option>
                </select>
                {errors?.[index]?.uom && (
                  <p className="mt-1 text-xs text-red-600">{errors[index].uom.message}</p>
                )}
              </td>
              <td className="px-3 py-2">
                <Input
                  value={item.description}
                  onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                  placeholder="Enter description"
                  className="min-w-[150px]"
                  error={errors?.[index]?.description?.message}
                />
              </td>
              <td className="px-3 py-2">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
                  placeholder="0"
                  min="1"
                  className="min-w-[80px]"
                  error={errors?.[index]?.quantity?.message}
                />
              </td>
              <td className="px-3 py-2">
                <Input
                  type="number"
                  value={item.indicativePrice}
                  onChange={(e) => handleInputChange(index, 'indicativePrice', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="min-w-[100px]"
                  error={errors?.[index]?.indicativePrice?.message}
                />
              </td>
              <td className="px-3 py-2 text-right font-medium">
                {item.subTotal.toFixed(2)}
              </td>
              <td className="px-3 py-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onItemRemove(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};