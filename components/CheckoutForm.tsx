"use client";

import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";

interface CheckoutFormProps {
  total: number;
  onSuccess: () => void;
  shippingDetails: any;
  items: any[];
  email: string;
}

export default function CheckoutForm({ total, items, email, shippingDetails }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL where the customer should be redirected after payment
        return_url: `${window.location.origin}/success`,
        shipping: {
          name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
          address: {
            line1: shippingDetails.address,
            city: shippingDetails.city,
            state: shippingDetails.state,
            postal_code: shippingDetails.zipCode,
            country: shippingDetails.country === "United States" ? "US" : shippingDetails.country,
          }
        }
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message ?? "An unexpected error occurred.");
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <div id="payment-form" className="space-y-8">
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      
      <div className="pt-6">
        <button
          disabled={isLoading || !stripe || !elements}
          onClick={handleSubmit}
          className="w-full lg:w-max px-16 bg-black text-white py-5 text-[11px] font-luxury tracking-[0.2em] uppercase hover:bg-zinc-800 transition-all duration-500 shadow-2xl active:scale-[0.98] rounded-full flex items-center justify-center gap-3 disabled:bg-zinc-400"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Processing...
            </>
          ) : (
            `Pay $${total.toLocaleString()}`
          )}
        </button>
      </div>
      
      {message && <div id="payment-message" className="text-red-500 text-xs mt-4 font-medium uppercase tracking-widest">{message}</div>}
    </div>
  );
}
