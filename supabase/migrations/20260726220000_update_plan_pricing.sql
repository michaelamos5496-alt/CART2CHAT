-- Repricing: Starter moves from free/20 products to a paid tier, Growth
-- and Pro get new prices and product limits. Yearly price is set equal to
-- monthly since no yearly discount was specified and yearly billing isn't
-- wired to anything real yet (provider = 'none').

update public.plan_limits
set monthly_price = 100, yearly_price = 100, max_products = 5
where plan = 'starter';

update public.plan_limits
set monthly_price = 250, yearly_price = 250, max_products = 15
where plan = 'growth';

update public.plan_limits
set monthly_price = 500, yearly_price = 500, max_products = null
where plan = 'pro';
