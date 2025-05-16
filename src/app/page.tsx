"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import gifone from "@/assets/1.gif";
import profileone from "@/assets/1.png";
import profiletwo from "@/assets/2.png";
import profilethree from "@/assets/3.png";
import design from "@/assets/line-design.svg";

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const slides = [
    {
      poster: profileone,
      title: "Now Discuss Anything",
      description:
        "Create conferences, invite people, Discuss any topic together.",
    },
    {
      poster: profiletwo,
      title: "See Each Other Anytime",
      description:
        "Get to see each other anywhere, anytime. Enjoy safe, discreet messaging",
    },
    {
      poster: profilethree,
      title: "Plan Anything & Anywhere",
      description:
        "Just call your group and plan your trip or meeting at any time.",
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      nextSlide();
    }
    if (touchStart - touchEnd < -50) {
      prevSlide();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section
      className="min-h-screen bg-[#181826] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-screen">
        <div className="h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div className="flex flex-col h-full">
                {/* GIF shown for all slides */}
                <div className="w-full h-[40vh] relative overflow-hidden">
                  <Image
                    src={gifone}
                    alt="Onboarding animation"
                    width={400}
                    height={300}
                    className="w-full object-cover"
                  />
                </div>

                <div className="relative px-4">
                  <div className=" rounded-t-3xl pt-4 pb-4 relative">
                    <div className="relative mx-auto max-w-[500px]">
                      <div className="relative mb-8">
                        <Image
                          src={slide.poster}
                          alt="Poster"
                          width={300}
                          height={300}
                          className="mx-auto"
                        />
                      </div>
                      <div className="text-center px-4">
                        <h2 className="text-2xl font-bold mb-2">{slide.title}</h2>
                        <div className="mb-3">
                          <Image
                            src={design}
                            alt="border-design"
                            width={150}
                            height={10}
                            className="mx-auto"
                          />
                        </div>
                        <h5 className="text-gray-600 text-sm mb-6">
                          {slide.description}
                        </h5>
                        <Link href="/auth/create-account" className="inline-block pb-8">
                          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
                            <ChevronRight className="text-white w-8 h-8" />
                          </div>
                        </Link>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}