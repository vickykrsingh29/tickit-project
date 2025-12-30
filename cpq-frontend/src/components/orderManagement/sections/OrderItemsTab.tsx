import React, { useRef } from 'react';

interface OrderItemsTabProps {
  OrderFormTable: React.ForwardRefExoticComponent<any>;
  orderFormTableRef: React.RefObject<any>;
  initialItems?: any[];
  onItemsChange?: (items: any[], totals: any) => void;
}

const OrderItemsTab = ({ 
  OrderFormTable, 
  orderFormTableRef, 
  initialItems, 
  onItemsChange 
}: OrderItemsTabProps) => {
  
  const lastItemsUpdateRef = useRef<string>("");
  
  const handleItemsChange = (items: any[], totals: any) => {
    if (onItemsChange) {
      const currentItemsString = JSON.stringify(items);
      if (currentItemsString !== lastItemsUpdateRef.current) {
        lastItemsUpdateRef.current = currentItemsString;
        onItemsChange(items, totals);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Order Items</h3>
        <p className="text-gray-600 text-sm">
          Add products to your order. You can add multiple products and specify quantities.
        </p>
      </div>
      
      <OrderFormTable 
        ref={orderFormTableRef} 
        initialData={initialItems} 
        isEditing={true}
        onItemsChange={handleItemsChange}
      />
    </div>
  );
};

export default OrderItemsTab;