import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { load, save, STORAGE_KEYS } from './storage';
import { supabase } from './supabaseClient';
import { Scissors, Mail, Lock, Shield, Calendar, User, Phone, Check } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const DEFAULT_PRODUCTS = [
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
  ];
  const [products, setProducts] = useState(() => load(STORAGE_KEYS.productsCatalog, DEFAULT_PRODUCTS));
  const [haircuts, setHaircuts] = useState(() => load(STORAGE_KEYS.haircuts, []));
  const [selectedBarber, setSelectedBarber] = useState(() => load(STORAGE_KEYS.selectedBarber, 'Hernan'));
  const [selectedService, setSelectedService] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [productSales, setProductSales] = useState(() => load(STORAGE_KEYS.productSales, []));
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productPrice, setProductPrice] = useState('');
  const [productDate, setProductDate] = useState(new Date().toISOString().split('T')[0]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [initialBalance, setInitialBalance] = useState(() => load(STORAGE_KEYS.initialBalance, 0));
  const [cashFund, setCashFund] = useState(() => load(STORAGE_KEYS.cashFund, 0));
  const [paymentType, setPaymentType] = useState('Efectivo');
  const [productPaymentType, setProductPaymentType] = useState('Efectivo');
  const [expenses, setExpenses] = useState(() => load(STORAGE_KEYS.expenses, []));
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextOpeningBalance, setNextOpeningBalance] = useState(() => load(STORAGE_KEYS.nextOpeningBalance, 0));
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [activeSection, setActiveSection] = useState(() => load(STORAGE_KEYS.adminSection, 'resumen'));
  
  useEffect(() => {
    save(STORAGE_KEYS.selectedBarber, selectedBarber);
  }, [selectedBarber]);
  useEffect(() => {
    if (!barbers.includes(selectedBarber)) setSelectedBarber(barbers[0]);
  }, [barbers, selectedBarber]);

  useEffect(() => {
    save(STORAGE_KEYS.haircuts, haircuts);
  }, [haircuts]);

  useEffect(() => {
    save(STORAGE_KEYS.productSales, productSales);
  }, [productSales]);
  useEffect(() => {
    save(STORAGE_KEYS.productsCatalog, products);
  }, [products]);

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
  useEffect(() => {
    save(STORAGE_KEYS.adminSection, activeSection);
  }, [activeSection]);

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
  const addProduct = () => {
    const name = newProductName.trim();
    const priceNum = parseFloat(newProductPrice);
    if (!name || isNaN(priceNum) || priceNum <= 0) return;
    const nextId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newItem = { id: nextId, name, price: priceNum };
    setProducts([...products, newItem]);
    setNewProductName('');
    setNewProductPrice('');
  };
  const startEditProduct = (id) => {
    const p = products.find(pp => pp.id === id);
    if (!p) return;
    setEditingProductId(id);
    setEditName(p.name);
    setEditPrice(String(p.price));
  };
  const saveEditProduct = () => {
    if (editingProductId === null) return;
    const name = editName.trim();
    const priceNum = parseFloat(editPrice);
    if (!name || isNaN(priceNum) || priceNum <= 0) return;
    setProducts(products.map(p => p.id === editingProductId ? { ...p, name, price: priceNum } : p));
    setEditingProductId(null);
    setEditName('');
    setEditPrice('');
  };
  const cancelEditProduct = () => {
    setEditingProductId(null);
    setEditName('');
    setEditPrice('');
  };
  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
    setSelectedProducts(prev => prev.filter(pid => parseInt(pid) !== id));
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
    
    doc.setFontSize(20);
    doc.text('Informe Diario - Barbería', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 20, 35);
    
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
    
    doc.setFontSize(16);
    doc.text(`Total Diario: $${grandTotal.toLocaleString('es-CO')}`, 20, yPosition + 10);
    
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm border border-brand-gold/20 flex items-center justify-center text-xl text-brand-gold hover:bg-white/10 transition">
              ✂️
            </div>
            <h1 className="text-3xl font-semibold font-serif text-brand-gold tracking-wide">
              Barbería
            </h1>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm border border-brand-gold/20 flex items-center justify-center overflow-hidden hover:bg-white/10 transition focus:outline-none"
            >
              <span className="text-xl">👤</span>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-brand-gray border border-brand-gold/30 rounded-lg shadow-xl z-50 py-1">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    closeCashRegister();
                  }}
                  disabled={haircuts.length === 0 && productSales.length === 0}
                  className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-black/20 hover:text-brand-gold disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  Cerrar Caja
                </button>
                {onSignOut ? (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSignOut();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-black/20 hover:text-brand-gold"
                  >
                    Salir
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex justify-center mb-8">
          <div className="relative flex items-center p-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-brand-gold/15 shadow-inner overflow-x-auto">
            {[
              { id: 'resumen', label: 'Resumen', icon: '📊' },
              { id: 'caja', label: 'Caja', icon: '💰' },
              { id: 'citas', label: 'Citas', icon: '📅' },
              { id: 'cortes', label: 'Cortes', icon: '✂️' },
              { id: 'productos', label: 'Productos', icon: '📦' },
              { id: 'gastos', label: 'Gastos', icon: '📋' },
            ].map((s, index) => {
              const active = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setActiveSection(s.id);
                  }}
                  className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    active ? 'text-brand-black' : 'text-gray-300 hover:text-brand-gold'
                  } sm:w-28 sm:justify-center`}
                >
                  <span className="text-base">{s.icon}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
            <div
              className="absolute h-full rounded-full bg-brand-gold/90 shadow-md transition-all duration-300 ease-out"
              style={{
                width: 'calc(100% / 6)',
                left: `${
                  ['resumen', 'caja', 'citas', 'cortes', 'productos', 'gastos'].indexOf(activeSection) * (100 / 6)
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {activeSection === 'resumen' || activeSection === 'caja' ? (
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid gap-6">
          {activeSection === 'resumen' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-brand-gold/25 bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-xl p-6 shadow-2xl shadow-brand-gold/10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-brand-gold text-xl">💰</span>
                <span className="text-xs uppercase tracking-wider text-gray-300 font-semibold">Total Diario</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-gold tracking-tight drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]">
                ${(getDailyTotal() + getProductsTotal()).toLocaleString('es-CO')}
              </div>
            </div>
            <div className="rounded-3xl border border-brand-gold/20 bg-gradient-to-br from-black/20 to-black/5 backdrop-blur-xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-brand-gold text-xl">📈</span>
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Ganancia Mensual</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-brand-gold tracking-tight drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]">
                ${getMonthlyProfit().toLocaleString('es-CO')}
              </div>
            </div>
          </div>
          ) : null}
          {activeSection === 'caja' ? (
          <div className="rounded-3xl border border-brand-gold/25 bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-xl p-6 shadow-2xl shadow-brand-gold/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Saldo Inicial</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={initialBalance}
                    onChange={(e) => {
                      const v = e.target.value;
                      setInitialBalance(v ? parseFloat(v) : 0);
                    }}
                    className="w-full pl-7 px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Fondo de Caja</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={cashFund}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCashFund(v ? parseFloat(v) : 0);
                    }}
                    className="w-full pl-7 px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-brand-gold text-xl">🧾</span>
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Caja</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-gold tracking-tight drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]">
                ${getCashTotal().toLocaleString('es-CO')}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Apertura Siguiente Día</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={nextOpeningBalance}
                    onChange={(e) => {
                      const v = e.target.value;
                      setNextOpeningBalance(v ? parseFloat(v) : 0);
                    }}
                    className="w-full pl-7 px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setInitialBalance(nextOpeningBalance || 0);
                    setNextOpeningBalance(0);
                  }}
                  className="w-full bg-brand-gold text-brand-black px-4 py-3 rounded-xl font-bold tracking-wide hover:brightness-110 transition-shadow shadow-md"
                >
                  Aplicar Apertura
                </button>
              </div>
            </div>
          </div>
          ) : null}
        </div>
      </header>
      ) : null}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'citas' ? (
          supabase ? (
            <AdminAppointmentsPanel />
          ) : (
            <div className="rounded-3xl border border-brand-gold/25 bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-xl p-6 shadow-2xl shadow-brand-gold/10"> mb-8 text-gray-300">
              Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` para habilitar citas.
            </div>
          )
        ) : null}
        <div className="grid grid-cols-1 gap-8 mb-8">
          {activeSection === 'cortes' ? (
          <div className="rounded-3xl border border-brand-gold/25 bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-xl p-6 shadow-2xl shadow-brand-gold/10">
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
                className="w-full px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
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
                className="w-full px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
              >
                <option value="">Seleccionar servicio</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">$ Precio</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="25000"
                  className="w-full pl-7 px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
                  readOnly
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">📅 Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Tipo de Pago</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-transparent mb-2">Acción</label>
              <button
                onClick={addHaircut}
                className="w-full bg-brand-gold text-brand-black px-4 py-3 rounded-xl font-bold hover:brightness-110 transition-colors shadow-md"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
          ) : null}

        {activeSection === 'productos' ? (
        <div className="rounded-3xl border border-brand-gold/25 bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-xl p-6 shadow-2xl shadow-brand-gold/10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-brand-gold text-xl">📦</span>
            <h2 className="text-2xl font-semibold font-serif text-brand-gold">Agregar Producto Vendido</h2>
          </div>
          <div className="h-0.5 bg-brand-gold w-16 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <div className="mb-3 text-xs uppercase tracking-wider text-gray-300 font-semibold">Productos</div>
              <div
                className="h-[420px] overflow-auto rounded-2xl border border-brand-gold/25 bg-black/25 backdrop-blur-sm"
                style={{ scrollbarWidth: 'thin' }}
              >
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-black/30 backdrop-blur-sm border-b border-brand-gold/20">
                    <tr className="text-left text-gray-300">
                      <th className="px-3 py-3 w-12">✔</th>
                      <th className="px-3 py-3">Producto</th>
                      <th className="px-3 py-3 w-28">Precio</th>
                      <th className="px-3 py-3 w-24"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {products.map((product) => (
                      <tr key={product.id} className="group hover:bg-black/20">
                        <td className="px-3 py-3 sm:py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(String(product.id))}
                            onChange={() => handleProductToggle(product.id)}
                            className="h-5 w-5 accent-brand-gold"
                            aria-label={`Seleccionar ${product.name}`}
                          />
                        </td>
                        <td className="px-3 py-3 sm:py-4 text-gray-100">
                          {editingProductId === product.id ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
                            />
                          ) : (
                            product.name
                          )}
                        </td>
                        <td className="px-3 py-3 sm:py-4 text-gray-300">
                          {editingProductId === product.id ? (
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-28 px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
                            />
                          ) : (
                            `$${product.price.toLocaleString('es-CO')}`
                          )}
                        </td>
                        <td className="px-3 py-3 sm:py-4">
                          {editingProductId === product.id ? (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={saveEditProduct}
                                className="text-brand-gold hover:brightness-110 transition-colors"
                                aria-label="Guardar"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={cancelEditProduct}
                                className="text-brand-gray hover:text-gray-300 transition-colors"
                                aria-label="Cancelar"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEditProduct(product.id)}
                                className="text-gray-400 hover:text-brand-gold transition-colors"
                                aria-label="Editar"
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="text-gray-400 hover:text-red-300 transition-colors"
                                aria-label="Eliminar"
                                title="Eliminar"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 border-t border-brand-gold/20 pt-4">
                <button
                  onClick={() => setShowNewProduct(!showNewProduct)}
                  className="w-full flex items-center justify-between text-brand-gold"
                >
                  <span className="text-sm font-semibold">¿No encuentras el producto? Créalo aquí</span>
                  <span className="text-brand-gold">{showNewProduct ? '▾' : '▸'}</span>
                </button>
                {showNewProduct ? (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      placeholder="Nombre"
                      className="w-full px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
                    />
                    <input
                      type="number"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      placeholder="Precio"
                      className="w-full px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
                    />
                    <button
                      onClick={addProduct}
                      className="w-full bg-transparent border border-brand-gold text-brand-gold px-3 py-2 rounded-xl font-semibold hover:bg-brand-gold/10 transition-colors"
                    >
                      Crear Producto
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-brand-gold/20 bg-[#121212] p-6 shadow-lg">
                <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Resumen de Venta</div>
                <div className="text-4xl sm:text-5xl font-bold text-brand-gold mb-4 drop-shadow-[0_0_8px_rgba(212,175,55,0.45)]">
                  ${Number(productPrice || 0).toLocaleString('es-CO')}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">📅 Fecha</label>
                    <input
                      type="date"
                      value={productDate}
                      onChange={(e) => setProductDate(e.target.value)}
                      className="w-full px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Tipo de Pago</label>
                    <select
                      value={productPaymentType}
                      onChange={(e) => setProductPaymentType(e.target.value)}
                      className="w-full px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Tarjeta">Tarjeta</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={addProductSale}
                    className="w-full bg-brand-gold text-brand-black px-5 py-3 rounded-xl font-bold hover:brightness-110 transition-colors shadow-lg"
                  >
                    Confirmar Venta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        ) : null}
        </div>

        {activeSection === 'gastos' ? (
        <div className="rounded-3xl border border-brand-gold/25 bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-xl p-6 shadow-2xl shadow-brand-gold/10"> mb-8">
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
                className="w-full px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">$ Monto</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-7 px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">📅 Fecha</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-transparent mb-2">Acción</label>
              <button
                onClick={addExpense}
                className="w-full bg-brand-gold text-brand-black px-4 py-3 rounded-xl font-bold hover:brightness-110 transition-colors shadow-md"
              >
                + Agregar
              </button>
            </div>
          </div>
        </div>
        ) : null}

        {activeSection === 'resumen' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {barbers.map(barber => (
            <div key={barber} className="rounded-3xl border border-brand-gold/20 bg-gradient-to-br from-black/25 to-black/10 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl hover:shadow-brand-gold/10 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 flex items-center justify-center border border-brand-gold/30">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-brand-gold">{barber}</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <span className="text-brand-gold">✂️</span>
                    {haircuts.filter(h => h.barber === barber).length} cortes
                  </p>
                </div>
              </div>
              <p className="text-3xl font-extrabold text-brand-gold tracking-tight drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]">
                ${getBarberTotal(barber).toLocaleString('es-CO')}
              </p>
            </div>
          ))}
        </div>
        ) : null}

        {activeSection === 'cortes' ? (
        <div className="rounded-2xl border border-brand-gold/20 bg-black/25 backdrop-blur-sm shadow-lg mb-8">
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
        ) : null}

        {activeSection === 'productos' ? (
        <div className="rounded-2xl border border-brand-gold/20 bg-black/25 backdrop-blur-sm shadow-lg mb-8">
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
        ) : null}

        {activeSection === 'gastos' ? (
        <div className="rounded-2xl border border-brand-gold/20 bg-black/25 backdrop-blur-sm shadow-lg mb-8">
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
        ) : null}
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
        <div className="rounded-2xl border border-brand-gold/20 bg-black/25 backdrop-blur-sm p-6 shadow-lg mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
        <div className="flex items-center gap-3">
          <span className="text-brand-gold text-xl">📅</span>
          <h2 className="text-2xl font-semibold font-serif text-brand-gold">Citas</h2>
        </div>
        <div className="w-full md:w-48 md:justify-self-end">
          <label className="block text-xs font-semibold uppercase tracking-wider text-brand-gold mb-1">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
          />
        </div>
      </div>
      <div className="h-0.5 bg-brand-gold w-16 mb-4"></div>
      {error ? <div className="text-red-300 text-sm mb-3">{error}</div> : null}
      {loading ? <div className="text-gray-300 text-sm mb-3">Cargando...</div> : null}
          <div className="rounded-xl border border-brand-gold/25 bg-black/25 backdrop-blur-sm overflow-auto">
        <table className="min-w-full text-sm">
              <thead className="bg-black/30 backdrop-blur-sm border-b border-brand-gold/20">
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex flex-col items-center gap-3 md:flex-1">
          <div className="w-14 h-14 rounded-full bg-black/25 backdrop-blur-sm border-[0.5px] border-brand-gold/40 flex items-center justify-center text-2xl text-brand-gold">
            <Scissors className="w-7 h-7" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold font-serif text-brand-gold tracking-wider md:tracking-widest">
            Barbería
          </h1>
        </div>
        {right ? (
          <div className="w-full md:w-auto flex justify-center md:justify-end">
            {right}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen bg-brand-black">
      <BrandHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border-[0.5px] border-brand-gold/40 bg-black/20 backdrop-blur-md p-6 shadow-lg"
        >
          <h2 className="text-2xl font-semibold font-serif text-brand-gold mb-2 tracking-wider">Selecciona una interfaz</h2>
          <div className="h-0.5 bg-brand-gold w-16 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              to="/admin"
              className="group block border border-brand-gold/25 bg-black/25 backdrop-blur-sm rounded-2xl p-6 transition-all hover:scale-105 hover:border-brand-gold/50"
            >
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-brand-gold" />
                <div className="text-brand-gold font-semibold text-lg">Administrador</div>
              </div>
              <div className="text-gray-300 text-sm">Ingresar y gestionar caja y citas</div>
            </Link>
            <Link
              to="/cliente"
              className="group block border border-brand-gold/25 bg-black/25 backdrop-blur-sm rounded-2xl p-6 transition-all hover:scale-105 hover:border-brand-gold/50"
            >
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6 text-brand-gold" />
                <div className="text-brand-gold font-semibold text-lg">Cliente</div>
              </div>
              <div className="text-gray-300 text-sm">Agendar cita y ver disponibilidad</div>
            </Link>
          </div>
        </motion.div>
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
        <div className="rounded-3xl border border-brand-gold/25 bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-xl p-6 shadow-2xl shadow-brand-gold/10">
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
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Nombre</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold/70">
                      <User className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Nombre del cliente"
                      className="w-full pl-10 px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Teléfono</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold/70">
                      <Phone className="w-5 h-5" />
                    </span>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="310 000 0000"
                      className="w-full pl-10 px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Barbero</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold/70">
                      <Scissors className="w-5 h-5" />
                    </span>
                    <select
                      value={selectedBarber}
                      onChange={(e) => setSelectedBarber(e.target.value)}
                      className="w-full pl-10 px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
                    >
                      {BARBERS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Fecha</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold/70">
                      <Calendar className="w-5 h-5" />
                    </span>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {selectedSlot ? `Reserva con ${selectedBarber} el ${date} a las ${timeLabel(selectedSlot)}` : 'Selecciona una hora para continuar'}
                </div>
                {error ? <div className="text-red-300 text-sm">{error}</div> : null}
                {success ? <div className="text-green-300 text-sm">{success}</div> : null}
                <button
                  onClick={submit}
                  disabled={loading || !selectedSlot}
                  className="w-full bg-brand-gold text-brand-black px-4 py-3 rounded-xl font-bold hover:brightness-110 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                >
                  <span>Confirmar cita</span>
                  <Check className="w-5 h-5" />
                </button>
              </div>

              <div className="md:col-span-7">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-300">Horas disponibles</div>
                  {loading ? <div className="text-gray-300 text-xs">Cargando...</div> : null}
                </div>
                <div className="rounded-2xl border border-brand-gold/25 bg-black/25 backdrop-blur-sm p-4">
                  {(() => {
                    const all = buildSlots(date);
                    const morning = all.filter((s) => s.getHours() < 14);
                    const afternoon = all.filter((s) => s.getHours() >= 14);
                    const renderGroup = (label, list) => (
                      <div className="mb-4">
                        <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">{label}</div>
                        <div className="flex flex-wrap gap-2">
                          {list.map((slot) => {
                            const busy = busyStarts.has(slot.getTime());
                            const active = !busy && selectedSlot && slot.getTime() === selectedSlot.getTime();
                            const base = 'px-3 py-2 rounded-full border text-sm transition-all';
                            const cls = busy
                              ? 'opacity-40 text-gray-400 border-gray-700 line-through cursor-not-allowed'
                              : active
                              ? 'bg-brand-gold text-brand-black border-brand-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.45)]'
                              : 'bg-black/40 text-gray-100 border-brand-gold/25 hover:bg-black/50';
                            return (
                              <button
                                key={slot.toISOString()}
                                onClick={() => !busy && setSelectedSlot(slot)}
                                className={`${base} ${cls}`}
                                disabled={busy}
                              >
                                {timeLabel(slot)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                    return (
                      <>
                        {renderGroup('Mañana', morning)}
                        {renderGroup('Tarde', afternoon)}
                      </>
                    );
                  })()}
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
    try {
      if (isRegistering) {
        const { error: signUpError, data } = await supabase.auth.signUp({ email, password });
        if (signUpError) {
          setError(signUpError.message);
        } else if (data.session) {
        } else {
          setMessage('Registro exitoso. Revisa tu correo o inicia sesión.');
          setIsRegistering(false);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) setError('Correo o contraseña inválidos.');
      }
    } catch (e) {
      setError('No se pudo conectar a Supabase. Verifica VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
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
          Variables `VITE_SUPABASE_URL` y/o `VITE_SUPABASE_ANON_KEY` faltan o son inválidas. Configura correctamente tus credenciales de Supabase para habilitar el login.
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-brand-black">
        <BrandHeader />
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border-[0.5px] border-brand-gold/40 bg-black/35 backdrop-blur-md p-6 shadow-lg"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <span className="text-brand-gold text-xl">🔒</span>
                <h2 className="text-2xl font-semibold font-serif text-brand-gold">{isRegistering ? 'Registrar Administrador' : 'Login Administrador'}</h2>
              </div>
              <Link
                to="/"
                className="bg-brand-black text-brand-gold px-3 py-1 rounded-md hover:bg-black/40 transition-colors border border-brand-gold/30 text-sm"
              >
                Inicio
              </Link>
            </div>
            <div className="h-0.5 bg-brand-gold w-16 mb-6"></div>
            <div className="space-y-4">
              {message && <div className="text-green-400 text-sm mb-2">{message}</div>}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold/70">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo"
                  className="w-full pl-10 px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold/70">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full pl-10 px-3 py-2 bg-transparent border border-brand-gold/40 text-gray-100 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
                />
              </div>
              {error ? <div className="text-red-300 text-sm">{error}</div> : null}
              <button
                onClick={handleAuth}
                className="w-full bg-brand-gold text-brand-black px-5 py-3 rounded-xl font-bold shadow-[0_10px_24px_rgba(212,175,55,0.25)] hover:brightness-110 transition-all"
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
          </motion.div>
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
  const location = useLocation();
  const [transitioning, setTransitioning] = useState(false);
  useEffect(() => {
    setTransitioning(true);
    const t = setTimeout(() => setTransitioning(false), 450);
    return () => clearTimeout(t);
  }, [location.pathname]);
  return (
    <>
      {transitioning ? (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}>
            <div className="w-16 h-16 rounded-full border border-brand-gold/40 bg-black/20 flex items-center justify-center">
              <Scissors className="w-7 h-7 text-brand-gold animate-spin" />
            </div>
          </motion.div>
        </div>
      ) : null}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cliente" element={<ClientBookingPage />} />
        <Route path="/admin" element={<AdminGatePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
