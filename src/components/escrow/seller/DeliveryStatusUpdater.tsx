import { Truck, CheckCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  currentStatus: string;
  onUpdateStatus: (status: "shipped" | "delivered") => void;
  isLoading?: boolean;
};

export default function DeliveryStatusUpdater({ currentStatus, onUpdateStatus, isLoading }: Props) {
  const isShipped = currentStatus === "shipped" || currentStatus === "delivered";
  const isDelivered = currentStatus === "delivered";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mt-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" />
        Delivery Tracking
      </h3>
      
      <p className="text-sm text-slate-500 mb-6">
        Update the fulfillment status below to keep the buyer informed. Once marked as delivered, the buyer has 15 days to inspect before auto-release.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => onUpdateStatus("shipped")}
          disabled={isShipped || isLoading}
          variant={isShipped ? "secondary" : "default"}
          className={`flex-1 ${isShipped ? "bg-slate-100 text-slate-500" : "bg-primary text-white"} py-6 font-bold flex items-center justify-center gap-2`}
        >
          <Truck className="w-5 h-5" />
          Mark as Shipped
        </Button>

        <Button
          onClick={() => onUpdateStatus("delivered")}
          disabled={!isShipped || isDelivered || isLoading}
          variant={isDelivered ? "secondary" : "default"}
          className={`flex-1 ${isDelivered ? "bg-slate-100 text-slate-500" : "bg-emerald-600 hover:bg-emerald-700 text-white"} py-6 font-bold flex items-center justify-center gap-2`}
        >
          <CheckCircle className="w-5 h-5" />
          Mark as Delivered
        </Button>
      </div>
    </div>
  );
}
