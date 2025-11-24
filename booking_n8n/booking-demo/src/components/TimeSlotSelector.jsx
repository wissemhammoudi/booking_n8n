import React from 'react';

const TimeSlotSelector = ({ slots, selectedSlot, onSelect, isLoading }) => {
  if (isLoading && slots.length === 0) {
    return (
      <div className="time-slots-container">
        <div className="time-slots-grid">
          <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
            Loading time slots...
          </div>
        </div>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="time-slots-container">
        <div className="time-slots-grid">
          <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
            No time slots available for this date
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="time-slots-container">
      <div className="time-slots-grid">
        {slots.map((slot, index) => {
          const isBooked = slot.available === false;
          const isSelected = selectedSlot === slot.time;

          return (
            <div
              key={index}
              className={`time-slot ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => !isBooked && onSelect(slot.time)}
              title={isBooked ? 'This slot is already booked' : ''}
            >
              {slot.display}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSlotSelector;


