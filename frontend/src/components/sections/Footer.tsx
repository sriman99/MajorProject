import { assets } from "../../config/assets"

export function Footer() {
  const footerLinks = [
    { name: "Home", href: "#" },
    { name: "Features", href: "#features" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" }
  ]

  const socialLinks = [
    { name: "Facebook", icon: assets.social.facebook, href: "#" },
    { name: "Twitter", icon: assets.social.twitter, href: "#" },
    { name: "LinkedIn", icon: assets.social.linkedin, href: "#" }
  ]

  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 py-16 border-t border-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#ff7757]/5 via-transparent to-[#1a2352]/5 rounded-3xl blur-3xl -z-10" />
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src="/67f907e9bd92c5e1c7e6bf06_12.svg" 
          alt="" 
          className="absolute top-10 right-10 w-16 h-16 animate-float opacity-20"
        />
        <img 
          src="/67f907e9bd92c5e1c7e6bf07_3.svg" 
          alt="" 
          className="absolute bottom-10 left-10 w-20 h-20 animate-float opacity-20"
        />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
          <div className="flex items-center">
            <span className="text-3xl font-bold bg-gradient-to-r from-[#1a2352] to-[#ff7757] bg-clip-text text-transparent">
              NeumoAI
            </span>
          </div>

          <nav className="flex flex-wrap justify-center gap-8">
            {footerLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-6">
            {socialLinks.map((social) => (
              <a 
                key={social.name}
                href={social.href} 
                className="text-[#ff7757] hover:scale-110 transition-transform"
                aria-label={social.name}
              >
                <img src={social.icon} alt={social.name} className="w-6 h-6" />
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 mb-4 md:mb-0">
            © {new Date().getFullYear()} NeumoAI. All rights reserved
          </p>
          <div className="flex space-x-8">
            {["Privacy Policy", "Terms and Conditions"].map((text) => (
              <a 
                key={text}
                href="#" 
                className="text-gray-600 hover:text-[#ff7757] transition-colors relative group"
              >
                {text}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
} 