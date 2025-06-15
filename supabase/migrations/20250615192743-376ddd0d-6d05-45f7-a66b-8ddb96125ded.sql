
-- Enable Row Level Security (RLS) on both member tables
ALTER TABLE public.test_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users (logged-in) can view member rows
CREATE POLICY "Authenticated users can SELECT test_members"
  ON public.test_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can SELECT members"
  ON public.members
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can INSERT new member rows
CREATE POLICY "Authenticated users can INSERT test_members"
  ON public.test_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can INSERT members"
  ON public.members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can UPDATE existing member rows
CREATE POLICY "Authenticated users can UPDATE test_members"
  ON public.test_members
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can UPDATE members"
  ON public.members
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can DELETE member rows
CREATE POLICY "Authenticated users can DELETE test_members"
  ON public.test_members
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can DELETE members"
  ON public.members
  FOR DELETE
  TO authenticated
  USING (true);
