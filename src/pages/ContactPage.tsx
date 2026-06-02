import ContactForm from "../components/ContactForm";
import Layout from "../layouts/Layout";
import { contactInfo, siteData, socialLinks } from "../data/siteData";

const mapImage =
  "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=1200&h=600&fit=crop&q=80";

export default function ContactPage() {
  return (
    <Layout
      title={`Contact Us - ${siteData.name}`}
      description="Get in touch with us to start your fitness journey"
    >
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Contact Us
            </h1>

            <p className="text-xl text-gray-300">
              We're here to help you on your fitness journey. Get in touch
              today!
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">
                Get In Touch
              </h2>

              <div className="space-y-6">
                {contactInfo.map((info) => (
                  <div key={info.title} className="flex items-start gap-4">
                    <div className="bg-orange-500 p-4 rounded-lg shrink-0">
                      <i className={`${info.icon} text-2xl text-white`}></i>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {info.title}
                      </h3>

                      {Array.isArray(info.content) ? (
                        info.content.map((line) => (
                          <p
                            key={`${info.title}-${line}`}
                            className="text-gray-400 leading-relaxed"
                          >
                            {line}
                          </p>
                        ))
                      ) : info.link ? (
                        <a
                          href={info.link}
                          className="text-gray-400 hover:text-orange-500 transition-colors"
                        >
                          {info.content}
                        </a>
                      ) : (
                        <p className="text-gray-400 leading-relaxed">
                          {info.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Follow Us
                </h3>

                <div className="flex space-x-4">
                  {socialLinks.map((social) => {
                    const socialUrl =
                      siteData.social[
                        social.name as keyof typeof siteData.social
                      ];

                    return (
                      <a
                        key={social.name}
                        href={socialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-slate-700 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-all"
                        aria-label={social.label}
                      >
                        <i className={`${social.icon} text-xl text-white`}></i>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">
            What to Expect When You Visit
          </h2>

          <p className="text-xl text-gray-300 mb-12 text-center max-w-2xl mx-auto">
            Your first visit is important to us. Here's what you can expect.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center hover:border-orange-500 transition-all">
              <div className="w-16 h-16 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-search-line text-3xl text-orange-500"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Tour & Consultation
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                We'll give you a comprehensive tour of our facilities and
                discuss your fitness goals
              </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center hover:border-orange-500 transition-all">
              <div className="w-16 h-16 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-group-line text-3xl text-orange-500"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Meet Our Team
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Get introduced to our trainers and staff who will support you
                on your journey
              </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center hover:border-orange-500 transition-all">
              <div className="w-16 h-16 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-list-3-line text-3xl text-orange-500"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Membership Options
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Explore our flexible membership plans designed to fit your
                lifestyle and budget
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-700">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="bg-orange-500/10 p-4 rounded-lg shrink-0">
                  <i className="ri-time-line text-4xl text-orange-500"></i>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Response Time
                  </h3>

                  <p className="text-gray-300 mb-4 leading-relaxed">
                    We're committed to getting back to you quickly. Here's what
                    you can expect:
                  </p>

                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <i className="ri-checkbox-circle-fill text-orange-500 text-xl mt-0.5"></i>
                      <div>
                        <span className="text-white font-semibold">
                          Email inquiries:
                        </span>
                        <span className="text-gray-300">
                          {" "}
                          We respond within 24 hours during business days
                        </span>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <i className="ri-checkbox-circle-fill text-orange-500 text-xl mt-0.5"></i>
                      <div>
                        <span className="text-white font-semibold">
                          Phone calls:
                        </span>
                        <span className="text-gray-300">
                          {" "}
                          Available during staffed hours (5 AM - 11 PM)
                        </span>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <i className="ri-checkbox-circle-fill text-orange-500 text-xl mt-0.5"></i>
                      <div>
                        <span className="text-white font-semibold">
                          Form submissions:
                        </span>
                        <span className="text-gray-300">
                          {" "}
                          Confirmation within 2 hours, full response within 24
                          hours
                        </span>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <i className="ri-checkbox-circle-fill text-orange-500 text-xl mt-0.5"></i>
                      <div>
                        <span className="text-white font-semibold">
                          Urgent matters:
                        </span>
                        <span className="text-gray-300">
                          {" "}
                          Call us directly for immediate assistance
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Find Us
          </h2>

          <div className="max-w-5xl mx-auto bg-slate-800 p-8 rounded-xl border border-slate-700">
            <div className="aspect-video bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden relative">
              <img
                src={mapImage}
                alt="Gym location map"
                width={1200}
                height={600}
                className="w-full h-full object-cover opacity-50"
                loading="lazy"
              />

              <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                <div>
                  <i className="ri-map-pin-line text-5xl text-orange-500 mb-4"></i>
                  <p className="text-gray-300 text-lg">
                    Map integration can be added here (Google Maps, etc.)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
