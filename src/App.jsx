import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { load, save, STORAGE_KEYS } from './storage';
import { supabase } from './supabaseClient';

const BARBERS = ['Hernan', 'Manuel', 'Luigui'];

function AdminCashRegister({ onSignOut }) {
  const [barbers] = useState(BARBERS);
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
  const [selectedBarber, setSelectedBarber] = useState(() => load(STORAGE_KEYS.selectedBarber, 'Hernan'));
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
  useEffect(() => {
    if (!barbers.includes(selectedBarber)) setSelectedBarber(barbers[0]);
  }, [barbers, selectedBarber]);

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

  const closeCashRegister = async () => {
    const doc = new jsPDF();
    const dateLabel = new Date().toLocaleString('es-CO');
    const haircutsTotal = getDailyTotal();
    const productsTotal = getProductsTotal();
    const expensesTotal = getExpensesTotal();
    const dayTotal = haircutsTotal + productsTotal - expensesTotal;
    const finalCash = initialBalance + cashFund + haircutsTotal + productsTotal - expensesTotal;
    const haircutsByPay = getTotalsByPayment(haircuts);
    const productsByPay = getTotalsByPayment(productSales);

    if (supabase) {
      try {
        const payload = {
            initial_balance: initialBalance,
            cash_fund: cashFund,
            final_balance: finalCash,
            total_sales: haircutsTotal + productsTotal,
            total_haircuts: haircutsTotal,
            total_products: productsTotal,
            total_expenses: expensesTotal,
            haircuts_data: haircuts,
            products_data: productSales,
            expenses_data: expenses,
            payment_methods_summary: {
                haircuts: haircutsByPay,
                products: productsByPay
            }
        };

        const { error } = await supabase.from('daily_closings').insert([payload]);
        if (error) {
            console.error('Error saving to DB:', error);
            alert('Error al guardar el cierre en la base de datos: ' + error.message);
        } else {
            alert('Cierre guardado exitosamente en la base de datos.');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        alert('Error inesperado al guardar en BD.');
      }
    }

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
              {onSignOut ? (
                <button
                  onClick={onSignOut}
                  className="bg-brand-black text-brand-gold px-4 py-2 rounded-md hover:bg-black/40 transition-colors"
                >
                  Salir
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {supabase ? <AdminAppointmentsPanel /> : null}
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

function getDayRangeIso(dateStr) {
  const start = new Date(`${dateStr}T00:00:00`);
  const end = new Date(start.getTime());
  end.setDate(end.getDate() + 1);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

function AdminAppointmentsPanel() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadAppointments() {
      if (!supabase) return;
      setLoading(true);
      setError('');
      const { startIso, endIso } = getDayRangeIso(date);
      const { data, error: qError } = await supabase
        .from('appointments')
        .select('id, barber, start_time, end_time, appointment_private(client_name, client_phone)')
        .gte('start_time', startIso)
        .lt('start_time', endIso)
        .order('start_time', { ascending: true });
      if (cancelled) return;
      if (qError) {
        setItems([]);
        setError('No se pudieron cargar las citas.');
      } else {
        setItems(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    }
    loadAppointments();
    return () => {
      cancelled = true;
    };
  }, [date]);

  async function removeAppointment(id) {
    if (!supabase) return;
    setError('');
    setLoading(true);
    const { error: delError } = await supabase.from('appointments').delete().eq('id', id);
    if (delError) setError('No se pudo eliminar la cita.');
    const { startIso, endIso } = getDayRangeIso(date);
    const { data } = await supabase
      .from('appointments')
      .select('id, barber, start_time, end_time, appointment_private(client_name, client_phone)')
      .gte('start_time', startIso)
      .lt('start_time', endIso)
      .order('start_time', { ascending: true });
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  return (
    <div className="bg-brand-gray p-6 rounded-2xl shadow-lg border border-brand-gold/30 mb-8">
      <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-brand-gold text-xl">📅</span>
          <h2 className="text-2xl font-semibold font-serif text-brand-gold">Citas</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-brand-gold">Fecha</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 bg-brand-black border border-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
          />
        </div>
      </div>
      <div className="h-0.5 bg-brand-gold w-16 mb-4"></div>
      {error ? <div className="text-red-300 text-sm mb-3">{error}</div> : null}
      {loading ? <div className="text-gray-300 text-sm mb-3">Cargando...</div> : null}
      <div className="rounded-md border border-gray-700 bg-brand-black overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-black border-b border-gray-700">
            <tr className="text-left text-gray-300">
              <th className="px-3 py-2 w-24">Hora</th>
              <th className="px-3 py-2 w-40">Barbero</th>
              <th className="px-3 py-2">Cliente</th>
              <th className="px-3 py-2 w-32">Teléfono</th>
              <th className="px-3 py-2 w-28"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-gray-300">
                  No hay citas para este día.
                </td>
              </tr>
            ) : (
              items.map((it) => {
                const privateRow = Array.isArray(it.appointment_private) ? it.appointment_private[0] : it.appointment_private;
                const when = new Date(it.start_time);
                return (
                  <tr key={it.id} className="hover:bg-black/20">
                    <td className="px-3 py-2 text-gray-100">{timeLabel(when)}</td>
                    <td className="px-3 py-2 text-gray-100">{it.barber}</td>
                    <td className="px-3 py-2 text-gray-100">{privateRow?.client_name ?? ''}</td>
                    <td className="px-3 py-2 text-gray-300">{privateRow?.client_phone ?? ''}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => removeAppointment(it.id)}
                        className="text-brand-gray hover:text-brand-gold transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BrandHeader({ right }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex flex-col items-center gap-3 flex-1">
          <div className="w-14 h-14 rounded-full bg-brand-gray border border-brand-gold/30 flex items-center justify-center text-2xl text-brand-gold">
            ✂️
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold font-serif text-brand-gold tracking-wide">
            Barbería
          </h1>
        </div>
        {right ? <div className="flex-shrink-0">{right}</div> : null}
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen bg-brand-black">
      <BrandHeader />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-brand-gray rounded-2xl shadow-lg border border-brand-gold/30 p-6">
          <h2 className="text-2xl font-semibold font-serif text-brand-gold mb-2">Selecciona una interfaz</h2>
          <div className="h-0.5 bg-brand-gold w-16 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/admin"
              className="block bg-brand-black border border-gray-700 rounded-xl p-5 hover:bg-black/30 transition-colors"
            >
              <div className="text-brand-gold font-semibold text-lg mb-1">Administrador</div>
              <div className="text-gray-300 text-sm">Ingresar y gestionar caja y citas</div>
            </Link>
            <Link
              to="/cliente"
              className="block bg-brand-black border border-gray-700 rounded-xl p-5 hover:bg-black/30 transition-colors"
            >
              <div className="text-brand-gold font-semibold text-lg mb-1">Cliente</div>
              <div className="text-gray-300 text-sm">Agendar cita y ver disponibilidad</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildSlots(dateStr) {
  const start = new Date(`${dateStr}T09:00:00`);
  const end = new Date(`${dateStr}T19:00:00`);
  const slots = [];
  for (let t = start.getTime(); t < end.getTime(); t += 30 * 60 * 1000) {
    slots.push(new Date(t));
  }
  return slots;
}

function timeLabel(d) {
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function ClientBookingPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBarber, setSelectedBarber] = useState(BARBERS[0]);
  const [busy, setBusy] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadBusy() {
      if (!supabase) return;
      setLoading(true);
      setError('');
      const { data, error: rpcError } = await supabase.rpc('get_busy_slots', { p_date: date });
      if (cancelled) return;
      if (rpcError) {
        setBusy([]);
        setError('No se pudo cargar la disponibilidad.');
      } else {
        setBusy(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    }
    loadBusy();
    return () => {
      cancelled = true;
    };
  }, [date]);

  const busyStarts = busy
    .filter((b) => b.barber === selectedBarber)
    .reduce((set, b) => {
      const t = new Date(b.start_time).getTime();
      set.add(t);
      return set;
    }, new Set());

  const availableSlots = buildSlots(date).filter((slot) => !busyStarts.has(slot.getTime()));

  useEffect(() => {
    if (selectedSlot && selectedSlot.toISOString().slice(0, 10) !== date) setSelectedSlot(null);
  }, [date, selectedSlot]);

  async function submit() {
    if (!supabase) return;
    setError('');
    setSuccess('');
    if (!clientName.trim() || !clientPhone.trim() || !selectedSlot) {
      setError('Completa nombre, teléfono y selecciona una hora.');
      return;
    }
    setLoading(true);
    const { error: rpcError } = await supabase.rpc('create_appointment', {
      p_barber: selectedBarber,
      p_start_time: selectedSlot.toISOString(),
      p_client_name: clientName.trim(),
      p_client_phone: clientPhone.trim(),
    });
    if (rpcError) {
      setError('No se pudo agendar. Puede que la hora ya no esté disponible.');
      setLoading(false);
      return;
    }
    setSuccess('Cita agendada correctamente.');
    setClientName('');
    setClientPhone('');
    setSelectedSlot(null);
    const { data } = await supabase.rpc('get_busy_slots', { p_date: date });
    setBusy(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-brand-black">
      <BrandHeader
        right={
          <Link
            to="/"
            className="bg-brand-black text-brand-gold px-4 py-2 rounded-md hover:bg-black/40 transition-colors border border-brand-gold/30"
          >
            Inicio
          </Link>
        }
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-brand-gray rounded-2xl shadow-lg border border-brand-gold/30 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-brand-gold text-xl">📅</span>
            <h2 className="text-2xl font-semibold font-serif text-brand-gold">Agendar Cita</h2>
          </div>
          <div className="h-0.5 bg-brand-gold w-16 mb-6"></div>

          {!supabase ? (
            <div className="text-gray-300">
              Faltan variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` para habilitar citas.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-black border border-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Barbero</label>
                  <select
                    value={selectedBarber}
                    onChange={(e) => setSelectedBarber(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-black border border-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                  >
                    {BARBERS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-black border border-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-black border border-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                  />
                </div>
                {error ? <div className="text-red-300 text-sm">{error}</div> : null}
                {success ? <div className="text-green-300 text-sm">{success}</div> : null}
                <button
                  onClick={submit}
                  disabled={loading || !selectedSlot}
                  className="w-full bg-brand-gold text-brand-black px-4 py-2 rounded-lg font-semibold hover:brightness-110 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Confirmar cita
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-300">Horas disponibles</div>
                  {loading ? <div className="text-gray-300 text-xs">Cargando...</div> : null}
                </div>
                <div className="rounded-md border border-gray-700 bg-brand-black p-3">
                  {availableSlots.length === 0 ? (
                    <div className="text-gray-300 text-sm">No hay disponibilidad para este día.</div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableSlots.map((slot) => {
                        const active = selectedSlot && slot.getTime() === selectedSlot.getTime();
                        return (
                          <button
                            key={slot.toISOString()}
                            onClick={() => setSelectedSlot(slot)}
                            className={[
                              'px-2 py-2 rounded-md border text-sm transition-colors',
                              active
                                ? 'bg-brand-gold text-brand-black border-brand-gold'
                                : 'bg-brand-black text-gray-100 border-gray-700 hover:bg-black/30',
                            ].join(' ')}
                          >
                            {timeLabel(slot)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="text-gray-400 text-xs mt-2">Horario: 9:00 a 19:00 (citas de 30 min)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminGatePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    async function init() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data?.session ?? null);
      setLoading(false);
    }
    init();
    if (!supabase) return () => {};
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!supabase || !session) {
        setIsAdmin(false);
        return;
      }
      const { data, error: qError } = await supabase.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle();
      if (cancelled) return;
      if (qError) {
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [session]);

  async function handleAuth() {
    if (!supabase) return;
    setError('');
    setMessage('');
    if (isRegistering) {
      const { error: signUpError, data } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
      } else if (data.session) {
        // Auto logged in
      } else {
        setMessage('Registro exitoso. Revisa tu correo o inicia sesión.');
        setIsRegistering(false);
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError('Correo o contraseña inválidos.');
    }
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black">
        <BrandHeader />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 text-gray-300">Cargando...</div>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="min-h-screen bg-brand-black">
        <BrandHeader
          right={
            <Link
              to="/"
              className="bg-brand-black text-brand-gold px-4 py-2 rounded-md hover:bg-black/40 transition-colors border border-brand-gold/30"
            >
              Inicio
            </Link>
          }
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 text-gray-300">
          Faltan variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` para habilitar login.
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-brand-black">
        <BrandHeader
          right={
            <Link
              to="/"
              className="bg-brand-black text-brand-gold px-4 py-2 rounded-md hover:bg-black/40 transition-colors border border-brand-gold/30"
            >
              Inicio
            </Link>
          }
        />
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="bg-brand-gray rounded-2xl shadow-lg border border-brand-gold/30 p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-brand-gold text-xl">🔒</span>
              <h2 className="text-2xl font-semibold font-serif text-brand-gold">{isRegistering ? 'Registrar Administrador' : 'Login Administrador'}</h2>
            </div>
            <div className="h-0.5 bg-brand-gold w-16 mb-6"></div>
            <div className="space-y-4">
              {message && <div className="text-green-400 text-sm mb-2">{message}</div>}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Correo</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-black border border-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-black border border-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
              {error ? <div className="text-red-300 text-sm">{error}</div> : null}
              <button
                onClick={handleAuth}
                className="w-full bg-brand-gold text-brand-black px-4 py-2 rounded-lg font-semibold hover:brightness-110 transition-colors"
              >
                {isRegistering ? 'Registrarse' : 'Ingresar'}
              </button>
              <div className="text-center mt-4">
                <button
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                    setMessage('');
                  }}
                  className="text-gray-400 text-sm hover:text-brand-gold transition-colors underline"
                >
                  {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-brand-black">
        <BrandHeader
          right={
            <button
              onClick={signOut}
              className="bg-brand-black text-brand-gold px-4 py-2 rounded-md hover:bg-black/40 transition-colors border border-brand-gold/30"
            >
              Salir
            </button>
          }
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="bg-brand-gray rounded-2xl shadow-lg border border-brand-gold/30 p-6 text-gray-300">
            Tu usuario no está autorizado como administrador.
          </div>
        </div>
      </div>
    );
  }

  return <AdminCashRegister onSignOut={signOut} />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cliente" element={<ClientBookingPage />} />
      <Route path="/admin" element={<AdminGatePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
