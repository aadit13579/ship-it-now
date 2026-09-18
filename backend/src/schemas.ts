export const createShipmentSchema = {
  body: {
    type: 'object',
    required: ['origin', 'destination', 'weight', 'expected_delivery'],
    properties: {
      reference_number: { type: 'string' },
      origin: { type: 'string', minLength: 2 },
      destination: { type: 'string', minLength: 2 },
      weight: { type: 'number', minimum: 0.1 },
      priority: { type: 'string', enum: ['Standard', 'Express'], default: 'Standard' },
      delivery_notes: { type: 'string' },
      expected_delivery: { type: 'string', format: 'date' },
    },
  },
};

export const updateStatusSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer' },
    },
  },
  body: {
    type: 'object',
    required: ['status'],
    properties: {
      status: { 
        type: 'string', 
        enum: ['Booked', 'In Transit', 'Customs Hold', 'Delivered', 'Cancelled'] 
      },
      notes: { type: 'string' },
    },
  },
};

export const getShipmentsQuerySchema = {
  querystring: {
    type: 'object',
    properties: {
      status: { type: 'string' },
      search: { type: 'string' },
    },
  },
};