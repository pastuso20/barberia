import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { load, save, STORAGE_KEYS } from './storage';
import { supabase } from './supabaseClient';
import { Scissors, Mail, Lock, Shield, Calendar, User, Phone, Check, Plus, Pencil, Trash2, X, LayoutDashboard, Settings, UserCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BARBERS = ['Hernan', 'Manuel', 'Luigui'];

const sectionImages = {
  resumen: '/images/resumen.jpg',
  caja: '/images/caja.jpg',
  citas: '/images/citas.jpg',
  cortes: '/images/cortes.jpg',
  productos: '/images/productos.jpg',
  gastos: '/images/gastos.jpg',
  barberos: '/images/resumen.jpg',
};

function AdminCashRegister({ onSignOut }) {
  const [barbers, setBarbers] = useState(() => load(STORAGE_KEYS.barbers, BARBERS));
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
  const [newBarberName, setNewBarberName] = useState('');
  const [editingBarber, setEditingBarber] = useState('');
  const [editingName, setEditingName] = useState('');
  const [barberError, setBarberError] = useState('');
  
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
  useEffect(() => {
    save(STORAGE_KEYS.barbers, barbers);
  }, [barbers]);

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

  const addBarber = (nameParam) => {
    const name = (nameParam ?? newBarberName).trim();
    if (!name) return;
    if (barbers.some(b => b.toLowerCase() === name.toLowerCase())) {
      setBarberError('El barbero ya existe');
      return;
    }
    setBarberError('');
    setBarbers([...barbers, name]);
    setNewBarberName('');
  };

  const renameBarber = (oldName, newNameParam) => {
    const name = (newNameParam ?? editingName).trim();
    if (!name) return;
    if (barbers.some(b => b.toLowerCase() === name.toLowerCase())) {
      setBarberError('Ya existe ese nombre');
      return;
    }
    const old = oldName ?? editingBarber;
    const next = barbers.map(b => (b === old ? name : b));
    setBarbers(next);
    setHaircuts(haircuts.map(h => (h.barber === old ? { ...h, barber: name } : h)));
    if (selectedBarber === old) setSelectedBarber(name);
    setEditingBarber('');
    setEditingName('');
    setBarberError('');
  };

  const deleteBarber = (nameParam) => {
    const name = nameParam ?? selectedBarber;
    if (haircuts.some(h => h.barber === name)) {
      setBarberError('No se puede eliminar: tiene registros');
      return;
    }
    const next = barbers.filter(b => b !== name);
    setBarbers(next);
    if (!next.includes(selectedBarber)) setSelectedBarber(next[0] || '');
    setBarberError('');
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

  const handleServiceChange = (serviceId) => {
    setSelectedService(serviceId);
    if (serviceId) {
      const service = services.find(s => s.id === parseInt(serviceId));
      setPrice(service ? service.price : '');
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

  const getWeeklyActivity = () => {
    const today = new Date();
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayHaircuts = haircuts.filter(h => h.date === dateString).reduce((sum, h) => sum + h.price, 0);
      const dayProducts = productSales.filter(p => p.date === dateString).reduce((sum, p) => sum + p.price, 0);
      weeklyData.push({
        name: date.toLocaleDateString('es-CO', { weekday: 'short' }).slice(0, 3),
        ingresos: dayHaircuts + dayProducts,
      });
    }
    return weeklyData;
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-gray-300 font-sans overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={activeSection}
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700 blur-[2px] scale-105"
          style={{ backgroundImage: `url(${sectionImages[activeSection]})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black/90" />
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Admin Header */}
        <div className="max-w-7xl w-full mx-auto px-6 pt-10 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-full border-2 border-brand-gold/30 flex items-center justify-center bg-black/20 backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                <Scissors className="w-7 h-7 text-brand-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-4xl font-serif text-brand-gold tracking-[0.15em] font-bold uppercase drop-shadow-lg">
                  Panel Admin
                </h1>
                <div className="h-[1px] w-16 bg-gradient-to-r from-brand-gold/50 to-transparent mt-1" />
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center overflow-hidden hover:border-brand-gold/40 transition-all shadow-[6px_6px_12px_#000000,-6px_-6px_12px_#1a1a1a] active:scale-95 group"
              >
                <User className="w-6 h-6 text-gray-400 group-hover:text-brand-gold transition-colors" />
              </button>

              {isProfileMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 mt-4 w-56 bg-[#111]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 py-2 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      closeCashRegister();
                    }}
                    disabled={haircuts.length === 0 && productSales.length === 0}
                    className="w-full text-left px-6 py-4 text-sm font-bold uppercase tracking-widest text-gray-400 hover:bg-brand-gold/10 hover:text-brand-gold disabled:opacity-20 transition-all flex items-center gap-3"
                  >
                    <Check className="w-4 h-4" /> Cerrar Caja
                  </button>
                  <div className="h-[1px] bg-white/5 mx-4" />
                  {onSignOut ? (
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-6 py-4 text-sm font-bold uppercase tracking-widest text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center gap-3"
                    >
                      <X className="w-4 h-4" /> Salir
                    </button>
                  ) : null}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl w-full mx-auto px-6 mb-10">
          <div className="flex justify-center">
            <div className="flex items-center p-1.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[inset_6px_6px_12px_#000000,inset_-6px_-6px_12px_#1a1a1a]">
              {[
                { id: 'resumen', label: 'Resumen' },
                { id: 'caja', label: 'Caja' },
                { id: 'citas', label: 'Citas' },
                { id: 'cortes', label: 'Cortes' },
                { id: 'productos', label: 'Productos' },
                { id: 'gastos', label: 'Gastos' },
                { id: 'barberos', label: 'Barberos' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`relative px-6 py-2.5 text-xs font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-300 focus:outline-none ${
                    activeSection === s.id ? 'text-brand-black' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {activeSection === s.id && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-brand-gold rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl w-full mx-auto px-6 pb-20 overflow-y-auto">
          {activeSection === 'resumen' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {/* Dashboard Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: 'Total Diario', value: (getDailyTotal() + getProductsTotal()), icon: '💰' },
                  { label: 'Ganancia Mensual', value: getMonthlyProfit(), icon: '📈' },
                  { label: 'Cortes de Hoy', value: haircuts.length, icon: '✂️', noCurrency: true },
                  { label: 'Ventas Productos', value: productSales.length, icon: '📦', noCurrency: true },
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#111]/60 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-[20px_20px_40px_rgba(0,0,0,0.4),-10px_-10px_30px_rgba(255,255,255,0.02)] flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center mb-4 border border-brand-gold/20">
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">{item.label}</span>
                    <div className="text-3xl font-bold text-white tracking-tight">
                      {item.noCurrency ? item.value : `$${item.value.toLocaleString('es-CO')}`}
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Activity Chart */}
              <div className="bg-[#111]/60 backdrop-blur-xl border border-white/5 rounded-[40px] p-10 shadow-[inset_10px_10px_20px_#050505,inset_-10px_-10px_20px_#151515]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-black uppercase tracking-[0.25em] text-gray-400 ml-4">Actividad Semanal</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ingresos</span>
                  </div>
                </div>
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <BarChart data={getWeeklyActivity()} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#444" 
                        fontSize={10} 
                        fontWeight="bold" 
                        tickLine={false} 
                        axisLine={false} 
                        dy={15}
                      />
                      <YAxis 
                        stroke="#444" 
                        fontSize={10} 
                        fontWeight="bold" 
                        tickLine={false} 
                        axisLine={false} 
                        dx={-10}
                        tickFormatter={(v) => `$${(v/1000)}k`}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(212,175,55,0.05)' }}
                        contentStyle={{ 
                          backgroundColor: '#0a0a0a', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                      />
                      <Bar 
                        dataKey="ingresos" 
                        fill="#D4AF37" 
                        radius={[8, 8, 0, 0]} 
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: 'Últimos Cortes', data: haircuts, type: 'haircut' },
                  { title: 'Ventas Recientes', data: productSales, type: 'product' },
                ].map((section, sIdx) => (
                  <div key={sIdx} className="bg-[#111]/60 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-[20px_20px_40px_rgba(0,0,0,0.4)]">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 mb-8 ml-4">{section.title}</h3>
                    <div className="space-y-4">
                      {section.data.slice(-5).reverse().map((item, iIdx) => (
                        <div key={iIdx} className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-lg border border-white/5">
                              {section.type === 'haircut' ? '✂️' : '📦'}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-200">
                                {section.type === 'haircut' ? item.barber : item.product}
                              </div>
                              <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                                {section.type === 'haircut' ? item.service : 'Producto'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-brand-gold">
                              ${item.price.toLocaleString('es-CO')}
                            </div>
                            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                              {item.date}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'caja' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-10"
            >
              <div className="bg-[#111]/60 backdrop-blur-xl border border-white/10 rounded-[48px] p-10 md:p-16 shadow-[20px_20px_60px_#000000,-20px_-20px_60px_#2a2a2a] relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-gold/5 blur-[80px] rounded-full" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                  {[
                    { label: 'Saldo Inicial', value: initialBalance, setter: setInitialBalance },
                    { label: 'Fondo de Caja', value: cashFund, setter: setCashFund },
                  ].map((field, fIdx) => (
                    <div key={fIdx}>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 ml-4">{field.label}</label>
                      <div className="relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-gold transition-colors font-bold">$</span>
                        <input
                          type="number"
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value ? parseFloat(e.target.value) : 0)}
                          className="w-full pl-12 pr-6 py-5 bg-[#0a0a0a]/50 text-gray-200 rounded-2xl focus:outline-none shadow-[inset_8px_8px_16px_#050505,inset_-8px_-8px_16px_#151515] transition-all font-bold text-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center py-10 rounded-[32px] bg-black/30 shadow-[inset_10px_10px_20px_#050505,inset_-10px_-10px_20px_#151515] mb-12">
                  <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 flex items-center justify-center mb-6 border border-brand-gold/20 shadow-lg">
                    <LayoutDashboard className="w-8 h-8 text-brand-gold" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Total en Caja</span>
                  <div className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                    ${getCashTotal().toLocaleString('es-CO')}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 ml-4">Apertura Siguiente Día</label>
                    <div className="relative group">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-gold transition-colors font-bold">$</span>
                      <input
                        type="number"
                        value={nextOpeningBalance}
                        onChange={(e) => setNextOpeningBalance(e.target.value ? parseFloat(e.target.value) : 0)}
                        className="w-full pl-12 pr-6 py-5 bg-[#0a0a0a]/50 text-gray-200 rounded-2xl focus:outline-none shadow-[inset_8px_8px_16px_#050505,inset_-8px_-8px_16px_#151515] transition-all font-bold text-lg"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setInitialBalance(nextOpeningBalance || 0);
                      setNextOpeningBalance(0);
                    }}
                    className="w-full bg-brand-gold text-brand-black px-8 py-5 rounded-[20px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-[0_20px_40px_rgba(212,175,55,0.2)] flex items-center justify-center gap-3 text-sm h-[68px]"
                  >
                    Aplicar Apertura <Check className="w-5 h-5" strokeWidth={3} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'citas' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {supabase ? (
                <div className="bg-[#111]/60 backdrop-blur-xl border border-white/10 rounded-[48px] p-8 md:p-12 shadow-[20px_20px_60px_#000000] overflow-hidden">
                  <AdminAppointmentsPanel />
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-10 text-center">
                  <p className="text-red-500 font-black uppercase tracking-[0.2em] text-sm mb-4">Configuración Requerida</p>
                  <p className="text-gray-400 text-sm">Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` para habilitar el panel de citas.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeSection === 'cortes' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Form: Add Haircut */}
              <div className="bg-[#111]/60 backdrop-blur-xl border border-white/10 rounded-[48px] p-10 md:p-16 shadow-[20px_20px_60px_#000000] relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-gold/5 blur-[80px] rounded-full" />
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/20">
                    <span className="text-2xl">✂️</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Agregar Nuevo Corte</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
                  {[
                    { label: 'Barbero', type: 'select', value: selectedBarber, setter: setSelectedBarber, options: barbers },
                    { label: 'Servicio', type: 'select', value: selectedService, setter: handleServiceChange, options: services.map(s => ({ id: s.id, name: s.name })) },
                    { label: 'Precio', type: 'input', value: price, readOnly: true },
                    { label: 'Fecha', type: 'date', value: date, setter: setDate },
                    { label: 'Tipo de Pago', type: 'select', value: paymentType, setter: setPaymentType, options: ['Efectivo', 'Transferencia', 'Tarjeta'] },
                  ].map((field, fIdx) => (
                    <div key={fIdx}>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 ml-4">{field.label}</label>
                      <div className="relative group">
                        {field.type === 'select' ? (
                          <>
                            <select
                              value={field.value}
                              onChange={(e) => field.setter(e.target.value)}
                              className="w-full px-6 py-5 bg-[#0a0a0a]/50 text-gray-200 rounded-2xl focus:outline-none shadow-[inset_8px_8px_16px_#050505,inset_-8px_-8px_16px_#151515] appearance-none transition-all font-bold cursor-pointer"
                            >
                              {field.label === 'Servicio' ? (
                                <>
                                  <option value="" className="bg-[#0a0a0a]">Seleccionar servicio</option>
                                  {field.options.map(o => <option key={o.id} value={o.id} className="bg-[#0a0a0a]">{o.name}</option>)}
                                </>
                              ) : (
                                field.options.map(o => <option key={typeof o === 'string' ? o : o.id} value={typeof o === 'string' ? o : o.id} className="bg-[#0a0a0a]">{typeof o === 'string' ? o : o.name}</option>)
                              )}
                            </select>
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </span>
                          </>
                        ) : (
                          <input
                            type={field.type === 'date' ? 'date' : 'number'}
                            value={field.value}
                            onChange={(e) => field.setter && field.setter(e.target.value)}
                            readOnly={field.readOnly}
                            className={`w-full px-6 py-5 bg-[#0a0a0a]/50 text-gray-200 rounded-2xl focus:outline-none shadow-[inset_8px_8px_16px_#050505,inset_-8px_-8px_16px_#151515] transition-all font-bold ${field.readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${field.type === 'date' ? '[color-scheme:dark]' : ''}`}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={addHaircut}
                    className="w-full md:w-64 bg-brand-gold text-brand-black px-12 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-[0_20px_40px_rgba(212,175,55,0.2)] flex items-center justify-center gap-4 text-sm"
                  >
                    Agregar Corte <Plus className="w-5 h-5" strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* List: Haircuts Today */}
              <div className="bg-[#111]/60 backdrop-blur-xl border border-white/10 rounded-[48px] p-10 md:p-16 shadow-[20px_20px_60px_#000000] relative overflow-hidden">
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-3xl font-bold text-white tracking-tight">Cortes de Hoy</h2>
                  <div className="px-6 py-3 rounded-2xl bg-brand-gold/5 border border-brand-gold/20 text-brand-gold font-black uppercase tracking-widest text-xs">
                    Total: ${getDailyTotal().toLocaleString('es-CO')}
                  </div>
                </div>

                {haircuts.length === 0 ? (
                  <div className="py-20 text-center rounded-[32px] bg-black/20 shadow-inner border border-white/5">
                    <p className="text-gray-600 font-bold uppercase tracking-[0.3em] text-sm">No hay registros aún</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {haircuts.map(haircut => (
                      <div key={haircut.id} className="group relative p-8 rounded-[32px] bg-[#1a1a1a]/60 border border-white/5 hover:border-brand-gold/30 transition-all duration-500 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-xl border border-white/5 group-hover:border-brand-gold/20 transition-all">
                            👤
                          </div>
                          <button
                            onClick={() => deleteHaircut(haircut.id)}
                            className="w-10 h-10 rounded-xl bg-red-500/5 text-red-500/50 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-1 mb-6">
                          <div className="text-xl font-bold text-white">{haircut.barber}</div>
                          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-gold/80">{haircut.service}</div>
                        </div>
                        <div className="h-[1px] w-full bg-white/5 mb-6" />
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">{haircut.date}</div>
                            <div className="px-3 py-1 rounded-full bg-black/40 border border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500">{haircut.payment}</div>
                          </div>
                          <div className="text-2xl font-black text-white tracking-tighter">
                            ${haircut.price.toLocaleString('es-CO')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeSection === 'productos' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Form: Add Product Sale */}
              <div className="bg-[#111]/60 backdrop-blur-xl border border-white/10 rounded-[48px] p-10 md:p-16 shadow-[20px_20_60px_#000000] relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-gold/5 blur-[80px] rounded-full" />
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/20">
                    <span className="text-2xl">📦</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Agregar Venta de Producto</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                  {/* Left: Product Selection Table */}
                  <div className="lg:col-span-7 space-y-8">
                    <div className="bg-[#0a0a0a]/50 rounded-[32px] border border-white/5 shadow-inner overflow-hidden">
                      <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-brand-gold/20 scrollbar-track-transparent">
                        <table className="w-full text-left">
                          <thead className="sticky top-0 bg-[#111] z-10 border-b border-white/10">
                            <tr>
                              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">✔</th>
                              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Producto</th>
                              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Precio</th>
                              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {products.map((product) => (
                              <tr key={product.id} className="group hover:bg-white/[0.02] transition-all duration-300">
                                <td className="px-8 py-6">
                                  <div 
                                    onClick={() => handleProductToggle(product.id)}
                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                                      selectedProducts.includes(String(product.id))
                                      ? 'bg-brand-gold border-brand-gold'
                                      : 'bg-transparent border-white/10 group-hover:border-brand-gold/30'
                                    }`}
                                  >
                                    {selectedProducts.includes(String(product.id)) && <Check className="w-4 h-4 text-brand-black" strokeWidth={4} />}
                                  </div>
                                </td>
                                <td className="px-8 py-6 font-bold text-gray-200">
                                  {editingProductId === product.id ? (
                                    <input
                                      type="text"
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      className="w-full px-4 py-2 bg-black border border-brand-gold/30 rounded-xl text-sm focus:outline-none"
                                    />
                                  ) : product.name}
                                </td>
                                <td className="px-8 py-6 text-right font-black text-brand-gold/80">
                                  {editingProductId === product.id ? (
                                    <input
                                      type="number"
                                      value={editPrice}
                                      onChange={(e) => setEditPrice(e.target.value)}
                                      className="w-24 px-4 py-2 bg-black border border-brand-gold/30 rounded-xl text-sm focus:outline-none text-right"
                                    />
                                  ) : `$${product.price.toLocaleString('es-CO')}`}
                                </td>
                                <td className="px-8 py-6">
                                  <div className="flex items-center justify-center gap-3">
                                    {editingProductId === product.id ? (
                                      <>
                                        <button onClick={saveEditProduct} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg"><Check className="w-4 h-4" /></button>
                                        <button onClick={cancelEditProduct} className="p-2 text-gray-500 hover:bg-gray-500/10 rounded-lg"><X className="w-4 h-4" /></button>
                                      </>
                                    ) : (
                                      <>
                                        <button onClick={() => startEditProduct(product.id)} className="p-2 text-gray-500 hover:text-brand-gold hover:bg-brand-gold/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => deleteProduct(product.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowNewProduct(!showNewProduct)}
                      className="w-full py-4 rounded-2xl bg-[#111] border border-white/5 text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-brand-gold transition-all flex items-center justify-center gap-3"
                    >
                      {showNewProduct ? 'Cerrar catálogo' : '¿No encuentras un producto? Crear nuevo'}
                    </button>

                    {showNewProduct && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-black/40 rounded-[32px] border border-white/5 shadow-inner">
                        <input
                          type="text"
                          value={newProductName}
                          onChange={(e) => setNewProductName(e.target.value)}
                          placeholder="Nombre"
                          className="w-full px-5 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-brand-gold/50 transition-all"
                        />
                        <input
                          type="number"
                          value={newProductPrice}
                          onChange={(e) => setNewProductPrice(e.target.value)}
                          placeholder="Precio"
                          className="w-full px-5 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-brand-gold/50 transition-all"
                        />
                        <button
                          onClick={addProduct}
                          className="bg-brand-gold text-brand-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-95 transition-all"
                        >
                          Crear Producto
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* Right: Summary & Confirm */}
                  <div className="lg:col-span-5">
                    <div className="bg-[#1a1a1a]/60 backdrop-blur-md rounded-[40px] p-10 border border-brand-gold/20 shadow-2xl sticky top-10">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6 block text-center">Resumen de Venta</span>
                      <div className="text-center mb-10">
                        <div className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                          ${Number(productPrice || 0).toLocaleString('es-CO')}
                        </div>
                        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mt-2">
                          {selectedProducts.length} {selectedProducts.length === 1 ? 'Producto seleccionado' : 'Productos seleccionados'}
                        </div>
                      </div>

                      <div className="space-y-8 mb-10">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 ml-4">Fecha</label>
                          <input
                            type="date"
                            value={productDate}
                            onChange={(e) => setProductDate(e.target.value)}
                            className="w-full px-6 py-5 bg-[#0a0a0a]/50 text-gray-200 rounded-2xl focus:outline-none shadow-[inset_8px_8px_16px_#050505,inset_-8px_-8px_16px_#151515] transition-all font-bold [color-scheme:dark]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 ml-4">Tipo de Pago</label>
                          <div className="relative">
                            <select
                              value={productPaymentType}
                              onChange={(e) => setProductPaymentType(e.target.value)}
                              className="w-full px-6 py-5 bg-[#0a0a0a]/50 text-gray-200 rounded-2xl focus:outline-none shadow-[inset_8px_8px_16px_#050505,inset_-8px_-8px_16px_#151515] appearance-none transition-all font-bold cursor-pointer"
                            >
                              <option value="Efectivo" className="bg-[#0a0a0a]">Efectivo</option>
                              <option value="Transferencia" className="bg-[#0a0a0a]">Transferencia</option>
                              <option value="Tarjeta" className="bg-[#0a0a0a]">Tarjeta</option>
                            </select>
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={addProductSale}
                        disabled={selectedProducts.length === 0}
                        className="w-full bg-brand-gold text-brand-black px-12 py-6 rounded-[24px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-[0_20px_40px_rgba(212,175,55,0.2)] disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-4 text-sm"
                      >
                        Confirmar Venta <Check className="w-5 h-5" strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* List: Product Sales Today */}
              <div className="bg-[#111]/60 backdrop-blur-xl border border-white/10 rounded-[48px] p-10 md:p-16 shadow-[20px_20px_60px_#000000] relative overflow-hidden">
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-3xl font-bold text-white tracking-tight">Productos Vendidos</h2>
                  <div className="px-6 py-3 rounded-2xl bg-brand-gold/5 border border-brand-gold/20 text-brand-gold font-black uppercase tracking-widest text-xs">
                    Total: ${getProductsTotal().toLocaleString('es-CO')}
                  </div>
                </div>

                {productSales.length === 0 ? (
                  <div className="py-20 text-center rounded-[32px] bg-black/20 shadow-inner border border-white/5">
                    <p className="text-gray-600 font-bold uppercase tracking-[0.3em] text-sm">No hay registros aún</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {productSales.map(item => (
                      <div key={item.id} className="group relative p-8 rounded-[32px] bg-[#1a1a1a]/60 border border-white/5 hover:border-brand-gold/30 transition-all duration-500 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-xl border border-white/5 group-hover:border-brand-gold/20 transition-all">
                            📦
                          </div>
                          <button
                            onClick={() => deleteProductSale(item.id)}
                            className="w-10 h-10 rounded-xl bg-red-500/5 text-red-500/50 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-1 mb-6">
                          <div className="text-xl font-bold text-white truncate pr-4">{item.product}</div>
                          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-gold/80">Consumo Interno</div>
                        </div>
                        <div className="h-[1px] w-full bg-white/5 mb-6" />
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">{item.date}</div>
                            <div className="px-3 py-1 rounded-full bg-black/40 border border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500">{item.payment}</div>
                          </div>
                          <div className="text-2xl font-black text-white tracking-tighter">
                            ${item.price.toLocaleString('es-CO')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeSection === 'gastos' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Form: Add Expense */}
              <div className="bg-[#111]/60 backdrop-blur-xl border border-white/10 rounded-[48px] p-10 md:p-16 shadow-[20px_20px_60px_#000000] relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-gold/5 blur-[80px] rounded-full" />
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/20">
                    <span className="text-2xl">💸</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Registrar Gasto Interno</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
                  {[
                    { label: 'Concepto', type: 'text', value: expenseName, setter: setExpenseName, placeholder: 'Compra de insumos' },
                    { label: 'Monto', type: 'number', value: expenseAmount, setter: setExpenseAmount, placeholder: '0' },
                    { label: 'Fecha', type: 'date', value: expenseDate, setter: setExpenseDate },
                  ].map((field, fIdx) => (
                    <div key={fIdx}>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 ml-4">{field.label}</label>
                      <div className="relative group">
                        <input
                          type={field.type}
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-6 py-5 bg-[#0a0a0a]/50 text-gray-200 rounded-2xl focus:outline-none shadow-[inset_8px_8px_16px_#050505,inset_-8px_-8px_16px_#151515] transition-all font-bold placeholder:text-gray-700 [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={addExpense}
                    className="w-full md:w-64 bg-brand-gold text-brand-black px-12 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-[0_20px_40px_rgba(212,175,55,0.2)] flex items-center justify-center gap-4 text-sm"
                  >
                    Registrar Gasto <Plus className="w-5 h-5" strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* List: Expenses */}
              <div className="bg-[#111]/60 backdrop-blur-xl border border-white/10 rounded-[48px] p-10 md:p-16 shadow-[20px_20px_60px_#000000] relative overflow-hidden">
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-3xl font-bold text-white tracking-tight">Gastos Internos</h2>
                  <div className="px-6 py-3 rounded-2xl bg-brand-gold/5 border border-brand-gold/20 text-brand-gold font-black uppercase tracking-widest text-xs">
                    Total: ${getExpensesTotal().toLocaleString('es-CO')}
                  </div>
                </div>

                {expenses.length === 0 ? (
                  <div className="py-20 text-center rounded-[32px] bg-black/20 shadow-inner border border-white/5">
                    <p className="text-gray-600 font-bold uppercase tracking-[0.3em] text-sm">No hay registros aún</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {expenses.map(exp => (
                      <div key={exp.id} className="group relative p-8 rounded-[32px] bg-[#1a1a1a]/60 border border-white/5 hover:border-brand-gold/30 transition-all duration-500 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-xl border border-white/5 group-hover:border-brand-gold/20 transition-all">
                            📉
                          </div>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="w-10 h-10 rounded-xl bg-red-500/5 text-red-500/50 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-1 mb-6">
                          <div className="text-xl font-bold text-white truncate pr-4">{exp.name}</div>
                          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Egreso Administrativo</div>
                        </div>
                        <div className="h-[1px] w-full bg-white/5 mb-6" />
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">{exp.date}</div>
                          </div>
                          <div className="text-2xl font-black text-red-500 tracking-tighter">
                            -${exp.amount.toLocaleString('es-CO')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeSection === 'barberos' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Form: Add Barber */}
              <div className="bg-[#111]/60 backdrop-blur-xl border border-white/10 rounded-[48px] p-10 md:p-16 shadow-[20px_20px_60px_#000000] relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-gold/5 blur-[80px] rounded-full" />
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/20">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Gestionar Barberos</h2>
                </div>

                <div className="max-w-xl mx-auto">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 ml-4">Nuevo Barbero</label>
                  <div className="flex flex-col md:flex-row gap-6">
                    <input
                      type="text"
                      value={newBarberName}
                      onChange={(e) => setNewBarberName(e.target.value)}
                      placeholder="Nombre del barbero"
                      className="flex-1 px-6 py-5 bg-[#0a0a0a]/50 text-gray-200 rounded-2xl focus:outline-none shadow-[inset_8px_8px_16px_#050505,inset_-8px_-8px_16px_#151515] transition-all font-bold placeholder:text-gray-700"
                    />
                    <button
                      onClick={() => addBarber()}
                      className="bg-brand-gold text-brand-black px-10 py-5 rounded-[20px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-[0_20px_40px_rgba(212,175,55,0.2)] flex items-center justify-center gap-3 text-sm"
                    >
                      Añadir <Plus className="w-5 h-5" strokeWidth={3} />
                    </button>
                  </div>
                  {barberError && <p className="mt-4 text-red-500 text-xs font-bold uppercase tracking-wider text-center">{barberError}</p>}
                </div>
              </div>

              {/* List: Barbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {barbers.map(barber => (
                  <div key={barber} className="group relative p-10 rounded-[48px] bg-[#111]/60 backdrop-blur-xl border border-white/5 hover:border-brand-gold/30 transition-all duration-500 shadow-[20px_20px_40px_rgba(0,0,0,0.4)]">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-[32px] bg-black/40 flex items-center justify-center text-4xl mb-6 border border-white/5 group-hover:border-brand-gold/20 transition-all shadow-2xl">
                        👤
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-brand-gold transition-colors">{barber}</h3>
                      <div className="px-4 py-1.5 rounded-full bg-brand-gold/5 border border-brand-gold/10 text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold/80 mb-8">
                        {haircuts.filter(h => h.barber === barber).length} Cortes realizados
                      </div>
                      
                      <div className="text-4xl font-black text-white tracking-tighter mb-8 drop-shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                        ${getBarberTotal(barber).toLocaleString('es-CO')}
                      </div>

                      <div className="w-full h-[1px] bg-white/5 mb-8" />

                      <div className="w-full grid grid-cols-2 gap-4">
                        {editingBarber === barber ? (
                          <div className="col-span-2 space-y-4">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="w-full px-5 py-3 bg-black border border-brand-gold/30 rounded-xl text-sm focus:outline-none"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => renameBarber(barber, editingName)} className="flex-1 bg-green-500/10 text-green-500 py-3 rounded-xl hover:bg-green-500 hover:text-white transition-all"><Check className="w-4 h-4 mx-auto" /></button>
                              <button onClick={() => { setEditingBarber(''); setEditingName(''); }} className="flex-1 bg-white/5 text-gray-500 py-3 rounded-xl hover:bg-white/10 transition-all"><X className="w-4 h-4 mx-auto" /></button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => { setEditingBarber(barber); setEditingName(barber); }}
                              className="bg-white/5 text-gray-400 py-4 rounded-2xl border border-white/5 hover:bg-brand-gold/10 hover:text-brand-gold hover:border-brand-gold/20 transition-all flex items-center justify-center gap-2"
                            >
                              <Pencil className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Editar</span>
                            </button>
                            <button
                              onClick={() => deleteBarber(barber)}
                              className="bg-red-500/5 text-red-500/50 py-4 rounded-2xl border border-red-500/10 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Borrar</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Footer */}
        <div className="max-w-7xl w-full mx-auto px-6 py-10 border-t border-white/5 text-center">
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em]">
            © 2024 Barbería Premium Admin Panel
          </p>
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
    <div className="space-y-12">
      {/* Header & Date Selector */}
      <div className="bg-[#111]/60 backdrop-blur-xl border border-white/10 rounded-[48px] p-10 md:p-16 shadow-[20px_20px_60px_#000000] relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-gold/5 blur-[80px] rounded-full" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/20">
              <Calendar className="w-6 h-6 text-brand-gold" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Gestión de Citas</h2>
          </div>
          
          <div className="w-full md:w-72">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 ml-4">Filtrar por Fecha</label>
            <div className="relative group">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-6 py-5 bg-[#0a0a0a]/50 text-gray-200 rounded-2xl focus:outline-none shadow-[inset_8px_8px_16px_#050505,inset_-8px_-8px_16px_#151515] transition-all font-bold [color-scheme:dark] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Sincronizando...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center rounded-[32px] bg-black/20 shadow-inner border border-white/5">
            <p className="text-gray-600 font-bold uppercase tracking-[0.3em] text-sm">No hay citas para este día</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((it) => {
              const privateRow = Array.isArray(it.appointment_private) ? it.appointment_private[0] : it.appointment_private;
              const when = new Date(it.start_time);
              return (
                <div key={it.id} className="group relative p-8 rounded-[32px] bg-[#1a1a1a]/60 border border-white/5 hover:border-brand-gold/30 transition-all duration-500 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="px-4 py-2 rounded-xl bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-sm font-black tracking-tighter">
                      {timeLabel(when).toLowerCase()}
                    </div>
                    <button
                      onClick={() => removeAppointment(it.id)}
                      className="w-10 h-10 rounded-xl bg-red-500/5 text-red-500/50 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-1">Barbero</div>
                      <div className="text-lg font-bold text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-gold shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                        {it.barber}
                      </div>
                    </div>
                    
                    <div className="h-[1px] w-full bg-white/5" />
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-lg">
                        👤
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-200">{privateRow?.client_name ?? 'Sin nombre'}</div>
                        <div className="text-[10px] font-bold text-gray-500 flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" /> {privateRow?.client_phone ?? 'Sin teléfono'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="px-3 py-1 rounded-full bg-black/40 border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                      Cita Agendada
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}



function HomePage() {
  const [selectedProfile, setSelectedProfile] = useState(null);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
      {/* Fondo Inmersivo Premium */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[2000ms] scale-110 blur-[3px]"
        style={{ backgroundImage: `url('/images/home.jpg')` }}
      />
      {/* Overlay de lujo con viñeta */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black/90" />
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />

      <div className="relative z-10 w-full max-w-5xl px-6 py-12 flex flex-col items-center">
        {/* Encabezado de Marca Refinado */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center mb-16"
        >
          <div className="w-16 h-16 rounded-full border-2 border-brand-gold/30 flex items-center justify-center mb-6 bg-black/20 backdrop-blur-sm shadow-[0_0_20px_rgba(212,175,55,0.1)]">
            <Scissors className="w-8 h-8 text-brand-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" strokeWidth={1.5} />
          </div>
          <h1 className="text-6xl md:text-7xl font-serif text-brand-gold tracking-[0.2em] font-bold uppercase drop-shadow-2xl">
            Barbería
          </h1>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent mt-4" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full bg-black/40 backdrop-blur-xl rounded-[40px] p-8 md:p-10 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden"
        >
          {/* Sutil brillo de fondo para la tarjeta */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-gold/5 blur-[80px] rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-gold/5 blur-[80px] rounded-full" />

          <h2 className="text-lg md:text-xl font-medium text-gray-400 mb-8 text-center tracking-[0.1em] uppercase">
            Selecciona tu perfil
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Tarjeta Perfil: Administrador */}
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => setSelectedProfile('admin')}
              className={`relative cursor-pointer group rounded-[28px] p-8 border transition-all duration-500 flex flex-col items-center justify-center aspect-square md:aspect-[1.1/1] ${
                selectedProfile === 'admin' 
                ? 'bg-brand-gold/[0.07] border-brand-gold shadow-[0_0_40px_rgba(212,175,55,0.15)]' 
                : 'bg-[#111]/60 border-white/5 hover:border-brand-gold/40 hover:bg-[#151515]'
              }`}
            >
              <div className={`w-20 h-20 mb-6 flex items-center justify-center rounded-2xl transition-all duration-500 shadow-2xl ${
                selectedProfile === 'admin' 
                ? 'bg-brand-gold text-brand-black scale-110 shadow-brand-gold/20' 
                : 'bg-[#1a1a1a] text-brand-gold group-hover:scale-105 border border-white/5 group-hover:border-brand-gold/20'
              }`}>
                <div className="relative">
                  <LayoutDashboard className="w-10 h-10" strokeWidth={1.2} />
                  <Settings className="w-5 h-5 absolute -bottom-1 -right-1 bg-inherit rounded-full p-0.5" strokeWidth={2} />
                </div>
              </div>
              <h3 className={`text-2xl font-bold mb-3 tracking-tight transition-colors duration-500 ${selectedProfile === 'admin' ? 'text-brand-gold' : 'text-gray-200'}`}>
                Administrador
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed max-w-[200px] text-center font-medium">
                Gestión experta de caja, citas y reportes estratégicos
              </p>
              
              {selectedProfile === 'admin' && (
                <motion.div layoutId="profile-check" className="absolute top-4 right-4 w-7 h-7 bg-brand-gold rounded-full flex items-center justify-center shadow-lg shadow-brand-gold/30">
                  <Check className="w-4 h-4 text-brand-black" strokeWidth={3} />
                </motion.div>
              )}
            </motion.div>

            {/* Tarjeta Perfil: Cliente */}
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => setSelectedProfile('cliente')}
              className={`relative cursor-pointer group rounded-[28px] p-8 border transition-all duration-500 flex flex-col items-center justify-center aspect-square md:aspect-[1.1/1] ${
                selectedProfile === 'cliente' 
                ? 'bg-brand-gold/[0.07] border-brand-gold shadow-[0_0_40px_rgba(212,175,55,0.15)]' 
                : 'bg-[#111]/60 border-white/5 hover:border-brand-gold/40 hover:bg-[#151515]'
              }`}
            >
              <div className={`w-20 h-20 mb-6 flex items-center justify-center rounded-2xl transition-all duration-500 shadow-2xl ${
                selectedProfile === 'cliente' 
                ? 'bg-brand-gold text-brand-black scale-110 shadow-brand-gold/20' 
                : 'bg-[#1a1a1a] text-brand-gold group-hover:scale-105 border border-white/5 group-hover:border-brand-gold/20'
              }`}>
                <div className="relative">
                  <Calendar className="w-10 h-10" strokeWidth={1.2} />
                  <UserCheck className="w-5 h-5 absolute -bottom-1 -right-1 bg-inherit rounded-full p-0.5" strokeWidth={2} />
                </div>
              </div>
              <h3 className={`text-2xl font-bold mb-3 tracking-tight transition-colors duration-500 ${selectedProfile === 'cliente' ? 'text-brand-gold' : 'text-gray-200'}`}>
                Cliente
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed max-w-[200px] text-center font-medium">
                Reserva tu estilo, consulta disponibilidad y agenda tu cita
              </p>

              {selectedProfile === 'cliente' && (
                <motion.div layoutId="profile-check" className="absolute top-4 right-4 w-7 h-7 bg-brand-gold rounded-full flex items-center justify-center shadow-lg shadow-brand-gold/30">
                  <Check className="w-4 h-4 text-brand-black" strokeWidth={3} />
                </motion.div>
              )}
            </motion.div>
          </div>

          <div className="flex justify-center">
            {selectedProfile ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Link
                  to={selectedProfile === 'admin' ? '/admin' : '/cliente'}
                  className="bg-brand-gold text-brand-black px-12 py-4 rounded-xl font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-[0_20px_40px_rgba(212,175,55,0.2)] flex items-center gap-3 text-sm"
                >
                  Continuar <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </motion.div>
            ) : (
              <button
                disabled
                className="bg-white/5 text-gray-600 px-12 py-4 rounded-xl font-black uppercase tracking-[0.2em] cursor-not-allowed flex items-center gap-4 border border-white/5 text-sm"
              >
                Continuar <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
          </div>
        </motion.div>
        
        <p className="mt-12 text-gray-600 text-xs tracking-[0.3em] uppercase font-bold">
          © 2024 Barbería Premium Experience
        </p>
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
  const [barbers] = useState(() => load(STORAGE_KEYS.barbers, BARBERS));
  const [selectedBarber, setSelectedBarber] = useState(() => {
    const bs = load(STORAGE_KEYS.barbers, BARBERS);
    return bs[0] || '';
  });
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
  useEffect(() => {
    if (!barbers.includes(selectedBarber)) setSelectedBarber(barbers[0] || '');
  }, [barbers, selectedBarber]);

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
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Fondo Inmersivo Premium */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 blur-[2px]"
        style={{ backgroundImage: `url('/images/citas.jpg')` }}
      />
      {/* Overlay de lujo con viñeta */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black/90" />
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />

      <div className="relative z-10 flex flex-col items-center min-h-screen">
        <div className="w-full max-w-7xl mx-auto px-6 pt-12 pb-20">
          
          {/* Encabezado de Marca Refinado */}
          <motion.div 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center mb-16 relative"
          >
            <div className="absolute right-0 top-0">
              <Link
                to="/"
                className="px-8 py-3 rounded-xl border border-brand-gold/30 text-brand-gold hover:bg-brand-gold/10 transition-all text-xs font-black uppercase tracking-[0.2em] backdrop-blur-sm"
              >
                Inicio
              </Link>
            </div>
            
            <div className="w-16 h-16 rounded-full border-2 border-brand-gold/30 flex items-center justify-center mb-6 bg-black/20 backdrop-blur-sm shadow-[0_0_20px_rgba(212,175,55,0.1)]">
              <Scissors className="w-8 h-8 text-brand-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" strokeWidth={1.5} />
            </div>
            <h1 className="text-6xl md:text-7xl font-serif text-brand-gold tracking-[0.2em] font-bold uppercase drop-shadow-2xl text-center">
              Barbería
            </h1>
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent mt-4" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            <div className="bg-black/40 backdrop-blur-xl rounded-[48px] p-10 md:p-16 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
              {/* Sutil brillo de fondo para la tarjeta */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-gold/5 blur-[80px] rounded-full" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-gold/5 blur-[80px] rounded-full" />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
                
                {/* Left Side: Form */}
                <div className="md:col-span-5 space-y-10">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/20">
                      <span className="text-2xl">🗓️</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Agendar Cita</h2>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 ml-2">NOMBRE</label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-gold transition-colors">
                          <User className="w-5 h-5" />
                        </span>
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Nombre del cliente"
                          className="w-full pl-12 pr-4 py-5 bg-[#0a0a0a]/50 text-gray-200 rounded-2xl focus:outline-none shadow-[inset_8px_8px_16px_#050505,inset_-8px_-8px_16px_#151515] transition-all placeholder:text-gray-700 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 ml-2">TELÉFONO</label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-gold transition-colors">
                          <Phone className="w-5 h-5" />
                        </span>
                        <input
                          type="tel"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="310 000 0000"
                          className="w-full pl-12 pr-4 py-5 bg-[#0a0a0a]/50 text-gray-200 rounded-2xl focus:outline-none shadow-[inset_8px_8px_16px_#050505,inset_-8px_-8px_16px_#151515] transition-all placeholder:text-gray-700 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 ml-2">BARBERO</label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-gold transition-colors">
                          <Scissors className="w-5 h-5" />
                        </span>
                        <select
                          value={selectedBarber}
                          onChange={(e) => setSelectedBarber(e.target.value)}
                          className="w-full pl-12 pr-10 py-5 bg-[#0a0a0a]/50 text-gray-200 rounded-2xl focus:outline-none shadow-[inset_8px_8px_16px_#050505,inset_-8px_-8px_16px_#151515] appearance-none transition-all cursor-pointer font-medium"
                        >
                          {barbers.map((b) => (
                            <option key={b} value={b} className="bg-[#0a0a0a]">
                              {b}
                            </option>
                          ))}
                        </select>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 ml-2">FECHA</label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-gold transition-colors">
                          <Calendar className="w-5 h-5" />
                        </span>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full pl-12 pr-4 py-5 bg-[#0a0a0a]/50 text-gray-200 rounded-2xl focus:outline-none shadow-[inset_8px_8px_16px_#050505,inset_-8px_-8px_16px_#151515] transition-all [color-scheme:dark] cursor-pointer font-medium"
                        />
                      </div>
                    </div>

                    <div className="pt-6">
                      <p className="text-gray-600 text-[11px] font-bold uppercase tracking-[0.1em] mb-6 text-center">Selecciona una hora para continuar</p>
                      <button
                        onClick={submit}
                        disabled={loading || !selectedSlot}
                        className="w-full bg-brand-gold text-brand-black px-4 py-6 rounded-[24px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_20px_40px_rgba(212,175,55,0.2)] flex items-center justify-center gap-4 text-base"
                      >
                        Confirmar cita <Check className="w-6 h-6" strokeWidth={3} />
                      </button>
                    </div>

                    {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-center py-3 rounded-xl text-xs font-bold uppercase tracking-wider animate-pulse">{error}</div>}
                    {success && <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-center py-3 rounded-xl text-xs font-bold uppercase tracking-wider">{success}</div>}
                  </div>
                </div>

                {/* Right Side: Slots */}
                <div className="md:col-span-7">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 ml-4">HORAS DISPONIBLES</h3>
                    {loading && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-brand-gold rounded-full animate-ping" />
                        <span className="text-brand-gold text-[10px] font-black tracking-widest uppercase">Actualizando</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#0a0a0a]/30 rounded-[40px] p-10 shadow-[inset_15px_15px_30px_#050505,inset_-15px_-15px_30px_#151515] min-h-[500px] flex flex-col">
                    {(() => {
                      const all = buildSlots(date);
                      const morning = all.filter((s) => s.getHours() < 14);
                      const afternoon = all.filter((s) => s.getHours() >= 14);
                      
                      const renderGroup = (label, list) => (
                        <div className="mb-12 last:mb-0">
                          <div className="flex items-center gap-4 mb-8">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/5" />
                            <div className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-600">{label}</div>
                            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/5" />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            {list.map((slot) => {
                              const isBusy = busyStarts.has(slot.getTime());
                              const isSelected = !isBusy && selectedSlot && slot.getTime() === selectedSlot.getTime();
                              
                              let btnClass = "px-4 py-4 rounded-[20px] text-xs font-black transition-all duration-300 text-center ";
                              if (isBusy) {
                                btnClass += "bg-[#3d0a0a] text-red-500/50 shadow-[inset_4px_4px_8px_#1a0505,inset_-4px_-4px_8px_#5a1010] cursor-not-allowed border border-red-900/20";
                              } else if (isSelected) {
                                btnClass += "bg-brand-gold text-brand-black shadow-[0_10px_20px_rgba(212,175,55,0.3)] scale-105 border border-brand-gold";
                              } else {
                                btnClass += "bg-[#111] text-gray-400 shadow-[8px_8px_16px_#050505,-8px_-8px_16px_#151515] hover:text-brand-gold hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] active:scale-95 border border-white/5";
                              }

                              return (
                                <button
                                  key={slot.toISOString()}
                                  onClick={() => !isBusy && setSelectedSlot(slot)}
                                  className={btnClass}
                                  disabled={isBusy}
                                >
                                  {timeLabel(slot).toLowerCase()}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );

                      return (
                        <>
                          {renderGroup('MAÑANA', morning)}
                          {renderGroup('TARDE', afternoon)}
                        </>
                    );
                    })()}
                  </div>
                  <div className="mt-10 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-brand-gold" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Seleccionado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#111] border border-white/5" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Disponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#3d0a0a] border border-red-900/20" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ocupado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <p className="mt-16 text-center text-gray-600 text-xs tracking-[0.3em] uppercase font-bold">
            © 2024 Barbería Premium Experience
          </p>
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="relative min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-xl rounded-[40px] p-10 border border-white/10 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">Error de Configuración</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Faltan las credenciales de Supabase. Por favor, configura <code className="text-brand-gold bg-black/40 px-2 py-1 rounded">VITE_SUPABASE_URL</code> y <code className="text-brand-gold bg-black/40 px-2 py-1 rounded">VITE_SUPABASE_ANON_KEY</code>.
          </p>
          <Link
            to="/"
            className="inline-block bg-brand-gold text-brand-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden flex items-center justify-center p-6">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-[3px] opacity-40 scale-105"
          style={{ backgroundImage: `url('/images/resumen.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black/90" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-xl rounded-[48px] p-10 md:p-12 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-gold/5 blur-[80px] rounded-full" />
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 rounded-2xl border-2 border-brand-gold/30 flex items-center justify-center mb-6 bg-black/20 backdrop-blur-sm shadow-[0_0_20px_rgba(212,175,55,0.1)]">
              <Lock className="w-7 h-7 text-brand-gold" />
            </div>
            <h2 className="text-2xl font-serif text-brand-gold tracking-[0.15em] font-bold uppercase text-center">
              {isRegistering ? 'Registro' : 'Acceso'} Admin
            </h2>
            <div className="h-[1px] w-12 bg-brand-gold/50 mt-3" />
          </div>

          <div className="space-y-6">
            {message && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-500 text-[10px] font-black uppercase tracking-widest text-center">
                {message}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Email</label>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-gold transition-colors">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@barberia.com"
                  className="w-full pl-14 pr-6 py-5 bg-[#0a0a0a]/50 text-gray-200 rounded-2xl focus:outline-none shadow-[inset_8px_8px_16px_#050505,inset_-8px_-8px_16px_#151515] transition-all font-medium placeholder:text-gray-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Password</label>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-gold transition-colors">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-5 bg-[#0a0a0a]/50 text-gray-200 rounded-2xl focus:outline-none shadow-[inset_8px_8px_16px_#050505,inset_-8px_-8px_16px_#151515] transition-all font-medium placeholder:text-gray-800"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">
                {error}
              </div>
            )}

            <button
              onClick={handleAuth}
              className="w-full bg-brand-gold text-brand-black px-8 py-5 rounded-[20px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-[0_20px_40px_rgba(212,175,55,0.2)] text-sm mt-4"
            >
              {isRegistering ? 'Crear Cuenta' : 'Entrar al Panel'}
            </button>

            <div className="flex flex-col gap-4 mt-8">
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                  setMessage('');
                }}
                className="text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-brand-gold transition-colors text-center"
              >
                {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </button>
              
              <Link
                to="/"
                className="text-gray-700 text-[10px] font-black uppercase tracking-widest hover:text-gray-400 transition-colors text-center"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="relative min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-xl rounded-[40px] p-10 border border-white/10 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">Acceso Restringido</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Tu cuenta no tiene privilegios de administrador. Contacta al soporte si crees que esto es un error.
          </p>
          <button
            onClick={signOut}
            className="w-full bg-white/5 text-gray-400 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all border border-white/5"
          >
            Cerrar Sesión
          </button>
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
