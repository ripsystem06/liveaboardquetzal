"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Fish,
  Compass,
  Heart,
  Star,
  Ship,
  Bed,
  UtensilsCrossed,
  ThermometerSun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { useLanguage } from "@/contexts/language-context";

const values = [
  { icon: Fish, key: "v1" },
  { icon: Compass, key: "v2" },
  { icon: Heart, key: "v3" },
  { icon: Star, key: "v5" },
] as const;

const galleryImages = [
  {
    src: "/images/Habitaciones/cuadruplepremium1.webp",
    category: "staterooms" as const,
  },
  {
    src: "/images/Habitaciones/cuadruplepremium2.webp",
    category: "staterooms" as const,
  },
  {
    src: "/images/Habitaciones/cuadruplesencilla.webp",
    category: "staterooms" as const,
  },
  {
    src: "/images/Habitaciones/cuadruplesencilla2.webp",
    category: "staterooms" as const,
  },
  {
    src: "/images/Habitaciones/sencilladoble.webp",
    category: "staterooms" as const,
  },
  {
    src: "/images/Habitaciones/sencilladoble2.webp",
    category: "staterooms" as const,
  },
  {
    src: "/images/Habitaciones/barrabebidas.webp",
    category: "staterooms" as const,
  },
  {
    src: "/images/Habitaciones/comedor.webp",
    category: "staterooms" as const,
  },
  {
    src: "/images/Habitaciones/comedor2.webp",
    category: "staterooms" as const,
  },
  {
    src: "/images/Habitaciones/comedor3.webp",
    category: "staterooms" as const,
  },
  {
    src: "/images/Habitaciones/estancia.webp",
    category: "staterooms" as const,
  },
  {
    src: "/images/Habitaciones/sala.webp",
    category: "staterooms" as const,
  },
  {
    src: "/images/Habitaciones/vino.webp",
    category: "staterooms" as const,
  },
];

const specs = [
  { key: "length", icon: Ship },
  { key: "guests", icon: Bed },
  { key: "cabins", icon: Bed },
  { key: "speed", icon: ArrowRight },
  { key: "beam", icon: ArrowRight },
  { key: "compressor", icon: ArrowRight },
];

const comforts = [
  { icon: UtensilsCrossed, key: "dining" },
  { icon: ThermometerSun, key: "sunDeck" },
  { icon: Bed, key: "cabin" },
  { icon: Ship, key: "dive" },
];

