import React, { useState, useEffect } from 'react';
import TimeSlotSelector from './TimeSlotSelector';
import Toast from './Toast';
import { getNextWeekday } from '../utils/helpers';

const safeJson = async (response) => {
  try {
    return await response.clone().json();
  } catch (e) {
    const text = await response.text();
    console.error("❌ Server did NOT return JSON. Raw response:", text);
    return null;
  }
};

const BookingForm = ({ checkBookingUrl, makeBookingUrl, iframeMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: getNextWeekday(),
  });

  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const checkDateAndLoadSlots = async (date) => {
    setIsLoading(true);

    try {

      const response = await fetch(checkBookingUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });

      const data = await safeJson(response);

      if (!data) {
        showToast('Server returned invalid response while loading slots.', 'error');
        setAvailableSlots([]);
        return;
      }

      console.log("📥 Slots API response:", data);

      if (!data.success) {
        showToast(data.error || 'Failed to load time slots', 'error');
        setAvailableSlots([]);
        return;
      }

      if (data.isHoliday) {
        showToast(data.holidayMessage, 'error');
        setAvailableSlots([]);
        return;
      }

      if (data.isWeekend) {
        showToast(data.weekendMessage, 'error');
        setAvailableSlots([]);
        return;
      }

      setAvailableSlots(data.availableSlots || []);

    } catch (error) {
      console.error("❌ Slot load error:", error);
      showToast('Error checking slot availability', 'error');
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (formData.date) checkDateAndLoadSlots(formData.date);
  }, []);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setFormData({ ...formData, date });
    setSelectedTimeSlot(null);
    checkDateAndLoadSlots(date);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTimeSlot) {
      showToast('Please select a time slot', 'error');
      return;
    }

    setIsLoading(true);

    const bookingData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      date: formData.date,
      time: selectedTimeSlot,
    };

    console.log("📤 Sending booking:", bookingData);

    try {
      const response = await fetch(makeBookingUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const data = await safeJson(response);

      if (!data) {
        showToast('Server returned invalid booking response.', 'error');
        return;
      }

      console.log("📥 Booking response:", data);

      if (data.success) {
        showToast(data.confirmationMessage || 'Booking confirmed!', 'success');

        if (iframeMode) {
          window.parent.postMessage({
            type: 'booking-submitted',
            success: true,
            data: data,
          }, '*');
        }

        // Reset form
        const nextDate = getNextWeekday();
        setFormData({ name: '', email: '', phone: '', date: nextDate });
        setSelectedTimeSlot(null);
        checkDateAndLoadSlots(nextDate);

      } else {
        showToast(data.error || data.message || 'Booking failed', 'error');
      }

    } catch (error) {
      console.error("❌ Booking error:", error);
      showToast('Booking failed: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form id="booking-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input type="text" id="name" name="name"
            value={formData.name} onChange={handleInputChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input type="email" id="email" name="email"
            value={formData.email} onChange={handleInputChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input type="tel" id="phone" name="phone"
            placeholder="+60123456789"
            value={formData.phone} onChange={handleInputChange}
            required />
        </div>

        <div className="form-group">
          <label htmlFor="date">Select Date *</label>
          <input type="date" id="date" name="date"
            value={formData.date} onChange={handleDateChange}
            min={new Date().toISOString().split('T')[0]} required />
        </div>

        <div className="form-group">
          <label>Available Time Slots *</label>
          <TimeSlotSelector
            slots={availableSlots}
            selectedSlot={selectedTimeSlot}
            onSelect={setSelectedTimeSlot}
            isLoading={isLoading}
          />
        </div>

        <button type="submit" className="btn"
          disabled={isLoading || !selectedTimeSlot}>
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Processing...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane"></i> Submit Booking
            </>
          )}
        </button>
      </form>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  );
};

export default BookingForm;
