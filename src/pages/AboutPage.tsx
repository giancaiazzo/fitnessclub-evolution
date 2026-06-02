import Layout from "../layouts/Layout";
import { history, siteData, trainers } from "../data/siteData";

export default function AboutPage() {
  return (
    <Layout
      title={`About Us - ${siteData.name}`}
      description="Learn about our mission, values, and expert trainers"
    >
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Sobre {siteData.name}
            </h1>
            <p className="text-xl text-gray-300">
             Nos dedicamos a mejorar tu vida de manera integral.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-8 text-center">
              Nuestra mision
            </h2>

            <div className="max-w-none">
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                At {siteData.name}, we believe that fitness is not just about
                physical strength, but about building confidence, discipline, and
                a positive mindset. Our mission is to create an inclusive
                community where everyone feels welcome and supported on their
                fitness journey.
              </p>

              <p className="text-lg text-gray-400 mb-6 leading-relaxed">
                We provide state-of-the-art facilities, expert guidance, and a
                supportive environment that empowers our members to push their
                limits and achieve extraordinary results.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Our Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center hover:border-orange-500 transition-all">
              <div className="w-20 h-20 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <i className="ri-trophy-line text-4xl text-orange-500"></i>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                Excellence
              </h3>

              <p className="text-gray-400 leading-relaxed">
                We strive for excellence in everything we do, from our
                facilities to our service.
              </p>
            </div>

            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center hover:border-orange-500 transition-all">
              <div className="w-20 h-20 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <i className="ri-hand-heart-line text-4xl text-orange-500"></i>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                Community
              </h3>

              <p className="text-gray-400 leading-relaxed">
                Building a supportive community where everyone can thrive
                together.
              </p>
            </div>

            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center hover:border-orange-500 transition-all">
              <div className="w-20 h-20 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <i className="ri-focus-3-line text-4xl text-orange-500"></i>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">Results</h3>

              <p className="text-gray-400 leading-relaxed">
                Focused on delivering real, measurable results for every member.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Our Journey
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-orange-500/30 hidden md:block"></div>

              <div className="space-y-12">
                {history.map((milestone) => (
                  <div
                    key={`${milestone.year}-${milestone.title}`}
                    className="relative flex items-start gap-6"
                  >
                    <div className="hidden md:block shrink-0">
                      <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center border-4 border-slate-900">
                        <span className="text-white font-bold text-sm">
                          {milestone.year}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-orange-500 transition-all">
                      <div className="md:hidden mb-2">
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          {milestone.year}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-2">
                        {milestone.title}
                      </h3>

                      <p className="text-gray-300 leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">
            Expert Trainers
          </h2>

          <p className="text-xl text-gray-300 mb-12 text-center max-w-2xl mx-auto">
            Meet our certified professionals dedicated to your success.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {trainers.map((trainer, index) => {
              let extraClassName = "";

              if (index + 1 === 4) {
                extraClassName = "lg:col-start-2";
              } else if (index + 1 === 5) {
                extraClassName = "md:col-start-2 lg:col-start-4";
              }

              return (
                <div
                  key={trainer.name}
                  className={`bg-slate-900 p-8 rounded-xl border border-slate-700 hover:border-orange-500 transition-all transform hover:scale-105 md:col-span-2 ${extraClassName}`}
                >
                  <div className="text-center mb-6">
                    <div className="w-40 h-40 rounded-full mx-auto mb-4 overflow-hidden border-4 border-orange-500/20">
                      <img
                        src={trainer.image}
                        alt={`${trainer.name} - ${trainer.role}`}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">
                      {trainer.name}
                    </h3>

                    <p className="text-orange-500 mb-1 font-semibold">
                      {trainer.role}
                    </p>

                    <p className="text-gray-400 text-sm mb-3">
                      {trainer.specialization}
                    </p>

                    <p className="text-gray-500 text-xs">
                      {trainer.experience} experience
                    </p>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed mb-4 text-center">
                    {trainer.bio}
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {trainer.certifications.map((certification) => (
                      <span
                        key={`${trainer.name}-${certification}`}
                        className="bg-slate-800 text-gray-300 text-xs px-3 py-1 rounded-full border border-slate-700"
                      >
                        {certification}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
