const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let loadingPromise = null;

// Loads Razorpay Checkout once and reuses it; resolves to window.Razorpay
export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => {
      loadingPromise = null; // allow retry
      reject(new Error("Could not load Razorpay. Check your internet connection."));
    };
    document.body.appendChild(script);
  });
  return loadingPromise;
}
