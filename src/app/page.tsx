'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { loadContentFromSupabase, type WebsiteContent } from '@/lib/content';
import { Sparkles, Shield, Clock, Phone, MapPin, ClockIcon, Check, Menu, X } from 'lucide-react';
import { BookingForm } from '@/components/BookingForm';

export default function Home() {
  const [content, setContent] = useState<WebsiteContent>({
    siteName: "Soul Mobile Detailing LLC",
    hero: { backgroundImage: "", heading: "", subheading: "" },
    features: [],
    services: [],
    about: { heading: "", paragraph1: "", paragraph2: "", stat1Label: "", stat1Value: "", stat2Label: "", stat2Value: "", image: "" },
    contact: { phone: "", email: "", hours: { weekday: "", saturday: "", sunday: "" } }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Load content from Supabase on mount
    loadContentFromSupabase().then(setContent);
  }, []);

  const iconMap = {
    sparkles: Sparkles,
    shield: Shield,
    clock: Clock,
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-900 shadow-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
              <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <span className="text-xl md:text-2xl font-bold text-white">{content.siteName}</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a className="text-gray-300 hover:text-blue-400 transition-colors cursor-pointer" onClick={(e) => { e.preventDefault(); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }); }}>Services</a>
              <a className="text-gray-300 hover:text-blue-400 transition-colors cursor-pointer" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}>About</a>
              <a className="text-gray-300 hover:text-blue-400 transition-colors cursor-pointer" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a>
              <BookingForm>
                <Button>Book Now</Button>
              </BookingForm>
              <Link href="/admin">
                <Button variant="outline" size="sm">Admin</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-700">
              <div className="flex flex-col space-y-4">
                <a
                  className="text-gray-300 hover:text-blue-400 transition-colors cursor-pointer px-2 py-2"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                    setMobileMenuOpen(false);
                  }}
                >
                  Services
                </a>
                <a
                  className="text-gray-300 hover:text-blue-400 transition-colors cursor-pointer px-2 py-2"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                    setMobileMenuOpen(false);
                  }}
                >
                  About
                </a>
                <a
                  className="text-gray-300 hover:text-blue-400 transition-colors cursor-pointer px-2 py-2"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    setMobileMenuOpen(false);
                  }}
                >
                  Contact
                </a>
                <BookingForm>
                  <Button className="w-full">Book Now</Button>
                </BookingForm>
                <Link href="/admin" className="w-full">
                  <Button variant="outline" className="w-full">Admin</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative min-h-[600px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${content.hero.backgroundImage})`,
        }}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
            {content.hero.heading}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white drop-shadow-lg">
            {content.hero.subheading}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <BookingForm>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Book Your Detail
              </Button>
            </BookingForm>
            <a href="#services">
              <Button size="lg" variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-gray-900">
                View Services
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose {content.siteName}?</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              We combine years of experience with premium products to deliver exceptional results
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {content.features.map((feature, index) => {
              const Icon = iconMap[feature.icon as keyof typeof iconMap];
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-600/20 p-4 rounded-full">
                      <Icon className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Detailing Packages</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Professional detailing packages designed to keep your vehicle looking its absolute best
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.services.map((service) => {
              const includedFeatures = service.features.filter(f => f.included);
              const additionalCount = service.features.length - includedFeatures.length;

              return (
                <Card key={service.id} className="bg-gray-800 border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-4 left-4 bg-blue-600 hover:bg-blue-600">
                      {service.badge}
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl text-white">{service.title}</CardTitle>
                      <span className="text-2xl font-bold text-blue-400">${service.price}</span>
                    </div>
                    <CardDescription className="text-gray-300">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {includedFeatures.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-white font-medium">{feature.text}</span>
                        </div>
                      ))}
                      {additionalCount > 0 && (
                        <p className="text-sm text-gray-400">+ {additionalCount} more features</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <ClockIcon className="w-4 h-4" />
                      <span>{service.duration} min</span>
                    </div>
                    <BookingForm selectedService={`${service.title} - ${service.price}`}>
                      <Button>Book Now</Button>
                    </BookingForm>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Pricing Note */}
          <div className="mt-12 text-center">
            <p className="text-gray-300 text-lg mb-4">
              * Prices vary depending on vehicle type and condition
            </p>
            <p className="text-gray-400 text-sm max-w-3xl mx-auto">
              Base prices shown for Coupes. Additional pricing for Sedans, Wagons, SUVs, Trucks, and Mini-Vans.
              Contact us for exact pricing based on your vehicle.
            </p>
          </div>

          {/* Additional Services */}
          <div className="mt-16 bg-gray-800 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Additional Services</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-300">
              <div className="flex justify-between">
                <span>Pet hair removal</span>
                <span className="text-blue-400 font-semibold">Starting at $50</span>
              </div>
              <div className="flex justify-between">
                <span>Shampoo carpets, seats & trunk</span>
                <span className="text-blue-400 font-semibold">Starting at $50</span>
              </div>
              <div className="flex justify-between">
                <span>Mold Removal</span>
                <span className="text-blue-400 font-semibold">Starting at $100</span>
              </div>
              <div className="flex justify-between">
                <span>Remove tar/bugs/pitch/tree-sap</span>
                <span className="text-blue-400 font-semibold">Starting at $50</span>
              </div>
              <div className="flex justify-between">
                <span>Cut out/remove scratches</span>
                <span className="text-blue-400 font-semibold">Starting at $100</span>
              </div>
              <div className="flex justify-between">
                <span>Clay baring</span>
                <span className="text-blue-400 font-semibold">Starting at $50</span>
              </div>
              <div className="flex justify-between">
                <span>Head light restoration</span>
                <span className="text-blue-400 font-semibold">Starting at $20</span>
              </div>
              <div className="flex justify-between">
                <span>Paint Sealant (upgrade from wax)</span>
                <span className="text-blue-400 font-semibold">$30</span>
              </div>
              <div className="flex justify-between">
                <span>Polishing and waxing</span>
                <span className="text-blue-400 font-semibold">Starting at $50</span>
              </div>
              <div className="flex justify-between">
                <span>3 Step Paint correction</span>
                <span className="text-blue-400 font-semibold">Starting at $150</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">{content.about.heading}</h2>
              <p className="text-lg text-gray-300 mb-6">{content.about.paragraph1}</p>
              <p className="text-lg text-gray-300 mb-6">{content.about.paragraph2}</p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{content.about.stat1Value}</div>
                  <div className="text-gray-300">{content.about.stat1Label}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{content.about.stat2Value}</div>
                  <div className="text-gray-300">{content.about.stat2Label}</div>
                </div>
              </div>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden">
              <img
                src={content.about.image}
                alt="About us"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Get In Touch</h2>
            <p className="text-lg text-gray-300">Ready to give your car the treatment it deserves?</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-600/20 p-4 rounded-full">
                  <Phone className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Call Us</h3>
              <p className="text-gray-300">{content.contact.phone}</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-600/20 p-4 rounded-full">
                  <MapPin className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Mobile Service</h3>
              <p className="text-gray-300">We come to your location</p>
              <p className="text-gray-300">Convenient & Professional</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-600/20 p-4 rounded-full">
                  <ClockIcon className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Service Hours</h3>
              <p className="text-gray-300">{content.contact.hours.weekday}</p>
              <p className="text-gray-300">{content.contact.hours.saturday}</p>
              <p className="text-gray-300">{content.contact.hours.sunday}</p>
            </div>
          </div>
          <div className="text-center mt-12">
            <BookingForm>
              <Button size="lg">Book Your Appointment Today</Button>
            </BookingForm>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                <span className="text-lg font-semibold">{content.siteName}</span>
              </div>
              <p className="text-gray-400">Premium mobile detailing services that come to you.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Exterior Detailing</li>
                <li>Interior Detailing</li>
                <li>Full Detail Packages</li>
                <li>Ceramic Coatings</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Contact</li>
                <li>Reviews</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>{content.contact.phone}</li>
                <li>{content.contact.email}</li>
                <li>Mobile Service Available</li>
                <li>Professional & Reliable</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 {content.siteName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
