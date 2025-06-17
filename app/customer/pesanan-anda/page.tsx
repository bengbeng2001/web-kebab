'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { SkeletonCard } from '@/components/skeleton';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { QrisPayment } from "@/components/qris-payment";
import { generateReceiptPDF } from '@/lib/pdf/receipt';
import { Order } from '@/lib/types/orders_interface';
import { UUID } from 'node:crypto';

interface Customer {
  id: UUID;
  username: string;
  address: string;
  phone: string; // Changed from phone_number
}

interface OrderProduct {
  id: UUID;
  order_id: UUID;
  product_id: UUID;
  product_name: string;
  categories_id: UUID;
  categories_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const authUserId = searchParams.get('userId');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQrisDialogOpen, setIsQrisDialogOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState<UUID | null>(null);
  const [isWhatsappConfirmDialogOpen, setIsWhatsappConfirmDialogOpen] = useState(false);
  const [selectedOrderForWhatsapp, setSelectedOrderForWhatsapp] = useState<Order | null>(null);
  const supabase = createClient();

  // Define fetchOrders outside useEffect to make it accessible
  const fetchOrders = async () => {
    if (!authUserId) {
      console.log("No authUserId found in search params.");
      setLoading(false);
      return;
    }
    console.log("Fetching public_users_id for authUserId:", authUserId);

    try {
      setLoading(true);
      setError(null);

      // First, get the public_users_id from users_public using authUserId
      const { data: userData, error: userDataError } = await supabase
        .from('users_public')
        .select('id, phone')
        .eq('auth_id', authUserId)
        .single();

      if (userDataError) {
        console.error("Error fetching user_public data:", userDataError);
        throw userDataError;
      }

      if (!userData) {
        console.log("No user_public data found for authUserId:", authUserId);
        setOrders([]);
        return;
      }
      const publicUserId = userData.id;
      console.log("Fetched publicUserId:", publicUserId);

      // Then, fetch orders for this publicUserId
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          customer:users_public!public_users_id (
            id,
            username,
            address,
            phone
          ),
          order_products (*)
        `)
        .eq('public_users_id', publicUserId)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        throw ordersError;
      }

      console.log("Fetched orders data:", ordersData);
      setOrders(ordersData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error("Caught error in fetchOrders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [authUserId]); // Use authUserId as dependency

  // New function to open cancel dialog
  const handleOpenCancelDialog = (orderId: UUID) => {
    setSelectedOrderToCancel(orderId);
    setIsCancelDialogOpen(true);
  };

  // Modified handleCancelOrder to be the confirmation action
  const handleConfirmCancelOrder = async () => {
    if (!selectedOrderToCancel) return; // Should not happen if dialog is opened correctly

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', selectedOrderToCancel);

      if (error) {
        console.error("Error cancelling order:", error);
        throw error;
      }

      console.log("Order cancelled successfully");
      setIsCancelDialogOpen(false); // Close dialog
      setSelectedOrderToCancel(null); // Clear selected order
      await fetchOrders(); // Refresh orders
    } catch (err) {
      console.error("Caught error in handleConfirmCancelOrder:", err);
    }
  };

  const handleOpenQrisPayment = (order: Order) => {
    if (order.payment_amount < order.total_price) {
      alert(`Jumlah pembayaran (${order.payment_amount.toLocaleString()}) lebih kecil dari total harga (${order.total_price.toLocaleString()}). Mohon bayar sesuai jumlah.`);
      return;
    }
    setSelectedOrderForPayment(order);
    setIsQrisDialogOpen(true);
  };

  // Modified handleProcessPayment to generate PDF using pdfmake
  const handleProcessPayment = async () => {
    if (!selectedOrderForPayment) return;

    try {
      const orderToPrint = selectedOrderForPayment;
      const dateFormatter = new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resi Pesanan #${orderToPrint.order_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 16px; }
          .receipt { max-width: 100%; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 16px; }
          .header h1 { font-size: 1.25rem; font-weight: bold; margin: 0; }
          .header p { font-size: 0.75rem; margin: 4px 0; }
          .info { font-size: 0.875rem; margin-bottom: 16px; }
          .divider { border-top: 2px dashed #ccc; margin: 16px 0; }
          table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
          th, td { padding: 4px; text-align: left; }
          th { font-weight: bold; }
          .total { font-size: 0.875rem; margin: 16px 0; }
          .total-row { display: flex; justify-content: space-between; margin: 4px 0; }
          .footer { text-align: center; font-size: 0.875rem; margin-top: 16px; }
          @media print {
            body { margin: 0; }
            .receipt { width: 80mm; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>Kebab Sayank</h1>
            <p>Jl. Karang Menjangan No.75, Airlangga, Kec. Gubeng, Surabaya, Jawa Timur 60286</p>
          </div>

          <div class="info">
            <p>No. Pesanan: #${orderToPrint.order_number}</p>
            <p>Nama Customer: ${orderToPrint.customer?.username || ''}</p>
            <p>No. Telp: ${orderToPrint.customer?.phone || ''}</p>
            <p>Alamat Customer: ${orderToPrint.customer?.address || ''}</p>
          </div>

          <div class="info">
            <p>Tanggal Cetak: ${dateFormatter.format(new Date())}</p>
            <p>Kasir: ${orderToPrint.cashier}</p>
            <p>Tipe: ${orderToPrint.order_type}</p>
            <p>Metode Bayar: ${orderToPrint.payment_method}</p>
          </div>

          <div class="divider"></div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: right">Qty</th>
                <th style="text-align: right">Harga</th>
                <th style="text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderToPrint.order_products?.map(item => `
                <tr>
                  <td>${item.product_name}</td>
                  <td style="text-align: right">${item.quantity}</td>
                  <td style="text-align: right">Rp. ${(item.price || 0).toLocaleString('id-ID')}</td>
                  <td style="text-align: right">Rp. ${(item.subtotal || 0).toLocaleString('id-ID')}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>

          <div class="divider"></div>

          <div class="total">
            <div class="total-row">
              <span>Total Produk:</span>
              <span>${orderToPrint.total_items || 0}</span>
            </div>
            <div class="total-row" style="font-weight: bold">
              <span>Total Harga:</span>
              <span>Rp. ${(orderToPrint.total_price || 0).toLocaleString('id-ID')}</span>
            </div>
            <div class="total-row">
              <span>Jumlah Bayar:</span>
              <span>Rp. ${(orderToPrint.payment_amount || 0).toLocaleString('id-ID')}</span>
            </div>
            <div class="total-row">
              <span>STATUS:</span>
              <span>${(orderToPrint.status || '').toUpperCase()}</span>
            </div>
          </div>

          <div class="footer">
            <p>Terima kasih atas kunjungan Anda</p>
            <p>Bila Ada Kritik saran silahkan hubungi kami</p>
            <p>0858-2024-7769 (WhatsApp)</p>
          </div>
        </div>
      </body>
      </html>
      `;

      // Create a blob from the HTML content
      const blob = new Blob([printContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `Resi_Pesanan_${orderToPrint.order_number}.html`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);

      // Open WhatsApp confirmation dialog
      setSelectedOrderForWhatsapp(orderToPrint);
      setIsWhatsappConfirmDialogOpen(true);

      // Close the QRIS dialog
      setIsQrisDialogOpen(false);
      setSelectedOrderForPayment(null);

    } catch (err) {
      console.error("Caught error in handleProcessPayment:", err);
    }
  };

  // New function to handle confirming opening WhatsApp
  const handleConfirmOpenWhatsApp = () => {
    if (!selectedOrderForWhatsapp) return;

    const whatsappNumber = '+6285820247769'; // Fallback number
    const genericWhatsappMessage = encodeURIComponent("Halo, saya ingin mengirimkan resi pesanan saya. Silakan lihat file terlampir.");
    window.open(`https://wa.me/${whatsappNumber}?text=${genericWhatsappMessage}`, '_blank');

    setIsWhatsappConfirmDialogOpen(false); // Close the dialog
    setSelectedOrderForWhatsapp(null); // Clear selected order
  };

  const handlePrintReceipt = async (orderToPrint: Order) => {
    try {
      // Generate and download PDF
      const pdfDoc = generateReceiptPDF(orderToPrint);
      pdfDoc.download(`Resi_Pesanan_${orderToPrint.order_number}.pdf`);

      // Update printed_at status di database
      const { error } = await supabase
        .from('orders')
        .update({ printed_at: new Date().toISOString() })
        .eq('id', orderToPrint.id);

      if (error) {
        console.error("Error updating printed_at status:", error);
      }
      await fetchOrders();
    } catch (err) {
      console.error("Caught error in handlePrintReceipt:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) return <SkeletonCard />;
  if (error) return <div className="container mx-auto p-4">Error: {error}</div>;
  if (!orders.length) return <div className="container mx-auto p-4">No orders found</div>;

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Pesanan Anda</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Order #{order.order_number}</CardTitle>
                  <CardDescription>
                    {format(new Date(order.created_at), 'PPP', { locale: id })}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">{order.customer?.username}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{order.customer?.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Address</p>
                    <p className="font-medium">{order.customer?.address}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tipe Pesanan</p>
                    <p className="font-medium">{order.order_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Metode Pembayaran</p>
                    <p className="font-medium">{order.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Items</p>
                    <p className="font-medium">{order.total_items}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Harga</p>
                    <p className="font-medium">Rp {order.total_price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Jumlah Dibayar</p>
                    <p className="font-medium">Rp {order.payment_amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Items:</h3>
                  <div className="space-y-2">
                    {((order.order_products || [])).map((product) => (
                      <div key={product.id} className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium">{product.product_name}</p>
                          <p className="text-muted-foreground">
                            {product.quantity}x @ Rp {product.price.toLocaleString()}
                          </p>
                        </div>
                        <p className="font-medium">
                          Rp {product.subtotal.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {order.status === 'pending' && (
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleOpenCancelDialog(order.id)}
                      className='bg-red-600'
                    >
                      Batalkan Pesanan
                    </Button>
                    <Button onClick={() => handleOpenQrisPayment(order)}>
                      Pembayaran
                    </Button>
                  </div>
                )}

                {order.status === 'completed' && (
                  <div className="flex justify-end mt-4">
                    <Button onClick={() => handlePrintReceipt(order)}>
                      Print Resi
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isQrisDialogOpen} onOpenChange={setIsQrisDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pembayaran Order #{selectedOrderForPayment?.order_number}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedOrderForPayment && (
              <QrisPayment amount={selectedOrderForPayment.total_price} />
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsQrisDialogOpen(false)}
            >
              Tutup
            </Button>
            <Button onClick={handleProcessPayment}>
              Konfirmasi & Download Resi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pembatalan Pesanan</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Apakah Anda yakin ingin membatalkan pesanan ini? Aksi ini tidak dapat dibatalkan.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCancelDialogOpen(false);
                setSelectedOrderToCancel(null);
              }}
            >
              Batal
            </Button>
            <Button onClick={handleConfirmCancelOrder}>
              Ya, Batalkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isWhatsappConfirmDialogOpen} onOpenChange={setIsWhatsappConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buka WhatsApp?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Resi telah berhasil diunduh. Apakah Anda ingin membuka WhatsApp untuk mengirimkannya secara manual?</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsWhatsappConfirmDialogOpen(false);
                setSelectedOrderForWhatsapp(null);
              }}
            >
              Tidak
            </Button>
            <Button onClick={handleConfirmOpenWhatsApp}>
              Ya, Buka WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersContent />
    </Suspense>
  );
} 