import React, { useState, useEffect } from 'react';
import BookingForm from './components/BookingForm';
import BusinessHours from './components/BusinessHours';
import './styles/App.css';

const MAIN_URL_MAKE_BOOKING = 'http://localhost:5678/webhook/make-booking';
const MAIN_URL_CHECK_BOOKING = 'http://localhost:5678/webhook/check-booking-date';

function App() {
  const [theme, setTheme] = useState('default');
  const [iframeMode, setIframeMode] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme');
    const iframeParam = urlParams.get('iframeMode');

    if (themeParam === 'teal') {
      setTheme('teal');
      document.body.classList.add('teal-theme');
    }

    if (iframeParam === 'true') {
      setIframeMode(true);
      document.body.classList.add('iframe-mode');
    }
  }, []);

  return (
    <div className={`app ${theme === 'teal' ? 'teal-theme' : ''} ${iframeMode ? 'iframe-mode' : ''}`}>
      <div className="container">
        <div className="header">
          <h1><i className="fas fa-calendar-check"></i> Learning Booking System</h1>
          <p>Book your appointment with time slot selection</p>
        </div>

        <div className="form-container">
          <BookingForm 
            checkBookingUrl={MAIN_URL_CHECK_BOOKING}
            makeBookingUrl={MAIN_URL_MAKE_BOOKING}
            iframeMode={iframeMode}
          />
          <BusinessHours />
        </div>
      </div>
    </div>
  );
}

export default App;