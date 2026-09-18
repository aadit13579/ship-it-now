import type { FastifyInstance } from 'fastify';
import { pool } from '../../db.js';
import { createShipmentSchema, updateStatusSchema, getShipmentsQuerySchema } from '../schemas.js';

export default async function shipmentRoutes(fastify: FastifyInstance) {
  
  // 1. Create Shipment
  fastify.post('/', { schema: createShipmentSchema }, async (request, reply) => {
  const { reference_number, origin, destination, weight, priority, delivery_notes, expected_delivery } = request.body as any;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    let finalRefNumber = reference_number;
    if (!finalRefNumber) {
      const seqRes = await client.query("SELECT nextval('shipment_ref_seq') as seq");
      const nextSeq = seqRes.rows[0].seq;
      finalRefNumber = `SHIP-${String(nextSeq).padStart(5, '0')}`; //something like SHIP-00001
    }

    const shipmentRes = await client.query(
      `INSERT INTO shipments (reference_number, origin, destination, weight, priority, delivery_notes, current_status, expected_delivery)
       VALUES ($1, $2, $3, $4, $5, $6, 'Booked', $7) RETURNING *`,
      [finalRefNumber, origin, destination, weight, priority || 'Standard', delivery_notes || null, expected_delivery]
    );

    const newShipment = shipmentRes.rows[0];

    await client.query(
      `INSERT INTO shipment_events (shipment_id, status, notes) VALUES ($1, 'Booked', 'Shipment created')`,
      [newShipment.id]
    );

    await client.query('COMMIT');
    reply.code(201).send(newShipment);
  } catch (err: any) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return reply.code(400).send({ error: 'Reference number already exists' });
    }
    fastify.log.error(err);
    reply.code(500).send({ error: 'Failed to create shipment' });
  } finally {
    client.release();
  }
});

  // 2. List Shipments
// 2. List Shipments (with search across ref, origin, destination, and notes)
  fastify.get('/', { schema: getShipmentsQuerySchema }, async (request, reply) => {
    const { status, search } = request.query as any;
    let query = 'SELECT * FROM shipments WHERE 1=1';
    const params: any[] = [];

    if (status) {
      params.push(status);
      query += ` AND current_status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      const searchParamIndex = `$${params.length}`;
      
      query += ` AND (
        reference_number ILIKE ${searchParamIndex} OR
        origin ILIKE ${searchParamIndex} OR
        destination ILIKE ${searchParamIndex} OR
        delivery_notes ILIKE ${searchParamIndex}
      )`;
    }

    query += ' ORDER BY priority DESC, created_at DESC';

    try {
      const res = await pool.query(query, params);
      reply.send(res.rows);
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Failed to fetch shipments' });
    }
  });

  // 3. Get Single Shipment
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as any;
    try {
      const shipmentRes = await pool.query('SELECT * FROM shipments WHERE id = $1', [id]);
      if (shipmentRes.rows.length === 0) return reply.code(404).send({ error: 'Shipment not found' });
      
      const eventsRes = await pool.query('SELECT * FROM shipment_events WHERE shipment_id = $1 ORDER BY created_at ASC', [id]);
      reply.send({ ...shipmentRes.rows[0], history: eventsRes.rows });
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Failed to fetch shipment details' });
    }
  });

  // 4. Update Status
  fastify.patch('/:id/status', { schema: updateStatusSchema }, async (request, reply) => {
    const { id } = request.params as any;
    const { status, notes } = request.body as any;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      const updateRes = await client.query(
        `UPDATE shipments SET current_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [status, id]
      );
      
      if (updateRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return reply.code(404).send({ error: 'Shipment not found' });
      }
      
      await client.query(`INSERT INTO shipment_events (shipment_id, status, notes) VALUES ($1, $2, $3)`, [id, status, notes || null]);
      await client.query('COMMIT');
      reply.send(updateRes.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      fastify.log.error(err);
      reply.code(500).send({ error: 'Failed to update status' });
    } finally {
      client.release();
    }
  });

  fastify.get('/health', async (request, reply) => {
    try {
        await pool.query('SELECT 1');
        reply.send({ status: 'ok', database: 'connected' });
    } catch (err) {
        reply.code(500).send({ status: 'error', database: 'disconnected' });
    }
    });
}