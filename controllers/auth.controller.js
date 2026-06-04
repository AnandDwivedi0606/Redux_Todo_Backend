const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/jwt");
const generateTokenForResetPassword = require("../utils/generateTokenForResetPassword");
const jwt = require("jsonwebtoken");
const OTP = require("../models/OTP.model");
const crypto = require("crypto");
const { transporter } = require("../utils/transorter");
const { resend } = require("../utils/resendMail");

const generateOTP = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  try {

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const user = await User.findOne({ email })

    if (user) {
      return res.status(400).json({ success: false, message: "Email already registered. Please log in or reset your password." })
    }

    await OTP.findOneAndUpdate(
      { email },
      {
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      },
      {
        upsert: true,
        new: true
      }
    );

    const { data, error } = await resend.emails.send({
      from: "Taskflow <onboarding@resend.dev>",
      to: email, // list of recipients
      subject: "Your Taskflow Verification Code",
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; -webkit-font-smoothing: antialiased;">

        <!-- Outer Wrapper Table -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f172a; padding: 40px 0;">
          <tr>
            <td align="center">

              <!-- Inner Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden;">

                <!-- Header with Branding -->
                <tr>
                  <td align="center" style="padding: 40px 40px 20px 40px;">
                     <!-- Taskflow Icon -->
                     <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f97316, #f59e0b); border-radius: 12px; margin: 0 auto 16px auto; line-height: 48px; text-align: center;">
                       <span style="color: #ffffff; font-size: 24px; font-weight: bold; font-family: sans-serif;">⚡</span>
                     </div>
                     <h1 style="margin: 0; color: #f8fafc; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Taskflow</h1>
                  </td>
                </tr>

                <!-- Body Content -->
                <tr>
                  <td style="padding: 0 40px 40px 40px; text-align: center;">
                    <h2 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 20px; font-weight: 600;">Verify Your Email</h2>
                    <p style="margin: 0 0 24px 0; color: #94a3b8; font-size: 16px; line-height: 24px;">
                      You're almost there! Please use the following 6-digit code to verify your email address and activate your Taskflow account.
                    </p>

                    <!-- OTP Code Box -->
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 24px auto;">
                      <tr>
                        <td align="center" style="background-color: #0f172a; border-radius: 12px; padding: 20px 40px; border: 1px dashed #334155;">
                           <span style="color: #f97316; font-size: 36px; font-weight: 800; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace;">
                             ${otp}
                           </span>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 24px 0; color: #64748b; font-size: 14px; line-height: 20px;">
                      This code is valid for <strong style="color: #94a3b8;">10 minutes</strong>. For security reasons, please do not share this code with anyone.
                    </p>

                    <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;">

                    <!-- Help Text -->
                    <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 20px;">
                      If you did not create an account with us, you can safely ignore this email. No further action is required.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px; background-color: #0f172a; text-align: center; border-top: 1px solid #334155;">
                    <p style="margin: 0; color: #475569; font-size: 12px; line-height: 18px;">
                      This is an automated message, please do not reply directly to this email.
                    </p>
                    <p style="margin: 8px 0 0 0; color: #475569; font-size: 12px;">
                      &copy; ${new Date().getFullYear()} Taskflow. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    })

    if (error) {
      console.error("Resend Error:", error);

      await OTP.deleteOne({ email });

      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    }

    res.status(200).json({ success: true })

  } catch (error) {
    console.error(error);

    try {
      if (email) {
        await OTP.deleteOne({ email });
      }
    } catch (cleanupError) {
      console.error("OTP cleanup failed:", cleanupError);
    }

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP"
    });
  }
}

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or invalid"
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" })
    }

    const userExist = await User.findOne({ email })

    if (userExist) {
      return res.status(400).json({ success: false, message: "User Already Exist" })
    }

    const salt = await bcrypt.genSalt(12)

    const hashPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      name,
      email,
      password: hashPassword
    })

    await newUser.save()

    const token = generateToken(newUser._id)

    const user = await User.findById(newUser._id).select("-password")

    return res.status(201).json({ success: true, token, user })

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const userexisting = await User.findOne({ email }).select("+password")

    if (!userexisting) {
      return res.status(401).json({ success: false, message: "Email or Password is incorrect" })
    }

    const comparePassword = await bcrypt.compare(password, userexisting.password)
    if (!comparePassword) {
      return res.status(401).json({ success: false, message: "Invalid Credentials" })
    }

    const token = generateToken(userexisting._id)

    const user = await User.findById(userexisting._id)

    return res.status(201).json({ success: true, token, user })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" })
  }
}

const getuserData = async (req, res) => {
  try {
    const user = req.user

    return res.status(201).json({ success: true, user })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" })
  }
}

const forgetPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: "User not Found" })
    }

    const token = generateTokenForResetPassword(user._id)

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const { data, error } = await resend.emails.send({
      from: "Taskflow <onboarding@resend.dev>",
      to: email, // list of recipients
      subject: "Reset Your Taskflow Password",
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; -webkit-font-smoothing: antialiased;">
        
        <!-- Outer Wrapper Table -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f172a; padding: 40px 0;">
          <tr>
            <td align="center">
              
              <!-- Inner Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden;">
                
                <!-- Header with Branding -->
                <tr>
                  <td align="center" style="padding: 40px 40px 20px 40px;">
                     <!-- Taskflow Icon (Simulated with a colored div since images might be blocked) -->
                     <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f97316, #f59e0b); border-radius: 12px; margin: 0 auto 16px auto; line-height: 48px; text-align: center;">
                       <span style="color: #ffffff; font-size: 24px; font-weight: bold; font-family: sans-serif;">⚡</span>
                     </div>
                     <h1 style="margin: 0; color: #f8fafc; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Taskflow</h1>
                  </td>
                </tr>

                <!-- Body Content -->
                <tr>
                  <td style="padding: 0 40px 40px 40px; text-align: center;">
                    <h2 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 20px; font-weight: 600;">Reset Your Password</h2>
                    <p style="margin: 0 0 24px 0; color: #94a3b8; font-size: 16px; line-height: 24px;">
                      We received a request to reset the password for your account. No worries, it happens! Click the button below to create a new password.
                    </p>
                    
                    <!-- Bulletproof CTA Button -->
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                        <td align="center" style="border-radius: 12px; background-color: #f97316;">
                          <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: 'Segoe UI', sans-serif; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 12px; border: 1px solid #f97316;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 24px 0 0 0; color: #64748b; font-size: 14px; line-height: 20px;">
                      This link will expire in <strong style="color: #94a3b8;">15 minutes</strong>.
                    </p>

                    <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;">

                    <!-- Fallback Text -->
                    <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 20px;">
                      If the button above doesn't work, copy and paste the following URL into your browser:
                    </p>
                    <p style="margin: 8px 0 0 0; word-break: break-all;">
                      <a href="${resetUrl}" style="color: #f97316; font-size: 13px; text-decoration: underline;">${resetUrl}</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px; background-color: #0f172a; text-align: center; border-top: 1px solid #334155;">
                    <p style="margin: 0; color: #475569; font-size: 12px; line-height: 18px;">
                      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                    </p>
                    <p style="margin: 8px 0 0 0; color: #475569; font-size: 12px;">
                      &copy; ${new Date().getFullYear()} Taskflow. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    })

    if (error) {
      console.error("Resend Error:", error);

      await OTP.deleteOne({ email });

      return res.status(500).json({
        success: false,
        message: "Failed to send reset link",
      });
    }

    return res.status(201).json({ success: true, message: "Password reset email sent successfully" })

  } catch (error) {
    // console.log(error);
    return res.status(500).json({ success: false, message: "Email Send Error" })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { email, password, token } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    let decode;

    try {
      decode = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return res.status(400).json({ success: false, message: error.name === "TokenExpiredError" ? "Reset link has expired" : "Invalid reset token", });
    }

    const user = await User.findById(decode.id)

    if (!user) {
      return res.status(400).json({ message: "User not Found" })
    }

    if (user?.email !== email) {
      return res.status(400).json({ message: "Invalid Email" })
    }

    const salt = await bcrypt.genSalt(12)

    const hashPassword = await bcrypt.hash(password, salt)

    user.password = hashPassword

    await user.save()

    return res.status(200).json({ success: true, message: "Password reset successfully", });

  } catch (error) {
    console.error("Reset Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const changeName = async (req, res) => {
  try {
    const { name } = req.body
    const userId = req?.user?._id

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is Required" })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.name = name.trim();

    await user.save();

    return res.status(200).json({ success: true, message: "Name successfully changed", user })

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server error" })
  }
}

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    const userId = req?.user?._id

    if (!oldPassword) {
      return res.status(400).json({ success: false, message: "Old Password required" })
    }

    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New Password required" })
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ success: false, message: "Old password and new Password cannot be same" })
    }

    const user = await User.findById(userId).select("+password")

    const passwordVerification = await bcrypt.compare(oldPassword, user.password)

    if (!passwordVerification) {
      return res.status(400).json({ success: false, message: "Old password Is invalid" })
    }

    const salt = await bcrypt.genSalt(12)
    const hashpassword = await bcrypt.hash(newPassword, salt)

    user.password = hashpassword

    await user.save()

    res.status(200).json({ success: true, message: "Password Changed Successfully" })

  } catch (error) {
    // console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" })
  }
}


module.exports = { generateOTP, verifyEmail, registerUser, loginUser, getuserData, forgetPassword, resetPassword, changeName, changePassword }