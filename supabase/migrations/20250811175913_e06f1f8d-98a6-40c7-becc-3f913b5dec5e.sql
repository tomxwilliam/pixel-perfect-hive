-- RLS policy fixes to enable admin deletes and calendar management
-- 1) Allow admins to DELETE profiles (customers)
CREATE POLICY profiles_admin_delete_all
ON public.profiles
FOR DELETE
USING (is_admin_user());

-- 2) Allow admins to fully manage call bookings (edit/delete)
CREATE POLICY "Admins can manage call bookings"
ON public.call_bookings
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());