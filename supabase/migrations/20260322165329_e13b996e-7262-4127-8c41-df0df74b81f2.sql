CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _full_name text;
  _first_name text;
  _last_name text;
BEGIN
  _full_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', '');
  
  -- Split full_name into first_name and last_name
  IF _full_name != '' AND position(' ' in _full_name) > 0 THEN
    _first_name := split_part(_full_name, ' ', 1);
    _last_name := substr(_full_name, position(' ' in _full_name) + 1);
  ELSE
    _first_name := _full_name;
    _last_name := '';
  END IF;

  INSERT INTO public.profiles (user_id, display_name, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(_full_name, ''), NEW.email),
    NULLIF(_first_name, ''),
    NULLIF(_last_name, '')
  );
  RETURN NEW;
END;
$function$;