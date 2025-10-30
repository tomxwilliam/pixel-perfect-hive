-- Add authentication email templates to existing email_templates table
-- Only insert if they don't already exist
INSERT INTO email_templates (name, subject, body_html, template_type, category, is_system, variables)
SELECT * FROM (VALUES
  ('Email Confirmation', 'Confirm your email address for {{company_name}}', '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to {{company_name}}!</h1>
  </div>
  <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>
    <p style="font-size: 16px; margin-bottom: 30px;">Thanks for signing up! Please confirm your email address by clicking the button below:</p>
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{confirmation_url}}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Confirm Email Address</a>
    </div>
    <p style="font-size: 14px; color: #666; margin-top: 30px;">Or copy and paste this link into your browser:</p>
    <p style="font-size: 12px; color: #999; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">{{confirmation_url}}</p>
    <p style="font-size: 14px; color: #666; margin-top: 30px;">If you didn''t create an account, you can safely ignore this email.</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>© 2024 {{company_name}}. All rights reserved.</p>
  </div>
</body>
</html>', 'auth_confirmation', 'authentication', true, '["confirmation_url", "company_name", "user_email"]'::jsonb),
  ('Password Reset', 'Reset your password for {{company_name}}', '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
  </div>
  <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>
    <p style="font-size: 16px; margin-bottom: 30px;">We received a request to reset your password. Click the button below to create a new password:</p>
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{reset_url}}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Reset Password</a>
    </div>
    <p style="font-size: 14px; color: #666; margin-top: 30px;">Or copy and paste this link into your browser:</p>
    <p style="font-size: 12px; color: #999; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">{{reset_url}}</p>
    <p style="font-size: 14px; color: #666; margin-top: 30px;">If you didn''t request a password reset, you can safely ignore this email. Your password will not be changed.</p>
    <p style="font-size: 12px; color: #999; margin-top: 20px;">This link will expire in 1 hour for security reasons.</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>© 2024 {{company_name}}. All rights reserved.</p>
  </div>
</body>
</html>', 'auth_password_reset', 'authentication', true, '["reset_url", "company_name", "user_email"]'::jsonb),
  ('Magic Link Login', 'Your magic link to sign in to {{company_name}}', '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Magic link login</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Sign in to {{company_name}}</h1>
  </div>
  <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>
    <p style="font-size: 16px; margin-bottom: 30px;">Click the button below to sign in to your account:</p>
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{magic_link_url}}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Sign In</a>
    </div>
    <p style="font-size: 14px; color: #666; margin-top: 30px;">Or copy and paste this link into your browser:</p>
    <p style="font-size: 12px; color: #999; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">{{magic_link_url}}</p>
    <p style="font-size: 14px; color: #666; margin-top: 30px;">If you didn''t request this link, you can safely ignore this email.</p>
    <p style="font-size: 12px; color: #999; margin-top: 20px;">This link will expire in 1 hour for security reasons.</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>© 2024 {{company_name}}. All rights reserved.</p>
  </div>
</body>
</html>', 'auth_magic_link', 'authentication', true, '["magic_link_url", "company_name", "user_email"]'::jsonb),
  ('Email Change Confirmation', 'Confirm your new email address for {{company_name}}', '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm email change</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Confirm Email Change</h1>
  </div>
  <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>
    <p style="font-size: 16px; margin-bottom: 30px;">We received a request to change your email address. Click the button below to confirm this change:</p>
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{confirmation_url}}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Confirm Email Change</a>
    </div>
    <p style="font-size: 14px; color: #666; margin-top: 30px;">Or copy and paste this link into your browser:</p>
    <p style="font-size: 12px; color: #999; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">{{confirmation_url}}</p>
    <p style="font-size: 14px; color: #666; margin-top: 30px;">If you didn''t request this change, please contact support immediately.</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>© 2024 {{company_name}}. All rights reserved.</p>
  </div>
</body>
</html>', 'auth_email_change', 'authentication', true, '["confirmation_url", "company_name", "user_email", "new_email"]'::jsonb)
) AS new_templates(name, subject, body_html, template_type, category, is_system, variables)
WHERE NOT EXISTS (
  SELECT 1 FROM email_templates 
  WHERE email_templates.template_type = new_templates.template_type
);