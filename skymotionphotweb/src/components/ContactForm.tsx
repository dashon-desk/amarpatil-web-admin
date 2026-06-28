import React, { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, Instagram, Linkedin, Globe, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ContactFormData } from "../types";
import { getSiteSettings, createLead } from "../utils/api";

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data && data.contact) {
          setSettings(data);
        }
      })
      .catch((err) => console.error("Error loading site settings in contact form:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    // Simple validation
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      setErrorMessage("Please fulfill the required Name, Email, Phone, and Message fields.");
      setIsSubmitting(false);
      return;
    }

    createLead({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      message: formData.message,
      source: "contact_form"
    })
      .then(() => {
        setSubmitSuccess(true);
        // Clear form
        setFormData({ name: "", email: "", phone: "", message: "" });
      })
      .catch((err) => {
        console.error("Error submitting lead:", err);
        setErrorMessage("Transmission failed. Please check your inputs or try again later.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-navy-dark relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
          
          {/* Left Column: Coordinates and Information */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-4">
              <span className="text-gold-warm tracking-[0.3em] text-[10px] uppercase font-bold block">
                COMMISSION AN ENQUIRY
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-secondary font-black tracking-tight text-white leading-tight">
                Let's Create <br />
                Something <span className="text-gold-warm font-light italic">Exceptional</span>
              </h2>
              <div className="h-[2px] w-20 bg-gold-warm" />
            </div>

            <p className="text-white/80 font-primary font-light text-sm md:text-base leading-relaxed">
              We look forward to translating your highest visions into physical and spatial marvels. Contact our concierge atelier for custom estimates, rare materials sourcing, and international creative consultancies.
            </p>

            {/* Direct Coordinates with Luxury Icons */}
            <div className="space-y-6 pt-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/5 rounded-xs text-gold-warm shrink-0 mt-0.5 border border-white/5">
                  <MapPin className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="font-secondary text-sm font-bold text-white">Primary Address</h4>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed whitespace-pre-line">
                    {settings?.contact?.address || `Avenue Princesse Grace, 98000 Monaco \nBelgrave Square, London SW1X, United Kingdom`}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/5 rounded-xs text-gold-warm shrink-0 mt-0.5 border border-white/5">
                  <Mail className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="font-secondary text-sm font-bold text-white">Digital Mailbox</h4>
                  <a href={`mailto:${settings?.contact?.email || "concierge@ateliereditorial.com"}`} className="text-xs text-white/80 hover:text-gold-warm duration-300 block mt-1">
                    {settings?.contact?.email || "concierge@ateliereditorial.com"}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/5 rounded-xs text-gold-warm shrink-0 mt-0.5 border border-white/5">
                  <Phone className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="font-secondary text-sm font-bold text-white">Direct Hotline</h4>
                  <a href={`tel:${settings?.contact?.phone || "+37793000000"}`} className="text-xs text-white/80 hover:text-gold-warm duration-300 block mt-1">
                    {settings?.contact?.phone || "+377 (93) 00-00-00 (Monaco HQ)"}
                  </a>
                </div>
              </div>
            </div>

            {/* Social Icons inside left column */}
            <div className="pt-6 border-t border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-4 font-bold">
                Follow our creative progress
              </p>
              <div className="flex space-x-4">
                <a href={settings?.socialLinks?.instagram || "#instagram"} className="p-3 bg-white/5 hover:bg-gold-warm hover:text-navy-dark text-white transition-all rounded-xs shadow-xs border border-white/5" aria-label="Our Instagram Feed">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href={settings?.socialLinks?.facebook || "#facebook"} className="p-3 bg-white/5 hover:bg-gold-warm hover:text-navy-dark text-white transition-all rounded-xs shadow-xs border border-white/5" aria-label="Our Facebook Page">
                  <Globe className="w-4 h-4" />
                </a>
                <a href={settings?.socialLinks?.whatsapp ? `https://wa.me/${settings.socialLinks.whatsapp}` : "#whatsapp"} className="p-3 bg-white/5 hover:bg-gold-warm hover:text-navy-dark text-white transition-all rounded-xs shadow-xs border border-white/5" aria-label="Our WhatsApp Contact">
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form with Validation */}
          <div className="lg:col-span-7">
            <div className="relative glass-premium p-8 md:p-12 shadow-xl border-glow-hover rounded-lg overflow-hidden">
              {/* Internal vintage thin double border */}
              <div className="absolute inset-2 border border-white/5 pointer-events-none" />

              <h3 className="font-secondary text-xl font-bold text-white mb-6 tracking-wide pb-4 border-b border-white/5">
                Inquiry Manifest
              </h3>

              <AnimatePresence mode="wait">
                {submitSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12 space-y-6"
                  >
                    <div className="inline-flex p-4 bg-gold-warm/10 rounded-full text-gold-warm">
                      <CheckCircle2 className="w-12 h-12 stroke-[1.25]" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-secondary text-2xl font-bold text-white">Submission Acknowledged</h4>
                      <p className="text-xs text-gold-warm tracking-widest uppercase font-mono">
                        Secure Transmission Complete
                      </p>
                    </div>
                    <p className="text-white/80 font-primary font-light text-sm max-w-md mx-auto leading-relaxed">
                      We have received your custom inquiry. A luxury concierge will review your parameters and contact you within 24 business hours to organize a private consult.
                    </p>
                    <button
                      onClick={() => setSubmitSuccess(false)}
                      className="px-6 py-2.5 text-[10px] tracking-widest uppercase font-bold text-navy-dark bg-gold-warm hover:bg-white duration-300 rounded-xs"
                    >
                      Submit Another Inquiry
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    
                    {errorMessage && (
                      <div className="border-l-4 border-gold-warm bg-white/5 text-white/90 p-4 font-primary text-xs">
                        {errorMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Name Field */}
                      <div className="space-y-2 text-left">
                        <label htmlFor="name" className="block text-[10px] uppercase tracking-widest text-white/60 font-bold">
                          Full Name <span className="text-gold-warm">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Arthur Pendragon..."
                          className="w-full bg-white/5 border border-white/10 focus:border-gold-warm px-4 py-3 text-xs md:text-sm font-primary text-white placeholder-white/20 outline-hidden duration-300 rounded-xs focus:ring-1 focus:ring-gold-warm/30"
                        />
                      </div>

                      {/* Email Field */}
                      <div className="space-y-2 text-left">
                        <label htmlFor="email" className="block text-[10px] uppercase tracking-widest text-white/60 font-bold">
                          Email Address <span className="text-gold-warm">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="client@estatemail.com"
                          className="w-full bg-white/5 border border-white/10 focus:border-gold-warm px-4 py-3 text-xs md:text-sm font-primary text-white placeholder-white/20 outline-hidden duration-300 rounded-xs focus:ring-1 focus:ring-gold-warm/30"
                        />
                      </div>
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2 text-left">
                      <label htmlFor="phone" className="block text-[10px] uppercase tracking-widest text-white/60 font-bold">
                        Phone Coordinates <span className="text-gold-warm">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+91 99999 99999"
                        className="w-full bg-white/5 border border-white/10 focus:border-gold-warm px-4 py-3 text-xs md:text-sm font-primary text-white placeholder-white/20 outline-hidden duration-300 rounded-xs focus:ring-1 focus:ring-gold-warm/30"
                      />
                    </div>

                    {/* Message Field */}
                    <div className="space-y-2 text-left">
                      <label htmlFor="message" className="block text-[10px] uppercase tracking-widest text-white/60 font-bold">
                        Manifest parameters & Details <span className="text-gold-warm">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Please detail your location preference, core materials, or desired timeline..."
                        className="w-full bg-white/5 border border-white/10 focus:border-gold-warm px-4 py-3 text-xs md:text-sm font-primary text-white placeholder-white/20 outline-hidden duration-300 rounded-xs focus:ring-1 focus:ring-gold-warm/30 resize-none"
                      />
                    </div>

                    {/* Submit Button with Custom background with gold hover effect */}
                    <button
                      type="submit"
                      disabled={isScrolling}
                      className="w-full inline-flex items-center justify-center space-x-3 bg-gold-warm hover:bg-white text-navy-dark hover:text-navy-dark px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all duration-500 rounded-xs shadow-md hover:shadow-xl cursor-pointer hover:scale-[1.01] active:scale-100"
                    >
                      {isSubmitting ? (
                        <span>Simulating Encryption...</span>
                      ) : (
                        <>
                          <span>Transmit Secure Manifest</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                    
                    <p className="text-[9px] text-center text-white/45 mt-4 leading-relaxed font-primary">
                      By submitting this secure manifest, you consent to our privacy architecture and our bespoke non-disclosure arrangements regarding client-held designs.
                    </p>

                  </form>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// Global variable tracking check to avoid linter typescript issues in handler check
const isScrolling = false;
