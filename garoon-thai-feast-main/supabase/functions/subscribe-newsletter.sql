-- Create a function to handle newsletter subscriptions
-- This function bypasses RLS policies and can be called from the client

CREATE OR REPLACE FUNCTION subscribe_newsletter(email_address TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to run with elevated privileges
AS $$
DECLARE
  result JSON;
  existing_subscription RECORD;
BEGIN
  -- Check if email already exists
  SELECT * INTO existing_subscription 
  FROM member_subscriptions 
  WHERE email = email_address;
  
  IF existing_subscription IS NOT NULL THEN
    -- Email already exists
    result := json_build_object(
      'success', false,
      'message', 'Email already subscribed',
      'data', existing_subscription
    );
  ELSE
    -- Insert new subscription
    INSERT INTO member_subscriptions (email, is_subscribed, subscribed_at)
    VALUES (email_address, true, NOW());
    
    -- Get the inserted record
    SELECT * INTO existing_subscription 
    FROM member_subscriptions 
    WHERE email = email_address;
    
    result := json_build_object(
      'success', true,
      'message', 'Successfully subscribed',
      'data', existing_subscription
    );
  END IF;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'message', 'Error: ' || SQLERRM,
      'data', NULL
    );
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION subscribe_newsletter(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION subscribe_newsletter(TEXT) TO anon;

-- Create a function to handle contact form submissions
CREATE OR REPLACE FUNCTION submit_contact_form(
  contact_name TEXT,
  contact_email TEXT,
  contact_subject TEXT,
  contact_message TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Insert contact form submission
  INSERT INTO member_subscriptions (email, is_subscribed, subscribed_at, metadata)
  VALUES (
    contact_email, 
    false, 
    NOW(),
    jsonb_build_object(
      'type', 'contact_form',
      'name', contact_name,
      'subject', contact_subject,
      'message', contact_message
    )
  );
  
  result := json_build_object(
    'success', true,
    'message', 'Contact form submitted successfully'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'message', 'Error: ' || SQLERRM
    );
    RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION submit_contact_form(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_contact_form(TEXT, TEXT, TEXT, TEXT) TO anon;
