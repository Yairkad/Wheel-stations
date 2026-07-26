-- Lets each station manager set their own WhatsApp message wording,
-- used automatically whenever they send a borrow-form link (see
-- api/wheel-stations/[stationId]/auth PATCH and [stationId]/page.tsx buildWhatsAppMessage).
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_message_template TEXT;
