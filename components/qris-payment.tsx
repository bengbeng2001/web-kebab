'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';

interface QrisPaymentProps {
  amount: number;
}

export function QrisPayment({ amount }: QrisPaymentProps) {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Pembayaran QRIS</CardTitle>
        <CardDescription>Scan QR code di bawah untuk pembayaran</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="w-48 h-48 flex items-center justify-center rounded-lg">
          <Image 
            src="/images/qris.png" 
            alt="QRIS Code" 
            width={192}
            height={192}
            className="rounded-lg"
          />
        </div>
        <div className="mt-6 text-center">
          <p className="text-lg text-muted-foreground">Jumlah yang harus dibayar:</p>
          <p className="text-3xl font-bold text-primary">Rp {amount.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
} 