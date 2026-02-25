'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Mail, Eye, EyeOff, Check, ChevronRight, AlertTriangle, X, RefreshCcw } from 'lucide-react';

interface User {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
  role: 'owner' | 'admin' | 'staff';
}

// In a real app, these would come from database
const ADMIN_USERS = [
  { id: 'admin-1', username: 'owner', fullName: 'Business Owner', role: 'owner' as const }
];

export default function AdminPage() {
  // Auth state
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Account management state
  const [showMyAccount, setShowMyAccount] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState('');
  const [accountError, setAccountError] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'username' | 'sending' | 'code' | 'security' | 'new-password'>('username');
  const [forgotUsername, setForgotUsername] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [userEmailForReset, setUserEmailForReset] = useState('');

  // Debug info
  const [isServer, setIsServer] = useState(true);
  const [clientInfo, setClientInfo] = useState({
    userAgent: '',
    cookiesEnabled: false,
    storageAvailable: false
  });

  // Session management
  useEffect(() => {
    // Mark that we're running on client
    setIsServer(false);

    // Get environment info
    if (typeof window !== 'undefined') {
      setClientInfo({
        userAgent: navigator.userAgent,
        cookiesEnabled: navigator.cookieEnabled,
        storageAvailable: storageAvailable('sessionStorage') && storageAvailable('localStorage')
      });
    }

    // Check for existing session
    try {
      const storedUser = window.sessionStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log('[ADMIN] Found user:', user.username);
        setCurrentUser(user);
        setIsAuthenticated(true);
        setNewUsername(user.username || '');
        setNewFullName(user.fullName || '');
      }
    } catch (error) {
      console.error('[ADMIN] Error checking authentication:', error);
    }

    // Finished loading
    setIsLoading(false);
  }, []);

  // Handle login
  const handleLogin = () => {
    setLoginError('');

    // Basic validation
    if (!username.trim() || !password.trim()) {
      setLoginError('Please enter both username and password');
      return;
    }

    // For demonstration - in production this would check against a database
    if (username === 'owner' && password === 'soul2025') {
      const user: User = {
        id: 'admin-1',
        username: 'owner',
        fullName: 'Business Owner',
        role: 'owner'
      };

      try {
        window.sessionStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        setIsAuthenticated(true);
        setNewUsername(user.username || '');
        setNewFullName(user.fullName || '');
        setUsername('');
        setPassword('');
      } catch (error) {
        console.error('[ADMIN] Error saving user to storage:', error);
        // Still authenticate even if storage fails
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    } else {
      setLoginError('Invalid username or password');
      setPassword('');
    }
  };

  // Handle logout
  const handleLogout = () => {
    try {
      window.sessionStorage.removeItem('currentUser');
    } catch (error) {
      console.error('[ADMIN] Error removing user from session:', error);
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    setShowMyAccount(false);
    setUsername('');
    setPassword('');
  };

  // Handle reset
  const handleReset = () => {
    try {
      window.sessionStorage.clear();
      window.location.reload();
    } catch (error) {
      console.error('[ADMIN] Error clearing session:', error);
    }
  };

  // Handle account update
  const handleAccountUpdate = () => {
    setAccountError('');
    setAccountSuccess('');

    // Validate inputs
    if (newPassword !== confirmPassword) {
      setAccountError('New passwords do not match');
      return;
    }

    if (currentPassword && currentPassword !== 'soul2025') {
      setAccountError('Current password is incorrect');
      return;
    }

    if (!newUsername.trim()) {
      setAccountError('Username cannot be empty');
      return;
    }

    try {
      if (!currentUser) {
        setAccountError('No user data found. Please login again.');
        return;
      }

      // Create updated user object
      const updatedUser: User = {
        ...currentUser,
        username: newUsername,
        fullName: newFullName || currentUser.fullName
      };

      // Save to session storage
      window.sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Show success message
      setAccountSuccess('Account information updated successfully');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setAccountSuccess('');
      }, 3000);
    } catch (error) {
      console.error('[ADMIN] Error updating account:', error);
      setAccountError('Error saving changes. Please try again.');
    }
  };

  // Helper for security question & reset code flow
  function getUserByUsername(username: string): User | null {
    if (username === 'owner') {
      // Ensure the role is one of the allowed values
      const user = ADMIN_USERS[0];
      return {
        ...user,
        role: user.role === 'owner' || user.role === 'admin' || user.role === 'staff' ? user.role : 'staff'
      };
    }
    return null;
  }

  // Get recovery options for a user
  function getRecoveryOptions(username: string) {
    // This would typically check a database
    // For demo purposes, we're hardcoding for the owner account
    if (username === 'owner') {
      return {
        hasEmail: true,
        hasSecurityQuestion: true,
        securityQuestion: 'What is the name of your first pet?'
      };
    }
    return {
      hasEmail: false,
      hasSecurityQuestion: false
    };
  }

  // Generate a password reset code
  function generatePasswordResetCode(username: string): string {
    // In a real app, this would store the code in a database
    // For now, just generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // Store the code in sessionStorage for this demo
      // In production, this would be in a database with expiration
      sessionStorage.setItem(`resetCode_${username}`, code);
    } catch (error) {
      console.error('Failed to save reset code:', error);
    }

    return code;
  }

  // Verify a password reset code
  function verifyResetCode(username: string, code: string): boolean {
    try {
      const storedCode = sessionStorage.getItem(`resetCode_${username}`);
      return storedCode === code;
    } catch (error) {
      console.error('Error verifying reset code:', error);
      return false;
    }
  }

  // Verify security answer
  function verifySecurityAnswer(username: string, answer: string): boolean {
    // For demo, the answer is "Buddy" for the owner account
    if (username === 'owner') {
      return answer.toLowerCase() === 'buddy';
    }
    return false;
  }

  // Reset password function
  function resetPassword(username: string, newPassword: string): boolean {
    // In a real app, this would update the password in the database
    console.log(`Password for ${username} would be reset to: ${newPassword}`);

    try {
      // Clean up the reset code
      sessionStorage.removeItem(`resetCode_${username}`);
    } catch (error) {
      console.error('Error cleaning up reset code:', error);
    }

    return true;
  }

  // Handle sending reset code
  const handleSendResetCode = async () => {
    setForgotPasswordError('');

    if (!forgotUsername.trim()) {
      setForgotPasswordError('Please enter your username');
      return;
    }

    const user = getUserByUsername(forgotUsername);
    if (!user) {
      setForgotPasswordError('Username not found. Please check and try again.');
      return;
    }

    // Check recovery options
    const recoveryOptions = getRecoveryOptions(forgotUsername);
    console.log('Recovery options for user:', forgotUsername, recoveryOptions);

    // If user has no email, go straight to security question if available
    if (!user.email) {
      console.log('User has no email, checking for security question');
      if (recoveryOptions.hasSecurityQuestion && recoveryOptions.securityQuestion) {
        console.log('User has security question, showing it');
        setSecurityQuestion(recoveryOptions.securityQuestion);
        setForgotPasswordStep('security');
        return;
      }
      setForgotPasswordError('No email address or security question registered for this account. Please contact the business owner at soulmobiledetailingllc@gmail.com');
      return;
    }

    // Show sending state
    setForgotPasswordStep('sending');
    setUserEmailForReset(user.email);

    try {
      // Generate the reset code
      const code = generatePasswordResetCode(forgotUsername);
      console.log('Generated reset code for', forgotUsername);

      // Send the email
      const response = await fetch('/api/send-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          resetCode: code
        })
      });

      const result = await response.json();
      console.log('Reset code API response:', result);

      if (result.success) {
        setForgotPasswordStep('code');
        setForgotPasswordSuccess(`Reset code sent to ${user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`);
      } else {
        // Email failed - check if we should use security question instead
        console.error('Email failed to send:', result.error);

        if (result.useSecurityQuestion && recoveryOptions.hasSecurityQuestion) {
          console.log('Falling back to security question');
          setSecurityQuestion(recoveryOptions.securityQuestion!);
          setForgotPasswordStep('security');
          setForgotPasswordError(`Failed to send email: ${result.error}. You can use the security question instead.`);
        } else {
          setForgotPasswordStep('username');
          setForgotPasswordError(`${result.error || 'Failed to send reset email'}. Please try again or contact support at soulmobiledetailingllc@gmail.com.`);
        }
      }
    } catch (error) {
      console.error('Reset code request error:', error);
      // Network or other error - check if security question is available
      if (recoveryOptions.hasSecurityQuestion) {
        setSecurityQuestion(recoveryOptions.securityQuestion!);
        setForgotPasswordStep('security');
        setForgotPasswordError('Failed to send email. You can use the security question instead.');
      } else {
        setForgotPasswordStep('username');
        setForgotPasswordError('Failed to send reset email. Please try again or contact the owner.');
      }
    }
  };

  // Handle reset code verification
  const handleVerifyResetCode = () => {
    setForgotPasswordError('');

    if (!resetCode.trim()) {
      setForgotPasswordError('Please enter the reset code');
      return;
    }

    if (verifyResetCode(forgotUsername, resetCode)) {
      setForgotPasswordStep('new-password');
    } else {
      setForgotPasswordError('Invalid reset code. Please try again.');
    }
  };

  // Handle security answer verification
  const handleVerifySecurityAnswer = () => {
    setForgotPasswordError('');

    if (!securityAnswer.trim()) {
      setForgotPasswordError('Please answer the security question');
      return;
    }

    if (verifySecurityAnswer(forgotUsername, securityAnswer)) {
      setForgotPasswordStep('new-password');
    } else {
      setForgotPasswordError('Incorrect answer. Please try again.');
    }
  };

  // Handle password reset
  const handleResetPassword = () => {
    setForgotPasswordError('');

    if (!newResetPassword.trim()) {
      setForgotPasswordError('Please enter a new password');
      return;
    }

    if (newResetPassword !== confirmResetPassword) {
      setForgotPasswordError('Passwords do not match');
      return;
    }

    if (newResetPassword.length < 8) {
      setForgotPasswordError('Password must be at least 8 characters');
      return;
    }

    if (resetPassword(forgotUsername, newResetPassword)) {
      setShowForgotPassword(false);
      setLoginError(''); // Clear any previous login errors
      setLoginError('Password reset successfully. Please log in with your new password.');
    } else {
      setForgotPasswordError('Failed to reset password. Please try again.');
    }
  };

  // Helper function to check if storage is available
  function storageAvailable(type: 'localStorage' | 'sessionStorage') {
    let storage;
    try {
      storage = window[type];
      const x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  }

  // If still in the server-side rendering phase or loading
  if (isServer || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-white">Loading Admin Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center my-8">
              <div className="w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400 text-center">
              Admin panel is loading, please wait...
            </p>
            <p className="text-gray-500 text-xs text-center mt-4">
              If the page doesn't load within 10 seconds, please refresh.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        {showForgotPassword ? (
          <Card className="w-full max-w-md bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-white">Reset Password</CardTitle>
              <button
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white"
                onClick={() => setShowForgotPassword(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {forgotPasswordStep === 'username' && (
                <>
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-sm text-blue-200">
                    <p className="font-semibold mb-1">How Password Reset Works:</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-300">
                      <li>Enter your username below</li>
                      <li>We'll send a reset code to your registered email</li>
                      <li>Enter the code to set a new password</li>
                      <li>If email fails, you'll be asked your security question</li>
                    </ol>
                  </div>
                  <div>
                    <Label htmlFor="forgotUsername" className="text-white">Your Username</Label>
                    <Input
                      id="forgotUsername"
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                      placeholder="Enter your username"
                    />
                  </div>
                  {forgotPasswordError && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {forgotPasswordError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleSendResetCode}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Reset Code
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                  <p className="text-center text-sm text-gray-400 mt-4">
                    No email registered? Contact the owner at<br />
                    <span className="text-blue-400">soulmobiledetailingllc@gmail.com</span>
                  </p>
                </>
              )}

              {forgotPasswordStep === 'sending' && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg text-white mb-2">Sending Reset Code</p>
                  <p className="text-gray-400">Please wait while we send the reset code to your email...</p>
                </div>
              )}

              {forgotPasswordStep === 'code' && (
                <>
                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-sm text-green-200 mb-4">
                    <Check className="w-5 h-5 text-green-400 mb-1" />
                    <p>{forgotPasswordSuccess}</p>
                  </div>
                  <div>
                    <Label htmlFor="resetCode" className="text-white">Enter Reset Code</Label>
                    <Input
                      id="resetCode"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white text-center text-lg tracking-wider"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  {forgotPasswordError && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {forgotPasswordError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleVerifyResetCode}
                    >
                      Verify Code
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setForgotPasswordStep('username')}
                    >
                      Back
                    </Button>
                  </div>
                  <p className="text-center text-sm text-gray-400 mt-4">
                    Didn't receive the code?{' '}
                    <button
                      className="text-blue-400 hover:underline"
                      onClick={() => setForgotPasswordStep('username')}
                    >
                      Try again
                    </button>
                  </p>
                </>
              )}

              {forgotPasswordStep === 'security' && (
                <>
                  <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 text-sm text-amber-200 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mb-1" />
                    <p>Email couldn't be sent. Please answer your security question instead.</p>
                    {forgotPasswordError && <p className="mt-2 text-red-300">{forgotPasswordError}</p>}
                  </div>
                  <div>
                    <Label htmlFor="securityQuestion" className="text-white">Security Question</Label>
                    <p className="bg-gray-900 border border-gray-700 rounded-md p-3 mb-3 text-white">
                      {securityQuestion}
                    </p>
                    <Label htmlFor="securityAnswer" className="text-white">Your Answer</Label>
                    <Input
                      id="securityAnswer"
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                      placeholder="Enter your answer"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleVerifySecurityAnswer}
                    >
                      Verify Answer
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setForgotPasswordStep('username')}
                    >
                      Back
                    </Button>
                  </div>
                </>
              )}

              {forgotPasswordStep === 'new-password' && (
                <>
                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-sm text-green-200 mb-4">
                    <Check className="w-5 h-5 text-green-400 mb-1" />
                    <p>Verification successful! Please set your new password.</p>
                  </div>
                  <div>
                    <Label htmlFor="newResetPassword" className="text-white">New Password</Label>
                    <Input
                      id="newResetPassword"
                      type="password"
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white mb-3"
                      placeholder="Enter new password"
                    />
                    <Label htmlFor="confirmResetPassword" className="text-white">Confirm Password</Label>
                    <Input
                      id="confirmResetPassword"
                      type="password"
                      value={confirmResetPassword}
                      onChange={(e) => setConfirmResetPassword(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                      placeholder="Confirm new password"
                    />
                  </div>
                  {forgotPasswordError && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {forgotPasswordError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleResetPassword}
                    >
                      Reset Password
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        // Check the previous step to determine where to go back to
                        if (forgotPasswordStep === 'new-password') {
                          const previousStep: 'code' | 'security' = securityQuestion ? 'security' : 'code';
                          setForgotPasswordStep(previousStep);
                        }
                      }}
                    >
                      Back
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-white">Admin Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white pr-10"
                    placeholder="Enter your password"
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-900/30 border border-red-700 rounded-md p-3">
                  <p className="text-red-300 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {loginError}
                  </p>
                </div>
              )}

              <Button className="w-full" onClick={handleLogin}>
                Login
              </Button>

              <div className="flex justify-between text-sm">
                <button
                  className="text-blue-400 hover:underline"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
                <Link href="/" className="text-gray-400 hover:text-gray-300">
                  Back to Website
                </Link>
              </div>

              <div className="bg-gray-900/60 rounded-md p-3 mt-4">
                <p className="text-gray-400 text-sm mb-2">For demonstration:</p>
                <p className="text-gray-300 text-sm">Username: <span className="text-blue-300">owner</span></p>
                <p className="text-gray-300 text-sm">Password: <span className="text-blue-300">soul2025</span></p>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full text-sm" onClick={handleReset}>
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Reset & Reload
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ChevronRight className="w-4 h-4" />
                Back to Website
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant={showMyAccount ? "default" : "outline"}
              className="gap-2"
              onClick={() => setShowMyAccount(!showMyAccount)}
            >
              My Account
            </Button>
            <Button variant="destructive" className="gap-2" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {showMyAccount && (
          <Card className="mb-6 bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">My Account</CardTitle>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setShowMyAccount(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {accountSuccess && (
                <div className="bg-green-900/30 border border-green-700 rounded-md p-3 mb-4">
                  <p className="text-green-300 text-sm flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    {accountSuccess}
                  </p>
                </div>
              )}

              {accountError && (
                <div className="bg-red-900/30 border border-red-700 rounded-md p-3 mb-4">
                  <p className="text-red-300 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {accountError}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="newUsername" className="text-white">Username</Label>
                  <Input
                    id="newUsername"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="newFullName" className="text-white">Full Name</Label>
                  <Input
                    id="newFullName"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-4">To change your password, enter your current password first:</p>

                  <div>
                    <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="newPassword" className="text-white">New Password (leave blank to keep current)</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <Button className="w-full mt-2" onClick={handleAccountUpdate}>
                  Update Account
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Welcome, {currentUser?.fullName || 'Admin User'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              You are logged in as {currentUser?.username || 'admin'} ({currentUser?.role || 'admin'})
            </p>
            <div className="bg-gray-700/50 p-6 rounded-md">
              <h2 className="text-xl font-medium mb-4">Admin Dashboard</h2>
              <p className="text-gray-300 mb-3">
                This is the admin control panel for Soul Mobile Detailing.
                From here you can manage your website content, bookings, and account settings.
              </p>
              <Link href="/">
                <Button>Return to Website</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Debug Information</CardTitle>
            <Button variant="outline" className="h-8" onClick={handleReset}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Clear Session & Reload
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 p-4 rounded-md font-mono text-sm text-gray-300">
              <p>User ID: {currentUser?.id || 'unknown'}</p>
              <p>Username: {currentUser?.username || 'unknown'}</p>
              <p>Full Name: {currentUser?.fullName || 'unknown'}</p>
              <p>Role: {currentUser?.role || 'unknown'}</p>
              <p>Environment: {process.env.NODE_ENV || 'development'}</p>
              <p>Client: {clientInfo.userAgent ? clientInfo.userAgent.substring(0, 90) + '...' : 'unknown'}</p>
              <p>Storage: {clientInfo.storageAvailable ? 'Available' : 'Unavailable'}</p>
              <p>Using Next.js admin panel implementation (React)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
