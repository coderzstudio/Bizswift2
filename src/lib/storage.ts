// Types for our data
export interface Party {
  id: string;
  name: string;
  type: 'customer' | 'supplier';
  mobile: string;
  address: string;
  gst?: string;
  state?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  unit?: string;
  hsn?: string;
  lowStockAlert?: number;
  costPrice?: number;
}

export interface InvoiceItem {
  id: string;
  product: string;
  productId: string;
  qty: number;
  rate: number;
  amount: number;
  hsn?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  partyId: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  gstPercentage: number;
  gstAmount: number;
  discount: number;
  total: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'unpaid';
  deliveryBy?: string;
  transport?: string;
  vehicleNo?: string;
  eWayBillNo?: string;
  poNumber?: string;
  paymentTerm?: string;
}

export interface Transaction {
  id: string;
  type: 'payment' | 'receipt';
  amount: number;
  date: string;
  partyId: string;
  invoiceId?: string;
  mode: 'cash' | 'bank_transfer' | 'upi' | 'cheque';
  description?: string;
  reference?: string;
  createdAt: string;
}

export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  gst?: string;
  termsAndConditions: string;
}

// Default business info
const defaultBusinessInfo: BusinessInfo = {
  name: 'BizSwift Enterprise',
  address: '123 Business Street, City, State, PIN',
  phone: '9876543210',
  email: 'contact@bizswift.com',
  gst: '22AAAAA0000A1Z5',
  termsAndConditions: '1. Payment due within 30 days\n2. Goods once sold cannot be returned\n3. All disputes subject to local jurisdiction'
};

// Storage keys
const PARTIES_KEY = 'bizswift_parties';
const INVOICES_KEY = 'bizswift_invoices';
const BUSINESS_INFO_KEY = 'bizswift_business_info';
const PRODUCTS_KEY = 'bizswift_products';
const TRANSACTIONS_KEY = 'bizswift_transactions';

// Helper functions
export const getParties = (): Party[] => {
  const partiesJson = localStorage.getItem(PARTIES_KEY);
  return partiesJson ? JSON.parse(partiesJson) : [];
};

export const saveParty = (party: Party): void => {
  const parties = getParties();
  if (!party.id) {
    party.id = crypto.randomUUID();
  }
  
  const existingIndex = parties.findIndex(p => p.id === party.id);
  if (existingIndex >= 0) {
    parties[existingIndex] = party;
  } else {
    parties.push(party);
  }
  
  localStorage.setItem(PARTIES_KEY, JSON.stringify(parties));
};

export const deleteParty = (id: string): void => {
  const parties = getParties().filter(party => party.id !== id);
  localStorage.setItem(PARTIES_KEY, JSON.stringify(parties));
};

export const getPartyById = (id: string): Party | undefined => {
  return getParties().find(party => party.id === id);
};

// Products functions
export const getProducts = (): Product[] => {
  const productsJson = localStorage.getItem(PRODUCTS_KEY);
  return productsJson ? JSON.parse(productsJson) : [];
};

