-- PostgreSQL schema converted from SQL Server
-- Generated for Render.com deployment
-- Run this ONCE after creating the database on Render

CREATE TABLE Account (
	account_id SERIAL NOT NULL,
	customer_id INTEGER NOT NULL,
	username VARCHAR NULL,
	password_hash VARCHAR NULL,
	role VARCHAR NULL,
	created_at TIMESTAMP NULL,
	PRIMARY KEY (account_id)
);

CREATE TABLE cart (
	cart_id SERIAL NOT NULL,
	customer_id INTEGER NOT NULL,
	created_date TIMESTAMP NULL,
	PRIMARY KEY (cart_id)
);

CREATE TABLE cart_item (
	cart_item_id SERIAL NOT NULL,
	cart_id INTEGER NOT NULL,
	product_type VARCHAR NULL,
	product_id INTEGER NOT NULL,
	quantity INTEGER NULL,
	PRIMARY KEY (cart_item_id)
);

CREATE TABLE contact_lens (
	contact_lens_id SERIAL NOT NULL,
	name VARCHAR NOT NULL,
	brand VARCHAR NULL,
	contact_type VARCHAR NULL,
	color VARCHAR NULL,
	min_sph DECIMAL(5, 2) NULL,
	max_sph DECIMAL(5, 2) NULL,
	min_cyl DECIMAL(5, 2) NULL,
	max_cyl DECIMAL(5, 2) NULL,
	image_url TEXT NULL,
	price DECIMAL(18, 2) NULL,
	stock INTEGER NULL,
	status VARCHAR NULL,
	PRIMARY KEY (contact_lens_id)
);

CREATE TABLE Customer (
	customer_id SERIAL NOT NULL,
	name VARCHAR NULL,
	email VARCHAR NULL,
	phone VARCHAR NULL,
	address VARCHAR NULL,
	status VARCHAR NULL,
	PRIMARY KEY (customer_id)
);

CREATE TABLE discount (
	discount_id SERIAL NOT NULL,
	code VARCHAR NULL,
	discount_type VARCHAR NULL,
	discount_value DECIMAL(5, 2) NULL,
	min_quantity INTEGER NULL,
	min_order_amount DECIMAL(18, 2) NULL,
	start_date TIMESTAMP NULL,
	end_date TIMESTAMP NULL,
	status VARCHAR NULL,
	PRIMARY KEY (discount_id)
);

CREATE TABLE eye_prescription (
	prescription_id SERIAL NOT NULL,
	eye_profile_id INTEGER NOT NULL,
	eye_side VARCHAR NULL,
	sph DECIMAL(5, 2) NULL,
	cyl DECIMAL(5, 2) NULL,
	axis INTEGER NULL,
	pd DECIMAL(5, 2) NULL,
	add_power DECIMAL(5, 2) NULL,
	PRIMARY KEY (prescription_id)
);

CREATE TABLE eye_profile (
	eye_profile_id SERIAL NOT NULL,
	customer_id INTEGER NOT NULL,
	source VARCHAR NULL,
	created_date TIMESTAMP NULL,
	status VARCHAR NULL,
	profile_name VARCHAR NULL,
	PRIMARY KEY (eye_profile_id)
);

CREATE TABLE frame (
	frame_id SERIAL NOT NULL,
	name VARCHAR NULL,
	brand VARCHAR NULL,
	material VARCHAR NULL,
	size VARCHAR NULL,
	rim_type VARCHAR NULL,
	frame_type VARCHAR NULL,
	color VARCHAR NULL,
	image_url TEXT NULL,
	price DECIMAL(18, 2) NULL,
	stock INTEGER NULL,
	status VARCHAR NULL,
	PRIMARY KEY (frame_id)
);

CREATE TABLE glasses_design (
	design_id SERIAL NOT NULL,
	eye_profile_id INTEGER NOT NULL,
	frame_id INTEGER NULL,
	frame_color VARCHAR NULL,
	frame_size VARCHAR NULL,
	lens_id INTEGER NULL,
	lens_option_id INTEGER NULL,
	lens_color VARCHAR NULL,
	lens_size VARCHAR NULL,
	color_change BOOLEAN NULL,
	created_date TIMESTAMP NULL,
	status VARCHAR NULL,
	customer_id INTEGER NULL,
	total_price DECIMAL(10, 2) NULL,
	design_name VARCHAR NULL,
	PRIMARY KEY (design_id)
);

