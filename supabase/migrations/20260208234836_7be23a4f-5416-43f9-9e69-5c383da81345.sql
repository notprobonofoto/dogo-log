-- Add columns to push_subscriptions for full Web Push support
ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS device_id TEXT,
ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_profile_enabled 
ON push_subscriptions(profile_id, enabled);

-- Create unique constraint on device_id per profile
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_profile_device 
ON push_subscriptions(profile_id, device_id) 
WHERE device_id IS NOT NULL;