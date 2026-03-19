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
    <div className="relative min-h-screen bg-brand-black text-gray-300 font-sans">
      <AnimatePresence>
        <motion.div
          key={activeSection}
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-500"
          style={{ backgroundImage: `url(${sectionImages[activeSection]})` }}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-xl text-brand-gold">
                ✂️
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
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
            <div className="flex items-center p-1 rounded-full bg-brand-surface border border-brand-border">
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
                  className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors focus:outline-none ${
                    activeSection === s.id ? 'text-brand-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {activeSection === s.id && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-brand-gold rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeSection === 'resumen' || activeSection === 'caja' ? (
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="grid gap-6">
            {activeSection === 'resumen' ? (
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-brand-surface border border-brand-border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-brand-gold text-xl">💰</span>
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Total Diario</span>
                  </div>
                  <div className="text-3xl font-bold text-white tracking-tight">
                    ${(getDailyTotal() + getProductsTotal()).toLocaleString('es-CO')}
                  </div>
                </div>
                <div className="bg-brand-surface border border-brand-border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-brand-gold text-xl">📈</span>
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Ganancia Mensual</span>
                  </div>
                  <div className="text-3xl font-bold text-white tracking-tight">
                    ${getMonthlyProfit().toLocaleString('es-CO')}
                  </div>
                </div>
                <div className="bg-brand-surface border border-brand-border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-brand-gold text-xl">✂️</span>
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Cortes de Hoy</span>
                  </div>
                  <div className="text-3xl font-bold text-white tracking-tight">
                    {haircuts.length}
                  </div>
                </div>
                <div className="bg-brand-surface border border-brand-border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-brand-gold text-xl">📦</span>
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Productos Vendidos</span>
                  </div>
                  <div className="text-3xl font-bold text-white tracking-tight">
                    {productSales.length}
                  </div>
                </div>
              </div>
              <div className="bg-brand-surface border border-brand-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Actividad Semanal</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={getWeeklyActivity()} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333333' }} />
                      <Bar dataKey="ingresos" fill="#D4AF37" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-brand-surface border border-brand-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Últimos Cortes</h3>
                  <div className="divide-y divide-brand-border">
                    {haircuts.slice(-5).reverse().map(haircut => (
                      <div key={haircut.id} className="py-2 flex justify-between items-center">
                        <div>
                          <span className="font-medium text-white">{haircut.barber}</span>
                          <span className="text-gray-400 ml-2">- {haircut.service}</span>
                        </div>
                        <span className="text-gray-300">${haircut.price.toLocaleString('es-CO')}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-brand-surface border border-brand-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Últimos Productos Vendidos</h3>
                  <div className="divide-y divide-brand-border">
                    {productSales.slice(-5).reverse().map(item => (
                      <div key={item.id} className="py-2 flex justify-between items-center">
                        <span className="font-medium text-white">{item.product}</span>
                        <span className="text-gray-300">${item.price.toLocaleString('es-CO')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            ) : null}
            {activeSection === 'caja' ? (
            <div className="bg-brand-surface border border-brand-border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium uppercase text-gray-400/60 mb-1">Saldo Inicial</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={initialBalance}
                      onChange={(e) => {
                        const v = e.target.value;
                        setInitialBalance(v ? parseFloat(v) : 0);
                      }}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase text-gray-400/60 mb-1">Fondo de Caja</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={cashFund}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCashFund(v ? parseFloat(v) : 0);
                      }}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-brand-gold text-xl">🧾</span>
                  <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Caja</span>
                </div>
                <div className="text-4xl font-bold text-white tracking-tight">
                  ${getCashTotal().toLocaleString('es-CO')}
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase text-gray-400/60 mb-1">Apertura Siguiente Día</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={nextOpeningBalance}
                      onChange={(e) => {
                        const v = e.target.value;
                        setNextOpeningBalance(v ? parseFloat(v) : 0);
                      }}
                      className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setInitialBalance(nextOpeningBalance || 0);
                      setNextOpeningBalance(0);
                    }}
                    className="w-full bg-brand-gold text-brand-black px-4 py-2 rounded-md font-bold hover:brightness-110 transition-colors"
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
            <div className="bg-brand-surface border border-brand-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold text-white">Agregar Nuevo Corte</h2>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase text-gray-400/60 mb-1">Barbero</label>
                <select
                  value={selectedBarber}
                  onChange={(e) => setSelectedBarber(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                >
                  {barbers.map(barber => (
                    <option key={barber} value={barber}>{barber}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase text-gray-400/60 mb-1">Servicio</label>
                <select
                  value={selectedService}
                  onChange={handleServiceChange}
                  className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                >
                  <option value="">Seleccionar servicio</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase text-gray-400/60 mb-1">$ Precio</label>
                <div className="relative">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="25000"
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                    readOnly
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase text-gray-400/60 mb-1">📅 Fecha</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase text-gray-400/60 mb-1">Tipo de Pago</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase text-transparent mb-1">Acción</label>
                <button
                  onClick={addHaircut}
                  className="w-full bg-brand-gold text-brand-black px-4 py-2 rounded-md font-bold hover:brightness-110 transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
            ) : null}

          {activeSection === 'productos' ? (
          <div className="bg-brand-surface border border-brand-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-white">Agregar Producto Vendido</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <div className="mb-2 text-xs uppercase font-medium text-gray-400/60">Productos</div>
                <div
                  className="h-[420px] overflow-auto rounded-md border border-brand-border bg-brand-black/50"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-brand-surface/80 backdrop-blur-sm border-b border-brand-border">
                      <tr className="text-left text-gray-400">
                        <th className="px-3 py-2 w-12">✔</th>
                        <th className="px-3 py-2">Producto</th>
                        <th className="px-3 py-2 w-28">Precio</th>
                        <th className="px-3 py-2 w-24"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {products.map((product) => (
                        <tr key={product.id} className="group hover:bg-brand-black/50">
                          <td className="px-3 py-3">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(String(product.id))}
                              onChange={() => handleProductToggle(product.id)}
                              className="h-5 w-5 accent-brand-gold bg-transparent"
                              aria-label={`Seleccionar ${product.name}`}
                            />
                          </td>
                          <td className="px-3 py-3 text-white">
                            {editingProductId === product.id ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                              />
                            ) : (
                              product.name
                            )}
                          </td>
                          <td className="px-3 py-3 text-gray-300">
                            {editingProductId === product.id ? (
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="w-28 px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                              />
                            ) : (
                              `$${product.price.toLocaleString('es-CO')}`
                            )}
                          </td>
                          <td className="px-3 py-3">
                            {editingProductId === product.id ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={saveEditProduct}
                                  className="text-brand-gold hover:brightness-110 transition-colors"
                                  aria-label="Guardar"
                                >
                                  Guardar
                                </button>
                                <button
                                  onClick={cancelEditProduct}
                                  className="text-gray-500 hover:text-gray-300 transition-colors"
                                  aria-label="Cancelar"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditProduct(product.id)}
                                  className="text-gray-400 hover:text-white transition-colors"
                                  aria-label="Editar"
                                  title="Editar"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteProduct(product.id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                  aria-label="Eliminar"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 border-t border-brand-border pt-4">
                  <button
                    onClick={() => setShowNewProduct(!showNewProduct)}
                    className="w-full flex items-center justify-between text-gray-400 hover:text-white"
                  >
                    <span className="text-sm font-medium">¿No encuentras el producto? Créalo aquí</span>
                    <span className="text-gray-400">{showNewProduct ? '▾' : '▸'}</span>
                  </button>
                  {showNewProduct ? (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        placeholder="Nombre"
                        className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                      />
                      <input
                        type="number"
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(e.target.value)}
                        placeholder="Precio"
                        className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                      />
                      <button
                        onClick={addProduct}
                        className="w-full bg-brand-gold text-brand-black px-3 py-2 rounded-md font-bold hover:brightness-110 transition-colors"
                      >
                        Crear Producto
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="bg-brand-surface/50 border border-brand-border rounded-lg p-6 backdrop-blur-sm">
                  <div className="text-xs uppercase font-medium text-gray-400/60 mb-2">Resumen de Venta</div>
                  <div className="text-5xl font-bold text-white mb-4">
                    ${Number(productPrice || 0).toLocaleString('es-CO')}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium uppercase text-gray-400/60 mb-1">📅 Fecha</label>
                      <input
                        type="date"
                        value={productDate}
                        onChange={(e) => setProductDate(e.target.value)}
                        className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase text-gray-400/60 mb-1">Tipo de Pago</label>
                      <select
                        value={productPaymentType}
                        onChange={(e) => setProductPaymentType(e.target.value)}
                        className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
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
                      className="w-full bg-brand-gold text-brand-black px-5 py-3 rounded-md font-bold hover:brightness-110 transition-colors shadow-lg shadow-brand-gold/20"
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
          <div className="bg-brand-surface border border-brand-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-white">Registrar Gasto Interno</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase text-gray-400/60 mb-1">Concepto</label>
                <input
                  type="text"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  placeholder="Compra de insumos"
                  className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase text-gray-400/60 mb-1">$ Monto</label>
                <div className="relative">
                  <input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase text-gray-400/60 mb-1">📅 Fecha</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase text-transparent mb-1">Acción</label>
                <button
                  onClick={addExpense}
                  className="w-full bg-brand-gold text-brand-black px-4 py-2 rounded-md font-bold hover:brightness-110 transition-colors"
                >
                  + Agregar
                </button>
              </div>
            </div>
          </div>
          ) : null}

                    {activeSection === 'barberos' ? (
          <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-brand-gold">
              <span className="text-xl">👥</span>
              <span className="text-sm font-semibold uppercase tracking-wider">Barberos</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newBarberName}
                onChange={(e) => setNewBarberName(e.target.value)}
                placeholder="Nuevo barbero"
                className="w-40 px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              />
              <button
                onClick={() => addBarber()}
                className="flex items-center gap-1 bg-brand-gold text-brand-black px-3 py-2 rounded-md font-bold hover:brightness-110 transition-colors"
                title="Agregar barbero"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {barbers.map(barber => (
              <div key={barber} className="bg-brand-surface border border-brand-border rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-brand-black/50 flex items-center justify-center border border-brand-border">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{barber}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <span className="text-brand-gold">✂️</span>
                      {haircuts.filter(h => h.barber === barber).length} cortes
                    </p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white tracking-tight">
                  ${getBarberTotal(barber).toLocaleString('es-CO')}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  {editingBarber === barber ? (
                    <>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                      />
                      <button
                        onClick={() => renameBarber(barber, editingName)}
                        className="bg-brand-gold text-brand-black px-3 py-2 rounded-md hover:brightness-110 transition-colors"
                        title="Confirmar"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setEditingBarber(''); setEditingName(''); }}
                        className="bg-brand-surface text-gray-200 px-3 py-2 rounded-md border border-brand-border hover:bg-brand-black/50 transition-colors"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setEditingBarber(barber); setEditingName(barber); }}
                        className="bg-brand-surface text-gray-400 px-3 py-2 rounded-md border border-brand-border hover:bg-brand-black/50 transition-colors"
                        title="Renombrar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteBarber(barber)}
                        className="bg-brand-surface text-red-500 px-3 py-2 rounded-md border border-brand-border hover:bg-red-500/10 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
                {barberError ? <div className="text-red-400 text-xs mt-2">{barberError}</div> : null}
              </div>
            ))}
          </div>
          </>
          ) : null}

          {activeSection === 'cortes' ? (
          <div className="bg-brand-surface border border-brand-border rounded-lg p-6 mb-8">
            <div className="p-6 border-b border-brand-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Cortes de Hoy</h2>
            </div>
            
            {haircuts.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                No hay cortes registrados aún. ¡Agrega tu primer corte arriba!
              </div>
            ) : (
              <div className="divide-y divide-brand-border">
                {haircuts.map(haircut => (
                  <div key={haircut.id} className="p-4 flex justify-between items-center hover:bg-brand-black/50">
                    <div>
                      <span className="font-medium text-white">{haircut.barber}</span>
                      <span className="text-gray-300 ml-4">{haircut.service}</span>
                      <span className="text-gray-300 ml-4">${haircut.price.toLocaleString('es-CO')}</span>
                      <span className="text-gray-400 ml-4">{haircut.date}</span>
                      <span className="text-gray-400 ml-4">{haircut.payment}</span>
                    </div>
                    <button
                      onClick={() => deleteHaircut(haircut.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
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
          <div className="bg-brand-surface border border-brand-border rounded-lg p-6 mb-8">
            <div className="p-6 border-b border-brand-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Productos Vendidos</h2>
              <div className="text-lg font-bold text-white">
                Total Productos: ${getProductsTotal().toLocaleString('es-CO')}
              </div>
            </div>
            {productSales.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                No hay productos registrados aún.
              </div>
            ) : (
              <div className="divide-y divide-brand-border">
                {productSales.map(item => (
                  <div key={item.id} className="p-4 flex justify-between items-center hover:bg-brand-black/50">
                    <div>
                      <span className="font-medium text-white">{item.product}</span>
                      <span className="text-gray-300 ml-4">${item.price.toLocaleString('es-CO')}</span>
                      <span className="text-gray-400 ml-4">{item.date}</span>
                      <span className="text-gray-400 ml-4">{item.payment}</span>
                    </div>
                    <button
                      onClick={() => deleteProductSale(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
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
          <div className="bg-brand-surface border border-brand-border rounded-lg p-6 mb-8">
            <div className="p-6 border-b border-brand-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Gastos Internos</h2>
              <div className="text-lg font-bold text-white">
                Total Gastos: ${getExpensesTotal().toLocaleString('es-CO')}
              </div>
            </div>
            {expenses.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                No hay gastos registrados aún.
              </div>
            ) : (
              <div className="divide-y divide-brand-border">
                {expenses.map(exp => (
                  <div key={exp.id} className="p-4 flex justify-between items-center hover:bg-brand-black/50">
                    <div>
                      <span className="font-medium text-white">{exp.name}</span>
                      <span className="text-gray-300 ml-4">${exp.amount.toLocaleString('es-CO')}</span>
                      <span className="text-gray-400 ml-4">{exp.date}</span>
                    </div>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
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