export const saveProduct = (product: Product): void => {
  const products = getProducts();
  if (!product.id) {
    product.id = crypto.randomUUID();
  }
  
  if (product.stock === undefined) {
    product.stock = 0;
  }
  
  const existingIndex = products.findIndex(p => p.id === product.id);
  if (existingIndex >= 0) {
    products[existingIndex] = product;
  } else {
    products.push(product);
  }
  
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const deleteProduct = (id: string): void => {
  const products = getProducts().filter(product => product.id !== id);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const getProductById = (id: string): Product | undefined => {
  return getProducts().find(product => product.id === id);
};

export const adjustProductStock = (productId: string, quantity: number): boolean => {
  const product = getProductById(productId);
  if (!product) return false;
  
  product.stock += quantity;
  saveProduct(product);
  return true;
};

export const hasEnoughStock = (productId: string, requestedQty: number): boolean => {
  const product = getProductById(productId);
  if (!product) return false;
  return product.stock >= requestedQty;
};

export const getInvoices = (): Invoice[] => {
  const invoicesJson = localStorage.getItem(INVOICES_KEY);
  const invoices = invoicesJson ? JSON.parse(invoicesJson) : [];
  
  return invoices.map((invoice: Invoice) => {
    if (invoice.paidAmount === undefined) {
      invoice.paidAmount = invoice.status === 'paid' ? invoice.total : 0;
    }
    return invoice;
  });
};

export const generateInvoiceNumber = (): string => {
  const invoices = getInvoices();
  const date = new Date();
  const year = date.getFullYear().toString().substring(2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  const monthPrefix = `INV-${year}${month}-`;
  const monthInvoices = invoices.filter(inv => inv.invoiceNumber.startsWith(monthPrefix));
  
  let maxNumber = 0;
  monthInvoices.forEach(invoice => {
    const numberPart = invoice.invoiceNumber.split('-')[2];
    const number = parseInt(numberPart);
    if (!isNaN(number) && number > maxNumber) {
      maxNumber = number;
    }
  });
  
  const nextNumber = maxNumber + 1;
  return `${monthPrefix}${nextNumber.toString().padStart(3, '0')}`;
};

export const saveInvoice = (invoice: Invoice): Invoice => {
  const invoices = getInvoices();
  const isNewInvoice = !invoice.id || !invoices.some(i => i.id === invoice.id);
  
  if (!invoice.id) {
    invoice.id = crypto.randomUUID();
  }
  
  if (!invoice.invoiceNumber) {
    invoice.invoiceNumber = generateInvoiceNumber();
  }
  
  if (invoice.paidAmount === undefined) {
    invoice.paidAmount = invoice.status === 'paid' ? invoice.total : 0;
  }
  
  if (invoice.paidAmount >= invoice.total) {
    invoice.status = 'paid';
  } else if (invoice.paidAmount > 0) {
    invoice.status = 'partial';
  } else {
    invoice.status = 'unpaid';
  }
  
  if (isNewInvoice) {
    const party = getPartyById(invoice.partyId);
    
    if (party?.type === 'customer') {
      invoice.items.forEach(item => {
        if (item.productId) {
          adjustProductStock(item.productId, -item.qty);
        }
      });
    } else if (party?.type === 'supplier') {
      invoice.items.forEach(item => {
        if (item.productId) {
          adjustProductStock(item.productId, item.qty);
        }
      });
    }
  }
  
  const existingIndex = invoices.findIndex(i => i.id === invoice.id);
  if (existingIndex >= 0) {
    invoices[existingIndex] = invoice;
  } else {
    invoices.push(invoice);
  }
  
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  return invoice;
};

export const deleteInvoice = (id: string): void => {
  const invoices = getInvoices().filter(invoice => invoice.id !== id);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
};

export const getInvoiceById = (id: string): Invoice | undefined => {
  return getInvoices().find(invoice => invoice.id === id);
};

export const getInvoicesByPartyId = (partyId: string): Invoice[] => {
  return getInvoices().filter(invoice => invoice.partyId === partyId);
};

export const getBusinessInfo = (): BusinessInfo => {
  const infoJson = localStorage.getItem(BUSINESS_INFO_KEY);
  return infoJson ? JSON.parse(infoJson) : defaultBusinessInfo;
};

export const saveBusinessInfo = (info: BusinessInfo): void => {
  localStorage.setItem(BUSINESS_INFO_KEY, JSON.stringify(info));
};

export const getInvoicesByDateRange = (startDate: string, endDate: string): Invoice[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59);
  
  return getInvoices().filter(invoice => {
    const invoiceDate = new Date(invoice.date);
    return invoiceDate >= start && invoiceDate <= end;
  });
};

export const generateQuickInvoice = (
  partyId: string, 
  productId: string, 
  quantity: number, 
  discount: number = 0, 
  gstPercentage: number = 18,
  status: 'paid' | 'partial' | 'unpaid' = 'unpaid'
): Invoice => {
  const product = getProductById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  const party = getPartyById(partyId);
  if (!party) {
    throw new Error('Party not found');
  }
  
  if (party.type === 'customer' && !hasEnoughStock(productId, quantity)) {
    throw new Error(`Not enough stock available for ${product.name}. Current stock: ${product.stock}`);
  }
  
  const amount = product.price * quantity;
  const subtotal = amount;
  const gstAmount = (subtotal * gstPercentage) / 100;
  const total = subtotal + gstAmount - discount;
  
  const invoiceItem: InvoiceItem = {
    id: crypto.randomUUID(),
    product: product.name,
    productId: product.id,
    qty: quantity,
    rate: product.price,
    amount: amount,
    hsn: product.hsn
  };
  
  const invoice: Invoice = {
    id: crypto.randomUUID(),
    invoiceNumber: generateInvoiceNumber(),
    partyId,
    date: new Date().toISOString().split('T')[0],
    items: [invoiceItem],
    subtotal,
    gstPercentage,
    gstAmount,
    discount,
    total,
    paidAmount: status === 'paid' ? total : 0,
    status,
    deliveryBy: '',
    transport: '',
    vehicleNo: '',
    eWayBillNo: '',
    poNumber: '',
    paymentTerm: ''
  };
  
  return saveInvoice(invoice);
};

export const getLowStockProducts = (): Product[] => {
  return getProducts().filter(product => {
    const threshold = product.lowStockAlert || 5;
    return product.stock <= threshold;
  });
};

export const getOutOfStockProducts = (): Product[] => {
  return getProducts().filter(product => product.stock <= 0);
};

export const getStockMovementHistory = (productId: string): { date: string, change: number, invoiceId: string, invoiceNumber: string }[] => {
  const history: { date: string, change: number, invoiceId: string, invoiceNumber: string }[] = [];
  
  const invoices = getInvoices();
  
  for (const invoice of invoices) {
    const party = getPartyById(invoice.partyId);
    if (!party) continue;
    
    const isCustomer = party.type === 'customer';
    
    for (const item of invoice.items) {
      if (item.productId === productId) {
        history.push({
          date: invoice.date,
          change: isCustomer ? -item.qty : item.qty,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber
        });
      }
    }
  }
  
  return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getTransactions = (): Transaction[] => {
  const transactionsJson = localStorage.getItem(TRANSACTIONS_KEY);
  return transactionsJson ? JSON.parse(transactionsJson) : [];
};

export const saveTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  if (!transaction.id) {
    transaction.id = crypto.randomUUID();
  }
  
  if (!transaction.createdAt) {
    transaction.createdAt = new Date().toISOString();
  }
  
  const existingIndex = transactions.findIndex(t => t.id === transaction.id);
  if (existingIndex >= 0) {
    transactions[existingIndex] = transaction;
  } else {
    transactions.push(transaction);
  }
  
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const deleteTransaction = (id: string): void => {
  const transactions = getTransactions().filter(transaction => transaction.id !== id);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const getTransactionsByPartyId = (partyId: string): Transaction[] => {
  return getTransactions().filter(transaction => transaction.partyId === partyId);
};

export const getTransactionsByType = (type: 'payment' | 'receipt'): Transaction[] => {
  return getTransactions().filter(transaction => transaction.type === type);
};

export const getTransactionsByInvoiceId = (invoiceId: string): Transaction[] => {
  return getTransactions().filter(transaction => transaction.invoiceId === invoiceId);
};

export const getInvoiceRemainingAmount = (invoiceId: string): number => {
  const invoice = getInvoiceById(invoiceId);
  if (!invoice) return 0;
  
  return Math.max(0, invoice.total - invoice.paidAmount);
};

export const updateInvoicePaymentStatus = (invoice: Invoice): Invoice => {
  const transactions = getTransactionsByInvoiceId(invoice.id);
  const paidAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  const updatedInvoice = {
    ...invoice,
    paidAmount: paidAmount
  };
  
  if (paidAmount >= invoice.total) {
    updatedInvoice.status = 'paid';
  } else if (paidAmount > 0) {
    updatedInvoice.status = 'partial';
  } else {
    updatedInvoice.status = 'unpaid';
  }
  
  return saveInvoice(updatedInvoice);
};
