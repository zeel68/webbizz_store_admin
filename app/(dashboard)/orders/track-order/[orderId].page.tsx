// src/app/track-order/[orderId]/page.tsx
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle, CheckCircle, Clock, Loader2, Truck, X, XCircle } from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    returned: "bg-orange-100 text-orange-800",
};

const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    processing: <AlertCircle className="h-4 w-4" />,
    shipped: <Truck className="h-4 w-4" />,
    delivered: <CheckCircle className="h-4 w-4" />,
    cancelled: <XCircle className="h-4 w-4" />,
    returned: <X className="h-4 w-4" />,
};

export default function TrackOrderPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { fetchOrder } = useOrderStore();

    useEffect(() => {
        const loadOrder = async () => {
            try {
                const orderData = await fetchOrder(orderId as string);
                setOrder(orderData);
            } catch (error) {
                console.error("Failed to load order:", error);
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [orderId, fetchOrder]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold">Order not found</h2>
                <p className="text-muted-foreground mt-2">
                    The order you're looking for doesn't exist or has been removed
                </p>
                <Button className="mt-4" onClick={() => router.push('/')}>
                    Go back to orders
                </Button>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
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
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.back()}
            >
                &larr; Back to Orders
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        Order Tracking
                        <Badge className={`gap-1 px-3 py-1 ${statusColors[order.status]}`}>
                            {statusIcons[order.status]}
                            <span className="capitalize">{order.status}</span>
                        </Badge>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Order Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4">
                            <h3 className="font-semibold mb-2">Order Information</h3>
                            <p>Order #: {order.order_number || order._id.slice(-8)}</p>
                            <p>Date: {formatDate(order.created_at)}</p>
                            {order.tracking_number && <p>Tracking #: {order.tracking_number}</p>}
                        </Card>

                        <Card className="p-4">
                            <h3 className="font-semibold mb-2">Customer</h3>
                            <p>{order.user_id?.name || 'Customer'}</p>
                            <p>{order.user_id?.email || '—'}</p>
                            <p>{order.user_id?.phone || '—'}</p>
                        </Card>

                        <Card className="p-4">
                            <h3 className="font-semibold mb-2">Shipping Address</h3>
                            {renderShippingAddress()}
                        </Card>
                    </div>

                    {/* Order Timeline */}
                    <Card className="p-4">
                        <h3 className="font-semibold mb-4">Order Status Timeline</h3>
                        <div className="relative pl-8 border-l-2 border-gray-200">
                            <div className="mb-6 relative">
                                <div className="absolute -left-[11px] top-1 w-4 h-4 rounded-full bg-blue-500"></div>
                                <div className="ml-4">
                                    <p className="font-medium">Order Placed</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(order.created_at)}
                                    </p>
                                </div>
                            </div>

                            {order.status !== 'pending' && (
                                <div className="mb-6 relative">
                                    <div className="absolute -left-[11px] top-1 w-4 h-4 rounded-full bg-green-500"></div>
                                    <div className="ml-4">
                                        <p className="font-medium">Order Confirmed</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(order.updated_at)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {['shipped', 'delivered'].includes(order.status) && (
                                <div className="mb-6 relative">
                                    <div className="absolute -left-[11px] top-1 w-4 h-4 rounded-full bg-purple-500"></div>
                                    <div className="ml-4">
                                        <p className="font-medium">Shipped</p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.tracking_number ? `Tracking #: ${order.tracking_number}` : 'In transit'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {order.status === 'delivered' && (
                                <div className="relative">
                                    <div className="absolute -left-[11px] top-1 w-4 h-4 rounded-full bg-green-500"></div>
                                    <div className="ml-4">
                                        <p className="font-medium">Delivered</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(order.updated_at)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Order Items */}
                    <Card className="p-4">
                        <h3 className="font-semibold mb-4">Order Items</h3>
                        <div className="space-y-3">
                            {order.items?.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between border-b pb-3">
                                    <div>
                                        <p>{item.product_name || item.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatCurrency(item.price)} × {item.quantity}
                                        </p>
                                    </div>
                                    <p>{formatCurrency(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 ml-auto w-64">
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
                    </Card>
                </CardContent>
            </Card>
        </div>
    );
}