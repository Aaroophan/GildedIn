"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GraduationCap, Calendar, Award, School } from "lucide-react";
import { EducationService } from "@/models/Services/Education";
import ErrorMessage from "../ui/ErrorMessage";
import Loading from "../ui/Loading";
import Image from "next/image";

export const Educations = () => {
    const [educations, setEducations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const GetData = async () => {
        setIsLoading(true);
        try {
            const educationService = EducationService.getInstance();
            const result = await educationService.Education("Aaroophan");

            if ([200, 201, 202, 203, 204, 205, 206, 207, 208, 226].includes(result.Status)) {
                if (result.Educations) {
                    setEducations(result.Educations);
                }
                setError(null);
            } else {
                setError(result.Message);
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        GetData();
    }, []);

    if (isLoading) return <Loading />;
    if (error) return <ErrorMessage message={error} />;
    if (!educations || educations.length === 0) return null;

    return <EducationTimeline educations={educations} />;
};

const EducationTimeline = ({ educations }: { educations: any[] }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const scaleY = useTransform(scrollYProgress, [0, 2], [0, 3.5]);

    return (
        <section ref={containerRef} className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="font-comic text-4xl md:text-5xl font-bold pb-6 bg-gradient-to-br from-[var(--foreground)] via-[var(--foreground)] to-[var(--foreground)] bg-clip-text text-transparent cursor-default">
                        Education
                    </h2>
                    <p className="font-comic text-lg text-gray-400 max-w-2xl mx-auto bg-gradient-to-br from-[var(--foreground)]/75 via-[var(--foreground)]/75 to-[var(--foreground)]/75 bg-clip-text text-transparent cursor-default">
                        My academic journey and qualifications.
                    </p>
                </motion.div>

                <div className="relative max-w-8xl mx-auto font-comic">
                    {/* Central Line */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-2 rounded-full bg-[var(--mono-4)]/0 -translate-x-1/2 hidden md:block">
                        <motion.div
                            style={{ scaleY, transformOrigin: "top" }}
                            className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[var(--mono-4)] via-[var(--mono-4)]/50 to-[var(--mono-4)]/10 animate-pulse rounded-full"
                        />
                    </div>

                    {/* Mobile Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-2 rounded-full bg-[var(--mono-4)]/0 md:hidden">
                        <motion.div
                            style={{ scaleY, transformOrigin: "top" }}
                            className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[var(--mono-4)] via-[var(--mono-4)]/50 to-[var(--mono-4)]/10"
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        {educations.map((education, index) => (
                            <EducationCard
                                key={index}
                                education={education}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const EducationCard = ({ education, index }: { education: any, index: number }) => {
    const isLeft = index % 2 === 1;
    // Check if education is "Present" or ongoing
    const isCurrent = education.Date ? education.Date.includes("Present") : false;

    return (
        <div className={`relative flex flex-col md:flex-row gap-8 md:gap-0 ${!isLeft ? 'md:flex-row-reverse' : ''}`}>

            {/* Timeline Dot */}
            <div className="absolute left-4 md:left-1/2 w-6 h-6 rounded-full bg-[var(--background)] border-2 border-[var(--mono-4)] z-20 -translate-x-1/2 mt-1.5 md:mt-8">
                <div className="absolute inset-0 rounded-full bg-[var(--mono-4)]/20 animate-ping" />
            </div>

            {/* Content Spacer */}
            <div className="flex-1 md:w-1/2 hidden md:block" />

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, x: isLeft ? -50 : 50, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`cursor-default flex-1 md:w-1/2 pl-12 md:pl-0 ${isLeft ? 'md:pl-10' : 'md:pr-10'}`}
            >
                <div className={`group relative p-4 rounded-2xl ${isLeft ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-[var(--mono-4)]/20 to-[var(--mono-4)]/0 border border-[var(--mono-4)]/10 hover:border-[var(--mono-4)]/30 transition-all duration-300 hover:shadow-lg backdrop-blur-sm`}>
                    {isCurrent && (
                        <div className="absolute -top-3 right-6 px-3 py-1 text-xs font-semibold text-[var(--foreground)] bg-gradient-to-bl from-[var(--mono-4)]/80 to-[var(--mono-4)]/20 border border-[var(--mono-4)]/90 hover:border-[var(--mono-4)]/70 transition-all duration-300 rounded-full shadow-lg  group-hover:scale-105 transition-all duration-200 cursor-default animate-pulse">
                            Studying
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <div className="flex gap-5">
                        {education.Image && (
                            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-[var(--mono-4)]/30 group-hover:scale-105 group-hover:translate-x-1 transition-all duration-200 cursor-default">
                                <Image
                                    src={education.Image}
                                    alt={education.Name}
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                        // Fallback to Briefcase on error - tough to do with Next/Image directly in this structure without state, 
                                        // but we can try just hiding it? Or just let it fail to transparent.
                                        // Actually, best to just render Image.
                                    }}
                                />
                            </div>
                        )}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <h3 className="text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--mono-4)] group-hover:scale-105 group-hover:translate-x-3 transition-all duration-200 cursor-default">
                                    {education.Title}
                                </h3>
                            </div>
                            <div className="flex items-center text-md text-[var(--foreground)] font-medium group-hover:scale-105 group-hover:translate-x-5 transition-all duration-200 cursor-default">
                                <GraduationCap className="w-5 h-5 mr-2 text-[var(--mono-4)]" />
                                {education.Name}
                            </div>
                            <span className="flex items-center text-md text-[var(--foreground)] font-medium group-hover:scale-105 group-hover:translate-x-7 transition-all duration-200 cursor-default">
                                <Calendar className="w-5 h-5 mr-2 text-[var(--mono-4)]" />
                                <i>{education.Date}</i>
                            </span>

                            {/* We don't have separate location data in EducationService yet, but School icon fits generic institution location context if needed. 
                                For now, I'll omit location if it's not in data, or use School icon if we want to show something else. 
                                Based on service, we only have Name, Title, Date, Description. */}
                        </div>
                        </div>

                        {education.Description && education.Description.length > 0 && (
                            <ul className="space-y-2 mt-4">
                                {education.Description.map((desc: string, i: number) => (
                                    <li key={i} className="flex items-start text-sm text-[var(--foreground)]/70 group-hover:text-[var(--foreground)] transition-all hover:translate-x-5 duration-300">
                                        <Award className="w-4 h-4 mr-2.5 text-blue-500 mt-0.5 shrink-0" />
                                        <span className="text-sm hover:text-[var(--mono-4)] cursor-default">{desc}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
