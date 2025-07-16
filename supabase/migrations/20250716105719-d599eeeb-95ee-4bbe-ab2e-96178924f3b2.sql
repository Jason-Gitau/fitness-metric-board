-- Update transactions table to support proper subscription periods
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS subscription_period TEXT;

-- Add period column to better categorize subscription types  
UPDATE public.transactions 
SET subscription_period = 'daily' 
WHERE description LIKE '%daily%' AND subscription_period IS NULL;

UPDATE public.transactions 
SET subscription_period = 'weekly' 
WHERE description LIKE '%weekly%' AND subscription_period IS NULL;

UPDATE public.transactions 
SET subscription_period = 'monthly' 
WHERE description LIKE '%monthly%' AND subscription_period IS NULL;

-- Set default for new records
ALTER TABLE public.transactions 
ALTER COLUMN subscription_period SET DEFAULT 'daily';

-- Create an index on subscription_period for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_period ON public.transactions(subscription_period);

-- Create an index on member_id for better query performance  
CREATE INDEX IF NOT EXISTS idx_transactions_member_id ON public.transactions(member_id);

-- Create an index on ending_date for renewal queries
CREATE INDEX IF NOT EXISTS idx_transactions_ending_date ON public.transactions(ending_date);

-- Create an index on start_date for reporting queries
CREATE INDEX IF NOT EXISTS idx_transactions_start_date ON public.transactions(start_date);