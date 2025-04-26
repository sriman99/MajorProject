import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Stethoscope, Calendar, MessageCircle, FileText, Users, BookOpen, HeartPulse, Award, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'

export function DoctorHome() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const doctorName = user?.full_name || 'Doctor'
  
  const features = [
    {
      title: 'My Dashboard',
      description: 'View your appointments, messages, and patient analytics',
      icon: <Stethoscope className="h-10 w-10 text-blue-500" />,
      action: () => navigate('/doctor/dashboard'),
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Manage Appointments',
      description: 'View and manage your upcoming patient appointments',
      icon: <Calendar className="h-10 w-10 text-green-500" />,
      action: () => navigate('/appointments/manage'),
      bgColor: 'bg-green-50'
    },
    {
      title: 'Patient Messages',
      description: 'Communicate with your patients through secure messaging',
      icon: <MessageCircle className="h-10 w-10 text-purple-500" />,
      action: () => navigate('/doctor/messages'),
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Medical Records',
      description: 'Access patient medical records and test results',
      icon: <FileText className="h-10 w-10 text-red-500" />,
      action: () => navigate('/doctor/records'),
      bgColor: 'bg-red-50'
    },
    {
      title: 'Patient Directory',
      description: 'View and manage your patient directory',
      icon: <Users className="h-10 w-10 text-amber-500" />,
      action: () => navigate('/doctor/patients'),
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Medical Resources',
      description: 'Access medical literature and treatment guidelines',
      icon: <BookOpen className="h-10 w-10 text-teal-500" />,
      action: () => navigate('/doctor/resources'),
      bgColor: 'bg-teal-50'
    }
  ]
  
  return (
    <div className="bg-white">
      {/* Hero section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-700 to-blue-900 text-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Welcome, Dr. {doctorName}</h1>
            <p className="text-xl mb-8 opacity-90">
              Your medical expertise empowers respiratory health. Access your dashboard, manage patients, 
              and view appointments all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => navigate('/doctor/dashboard')} 
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg transition-all duration-300"
              >
                My Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/appointments/manage')} 
                size="lg"
                className="bg-blue-500 text-white hover:bg-blue-600 shadow-lg border-2 border-white transition-all duration-300"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Manage Appointments
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 transform opacity-20">
          <HeartPulse className="w-96 h-96" />
        </div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-blue-500 opacity-20"></div>
        <div className="absolute top-12 right-24 w-24 h-24 rounded-full bg-blue-400 opacity-10"></div>
      </section>

      {/* Features grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 relative">
            Your Medical Practice Tools
            <span className="block w-20 h-1 bg-blue-500 mx-auto mt-4"></span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 ${feature.bgColor} hover:scale-[1.02]`}
                onClick={feature.action}
              >
                <CardContent className="p-8">
                  <div className="mb-6">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <Button variant="ghost" className="text-blue-600 p-0 hover:bg-transparent hover:text-blue-800 flex items-center gap-1 group">
                    Access Now 
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Award className="h-14 w-14 mx-auto mb-6 text-blue-600" />
            <h2 className="text-2xl font-semibold mb-6">Empowering Healthcare Professionals</h2>
            <div className="relative py-8 px-8 bg-white rounded-lg shadow-lg mb-8 border-l-4 border-blue-500">
              <p className="text-lg text-gray-700 mb-6 italic">
                "Our platform helps doctors like you deliver exceptional care to respiratory patients
                with advanced tools, streamlined workflows, and improved patient communication."
              </p>
              <div className="flex items-center justify-center">
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl mr-4 border-2 border-blue-200">
                  NR
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Dr. Neha Reddy</p>
                  <p className="text-gray-500">Chief Medical Officer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 