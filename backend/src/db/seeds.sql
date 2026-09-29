-- Clear existing seeds
DELETE FROM user_selected_tasks;
DELETE FROM tasks;
DELETE FROM task_categories;

-- Seed Categories
INSERT INTO task_categories (id, name, slug, description) VALUES
('11111111-1111-1111-1111-111111111111', 'Home & Maintenance', 'home-maintenance', 'Household repairs, deep cleaning, plumbing, electrical, and seasonal maintenance tasks.'),
('22222222-2222-2222-2222-222222222222', 'Errands & Delivery', 'errands-delivery', 'Pickup and dropoff services, grocery shopping, prescription retrieval, and local errands.'),
('33333333-3333-3333-3333-333333333333', 'Senior & Family Care', 'senior-family-care', 'Companionship, medical appointment accompaniment, school pickups, and elder assistance.'),
('44444444-4444-4444-4444-444444444444', 'Admin & Documentation', 'admin-documentation', 'Govt document assistance, bill payments, banking errands, and local administrative tasks.');

-- Seed 20+ Tasks across the 4 Categories
INSERT INTO tasks (id, category_id, name, description) VALUES
-- Category 1: Home & Maintenance (5 tasks)
('a1010101-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'AC Service & Deep Repair', 'Complete dismantling, jet washing, and refrigerant top-up by trusted technician.'),
('a1010102-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Plumbing Inspection & Fix', 'Fix leaky faucets, flush tanks, sink blockages, and pipe pressure issues.'),
('a1010103-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Electrical Appliance Repair', 'Geyser, microwave, washing machine, or ceiling fan troubleshooting.'),
('a1010104-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Home Pest Control', 'Odorless cockroach, termite, and bed bug chemical treatment for whole apartment.'),
('a1010105-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Full House Deep Cleaning', 'Bathroom scrub, kitchen degreasing, window polish, and sofa shampooing.'),

-- Category 2: Errands & Delivery (5 tasks)
('b2020201-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Weekly Grocery & Pantry Run', 'Fresh vegetable market shopping and organic store bulk item delivery to door.'),
('b2020202-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Prescription & Pharmacy Pickup', 'Collect ongoing monthly medicines with doctor prescription from local chemist.'),
('b2020203-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Dry Cleaning & Laundry Drop/Fetch', 'Pickup heavy blankets, suits, and dresses, deliver to dry cleaner and return.'),
('b2020204-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Package & Parcel Courier Dropoff', 'Ship speed-post parcels or courier packages from local office.'),
('b2020205-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Pet Supplies & Food Pickup', 'Fetch specialized vet dog/cat food, treats, and grooming supplies.'),

-- Category 3: Senior & Family Care (5 tasks)
('c3030301-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Elder Hospital Escort & Queue', 'Escort senior family members to hospital, manage registration queues and reports.'),
('c3030302-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Daily Senior Welfare Check-in', 'In-person morning visit to verify health, meals, and safety of living-alone parents.'),
('c3030303-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Kids School Bus Drop/Pickup Assist', 'Safely accompany young children to and from local school bus stop.'),
('c3030304-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Physiotherapy & Clinic Escort', 'Assisted travel to rehabilitation or physical therapy clinics for seniors.'),
('c3030305-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Emergency Home Care Assistant', 'On-demand companion assistance during short family trips or emergencies.'),

-- Category 4: Admin & Documentation (5 tasks)
('d4040401-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Aadhaar & Passport Seva Queueing', 'Queue standing and appointment verification assistance at government kendras.'),
('d4040402-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Property Tax & Utility Bill Payment', 'Offline payment submission for municipal water, electricity, or property taxes.'),
('d4040403-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Bank Demand Draft & Cheque Deposit', 'Bank branch visits for physical draft creation, cheque clearing, or passbook print.'),
('d4040404-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Notary & Affidavit Attestation', 'Document printing, stamp paper purchase, and authorized notary signing.'),
('d4040405-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Society Maintenance Collection', 'Apartment association bill verification and physical receipt collection.');
