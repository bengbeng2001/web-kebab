import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorCardProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorCard({ message = "Terjadi kesalahan", onRetry }: ErrorCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center gap-4">
        <AlertCircle className="h-6 w-6 text-red-500" />
        <CardTitle className="text-xl">Oops! Ada Kesalahan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{message}</p>
        {onRetry && (
          <Button 
            onClick={onRetry}
            className="w-full"
          >
            Coba Lagi
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 