const partners = ["p1", "p2", "p3", "p4"] as const;

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* About Hero — Video Background */}
      <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/exteriornave/bannerpromo2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-primary/60" />
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="font-serif text-4xl md:text-6xl font-normal text-white mb-4 tracking-tight">
              {t("about.title")}
            </h1>
            <p className="font-sans text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              {t("about.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl font-normal text-foreground">
                {t("about.story")}
              </h2>
              <p className="font-sans text-muted-foreground leading-relaxed">
                {t("about.storyText1")}
              </p>
              <p className="font-sans text-muted-foreground leading-relaxed">
                {t("about.storyText2")}
              </p>
              <p className="font-sans text-muted-foreground leading-relaxed">
                {t("about.storyText3")}
              </p>
              <p className="font-sans text-muted-foreground leading-relaxed">
                {t("about.storyText4")}
              </p>
              <p className="font-sans text-muted-foreground leading-relaxed">
                {t("about.storyText5")}
              </p>
              <p className="font-sans text-muted-foreground leading-relaxed">
                {t("about.storyText6")}
              </p>
            </div>
            <div className="relative overflow-hidden rounded-lg aspect-[4/3]">
              <Image
                src="/images/Interior/interior-07.webp"
                alt="Quetzal Crew"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground text-center mb-12">
            {t("about.values")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v) => (
              <div
                key={v.key}
                className="flex gap-4 p-6 bg-card rounded-lg border border-border"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <v.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-normal text-foreground mb-2">
                    {t(`about.${v.key}`)}
                  </h3>
                  <p className="font-sans text-muted-foreground leading-relaxed">
                    {t(`about.${v.key}d`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your Floating Home */}
      <section className="py-16 md:py-24 bg-muted/20">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground text-center mb-8">
            {t("boat.story")}
          </h2>
          <div className="space-y-6">
            <p className="font-serif text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t("boat.storyText1")}
            </p>
            <p className="font-serif text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t("boat.storyText2")}
            </p>
            <p className="font-serif text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t("boat.storyText3")}
            </p>
            <p className="font-serif text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t("boat.storyText4")}
            </p>
          </div>
        </div>
      </section>

      {/* Deck Plans */}
      <section className="py-20 bg-background">
        <div className="text-center mb-12 px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground mb-4">
            {t("boat.deck.title")}
          </h2>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("boat.deck.subtitle")}
          </p>
        </div>
        <div className="px-[5vw]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {[
              {
                src: "/images/specsship/vistaperfil.png",
                label: "Vista de Perfil",
              },
              {
                src: "/images/specsship/cubiertaprincipal.png",
                label: "Cubierta Principal",
              },
              {
                src: "/images/specsship/cubiertasuperior.png",
                label: "Cubierta Superior",
              },
              {
                src: "/images/specsship/distribuciondefondo.png",
                label: "Distribución de Fondo",
              },
            ].map((plan) => (
              <div key={plan.src} className="relative">
                <Image
                  src={plan.src}
                  alt={plan.label}
                  width={800}
                  height={350}
                  className="w-full h-auto border border-gray-300 rounded-lg"
                />
                <p className="text-center font-sans text-sm font-semibold text-foreground mt-3 uppercase tracking-wide">
                  {plan.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specs */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground text-center mb-12">
            {t("boat.specs.title")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {specs.map((spec) => (
              <div
                key={spec.key}
                className="text-center p-6 bg-card rounded-lg border border-border"
              >
                <p className="font-sans text-sm text-muted-foreground mb-1">
                  {t(`boat.specs.${spec.key}`)}
                </p>
                <p className="font-sans text-lg font-semibold text-foreground">
                  {t(`boat.specs.${spec.key}Val`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Life Onboard */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground mb-4">
              {t("boat.comfort.title")}
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("boat.comfort.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {comforts.map((item) => (
              <div
                key={item.key}
                className="flex gap-4 p-6 bg-card rounded-lg border border-border"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-normal text-foreground mb-2">
                    {t(`boat.comfort.${item.key}`)}
                  </h3>
                  <p className="font-sans text-muted-foreground leading-relaxed">
                    {t(`boat.comfort.${item.key}Desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground mb-4">
              {t("boat.gallery.title")}
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("boat.gallery.subtitle")}
            </p>
          </div>

          {/* Featured Video */}
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full aspect-video object-cover"
            >
              <source src="/experiencia1.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {galleryImages.map((image) => (
              <div
                key={image.src}
                className="relative group overflow-hidden rounded-lg aspect-[4/3] lg:aspect-square bg-muted"
              >
                <Image
                  src={image.src}
                  alt={
                    image.category === "staterooms"
                      ? t("boat.gallery.altStateroom")
                      : t("boat.gallery.altInterior")
                  }
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  {image.category === "staterooms"
                    ? t("boat.gallery.staterooms")
                    : t("boat.gallery.interior")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaborations */}
      <section className="pt-16 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground mb-4">
            {t("collab.title")}
          </h2>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("collab.subtitle")}
          </p>
        </div>
      </section>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <p className="font-sans text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center">
            {t("collab.intro")}
          </p>
        </div>
      </section>
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {partners.map((p) => (
              <div
                key={p}
                className="p-8 bg-card rounded-lg border border-border shadow-sm"
              >
                <h3 className="font-serif text-xl font-normal text-foreground mb-3">
                  {t(`collab.${p}.name`)}
                </h3>
                <p className="font-sans text-muted-foreground leading-relaxed">
                  {t(`collab.${p}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-normal mb-4">
            {t("collab.cta")}
          </h2>
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans font-semibold"
          >
            <Link href="/contacto">
              {t("collab.ctaButton")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-normal text-foreground mb-4">
            {t("about.cta")}
          </h2>
          <p className="font-sans text-lg text-muted-foreground mb-6">
            {t("about.socialProof")}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans font-semibold"
          >
            <Link href="/contacto">
              {t("about.ctaButton")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
