-- Create app_settings table for storing application settings
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO app_settings (setting_key, setting_value, description)
VALUES
  ('cs_whatsapp_number', '6281234567890', 'Nomor WhatsApp Customer Service'),
  ('app_download_link', 'https://example.com/download', 'Link download aplikasi mobile')
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);
