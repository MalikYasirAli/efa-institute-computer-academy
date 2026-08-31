-- seed academy settings (protected fields included)
INSERT INTO academy_settings (id, academy_name, display_name, address, phone_primary, phone_secondary, email, hours, director_name, protected_instructor_name)
VALUES (
  gen_random_uuid(),
  'EFA INSTITUTE OF COMPUTER ACADEMY',
  'EFA Computer Academy Sillanwali',
  'Sillanwali, Sargodha, Pakistan',
  '0341-7490257',
  '0321-5867261',
  'efacomputeracademy7@gmail.com',
  '7:00 AM – 7:00 PM',
  'M. Fareed',
  'Yasir Ali'
)
ON CONFLICT (id) DO NOTHING;
