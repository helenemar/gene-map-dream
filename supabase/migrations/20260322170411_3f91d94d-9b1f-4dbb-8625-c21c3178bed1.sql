CREATE POLICY "Users can view profiles of genogram owners shared with them"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT g.user_id FROM genograms g
    JOIN genogram_shares s ON s.genogram_id = g.id
    WHERE s.shared_with_user_id = auth.uid() AND s.is_active = true
  )
  OR user_id = auth.uid()
);