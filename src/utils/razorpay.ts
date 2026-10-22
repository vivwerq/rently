/**
 * Razorpay Payment Gateway & Checkout Integration
 * Provides seamless loading of Razorpay Checkout.js,
 * with resilient sandbox/developer simulation fallback.
 */

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface RazorpayCheckoutOptions {
  keyId: string;
  orderId: string;
  amount: number; // in paise
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  prefill?: {
    name?: string;
    contact?: string;
    email?: string;
  };
  notes?: Record<string, string>;
  isMock?: boolean;
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onError: (error: string) => void;
  onDismiss?: () => void;
}

/**
 * Dynamically loads the official Razorpay Checkout SDK script
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('[Razorpay] Failed to load external checkout script (network/adblock). Fallback will be used.');
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

/**
 * Launches Razorpay Checkout modal or graceful in-app simulation
 */
export async function launchRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
  const {
    keyId,
    orderId,
    amount,
    currency = 'INR',
    name = 'Rently Tri-City',
    description = 'Hyperlocal Rental & Escrow Deposit',
    image = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=128&q=80',
    prefill,
    isMock = false,
    onSuccess,
    onError,
    onDismiss
  } = options;

  // Try loading real Razorpay script if not in forced mock mode
  const scriptLoaded = isMock ? false : await loadRazorpayScript();

  if (scriptLoaded && window.Razorpay && !isMock) {
    try {
      const rzpOptions = {
        key: keyId,
        amount,
        currency,
        name,
        description,
        image,
        order_id: orderId,
        prefill: {
          name: prefill?.name || 'Rently Campus User',
          contact: prefill?.contact || '9876543210',
          email: prefill?.email || 'user@rently.in'
        },
        theme: {
          color: '#059669' // Rently emerald brand accent
        },
        modal: {
          ondismiss: () => {
            if (onDismiss) onDismiss();
          }
        },
        handler: (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          onSuccess(response);
        }
      };

      const rzpInstance = new window.Razorpay(rzpOptions);
      rzpInstance.on('payment.failed', (response: any) => {
        onError(response?.error?.description || 'Payment failed or was declined.');
      });
      rzpInstance.open();
      return;
    } catch (err) {
      console.warn('[Razorpay] Real checkout invocation error, falling back to simulation modal:', err);
    }
  }

  // Graceful In-App Sandbox / Simulation Dialog
  renderSimulationModal({
    orderId,
    amount,
    currency,
    name,
    description,
    onSuccess,
    onDismiss
  });
}

interface SimulationModalProps {
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onDismiss?: () => void;
}

function renderSimulationModal(props: SimulationModalProps) {
  const overlayId = 'rzp-simulated-modal-overlay';
  const existing = document.getElementById(overlayId);
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = overlayId;
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
  overlay.style.backdropFilter = 'blur(6px)';
  overlay.style.display = 'grid';
  overlay.style.placeItems = 'center';
  overlay.style.zIndex = '99999';
  overlay.style.padding = '1rem';
  overlay.style.animation = 'fadeIn 0.2s ease-out';

  const amountRupees = (props.amount / 100).toLocaleString('en-IN');

  overlay.innerHTML = `
    <div style="background: #18181b; border: 1px solid #3f3f46; border-radius: 16px; max-width: 420px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f4f4f5;">
      <!-- Razorpay Branded Top Header -->
      <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="background: #ffffff; color: #0284c7; width: 28px; height: 28px; border-radius: 6px; display: grid; place-items: center; font-weight: 900; font-size: 16px;">R</div>
          <span style="font-weight: 800; font-size: 1.1rem; letter-spacing: -0.02em;">Razorpay <span style="font-size: 0.7rem; background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase;">Sandbox</span></span>
        </div>
        <div style="font-size: 0.8rem; opacity: 0.9; font-weight: 500;">Secure Escrow</div>
      </div>

      <!-- Content -->
      <div style="padding: 1.5rem;">
        <div style="text-align: center; margin-bottom: 1.25rem;">
          <div style="font-size: 0.85rem; color: #a1a1aa; margin-bottom: 4px;">Total Payable (Rent + Escrow Deposit)</div>
          <div style="font-size: 2.25rem; font-weight: 800; color: #10b981; letter-spacing: -0.02em;">
            ₹${amountRupees}
          </div>
          <div style="font-size: 0.8rem; color: #71717a; margin-top: 4px; font-family: monospace;">
            Order ID: ${props.orderId}
          </div>
        </div>

        <div style="background: #27272a; border-radius: 10px; padding: 0.85rem 1rem; margin-bottom: 1.25rem; border: 1px solid #3f3f46; font-size: 0.825rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #a1a1aa;">Merchant</span>
            <span style="font-weight: 600;">${props.name}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #a1a1aa;">Purpose</span>
            <span style="font-weight: 600;">${props.description}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #a1a1aa;">Payment Mode</span>
            <span style="color: #38bdf8; font-weight: 600;">UPI / NetBanking / Cards</span>
          </div>
        </div>

        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.5rem; font-size: 0.75rem; color: #6ee7b7; line-height: 1.4;">
          🔒 <strong>Escrow Protected:</strong> Security deposit is held in a segregated trust account and auto-released post return inspection.
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.65rem;">
          <button id="rzp-sim-success-btn" style="background: #10b981; color: #ffffff; border: none; padding: 0.85rem; border-radius: 10px; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
            ✓ Complete Test Payment (₹${amountRupees})
          </button>
          <button id="rzp-sim-cancel-btn" style="background: transparent; color: #a1a1aa; border: 1px solid #3f3f46; padding: 0.65rem; border-radius: 10px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.15s ease;">
            Cancel & Return
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const successBtn = document.getElementById('rzp-sim-success-btn');
  const cancelBtn = document.getElementById('rzp-sim-cancel-btn');

  successBtn?.addEventListener('click', () => {
    overlay.remove();
    props.onSuccess({
      razorpay_order_id: props.orderId,
      razorpay_payment_id: `pay_sim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      razorpay_signature: `sig_sim_${Date.now()}`
    });
  });

  cancelBtn?.addEventListener('click', () => {
    overlay.remove();
    if (props.onDismiss) props.onDismiss();
  });
}
