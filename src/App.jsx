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
  const [haircuts, setHaircuts] = useState(() => load(STORAGE_KEYS.haircuts, []));
  const [selectedBarber, setSelectedBarber] = useState(() => load(STORAGE_KEYS.selectedBarber, 'Felipe'));
  const [selectedService, setSelectedService] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Persist to localStorage when state changes
  useEffect(() => {
    save(STORAGE_KEYS.haircuts, haircuts);
  }, [haircuts]);

  useEffect(() => {
    save(STORAGE_KEYS.selectedBarber, selectedBarber);
  }, [selectedBarber]);

  const addHaircut = () => {
    if (selectedService && price && date) {
      const service = services.find(s => s.id === parseInt(selectedService));
      const newHaircut = {
        id: Date.now(),
        barber: selectedBarber,
        service: service.name,
        price: parseFloat(price),
        date: date
      };
      setHaircuts([...haircuts, newHaircut]);
      setSelectedService('');
      setPrice('');
    }
  };

  const deleteHaircut = (id) => {
    setHaircuts(haircuts.filter(haircut => haircut.id !== id));
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Barbería</h1>
            <div className="text-lg font-semibold text-red-600">
              Total Diario: ${getDailyTotal().toLocaleString('es-CO')}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Haircut Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Agregar Nuevo Corte</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <button
              onClick={generatePDF}
              disabled={haircuts.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Descargar Informe PDF
            </button>
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
      </div>
    </div>
  );
}

export default App;
