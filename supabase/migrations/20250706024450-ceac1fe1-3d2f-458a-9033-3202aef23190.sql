
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'pengguna');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, role)
);

-- Enable RLS on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Superadmin can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'superadmin'));

-- Create user_page_permissions table (user-based permissions)
CREATE TABLE public.user_page_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  page_path TEXT NOT NULL,
  page_name TEXT NOT NULL,
  can_view BOOLEAN DEFAULT true,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT false,
  description TEXT,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, page_path)
);

-- Enable RLS
ALTER TABLE public.user_page_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_page_permissions
CREATE POLICY "Users can view their own permissions"
  ON public.user_page_permissions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Superadmin can manage all permissions"
  ON public.user_page_permissions
  FOR ALL
  USING (public.has_role(auth.uid(), 'superadmin'));

-- Create pages master table for reference
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT UNIQUE NOT NULL,
  page_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view pages"
  ON public.pages
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Superadmin can manage pages"
  ON public.pages
  FOR ALL
  USING (public.has_role(auth.uid(), 'superadmin'));

-- Insert available pages
INSERT INTO public.pages (page_path, page_name, description) VALUES
('/', 'Dashboard', 'Halaman utama dashboard'),
('/cash-in', 'Kas Masuk', 'Halaman input kas masuk'),
('/cash-out', 'Kas Keluar', 'Halaman input kas keluar'),
('/journal', 'Jurnal Umum', 'Halaman jurnal umum'),
('/buku-kas-umum', 'Buku Kas Umum', 'Halaman buku kas umum'),
('/anggaran', 'Anggaran', 'Halaman pengelolaan anggaran'),
('/cash-flow', 'Arus Kas', 'Halaman laporan arus kas'),
('/laporan-realisasi-anggaran', 'LRA', 'Laporan Realisasi Anggaran'),
('/reports', 'Laporan', 'Halaman laporan'),
('/accounts', 'Akun Rekening', 'Halaman master akun rekening');

-- Function to check if user has specific permission for a page
CREATE OR REPLACE FUNCTION public.user_has_page_permission(
  _user_id UUID, 
  _page_path TEXT, 
  _permission_type TEXT DEFAULT 'view'
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE _permission_type
      WHEN 'view' THEN COALESCE(can_view, false)
      WHEN 'create' THEN COALESCE(can_create, false)
      WHEN 'edit' THEN COALESCE(can_edit, false)
      WHEN 'delete' THEN COALESCE(can_delete, false)
      WHEN 'export' THEN COALESCE(can_export, false)
      ELSE false
    END
  FROM public.user_page_permissions
  WHERE user_id = _user_id AND page_path = _page_path
$$;

-- Function to get all user permissions
CREATE OR REPLACE FUNCTION public.get_user_page_permissions(_user_id UUID)
RETURNS TABLE(
  page_path TEXT, 
  page_name TEXT, 
  can_view BOOLEAN,
  can_create BOOLEAN,
  can_edit BOOLEAN,
  can_delete BOOLEAN,
  can_export BOOLEAN,
  description TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    upp.page_path,
    p.page_name,
    upp.can_view,
    upp.can_create,
    upp.can_edit,
    upp.can_delete,
    upp.can_export,
    p.description
  FROM public.user_page_permissions upp
  JOIN public.pages p ON upp.page_path = p.page_path
  WHERE upp.user_id = _user_id AND upp.can_view = true
  ORDER BY p.page_path
$$;

-- Function to grant default permissions to new users
CREATE OR REPLACE FUNCTION public.grant_default_permissions(_user_id UUID)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  -- Grant basic view permissions to all users for dashboard and reports
  INSERT INTO public.user_page_permissions (user_id, page_path, page_name, can_view, description)
  SELECT 
    _user_id,
    p.page_path,
    p.page_name,
    true,
    'Default permission'
  FROM public.pages p
  WHERE p.page_path IN ('/', '/buku-kas-umum', '/cash-flow', '/laporan-realisasi-anggaran', '/reports')
  ON CONFLICT (user_id, page_path) DO NOTHING;
END;
$$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assign default role as 'pengguna'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'pengguna');
  
  -- Grant default page permissions
  PERFORM public.grant_default_permissions(NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
