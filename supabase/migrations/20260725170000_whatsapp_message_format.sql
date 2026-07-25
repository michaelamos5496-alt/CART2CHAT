-- Matches the exact requested WhatsApp order message shape:
--
--   Hello {business}.
--
--   I'd like to place an order.
--
--   Products
--   • Product A x2
--   • Product B x1
--
--   Total: {total}
--
--   Customer Name: {name}
--   Phone: {phone}
--   Location: {address}
--   Notes: {notes}
--
-- {{items}} is substituted client-side as "• Name xQty" bullet lines (see
-- buildWhatsAppMessage). {{business_name}} is new; everything else reuses
-- the placeholders already substituted by the app.
alter table public.business_settings
  alter column whatsapp_message_template
  set default 'Hello {{business_name}}.

I''d like to place an order.

Products
{{items}}

Total: {{total}}

Customer Name: {{customer_name}}
Phone: {{customer_phone}}
Location: {{address}}
Notes: {{notes}}';

update public.business_settings
set whatsapp_message_template = 'Hello {{business_name}}.

I''d like to place an order.

Products
{{items}}

Total: {{total}}

Customer Name: {{customer_name}}
Phone: {{customer_phone}}
Location: {{address}}
Notes: {{notes}}'
where whatsapp_message_template = 'Order #{{order_number}} from {{customer_name}} ({{customer_phone}}):

{{items}}

Subtotal: {{subtotal}}
Delivery: {{delivery_fee}}
Total: {{total}}

Address: {{address}}
Notes: {{notes}}';
