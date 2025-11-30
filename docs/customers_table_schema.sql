-- customers table schema for expediseapp_wms_dev
CREATE TABLE public.customers (
    id serial PRIMARY KEY,
    customer_code varchar(50) NOT NULL,
    customer_name varchar(100) NOT NULL,
    contact_person varchar(100),
    address varchar(200),
    phone varchar(30),
    email varchar(100),
    tin varchar(30),
    payment_terms varchar(50),
    delivery_terms varchar(50),
    credit_limit numeric(18,2),
    is_active boolean DEFAULT true,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);
-- Remove company_id, only use fields above for POST.
