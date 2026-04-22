import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/ui/avatar'
import { useAuthWithFetch } from '@/hooks/useAuth'
import { usersApi, type UserProfileUpdate, type PasswordChange } from '@/services/api'
import { toast } from 'sonner'
import { Loader2, User, Lock, Bell, UserX, Camera, Stethoscope } from 'lucide-react'
import { doctorsApi } from '@/services/api'

export default function Settings() {
  const { user, fetchUser } = useAuthWithFetch()
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)

  // Profile form state
  const [profileData, setProfileData] = useState<UserProfileUpdate>({
    full_name: '',
    phone: '',
    username: '',
  })

  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordChange>({
    current_password: '',
    new_password: '',
    confirm_new_password: '',
  })

  // Password validation errors
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  // Avatar preview
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Doctor profile state
  const [doctorData, setDoctorData] = useState({
    qualifications: '',
    experience: '',
    specialties: '',
    languages: '',
  })
  const [doctorLoading, setDoctorLoading] = useState(false)

  // Initialize profile data when user is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        username: user.username || '',
      })
      // Load doctor profile if doctor
      if (user.role === 'doctor' && user.doctor_profile) {
        setDoctorData({
          qualifications: user.doctor_profile.qualifications || '',
          experience: user.doctor_profile.experience || '',
          specialties: (user.doctor_profile.specialties || []).join(', '),
          languages: (user.doctor_profile.languages || []).join(', '),
        })
      }
    }
  }, [user])

  // Validate password strength
  const validatePassword = (password: string): string[] => {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one digit')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return errors
  }

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await usersApi.updateProfile(profileData)
      toast.success('Profile updated successfully!')

      // Refresh user data
      await fetchUser()
    } catch (error: any) {
      console.error('Profile update error:', error)
      const errorMessage = error.response?.data?.detail || 'Failed to update profile'

      // Handle validation errors
      if (Array.isArray(errorMessage)) {
        errorMessage.forEach((err: any) => {
          toast.error(err.msg || 'Validation error')
        })
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate new password
    const errors = validatePassword(passwordData.new_password)
    if (errors.length > 0) {
      setPasswordErrors(errors)
      errors.forEach(error => toast.error(error))
      return
    }

    // Check if passwords match
    if (passwordData.new_password !== passwordData.confirm_new_password) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    setPasswordErrors([])

    try {
      await usersApi.changePassword(passwordData)
      toast.success('Password changed successfully!')

      // Clear form
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_new_password: '',
      })
    } catch (error: any) {
      console.error('Password change error:', error)
      const errorMessage = error.response?.data?.detail || 'Failed to change password'

      // Handle validation errors
      if (Array.isArray(errorMessage)) {
        errorMessage.forEach((err: any) => {
          toast.error(err.msg || 'Validation error')
        })
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPG and PNG images are allowed.')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 5MB.')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to server
    setAvatarLoading(true)
    try {
      await usersApi.uploadAvatar(file)
      toast.success('Avatar uploaded successfully!')

      // Refresh user data
      await fetchUser()
    } catch (error: any) {
      console.error('Avatar upload error:', error)
      const errorMessage = error.response?.data?.detail || 'Failed to upload avatar'
      toast.error(errorMessage)
      setAvatarPreview(null)
    } finally {
      setAvatarLoading(false)
    }
  }

  // Handle doctor profile update
  const handleDoctorProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.doctor_profile?.id) return

    setDoctorLoading(true)
    try {
      await doctorsApi.updateProfile(user.doctor_profile.id, {
        qualifications: doctorData.qualifications,
        experience: doctorData.experience,
        specialties: doctorData.specialties.split(',').map(s => s.trim()).filter(Boolean),
        languages: doctorData.languages.split(',').map(l => l.trim()).filter(Boolean),
      })
      toast.success('Doctor profile updated successfully!')
      await fetchUser()
    } catch (error: any) {
      console.error('Doctor profile update error:', error)
      toast.error(error.response?.data?.detail || 'Failed to update doctor profile')
    } finally {
      setDoctorLoading(false)
    }
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="account">
              <UserX className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid gap-6">
              {/* Avatar Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>
                    Upload a profile picture to personalize your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      {avatarPreview || user.avatar_url ? (
                        <img
                          src={avatarPreview || user.avatar_url}
                          alt={user.full_name}
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center rounded-full">
                          <span className="text-3xl font-bold text-white">
                            {user.full_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </Avatar>
                    {avatarLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={avatarLoading}
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          {avatarLoading ? 'Uploading...' : 'Change Picture'}
                        </Button>
                        <Input
                          id="avatar-upload"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={avatarLoading}
                        />
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2">
                      JPG or PNG. Max size 5MB.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) =>
                          setProfileData({ ...profileData, full_name: e.target.value })
                        }
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email}
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                      <p className="text-sm text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phone: e.target.value })
                        }
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={profileData.username || ''}
                        onChange={(e) =>
                          setProfileData({ ...profileData, username: e.target.value })
                        }
                        placeholder="Enter your username (optional)"
                      />
                    </div>

                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Doctor Profile Section - only for doctors */}
              {user.role === 'doctor' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      Doctor Profile
                    </CardTitle>
                    <CardDescription>
                      Update your professional information visible to patients
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleDoctorProfileUpdate} className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="qualifications">Qualifications</Label>
                        <Input
                          id="qualifications"
                          value={doctorData.qualifications}
                          onChange={(e) => setDoctorData({ ...doctorData, qualifications: e.target.value })}
                          placeholder="e.g., MBBS, MD Pulmonology"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="experience">Experience</Label>
                        <Input
                          id="experience"
                          value={doctorData.experience}
                          onChange={(e) => setDoctorData({ ...doctorData, experience: e.target.value })}
                          placeholder="e.g., 10 years"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="specialties">Specialties</Label>
                        <Input
                          id="specialties"
                          value={doctorData.specialties}
                          onChange={(e) => setDoctorData({ ...doctorData, specialties: e.target.value })}
                          placeholder="Comma separated, e.g., Pulmonology, Respiratory Medicine"
                        />
                        <p className="text-xs text-muted-foreground">Separate multiple specialties with commas</p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="languages">Languages</Label>
                        <Input
                          id="languages"
                          value={doctorData.languages}
                          onChange={(e) => setDoctorData({ ...doctorData, languages: e.target.value })}
                          placeholder="Comma separated, e.g., English, Hindi, Telugu"
                        />
                        <p className="text-xs text-muted-foreground">Separate multiple languages with commas</p>
                      </div>

                      <Button type="submit" disabled={doctorLoading}>
                        {doctorLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Update Doctor Profile'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          current_password: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => {
                        setPasswordData({
                          ...passwordData,
                          new_password: e.target.value,
                        })
                        setPasswordErrors(validatePassword(e.target.value))
                      }}
                      placeholder="Enter new password"
                      required
                    />
                    {passwordErrors.length > 0 && (
                      <div className="text-sm text-red-600">
                        <ul className="list-disc list-inside">
                          {passwordErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirm_new_password">Confirm New Password</Label>
                    <Input
                      id="confirm_new_password"
                      type="password"
                      value={passwordData.confirm_new_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirm_new_password: e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                      required
                    />
                    {passwordData.confirm_new_password &&
                      passwordData.new_password !== passwordData.confirm_new_password && (
                        <p className="text-sm text-red-600">Passwords do not match</p>
                      )}
                  </div>

                  <div className="rounded-md bg-blue-50 p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      Password Requirements:
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>At least 8 characters long</li>
                      <li>At least one uppercase letter</li>
                      <li>At least one lowercase letter</li>
                      <li>At least one digit</li>
                      <li>At least one special character (!@#$%^&*...)</li>
                    </ul>
                  </div>

                  <Button type="submit" disabled={loading || passwordErrors.length > 0}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how you receive notifications (Coming soon)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about appointments and messages
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    Enable
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Get push notifications for important updates
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    Enable
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Appointment Reminders</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders before your scheduled appointments
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    Enable
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground italic">
                  Notification settings will be available in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    View your account details and status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Account ID</Label>
                    <div className="p-2 bg-muted rounded-md font-mono text-sm">
                      {user.id}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Role</Label>
                    <div className="p-2 bg-muted rounded-md capitalize">
                      {user.role === 'user' ? 'Patient' : user.role}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Account Status</Label>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          user.is_active ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <span>{user.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions for your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-red-600">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Button variant="destructive" disabled>
                      Delete Account
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Account deletion is currently disabled. Please contact support if you wish
                    to delete your account.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
