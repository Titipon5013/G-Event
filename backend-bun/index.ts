import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { cors } from 'hono/cors';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const app = new Hono();

app.use('/*', cors());

app.get('/', (c) => {
  return c.text("🚀 G-Event API is running with Hono!");
});

app.get('/api/events', async (c) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const safeData = data.map((event: any) => {
      delete event.manage_pin;
      return event;
    });

    return c.json({ status: "success", data: safeData }, 200);
  } catch (error: any) {
    return c.json({ status: "error", message: error.message }, 500);
  }
});

app.get('/api/events', async (c) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const safeData = data.map((event: any) => {
      delete event.manage_pin;
      return event;
    });

    return c.json({ status: "success", data: safeData }, 200);
  } catch (error: any) {
    return c.json({ status: "error", message: error.message }, 500);
  }
});

app.get('/test-db', async (c) => {
  try {
    const { data, error } = await supabase.from('events').select('*').limit(1);
    if (error) throw error;
    
    return c.json({ status: "success", message: "เชื่อมต่อ Supabase สำเร็จ!", data });
  } catch (error: any) {
    return c.json({ status: "error", message: error.message }, 500);
  }
});

app.post('/api/events', async (c) => {
  try {
    const body = await c.req.json();
    
    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          name: body.name,
          event_time: body.event_time,
          location: body.location,
          max_people: body.max_people || null,
          manage_pin: body.manage_pin,
          qr_image_url: body.qr_image_url || null 
        }
      ])
      .select();

    if (error) throw error;

    return c.json({ status: "success", message: "สร้าง Event สำเร็จ!", data: data[0] }, 201);
  } catch (error: any) {
    return c.json({ status: "error", message: error.message }, 400);
  }
});


app.get('/api/events/:id', async (c) => {
  try {
    const eventId = c.req.param('id');

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        participants (*)
      `)
      .eq('id', eventId)
      .single();

    if (error) throw error;

    delete data.manage_pin;

    return c.json({ status: "success", data }, 200);
  } catch (error: any) {
    return c.json({ status: "error", message: "ไม่พบข้อมูล Event นี้นะ" }, 404);
  }
});


app.post('/api/events/:id/join', async (c) => {
  try {
    const eventId = c.req.param('id');
    const body = await c.req.json();

    const { data, error } = await supabase
      .from('participants')
      .insert([
        {
          event_id: eventId,
          nickname: body.nickname,
          is_going: true,
          payment_status: 'unpaid'
        }
      ])
      .select();

    if (error) throw error;

    return c.json({ status: "success", message: "เข้าร่วม Event สำเร็จ!", data: data[0] }, 201);
  } catch (error: any) {
    return c.json({ status: "error", message: error.message }, 400);
  }
});

app.patch('/api/events/:eventId/participants/:participantId/slip', async (c) => {
  try {
    const participantId = c.req.param('participantId');
    const body = await c.req.json();

    const { data, error } = await supabase
      .from('participants')
      .update({ 
        slip_image_url: body.slip_image_url,
        payment_status: 'pending' 
      })
      .eq('id', participantId)
      .select();

    if (error) throw error;

    return c.json({ status: "success", message: "ส่งสลิปเรียบร้อย รอหัวตี้ตรวจนะจ๊ะ", data: data[0] });
  } catch (error: any) {
    return c.json({ status: "error", message: error.message }, 400);
  }
});

app.post('/api/events/:eventId/verify-payment', async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const body = await c.req.json();

    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('manage_pin')
      .eq('id', eventId)
      .single();

    if (eventError || !eventData) throw new Error("ไม่พบ Event นี้");
    if (eventData.manage_pin !== body.manage_pin) throw new Error("PIN ไม่ถูกต้อง! คุณไม่ใช่หัวตี้แน่ๆ");

    const { error: updateError } = await supabase
      .from('participants')
      .update({ payment_status: body.status })
      .eq('id', body.participant_id);

    if (updateError) throw updateError;

    const { data: allParticipants } = await supabase
      .from('participants')
      .select('is_going, payment_status')
      .eq('event_id', eventId);

    const hasUnpaid = allParticipants?.some(p => p.is_going === true && p.payment_status !== 'paid');

    if (!hasUnpaid && allParticipants && allParticipants.length > 0) {
      await supabase.from('events').delete().eq('id', eventId);
      
      return c.json({ 
        status: "success", 
        message: "ทุกคนจ่ายเงินครบแล้ว! ลบ Event นี้ทิ้งให้เรียบร้อย (ข้อมูลเพื่อนในงานหายไปด้วย)",
        event_deleted: true
      });
    }

    return c.json({ 
      status: "success", 
      message: `อัปเดตสถานะเป็น ${body.status} เรียบร้อย`,
      event_deleted: false
    });

  } catch (error: any) {
    return c.json({ status: "error", message: error.message }, 400);
  }
});

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};