CREATE TABLE glasses_design_option (
	design_option_id SERIAL NOT NULL,
	design_id INTEGER NOT NULL,
	option_id INTEGER NULL,
	option_name VARCHAR NULL,
	extra_price DECIMAL(10, 2) NULL,
	PRIMARY KEY (design_option_id)
);

CREATE TABLE inventory_receipt (
	receipt_id SERIAL NOT NULL,
	receipt_type VARCHAR NULL,
	product_type VARCHAR NULL,
	product_id INTEGER NOT NULL,
	quantity INTEGER NULL,
	note VARCHAR NULL,
	created_by INTEGER NULL,
	created_at TIMESTAMP NULL,
	PRIMARY KEY (receipt_id)
);

CREATE TABLE lens (
	lens_id SERIAL NOT NULL,
	name VARCHAR NULL,
	brand VARCHAR NULL,
	lens_type VARCHAR NULL,
	color_change BOOLEAN NULL,
	lens_size VARCHAR NULL,
	min_sph DECIMAL(5, 2) NULL,
	max_sph DECIMAL(5, 2) NULL,
	image_url TEXT NULL,
	base_price DECIMAL(18, 2) NULL,
	stock INTEGER NULL,
	status VARCHAR NULL,
	price DECIMAL(18, 2) NULL,
	PRIMARY KEY (lens_id)
);

CREATE TABLE lens_option (
	lens_option_id SERIAL NOT NULL,
	index_value VARCHAR NULL,
	coating VARCHAR NULL,
	extra_price DECIMAL(18, 2) NULL,
	option_name VARCHAR NULL,
	PRIMARY KEY (lens_option_id)
);

CREATE TABLE manufacturing_order (
	manufacturing_id SERIAL NOT NULL,
	order_id INTEGER NOT NULL,
	assigned_to INTEGER NULL,
	start_date TIMESTAMP NULL,
	status VARCHAR NULL,
	PRIMARY KEY (manufacturing_id)
);

CREATE TABLE my_glasses (
	my_glasses_id SERIAL NOT NULL,
	design_id INTEGER NOT NULL,
	final_price DECIMAL(18, 2) NULL,
	status VARCHAR NULL,
	customer_id INTEGER NULL,
	order_id INTEGER NULL,
	received_date TIMESTAMP NULL,
	notes VARCHAR NULL,
	PRIMARY KEY (my_glasses_id)
);

CREATE TABLE orders (
	order_id SERIAL NOT NULL,
	customer_id INTEGER NOT NULL,
	order_date TIMESTAMP NULL,
	status VARCHAR NULL,
	shipping_address VARCHAR NULL,
	total_amount DECIMAL(18, 2) NULL,
	discount_id INTEGER NULL,
	discount_amount DECIMAL(18, 2) NULL,
	final_amount DECIMAL(18, 2) NULL,
	discount_code VARCHAR NULL,
	PRIMARY KEY (order_id)
);

CREATE TABLE order_item (
	order_item_id SERIAL NOT NULL,
	order_id INTEGER NOT NULL,
	product_type VARCHAR NULL,
	product_id INTEGER NOT NULL,
	product_snapshot TEXT NULL,
	price DECIMAL(18, 2) NULL,
	quantity INTEGER NULL,
	PRIMARY KEY (order_item_id)
);

CREATE TABLE payment (
	payment_id SERIAL NOT NULL,
	order_id INTEGER NOT NULL,
	payment_method VARCHAR NULL,
	payment_status VARCHAR NULL,
	paid_amount DECIMAL(18, 2) NULL,
	paid_date TIMESTAMP NULL,
	transaction_id VARCHAR NULL,
	bank_account VARCHAR NULL,
	bank_name VARCHAR NULL,
	qr_code_url VARCHAR NULL,
	PRIMARY KEY (payment_id)
);

CREATE TABLE prescription_file (
	file_id SERIAL NOT NULL,
	eye_profile_id INTEGER NOT NULL,
	file_url VARCHAR NULL,
	upload_date TIMESTAMP NULL,
	PRIMARY KEY (file_id)
);

CREATE TABLE ready_made_glasses (
	ready_glasses_id SERIAL NOT NULL,
	name VARCHAR NULL,
	frame_id INTEGER NOT NULL,
	lens_id INTEGER NOT NULL,
	fixed_sph DECIMAL(5, 2) NULL,
	fixed_cyl DECIMAL(5, 2) NULL,
	image_url TEXT NULL,
	price DECIMAL(18, 2) NULL,
	stock INTEGER NULL,
	status VARCHAR NULL,
	PRIMARY KEY (ready_glasses_id)
);

