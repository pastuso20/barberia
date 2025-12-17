import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { load, save, STORAGE_KEYS } from './storage';

function App() {
  const [barbers] = useState(['Felipe', 'David', 'Kevin']);
  const [services] = useState([
    { id: 1, name: 'Corte Clásico', price: 25000 },
    { id: 2, name: 'Corte + Barba', price: 35000 },
    { id: 3, name: 'Corte Degradado', price: 30000 },
    { id: 4, name: 'Arreglo de Barba', price: 15000 },
    { id: 5, name: 'Afeitada Tradicional', price: 20000 },
    { id: 6, name: 'Corte Infantil', price: 20000 }
  ]);
  const [products] = useState([
    { id: 1, name: 'Agua', price: 3000 },
    { id: 2, name: 'Gaseosa', price: 4000 },
    { id: 3, name: 'Six-pack de cerveza', price: 30000 },
    { id: 4, name: 'Cerveza', price: 6000 },
    { id: 5, name: 'Speed Max', price: 8000 },
    { id: 6, name: 'Gatorade', price: 7000 }
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

  const handleProductChange = (e) => {
    const vals = Array.from(e.target.selectedOptions).map(o => o.value);
    setSelectedProducts(vals);
    if (vals.length) {
      const sum = vals.reduce((acc, id) => {
        const p = products.find(pp => pp.id === parseInt(id));
        return acc + (p ? p.price : 0);
      }, 0);
      setProductPrice(sum);
    } else {
      setProductPrice('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Barbería</h1>
            <div className="flex items-center gap-6">
              <div className="text-lg font-semibold text-red-600">
                Total Diario: ${(getDailyTotal() + getProductsTotal()).toLocaleString('es-CO')}
              </div>
              <div className="text-lg font-semibold text-green-700">
                Ganancia Mensual: ${getMonthlyProfit().toLocaleString('es-CO')}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Saldo Inicial</span>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => {
                    const v = e.target.value;
                    setInitialBalance(v ? parseFloat(v) : 0);
                  }}
                  className="w-28 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Fondo de Caja</span>
                <input
                  type="number"
                  value={cashFund}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCashFund(v ? parseFloat(v) : 0);
                  }}
                  className="w-28 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="text-lg font-semibold text-gray-900">
                Caja: ${getCashTotal().toLocaleString('es-CO')}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Apertura Siguiente Día</span>
                <input
                  type="number"
                  value={nextOpeningBalance}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNextOpeningBalance(v ? parseFloat(v) : 0);
                  }}
                  className="w-32 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={() => {
                    setInitialBalance(nextOpeningBalance || 0);
                    setNextOpeningBalance(0);
                  }}
                  className="bg-gray-800 text-white px-3 py-1 rounded-md hover:bg-gray-900 transition-colors"
                >
                  Aplicar Apertura
                </button>
              </div>
              <button
                onClick={closeCashRegister}
                disabled={haircuts.length === 0 && productSales.length === 0}
                className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Cerrar Caja
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Local storage mode: no loading/error banner */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Agregar Nuevo Corte</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Barbero</label>
              <select
                value={selectedBarber}
                onChange={(e) => setSelectedBarber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {barbers.map(barber => (
                  <option key={barber} value={barber}>{barber}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Servicio</label>
              <select
                value={selectedService}
                onChange={handleServiceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Seleccionar servicio</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio ($COP)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Pago</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={addHaircut}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Agregar Corte
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Agregar Producto Vendido</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Producto</label>
              <select
                value={selectedProducts}
                onChange={handleProductChange}
                multiple
                size={products.length}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio ($COP)</label>
              <input
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <input
                type="date"
                value={productDate}
                onChange={(e) => setProductDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Pago</label>
              <select
                value={productPaymentType}
                onChange={(e) => setProductPaymentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={addProductSale}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Agregar Producto
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Registrar Gasto Interno</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Concepto</label>
              <input
                type="text"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                placeholder="Compra de insumos"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monto ($COP)</label>
              <input
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addExpense}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Agregar Gasto
              </button>
            </div>
          </div>
        </div>

        {/* Barber Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {barbers.map(barber => (
            <div key={barber} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{barber}</h3>
              <p className="text-2xl font-bold text-red-600">${getBarberTotal(barber).toLocaleString('es-CO')}</p>
              <p className="text-sm text-gray-600">
                {haircuts.filter(h => h.barber === barber).length} cortes
              </p>
            </div>
          ))}
        </div>

        {/* Haircuts List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Cortes de Hoy</h2>
          </div>
          
          {haircuts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No hay cortes registrados aún. ¡Agrega tu primer corte arriba!
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {haircuts.map(haircut => (
                <div key={haircut.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <span className="font-medium text-gray-900">{haircut.barber}</span>
                    <span className="text-gray-600 ml-4">{haircut.service}</span>
                    <span className="text-gray-600 ml-4">${haircut.price.toLocaleString('es-CO')}</span>
                    <span className="text-gray-500 ml-4">{haircut.date}</span>
                    <span className="text-gray-500 ml-4">{haircut.payment}</span>
                  </div>
                  <button
                    onClick={() => deleteHaircut(haircut.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Productos Vendidos</h2>
            <div className="text-lg font-semibold text-red-600">
              Total Productos: ${getProductsTotal().toLocaleString('es-CO')}
            </div>
          </div>
          {productSales.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No hay productos registrados aún.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {productSales.map(item => (
                <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <span className="font-medium text-gray-900">{item.product}</span>
                    <span className="text-gray-600 ml-4">${item.price.toLocaleString('es-CO')}</span>
                    <span className="text-gray-500 ml-4">{item.date}</span>
                    <span className="text-gray-500 ml-4">{item.payment}</span>
                  </div>
                  <button
                    onClick={() => deleteProductSale(item.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Gastos Internos</h2>
            <div className="text-lg font-semibold text-red-600">
              Total Gastos: ${getExpensesTotal().toLocaleString('es-CO')}
            </div>
          </div>
          {expenses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No hay gastos registrados aún.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {expenses.map(exp => (
                <div key={exp.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <span className="font-medium text-gray-900">{exp.name}</span>
                    <span className="text-gray-600 ml-4">${exp.amount.toLocaleString('es-CO')}</span>
                    <span className="text-gray-500 ml-4">{exp.date}</span>
                  </div>
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
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
