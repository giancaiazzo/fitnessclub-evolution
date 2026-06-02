import { testimonials } from "../data/siteData";

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What Our Members Say
          </h2>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real experiences from people who transformed their lives with us
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-orange-500 transition-all transform hover:scale-105"
            >
              <div className="flex items-center gap-1 mb-6">
                {Array.from({ length: testimonial.rating }).map((_, index) => (
                  <i
                    key={index}
                    className="ri-star-fill text-orange-500 text-xl"
                  ></i>
                ))}
              </div>

              <p className="text-gray-300 leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>

              <div>
                <h3 className="text-xl font-bold text-white">
                  {testimonial.name}
                </h3>

                <p className="text-gray-400 text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}