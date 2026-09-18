-- Enums for constrained values
CREATE TYPE shipment_status AS ENUM (
  'Booked',
  'In Transit',
  'Customs Hold',
  'Delivered',
  'Cancelled'
);

CREATE TYPE shipment_priority AS ENUM (
  'Standard',
  'Express'
);

-- Main Shipments Table
CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    weight NUMERIC(10, 2) NOT NULL,
    priority shipment_priority NOT NULL DEFAULT 'Standard',
    delivery_notes TEXT,
    current_status shipment_status NOT NULL DEFAULT 'Booked',
    expected_delivery DATE NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shipment Events History Table
CREATE TABLE shipment_events (
    id SERIAL PRIMARY KEY,
    shipment_id INT NOT NULL REFERENCES shipments (id) ON DELETE CASCADE,
    status shipment_status NOT NULL,
    notes TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_shipments_reference ON shipments (reference_number);

CREATE INDEX idx_shipments_status ON shipments (current_status);

CREATE INDEX idx_events_shipment_id ON shipment_events (shipment_id);