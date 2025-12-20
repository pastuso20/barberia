import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { load, save, STORAGE_KEYS } from './storage';

function App() {
  const [barbers] = useState(['Felipe', 'David', 'Kevin']);
  const [services] = useState([
    { id: 1, name: 'Corte sencillo', price: 17000 },
    { id: 2, name: 'Corte + barba', price: 22000 },
    { id: 3, name: 'Barba + cerquillo', price: 10000 },
    { id: 4, name: 'Cerquillo', price: 3000 },
    { id: 5, name: 'Barba', price: 5000 },
    { id: 6, name: 'Decoloración', price: 60000 },
    { id: 7, name: 'Cejas', price: 3000 }
  ]);
  const [products] = useState([
    { id: 1, name: 'Budweiser', price: 3000 },
    { id: 2, name: 'Coronita', price: 4000 },
    { id: 3, name: 'Águila', price: 3000 },
    { id: 4, name: 'Andina Light', price: 3000 },
    { id: 5, name: 'Club Colombia', price: 4000 },
    { id: 6, name: 'Pony', price: 3000 },
    { id: 7, name: 'Kola Román', price: 3000 },
    { id: 8, name: 'Coca-Cola', price: 4000 },
    { id: 9, name: 'Gatorade', price: 4500 },
    { id: 10, name: 'Agua grande', price: 2000 },
    { id: 11, name: 'Agua pequeña', price: 1000 }
  ]);
  const [haircuts, setHaircuts] = useState(() => load(STORAGE_KEYS.haircuts, []));
  const [selectedBarber, setSelectedBarber] = useState(() => load(STORAGE_KEYS.selectedBarber, 'Felipe'));
  const [selectedService, setSelectedService] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [productSales, setProductSales] = useState(() => load(STORAGE_KEYS.productSales, []));
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productPrice, setProductPrice] = useState('');
  const [productDate, setProductDate] = useState(new Date().toISOString().split('T')[0]);
  const [initialBalance, setInitialBalance] = useState(() => load(STORAGE_KEYS.initialBalance, 0));
  const [cashFund, setCashFund] = useState(() => load(STORAGE_KEYS.cashFund, 0));
  const [paymentType, setPaymentType] = useState('Efectivo');
  const [productPaymentType, setProductPaymentType] = useState('Efectivo');
  const [expenses, setExpenses] = useState(() => load(STORAGE_KEYS.expenses, []));
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextOpeningBalance, setNextOpeningBalance] = useState(() => load(STORAGE_KEYS.nextOpeningBalance, 0));
  
  // Persist selected barber
  useEffect(() => {
    save(STORAGE_KEYS.selectedBarber, selectedBarber);
  }, [selectedBarber]);

  // Persist haircuts
  useEffect(() => {
    save(STORAGE_KEYS.haircuts, haircuts);
  }, [haircuts]);

  useEffect(() => {
    save(STORAGE_KEYS.productSales, productSales);
  }, [productSales]);

  useEffect(() => {
    save(STORAGE_KEYS.initialBalance, initialBalance);
  }, [initialBalance]);

  useEffect(() => {
    save(STORAGE_KEYS.cashFund, cashFund);
  }, [cashFund]);
  useEffect(() => {
    save(STORAGE_KEYS.expenses, expenses);
  }, [expenses]);
  useEffect(() => {
    save(STORAGE_KEYS.nextOpeningBalance, nextOpeningBalance);
  }, [nextOpeningBalance]);

  const addHaircut = () => {
    if (selectedService && price && date) {
      const service = services.find(s => s.id === parseInt(selectedService));
      const newItem = {
        id: Date.now(),
        barber: selectedBarber,
        service: service.name,
        price: parseFloat(price),
        date,
        payment: paymentType,
      };
      setHaircuts([...haircuts, newItem]);
      setSelectedService('');
      setPrice('');
    }
  };

  const deleteHaircut = (id) => {
    setHaircuts(haircuts.filter(haircut => haircut.id !== id));
  };

  const addProductSale = () => {
    if (selectedProducts.length > 0 && productDate) {
      const items = selectedProducts.map(pid => {
        const product = products.find(p => p.id === parseInt(pid));
        return {
          id: Date.now() + Math.random(),
          product: product?.name ?? '',
          price: product?.price ?? 0,
          date: productDate,
          payment: productPaymentType,
        };
      });
      setProductSales([...productSales, ...items]);
      setSelectedProducts([]);
      setProductPrice('');
    }
  };

  const deleteProductSale = (id) => {
    setProductSales(productSales.filter(p => p.id !== id));
  };
  const addExpense = () => {
    if (expenseName && expenseAmount && expenseDate) {
      const newItem = {
        id: Date.now(),
        name: expenseName,
        amount: parseFloat(expenseAmount),
        date: expenseDate,
      };
      setExpenses([...expenses, newItem]);
      setExpenseName('');
      setExpenseAmount('');
    }
  };
  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Informe Diario - Barbería', 20, 20);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 20, 35);
    
    // Group haircuts by barber
    const haircutsByBarber = {};
    barbers.forEach(barber => {
      haircutsByBarber[barber] = haircuts.filter(h => h.barber === barber);
    });
    
    let yPosition = 50;
    let grandTotal = 0;
    
    barbers.forEach(barber => {
      const barberHaircuts = haircutsByBarber[barber];
      const barberTotal = barberHaircuts.reduce((sum, h) => sum + h.price, 0);
      grandTotal += barberTotal;
      
      if (barberHaircuts.length > 0) {
        doc.setFontSize(14);
        doc.text(`${barber}:`, 20, yPosition);
        yPosition += 10;
        
        barberHaircuts.forEach(haircut => {
          doc.setFontSize(10);
          doc.text(`- ${haircut.service} - $${haircut.price.toLocaleString('es-CO')} - ${haircut.date}`, 30, yPosition);
          yPosition += 7;
        });
        
        doc.setFontSize(12);
        doc.text(`Subtotal: $${barberTotal.toLocaleString('es-CO')}`, 30, yPosition);
        yPosition += 15;
      }
    });
    
    // Grand total
    doc.setFontSize(16);
    doc.text(`Total Diario: $${grandTotal.toLocaleString('es-CO')}`, 20, yPosition + 10);
    
    // Save the PDF
    doc.save(`informe-barberia-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getBarberTotal = (barberName) => {
    return haircuts
      .filter(h => h.barber === barberName)
      .reduce((sum, h) => sum + h.price, 0);
  };

  const getDailyTotal = () => {
    return haircuts.reduce((sum, h) => sum + h.price, 0);
  };

  const getProductsTotal = () => {
    return productSales.reduce((sum, p) => sum + p.price, 0);
  };
  const getExpensesTotal = () => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  };

  const getCashTotal = () => {
    return initialBalance + cashFund + getDailyTotal() + getProductsTotal() - getExpensesTotal();
  };

  const isSameMonth = (dStr, ref = new Date()) => {
    const [y, m] = dStr.split('-').map(Number);
    return y === ref.getFullYear() && m === (ref.getMonth() + 1);
  };
  const getMonthlyTotals = () => {
    const now = new Date();
    const haircutsMonth = haircuts.filter(h => isSameMonth(h.date, now)).reduce((s, h) => s + h.price, 0);
    const productsMonth = productSales.filter(p => isSameMonth(p.date, now)).reduce((s, p) => s + p.price, 0);
    const expensesMonth = expenses.filter(e => isSameMonth(e.date, now)).reduce((s, e) => s + e.amount, 0);
    return { haircutsMonth, productsMonth, expensesMonth };
  };
  const getMonthlyProfit = () => {
    const { haircutsMonth, productsMonth, expensesMonth } = getMonthlyTotals();
    return haircutsMonth + productsMonth - expensesMonth;
  };

  const getTotalsByPayment = (items) => {
    const base = { Efectivo: 0, Transferencia: 0, Tarjeta: 0 };
    return items.reduce((acc, item) => {
      const key = item.payment || 'Efectivo';
      acc[key] = (acc[key] || 0) + item.price;
      return acc;
    }, base);
  };

  const closeCashRegister = () => {
    const doc = new jsPDF();
    const dateLabel = new Date().toLocaleString('es-CO');
    const haircutsTotal = getDailyTotal();
    const productsTotal = getProductsTotal();
    const expensesTotal = getExpensesTotal();
    const dayTotal = haircutsTotal + productsTotal - expensesTotal;
    const finalCash = initialBalance + cashFund + haircutsTotal + productsTotal - expensesTotal;
    const haircutsByPay = getTotalsByPayment(haircuts);
    const productsByPay = getTotalsByPayment(productSales);

    doc.setFontSize(20);
    doc.text('Cierre de Caja - Barbería', 20, 20);

    doc.setFontSize(12);
    doc.text(`Fecha y hora: ${dateLabel}`, 20, 35);

    let y = 50;
    doc.setFontSize(14);
    doc.text('Saldos', 20, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Saldo Inicial: $${initialBalance.toLocaleString('es-CO')}`, 25, y); y += 6;
    doc.text(`Fondo de Caja: $${cashFund.toLocaleString('es-CO')}`, 25, y); y += 12;

    doc.setFontSize(14);
    doc.text('Totales de Cortes', 20, y); y += 8;
    doc.setFontSize(12);
    doc.text(`Total: $${haircutsTotal.toLocaleString('es-CO')}`, 25, y); y += 6;
    doc.text(`Efectivo: $${haircutsByPay.Efectivo.toLocaleString('es-CO')}`, 25, y); y += 6;
    doc.text(`Transferencia: $${haircutsByPay.Transferencia.toLocaleString('es-CO')}`, 25, y); y += 6;
    doc.text(`Tarjeta: $${haircutsByPay.Tarjeta.toLocaleString('es-CO')}`, 25, y); y += 12;

    doc.setFontSize(14);
    doc.text('Totales de Productos', 20, y); y += 8;
    doc.setFontSize(12);
    doc.text(`Total: $${productsTotal.toLocaleString('es-CO')}`, 25, y); y += 6;
    doc.text(`Efectivo: $${productsByPay.Efectivo.toLocaleString('es-CO')}`, 25, y); y += 6;
    doc.text(`Transferencia: $${productsByPay.Transferencia.toLocaleString('es-CO')}`, 25, y); y += 6;
    doc.text(`Tarjeta: $${productsByPay.Tarjeta.toLocaleString('es-CO')}`, 25, y); y += 12;

    doc.setFontSize(14);
    doc.text('Gastos Internos', 20, y); y += 8;
    doc.setFontSize(12);
    doc.text(`Total: $${expensesTotal.toLocaleString('es-CO')}`, 25, y); y += 6;
    let ey = y;
    expenses.slice(0, 10).forEach(exp => {
      doc.text(`- ${exp.name} - $${exp.amount.toLocaleString('es-CO')} - ${exp.date}`, 25, ey);
      ey += 6;
    });
    y = ey + 6;

    doc.setFontSize(14);
    doc.text('Resumen', 20, y); y += 8;
    doc.setFontSize(12);
    doc.text(`Ingreso del Día: $${dayTotal.toLocaleString('es-CO')}`, 25, y); y += 6;
    doc.text(`Caja Final: $${finalCash.toLocaleString('es-CO')}`, 25, y); y += 12;

    doc.save(`cierre-caja-${new Date().toISOString().split('T')[0]}.pdf`);

    if (window.confirm('¿Vaciar registros y reiniciar saldo inicial después del cierre?')) {
      setHaircuts([]);
      setProductSales([]);
      setExpenses([]);
      setNextOpeningBalance(finalCash);
      setInitialBalance(0);
    }
  };

  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    setSelectedService(serviceId);
    if (serviceId) {
      const service = services.find(s => s.id === parseInt(serviceId));
      setPrice(service.price);
    } else {
      setPrice('');
    }
  };

  const handleProductToggle = (productId) => {
    const idStr = String(productId);
    setSelectedProducts((prev) => {
      const next = prev.includes(idStr) ? prev.filter((id) => id !== idStr) : [...prev, idStr];
      const nextSorted = next.sort((a, b) => parseInt(a) - parseInt(b));
      const sum = nextSorted.reduce((acc, id) => {
        const p = products.find((pp) => pp.id === parseInt(id));
        return acc + (p ? p.price : 0);
      }, 0);
      setProductPrice(sum ? sum : '');
      return nextSorted;
    });
  };

  return (
    <div className="min-h-screen bg-brand-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-brand-gray border border-brand-gold/30 flex items-center justify-center text-2xl text-brand-gold">
            ✂️
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold font-serif text-brand-gold tracking-wide">
            Barbería
          </h1>
        </div>
      </div>

      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-brand-gray rounded-2xl shadow-lg border border-brand-gold/30 p-6">
          <div className="flex flex-wrap items-center gap-6 justify-between">
            <div className="flex flex-wrap items-center gap-6">
              <div className="text-lg font-semibold text-brand-gold">
                Total Diario: ${(getDailyTotal() + getProductsTotal()).toLocaleString('es-CO')}
              </div>
              <div className="text-lg font-semibold text-brand-gold">
                Ganancia Mensual: ${getMonthlyProfit().toLocaleString('es-CO')}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-brand-gold">Saldo Inicial</span>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => {
                    const v = e.target.value;
                    setInitialBalance(v ? parseFloat(v) : 0);
                  }}
                  className="w-28 px-2 py-1 bg-brand-black border border-gray-700 text-gray-100 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-brand-gold">Fondo de Caja</span>
                <input
                  type="number"
                  value={cashFund}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCashFund(v ? parseFloat(v) : 0);
                  }}
                  className="w-28 px-2 py-1 bg-brand-black border border-gray-700 text-gray-100 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
              <div className="text-lg font-semibold text-brand-gold">
                Caja: ${getCashTotal().toLocaleString('es-CO')}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-brand-gold">Apertura Siguiente Día</span>
                <input
                  type="number"
                  value={nextOpeningBalance}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNextOpeningBalance(v ? parseFloat(v) : 0);
                  }}
                  className="w-32 px-2 py-1 bg-brand-black border border-gray-700 text-gray-100 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                />
                <button
                  onClick={() => {
                    setInitialBalance(nextOpeningBalance || 0);
                    setNextOpeningBalance(0);
                  }}
                  className="bg-brand-black text-brand-gold px-3 py-1 rounded-md hover:bg-black/40 transition-colors"
                >
                  Aplicar Apertura
                </button>
              </div>
              <button
                onClick={closeCashRegister}
                disabled={haircuts.length === 0 && productSales.length === 0}
                className="bg-brand-gold text-brand-black px-4 py-2 rounded-md hover:brightness-110 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Cerrar Caja
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 mb-8">
        <div className="bg-brand-gray p-6 rounded-2xl shadow-lg border border-brand-gold/30">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-brand-gold text-xl">✂️</span>
            <h2 className="text-2xl font-semibold font-serif text-brand-gold">Agregar Nuevo Corte</h2>
          </div>
          <div className="h-0.5 bg-brand-gold w-16 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Barbero</label>
              <select
                value={selectedBarber}
                onChange={(e) => setSelectedBarber(e.target.value)}
                className="w-full px-3 py-2 bg-brand-black border border-gray-700 text-gray-100 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              >
                {barbers.map(barber => (
                  <option key={barber} value={barber}>{barber}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Servicio</label>
              <select
                value={selectedService}
                onChange={handleServiceChange}
                className="w-full px-3 py-2 bg-brand-black border border-gray-700 text-gray-100 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              >
                <option value="">Seleccionar servicio</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">$ Precio</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25000"
                className="w-full px-3 py-2 bg-brand-black border border-gray-700 text-gray-100 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">📅 Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-brand-black border border-gray-700 text-gray-100 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Tipo de Pago</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full px-3 py-2 bg-brand-black border border-gray-700 text-gray-100 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={addHaircut}
                className="w-full bg-brand-gold text-brand-black px-4 py-2 rounded-lg font-semibold hover:brightness-110 transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>

        <div className="bg-brand-gray p-6 rounded-2xl shadow-lg border border-brand-gold/30">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-brand-gold text-xl">📦</span>
            <h2 className="text-2xl font-semibold font-serif text-brand-gold">Agregar Producto Vendido</h2>
          </div>
          <div className="h-0.5 bg-brand-gold w-16 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Productos</label>
              <div className="max-h-64 overflow-auto rounded-md border border-gray-700 bg-brand-black">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-brand-black border-b border-gray-700">
                    <tr className="text-left text-gray-300">
                      <th className="px-3 py-2 w-12">✔</th>
                      <th className="px-3 py-2">Producto</th>
                      <th className="px-3 py-2 w-28">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-black/20">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(String(product.id))}
                            onChange={() => handleProductToggle(product.id)}
                            className="h-4 w-4 accent-brand-gold"
                            aria-label={`Seleccionar ${product.name}`}
                          />
                        </td>
                        <td className="px-3 py-2 text-gray-100">{product.name}</td>
                        <td className="px-3 py-2 text-gray-300">
                          ${product.price.toLocaleString('es-CO')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">$ Precio Total</label>
              <input
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-brand-black border border-gray-700 text-gray-100 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">📅 Fecha</label>
              <input
                type="date"
                value={productDate}
                onChange={(e) => setProductDate(e.target.value)}
                className="w-full px-3 py-2 bg-brand-black border border-gray-700 text-gray-100 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Tipo de Pago</label>
              <select
                value={productPaymentType}
                onChange={(e) => setProductPaymentType(e.target.value)}
                className="w-full px-3 py-2 bg-brand-black border border-gray-700 text-gray-100 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={addProductSale}
                className="w-full bg-brand-gold text-brand-black px-4 py-2 rounded-lg font-semibold hover:brightness-110 transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
        </div>

        <div className="bg-brand-gray p-6 rounded-2xl shadow-lg border border-brand-gold/30 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-brand-gold text-xl">📋</span>
            <h2 className="text-2xl font-semibold font-serif text-brand-gold">Registrar Gasto Interno</h2>
          </div>
          <div className="h-0.5 bg-brand-gold w-16 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Concepto</label>
              <input
                type="text"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                placeholder="Compra de insumos"
                className="w-full px-3 py-2 bg-brand-black border border-gray-700 text-gray-100 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">$ Monto</label>
              <input
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-brand-black border border-gray-700 text-gray-100 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">📅 Fecha</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 bg-brand-black border border-gray-700 text-gray-100 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addExpense}
                className="w-full bg-brand-gold text-brand-black px-4 py-2 rounded-lg font-semibold hover:brightness-110 transition-colors"
              >
                + Agregar
              </button>
            </div>
          </div>
        </div>

        {/* Barber Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {barbers.map(barber => (
            <div key={barber} className="bg-brand-gray p-6 rounded-2xl shadow-lg border border-brand-gold/30">
              <h3 className="text-lg font-semibold text-brand-gold mb-2">{barber}</h3>
              <p className="text-2xl font-bold text-brand-gold">${getBarberTotal(barber).toLocaleString('es-CO')}</p>
              <p className="text-sm text-gray-400">
                {haircuts.filter(h => h.barber === barber).length} cortes
              </p>
            </div>
          ))}
        </div>

        {/* Haircuts List */}
        <div className="bg-brand-gray rounded-2xl shadow-lg border border-brand-gold/30 mb-8">
          <div className="p-6 border-b border-brand-gold/20 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-brand-gold">Cortes de Hoy</h2>
          </div>
          
          {haircuts.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              No hay cortes registrados aún. ¡Agrega tu primer corte arriba!
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {haircuts.map(haircut => (
                <div key={haircut.id} className="p-4 flex justify-between items-center hover:bg-black/20">
                  <div>
                    <span className="font-medium text-gray-100">{haircut.barber}</span>
                    <span className="text-gray-300 ml-4">{haircut.service}</span>
                    <span className="text-gray-300 ml-4">${haircut.price.toLocaleString('es-CO')}</span>
                    <span className="text-gray-400 ml-4">{haircut.date}</span>
                    <span className="text-gray-400 ml-4">{haircut.payment}</span>
                  </div>
                  <button
                    onClick={() => deleteHaircut(haircut.id)}
                    className="text-brand-gray hover:text-brand-gold transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-brand-gray rounded-2xl shadow-lg border border-brand-gold/30 mb-8">
          <div className="p-6 border-b border-brand-gold/20 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-brand-gold">Productos Vendidos</h2>
            <div className="text-lg font-semibold text-brand-gold">
              Total Productos: ${getProductsTotal().toLocaleString('es-CO')}
            </div>
          </div>
          {productSales.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              No hay productos registrados aún.
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {productSales.map(item => (
                <div key={item.id} className="p-4 flex justify-between items-center hover:bg-black/20">
                  <div>
                    <span className="font-medium text-gray-100">{item.product}</span>
                    <span className="text-gray-300 ml-4">${item.price.toLocaleString('es-CO')}</span>
                    <span className="text-gray-400 ml-4">{item.date}</span>
                    <span className="text-gray-400 ml-4">{item.payment}</span>
                  </div>
                  <button
                    onClick={() => deleteProductSale(item.id)}
                    className="text-brand-gray hover:text-brand-gold transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-brand-gray rounded-2xl shadow-lg border border-brand-gold/30 mb-8">
          <div className="p-6 border-b border-brand-gold/20 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-brand-gold">Gastos Internos</h2>
            <div className="text-lg font-semibold text-brand-gold">
              Total Gastos: ${getExpensesTotal().toLocaleString('es-CO')}
            </div>
          </div>
          {expenses.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              No hay gastos registrados aún.
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {expenses.map(exp => (
                <div key={exp.id} className="p-4 flex justify-between items-center hover:bg-black/20">
                  <div>
                    <span className="font-medium text-gray-100">{exp.name}</span>
                    <span className="text-gray-300 ml-4">${exp.amount.toLocaleString('es-CO')}</span>
                    <span className="text-gray-400 ml-4">{exp.date}</span>
                  </div>
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="text-brand-gray hover:text-brand-gold transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
