// src/components/InvoicePDF.tsx
import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

interface OrderItem {
    product_name?: string;
    name?: string;
    price: number;
    quantity: number;
}

interface ShippingAddress {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    phone?: string;
}

interface Order {
    _id: string;
    order_number?: string;
    user_id?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    items: OrderItem[];
    subtotal: number;
    shipping_cost: number;
    tax_amount: number;
    total: number;
    created_at: string;
    status: string;
    shipping_address?: string | ShippingAddress;
    tracking_number?: string;
}

interface InvoicePDFProps {
    order: Order;
}

const InvoicePDF = forwardRef<HTMLDivElement, InvoicePDFProps>(({ order }, ref) => {
    console.log(order);
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM dd, yyyy');
    };

    const renderShippingAddress = () => {
        if (!order.shipping_address) return null;

        if (typeof order.shipping_address === "string") {
            return <p className="text-sm">{order.shipping_address}</p>;
        }

        return (
            <div className="text-sm">
                {order.shipping_address.name && <p className="font-medium">{order.shipping_address.name}</p>}
                <p>{order.shipping_address.street}</p>
                <p>
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                </p>
                {order.shipping_address.country && <p>{order.shipping_address.country}</p>}
                {order.shipping_address.phone && <p>📞 {order.shipping_address.phone}</p>}
            </div>
        );
    };

    return (
        <div ref={ref} className="p-6 bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold">INVOICE</h1>
                    <p className="text-gray-500">Order #{order.order_number || order._id.slice(-8)}</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold">Date: {formatDate(order.created_at)}</p>
                    <p>Status: <span className="capitalize">{order.status}</span></p>
                    {order.tracking_number && <p>Tracking #: {order.tracking_number}</p>}
                </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h2 className="text-lg font-semibold mb-2">Bill To:</h2>
                    <p>{order.user_id?.name || 'Customer'}</p>
                    <p>{order.user_id?.email || '—'}</p>
                    <p>{order.user_id?.phone || '—'}</p>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-2">Ship To:</h2>
                    {renderShippingAddress()}
                </div>
            </div>

            {/* Order Items */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Order Items</h2>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="text-left p-2 border">Product</th>
                            <th className="text-left p-2 border">Price</th>
                            <th className="text-left p-2 border">Qty</th>
                            <th className="text-left p-2 border">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item, index) => (
                            <tr key={index}>
                                <td className="p-2 border">{item.product_name || item.name}</td>
                                <td className="p-2 border">{formatCurrency(item.price)}</td>
                                <td className="p-2 border">{item.quantity}</td>
                                <td className="p-2 border">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Order Summary */}
            <div className="ml-auto w-64">
                <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(order.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span>Shipping:</span>
                    <span>{formatCurrency(order.shipping_cost || 0)}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span>Tax:</span>
                    <span>{formatCurrency(order.tax_amount || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total || 0)}</span>
                </div>
            </div>

            {/* Shipping Label */}
            <div className="mt-8 p-4 border border-dashed">
                <h3 className="font-semibold text-center mb-2">SHIPPING LABEL</h3>
                <div className="flex">
                    <div className="w-2/3">
                        <p className="font-semibold">TO:</p>
                        {renderShippingAddress()}
                    </div>
                    <div className="w-1/3 flex flex-col items-center justify-center">
                        <QRCodeSVG
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/track-order/${order._id}`}
                            size={96}
                        />
                        <p className="text-xs mt-1 text-center">Scan to track package</p>
                    </div>
                </div>
            </div>

            {/* Tracking QR */}
            <div className="mt-12 pt-8 border-t text-center">
                <h3 className="font-semibold mb-2">Scan to Track Order</h3>
                <div className="flex justify-center">
                    <QRCodeSVG
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/track-order/${order._id}`}
                        size={128}
                    />
                </div>
                <p className="mt-2 text-sm text-gray-600">Order Tracking QR Code</p>
            </div>
        </div>
    );
});

InvoicePDF.displayName = 'InvoicePDF';

export default InvoicePDF;