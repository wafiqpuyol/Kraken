export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href=${process.env.NEXT_PUBLIC_FRONTEND_URL}/{locale}/update-password?token={resetToken} style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
    </div>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href=${process.env.NEXT_PUBLIC_FRONTEND_URL}/{locale}/verify?token={verificationCode} style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">Verify Link</a>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const AUTHORIZATION_CODE_TEMPLATE = `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authorize your account email change</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Authorize your account email change</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received your request to change your Kraken email to {new_email}.</p>
    <p>Your authorization code is:.</p>
    <div style="text-align: center; margin: 30px 0;">
<center style="box-sizing:border-box;min-width:500px;width:100%">  
                  <div style="background:#f7f6fd;border-bottom:1px solid #d6d6d6;border-bottom-color:#242424;border-bottom-left-radius:0;border-bottom-right-radius:0;border-radius:8px 8px 0px 0px;border-top-left-radius:15px;border-top-right-radius:15px;box-sizing:border-box;padding-bottom:1rem;padding-left:1rem;padding-right:1rem;padding-top:1rem;width:75%" align="center">
                    <strong style="box-sizing:border-box">{authorization_code}</strong>
                  </div>
                </center>
    </div>
    <p>You'll also need to enter the confirmation code we sent to {new_email} to finalize this change.</p>
    <p>If you no longer want to make this change, you can still cancel it.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`

export const CONFIRMATION_CODE_TEMPLATE = `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your account email change
</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Confirm your account email change
</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received your request to use this email as your new Kraken account email.</p>
    <p>Your confirmation code is:</p>
    <div style="text-align: center; margin: 30px 0;">
<center style="box-sizing:border-box;min-width:500px;width:100%">  
                  <div style="background:#f7f6fd;border-bottom:1px solid #d6d6d6;border-bottom-color:#242424;border-bottom-left-radius:0;border-bottom-right-radius:0;border-radius:8px 8px 0px 0px;border-top-left-radius:15px;border-top-right-radius:15px;box-sizing:border-box;padding-bottom:1rem;padding-left:1rem;padding-right:1rem;padding-top:1rem;width:75%" align="center">
                    <strong style="box-sizing:border-box">{confirmation_code}</strong>
                  </div>
                </center>
    </div>
    <p>You'll also need to enter the authorization code we sent to your current account email to finalize this change..</p>
    <p>If you no longer want to make this change, you can still cancel it.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`

export const EMERGENCY_CODE_TEMPLATE = `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Emergency Code
</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Emergency Code
</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received your request to reset your pincode.</p>
    <p>Your confirmation emergency code is:</p>
    <div style="text-align: center; margin: 30px 0;">
<center style="box-sizing:border-box;min-width:500px;width:100%">  
                  <div style="background:#f7f6fd;border-bottom:1px solid #d6d6d6;border-bottom-color:#242424;border-bottom-left-radius:0;border-bottom-right-radius:0;border-radius:8px 8px 0px 0px;border-top-left-radius:15px;border-top-right-radius:15px;box-sizing:border-box;padding-bottom:1rem;padding-left:1rem;padding-right:1rem;padding-top:1rem;width:75%" align="center">
                    <strong style="box-sizing:border-box">{emergency_code}</strong>
                  </div>
                </center>
    </div>
    <p>You'll also need to enter the emergency code then only you can able to reset your pin.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`