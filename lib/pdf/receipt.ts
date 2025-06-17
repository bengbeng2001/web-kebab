import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Order } from '@/lib/types/orders_interface';
import { TDocumentDefinitions, Content } from 'pdfmake/interfaces';

// Initialize pdfMake with fonts
pdfMake.vfs = pdfFonts.vfs;

export const generateReceiptPDF = (order: Order) => {
  const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const docDefinition: TDocumentDefinitions = {
    content: [
      { text: 'KEBAB SAYANK', style: 'header', alignment: 'center' },
      {
        text: [
          { text: 'No. Pesanan: #', style: 'header', alignment: 'center' },
          { text: `${order.order_number}\n`, style: 'header', alignment: 'center'  }
        ]
      },
      { text: 'Jl. Karang Menjangan No.75, Airlangga, Kec. Gubeng, Surabaya, Jawa Timur 60286', style: 'subheader', alignment: 'center' },
      {
        text: [
          { text: 'Nama Customer: ', bold: true },
          { text: `${order.customer?.username || ''}\n` }
        ]
      },
      {
        text: [
          { text: 'No. Telp: ', bold: true },
          { text: `${order.customer?.phone || ''}\n` }
        ]
      },
      {
        text: [
          { text: 'Alamat Customer: ', bold: true },
          { text: `${order.customer?.address || ''}\n` }
        ]
      },
      { text: '\n' },
      {
        text: [
          { text: 'Tanggal: ', bold: true },
          { text: `${dateFormatter.format(new Date(order.created_at))}\n` }
        ]
      },
      {
        text: [
          { text: 'Kasir: ', bold: true },
          { text: `${order.cashier}\n` }
        ]
      },
      {
        text: [
          { text: 'Tipe: ', bold: true },
          { text: `${order.order_type}\n` }
        ]
      },
      {
        text: [
          { text: 'Metode Bayar: ', bold: true },
          { text: `${order.payment_method}\n` }
        ]
      },
      { text: '\n' },
      { text: 'Daftar Item:', style: 'subheader' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Item', style: 'tableHeader' },
              { text: 'Qty', style: 'tableHeader' },
              { text: 'Harga', style: 'tableHeader' },
              { text: 'Total', style: 'tableHeader' }
            ],
            ...((order.order_products || [])).map(item => [
              item.product_name,
              item.quantity.toString(),
              `Rp ${Number(item.price || 0).toLocaleString('id-ID')}`,
              `Rp ${Number(item.subtotal || 0).toLocaleString('id-ID')}`
            ])
          ]
        }
      },
      { text: '\n' },
      {
        text: [
          { text: 'Total Produk: ', bold: true },
          { text: `${order.total_items || 0}\n` }
        ]
      },
      {
        text: [
          { text: 'Total Harga: ', bold: true },
          { text: `Rp ${Number(order.total_price || 0).toLocaleString('id-ID')}\n` }
        ]
      },
      {
        text: [
          { text: 'Jumlah Bayar: ', bold: true },
          { text: `Rp ${Number(order.payment_amount || 0).toLocaleString('id-ID')}\n` }
        ]
      },
      {
        text: [
          { text: 'STATUS: ', bold: true },
          { text: `${(order.status || '').toUpperCase()}\n` }
        ]
      },
      { text: '\n' },
      { text: 'Terima kasih atas kunjungan Anda', alignment: 'center' },
      { text: 'Bila Ada Kritik saran silahkan hubungi kami', alignment: 'center' },
      { text: '0858-2024-7769 (WhatsApp)', alignment: 'center' }
    ] as Content[],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 10,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      orderNumber: {
        fontSize: 12,
        bold: true,
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: 'black'
      }
    },
    defaultStyle: {
      fontSize: 10
    }
  };

  return pdfMake.createPdf(docDefinition);
}; 