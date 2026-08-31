-- 002_initial_schema_profiles_courses_applications.sql

-- profiles / admin_users
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid uuid NULL,
  email text UNIQUE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  is_protected boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- academy_settings
CREATE TABLE IF NOT EXISTS academy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_name text NOT NULL DEFAULT 'EFA INSTITUTE OF COMPUTER ACADEMY',
  display_name text NOT NULL DEFAULT 'EFA Computer Academy Sillanwali',
  address text,
  phone_primary text,
  phone_secondary text,
  email text,
  hours text,
  director_name text,
  protected_instructor_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- courses
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  summary text,
  description text,
  duration text,
  price numeric(10,2),
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- course_topics
CREATE TABLE IF NOT EXISTS course_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- students
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text UNIQUE,
  registration_number text UNIQUE,
  full_name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- applications
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id text NOT NULL UNIQUE,
  student_id uuid REFERENCES students(id) ON DELETE SET NULL,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- certificates
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number text NOT NULL UNIQUE,
  student_id uuid REFERENCES students(id),
  course_id uuid REFERENCES courses(id),
  issued_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id),
  application_id uuid REFERENCES applications(id),
  amount numeric(10,2),
  currency text DEFAULT 'PKR',
  provider text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- services
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  changed_by text,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);