CREATE TABLE shipment (
	shipment_id SERIAL NOT NULL,
	order_id INTEGER NOT NULL,
	shipper_id INTEGER NULL,
	carrier VARCHAR NULL,
	tracking_number VARCHAR NULL,
	shipped_date TIMESTAMP NULL,
	delivery_status VARCHAR NULL,
	PRIMARY KEY (shipment_id)
);

ALTER TABLE Account  ADD CONSTRAINT FK_Account_Customer FOREIGN KEY(customer_id)
REFERENCES Customer (customer_id);

ALTER TABLE cart  ADD CONSTRAINT FK_Cart_Customer FOREIGN KEY(customer_id)
REFERENCES Customer (customer_id);

ALTER TABLE cart_item  ADD CONSTRAINT FK_CartItem_Cart FOREIGN KEY(cart_id)
REFERENCES cart (cart_id);

ALTER TABLE eye_prescription  ADD CONSTRAINT FK_EyePrescription_EyeProfile FOREIGN KEY(eye_profile_id)
REFERENCES eye_profile (eye_profile_id);

ALTER TABLE eye_profile  ADD CONSTRAINT FK_EyeProfile_Customer FOREIGN KEY(customer_id)
REFERENCES Customer (customer_id);

ALTER TABLE glasses_design  ADD CONSTRAINT FK_GlassesDesign_Customer FOREIGN KEY(customer_id)
REFERENCES Customer (customer_id);

ALTER TABLE glasses_design  ADD CONSTRAINT FK_GlassesDesign_EyeProfile FOREIGN KEY(eye_profile_id)
REFERENCES eye_profile (eye_profile_id);

ALTER TABLE glasses_design  ADD CONSTRAINT FK_GlassesDesign_Frame FOREIGN KEY(frame_id)
REFERENCES frame (frame_id);

ALTER TABLE glasses_design  ADD CONSTRAINT FK_GlassesDesign_Lens FOREIGN KEY(lens_id)
REFERENCES lens (lens_id);

ALTER TABLE glasses_design_option  ADD CONSTRAINT FK_DesignOption_Design FOREIGN KEY(design_id)
REFERENCES glasses_design (design_id);

ALTER TABLE inventory_receipt  ADD CONSTRAINT FK_Receipt_Account FOREIGN KEY(created_by)
REFERENCES Account (account_id);

ALTER TABLE manufacturing_order  ADD CONSTRAINT FK_Manufacturing_Account FOREIGN KEY(assigned_to)
REFERENCES Account (account_id);

ALTER TABLE manufacturing_order  ADD CONSTRAINT FK_Manufacturing_Order FOREIGN KEY(order_id)
REFERENCES orders (order_id);

ALTER TABLE my_glasses  ADD CONSTRAINT FK_MyGlasses_GlassesDesign FOREIGN KEY(design_id)
REFERENCES glasses_design (design_id);

ALTER TABLE orders  ADD CONSTRAINT FK_Order_Customer FOREIGN KEY(customer_id)
REFERENCES Customer (customer_id);

ALTER TABLE orders  ADD CONSTRAINT FK_Order_Discount FOREIGN KEY(discount_id)
REFERENCES discount (discount_id);

ALTER TABLE order_item  ADD CONSTRAINT FK_OrderItem_Order FOREIGN KEY(order_id)
REFERENCES orders (order_id);

ALTER TABLE payment  ADD CONSTRAINT FK_Payment_Order FOREIGN KEY(order_id)
REFERENCES orders (order_id);

ALTER TABLE prescription_file  ADD CONSTRAINT FK_PrescriptionFile_EyeProfile FOREIGN KEY(eye_profile_id)
REFERENCES eye_profile (eye_profile_id);

ALTER TABLE ready_made_glasses  ADD CONSTRAINT FK_RMG_Frame FOREIGN KEY(frame_id)
REFERENCES frame (frame_id);

ALTER TABLE ready_made_glasses  ADD CONSTRAINT FK_RMG_Lens FOREIGN KEY(lens_id)
REFERENCES lens (lens_id);

ALTER TABLE shipment  ADD CONSTRAINT FK_Shipment_Order FOREIGN KEY(order_id)
REFERENCES orders (order_id);

ALTER TABLE shipment  ADD CONSTRAINT FK_Shipment_Shipper FOREIGN KEY(shipper_id)
REFERENCES Account (account_id);
