import { useEffect, useRef } from "react";
import Layout from "../layouts/Layout";
import { siteData } from "../MOD1-CLIENTES/data/siteData";

import entradaImg from "../MOD1-CLIENTES/virtualtour/1.jpg";
import musculacionImg from "../MOD1-CLIENTES/virtualtour/2.jpg";
import funcionalImg from "../MOD1-CLIENTES/virtualtour/3.jpg";
import vestuariosImg from "../MOD1-CLIENTES/virtualtour/4.jpg";

import "pannellum/build/pannellum.css";
import "pannellum/build/pannellum.js";

export default function TourVirtual() {
  const viewerRef = useRef<{ destroy: () => void; resize?: () => void } | null>(
    null
  );

  useEffect(() => {
    if (!window.pannellum) {
      console.error("Pannellum no se cargó correctamente");
      return;
    }

    if (viewerRef.current) return;

    viewerRef.current = window.pannellum.viewer("tour-virtual-viewer", {
      default: {
        firstScene: "entrada",
        sceneFadeDuration: 1000,
        autoLoad: true,
        showControls: true,
        showFullscreenCtrl: true,
        compass: false,
      },

      scenes: {
        entrada: {
          title: "Entrada del gimnasio",
          type: "equirectangular",
          panorama: entradaImg,
          pitch: 0,
          yaw: 0,
          hfov: 100,
          hotSpots: [
            {
              pitch: -2,
              yaw: 25,
              type: "scene",
              text: "Ir a zona de musculación",
              sceneId: "musculacion",
            },
            {
              pitch: -3,
              yaw: -35,
              type: "scene",
              text: "Ir a zona funcional",
              sceneId: "funcional",
            },
          ],
        },

        musculacion: {
          title: "Zona de musculación",
          type: "equirectangular",
          panorama: musculacionImg,
          pitch: 0,
          yaw: 0,
          hfov: 100,
          hotSpots: [
            {
              pitch: -2,
              yaw: 170,
              type: "scene",
              text: "Volver a la entrada",
              sceneId: "entrada",
            },
            {
              pitch: -4,
              yaw: 40,
              type: "scene",
              text: "Ir a zona funcional",
              sceneId: "funcional",
            },
            {
              pitch: 5,
              yaw: -20,
              type: "info",
              text: "Sector equipado con máquinas y pesos libres",
            },
          ],
        },

        funcional: {
          title: "Zona funcional",
          type: "equirectangular",
          panorama: funcionalImg,
          pitch: 0,
          yaw: 0,
          hfov: 100,
          hotSpots: [
            {
              pitch: -2,
              yaw: -150,
              type: "scene",
              text: "Volver a la entrada",
              sceneId: "entrada",
            },
            {
              pitch: -3,
              yaw: 35,
              type: "scene",
              text: "Ir a vestuarios",
              sceneId: "vestuarios",
            },
            {
              pitch: 4,
              yaw: 80,
              type: "info",
              text: "Espacio para entrenamiento funcional y clases grupales",
            },
          ],
        },

        vestuarios: {
          title: "Vestuarios",
          type: "equirectangular",
          panorama: vestuariosImg,
          pitch: 0,
          yaw: 0,
          hfov: 100,
          hotSpots: [
            {
              pitch: -2,
              yaw: 180,
              type: "scene",
              text: "Volver a zona funcional",
              sceneId: "funcional",
            },
            {
              pitch: -3,
              yaw: -120,
              type: "scene",
              text: "Volver a la entrada",
              sceneId: "entrada",
            },
          ],
        },
      },
    });

    setTimeout(() => {
      viewerRef.current?.resize?.();
    }, 300);

    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, []);

  return (
    <Layout
      title={`Tour virtual - ${siteData.name}`}
      description="Recorré virtualmente las instalaciones del gimnasio"
    >
      <section className="pt-32 pb-20 bg-gradient-to-br from-background via-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Tour virtual
            </h1>

            <p className="text-xl text-muted-foreground">
              Recorré nuestras instalaciones de forma interactiva y conocé los
              principales espacios de FitnessClubEvolution.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-4 md:p-6 shadow-xl shadow-primary/10">
            <div
              className="w-full overflow-hidden rounded-xl bg-background"
              style={{ height: "650px" }}
            >
              <div
                id="tour-virtual-viewer"
                className="w-full h-full"
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: "650px",
                }}
              />
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Usá el mouse o el dedo para moverte por la imagen. Tocá los puntos
            interactivos para avanzar entre los sectores del gimnasio.
          </p>
        </div>
      </section>
    </Layout>
  );
}