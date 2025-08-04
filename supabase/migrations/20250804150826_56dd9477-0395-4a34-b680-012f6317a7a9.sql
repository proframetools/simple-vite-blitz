-- Fix the function search path security issue
ALTER FUNCTION public.update_updated_at_column() SECURITY DEFINER SET search_path = '';