export interface MerchantOffer {
  merchant: string;
  price: number;
  available: boolean;
  url: string;
  logo?: string;
}

// Simulated merchant offers per product — in production, this would come from an API
const merchantOffers: Record<string, MerchantOffer[]> = {
  "nike-pegasus-41": [
    { merchant: "Nike.com", price: 139.99, available: true, url: "https://www.nike.com/fr/t/pegasus-41" },
    { merchant: "Alltricks", price: 129.99, available: true, url: "https://www.alltricks.fr" },
    { merchant: "i-Run", price: 132.50, available: true, url: "https://www.i-run.fr" },
    { merchant: "Amazon", price: 134.99, available: true, url: "https://www.amazon.fr" },
  ],
  "asics-gt-2000": [
    { merchant: "Asics.com", price: 149.99, available: true, url: "https://www.asics.com/fr" },
    { merchant: "i-Run", price: 139.99, available: true, url: "https://www.i-run.fr" },
    { merchant: "Alltricks", price: 142.50, available: true, url: "https://www.alltricks.fr" },
    { merchant: "Decathlon", price: 145.00, available: false, url: "https://www.decathlon.fr" },
  ],
  "brooks-ghost-16": [
    { merchant: "Brooks.com", price: 139.99, available: true, url: "https://www.brooksrunning.com/fr" },
    { merchant: "i-Run", price: 125.99, available: true, url: "https://www.i-run.fr" },
    { merchant: "Alltricks", price: 131.00, available: true, url: "https://www.alltricks.fr" },
  ],
  "hoka-speedgoat-6": [
    { merchant: "Hoka.com", price: 159.99, available: true, url: "https://www.hoka.com/fr" },
    { merchant: "i-Run", price: 149.99, available: true, url: "https://www.i-run.fr" },
    { merchant: "Alltricks", price: 152.00, available: true, url: "https://www.alltricks.fr" },
  ],
  "salomon-ultra-glide": [
    { merchant: "Salomon.com", price: 149.99, available: true, url: "https://www.salomon.com/fr" },
    { merchant: "i-Run", price: 139.99, available: true, url: "https://www.i-run.fr" },
    { merchant: "Alltricks", price: 142.00, available: true, url: "https://www.alltricks.fr" },
  ],
  "new-balance-fresh-foam": [
    { merchant: "NewBalance.fr", price: 159.99, available: true, url: "https://www.newbalance.fr" },
    { merchant: "i-Run", price: 144.99, available: true, url: "https://www.i-run.fr" },
    { merchant: "Amazon", price: 148.50, available: true, url: "https://www.amazon.fr" },
  ],
  "nike-vaporfly-3": [
    { merchant: "Nike.com", price: 259.99, available: true, url: "https://www.nike.com/fr" },
    { merchant: "i-Run", price: 239.99, available: true, url: "https://www.i-run.fr" },
    { merchant: "Alltricks", price: 245.00, available: true, url: "https://www.alltricks.fr" },
  ],
  "asics-gel-trabuco": [
    { merchant: "Asics.com", price: 139.99, available: true, url: "https://www.asics.com/fr" },
    { merchant: "i-Run", price: 129.99, available: true, url: "https://www.i-run.fr" },
    { merchant: "Decathlon", price: 134.00, available: true, url: "https://www.decathlon.fr" },
  ],
  "saucony-endorphin-speed": [
    { merchant: "Saucony.com", price: 179.99, available: true, url: "https://www.saucony.com/fr" },
    { merchant: "i-Run", price: 164.99, available: true, url: "https://www.i-run.fr" },
    { merchant: "Alltricks", price: 169.00, available: true, url: "https://www.alltricks.fr" },
  ],
  "mizuno-wave-rider": [
    { merchant: "Mizuno.com", price: 144.99, available: true, url: "https://www.mizuno.com/fr" },
    { merchant: "i-Run", price: 132.99, available: true, url: "https://www.i-run.fr" },
    { merchant: "Alltricks", price: 136.00, available: true, url: "https://www.alltricks.fr" },
  ],
};

export function getMerchantOffers(productId: string): MerchantOffer[] {
  const offers = merchantOffers[productId] || [];
  return [...offers].sort((a, b) => a.price - b.price);
}
