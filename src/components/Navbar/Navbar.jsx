"use client";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { Button } from "../ui/button";
import Link from "next/link";
import { User, LogIn, Palette, Trophy, BarChart3, Upload, Flame, Sparkles, Code2, Youtube, BookOpen } from "lucide-react";
import { CgDetailsMore } from "react-icons/cg";
import { authenti } from "./new";
import { Sun, Moon } from "lucide-react";
import Image from "next/image";
import GoogleTranslate from "../GoogleTranslate";
import { useContext } from "react";
import xpContext from "@/contexts/xp";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Logout from "./Logout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [session, setSession] = useState(null);
  const [sidebar, setSidebar] = useState(false);
  const [theme, setTheme] = useState("light"); // Default theme: light
  const [streak, setStreak] = useState(0);
  const { xp, show, changed } = useContext(xpContext);
  const router = useRouter();
  const pathname = usePathname();

  // Helper function to check if a link is active
  const isActiveLink = (href) => {
    return pathname === href || (href === "/roadmap" && pathname === "/");
  };
  // Load saved theme or use default
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.className = savedTheme; // Apply theme globally
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.className = newTheme; // Apply theme globally
  };

  // Fetch session
  useEffect(() => {
    const fetchSession = async () => {
      let session = await authenti();
      setSession(session);
      
      // Fetch streak if user is logged in
      if (session?.user?.email) {
        try {
          const res = await fetch(`/api/gamification/stats?userId=${session.user.email}`);
          const data = await res.json();
          setStreak(data.streak || 0);
        } catch (error) {
          console.error("Error fetching streak:", error);
        }
      }
    };
    fetchSession();
  }, []);

  // Sign out user
  const signOutUser = async () => {
    await signOut();
    setSession(null);
    router.push("/");
  };

  // Close sidebar on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the clicked target is outside the sidebar and the button that opens it
      const sidebarElement = document.querySelector(".sidebar");
      const buttonElement = document.querySelector("button"); // The button to open sidebar

      if (
        sidebarElement &&
        !sidebarElement.contains(event.target) &&
        !buttonElement.contains(event.target) &&
        event.target.textContent !== "Logout" &&
        event.target.textContent !== "Cancel"
      ) {
        setSidebar(false); // Close sidebar if the click is outside
      }
    };

    // Add event listener when sidebar is open
    if (sidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Clean up the event listener when the component unmounts or sidebar is closed
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebar]);

  return (
    <div className="p-2 w-screen border-b fixed top-0 left-0 bg-background/80 backdrop-blur-xl z-50 shadow-lg border-slate-200/20">
      <div className="flex w-full px-3 justify-between lg:px-10 items-center">
        {sidebar && (
          <motion.div
            initial={{
              opacity: 0,
              x: -360,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -360 }}
            transition={{
              duration: 0.1,
              ease: "easeOut",
            }}
            className="w-[360px] h-screen bg-background/95 backdrop-blur-xl fixed top-0 left-0 flex flex-col justify-between z-10 sidebar border-r border-slate-200/20 shadow-2xl"
          >
            <div className="flex flex-col gap-3 overflow-y-auto flex-1 p-4 pb-0" style={{ maxHeight: 'calc(100vh - 100px)' }}>
              <Button
                variant={"ghost"}
                className="items-center w-max hover:bg-slate-100/80 transition-all duration-200"
                onClick={() => setSidebar(false)}
              >
                <IoClose className="text-lg" />
              </Button>
              {session ? (
                <nav>
                  <ul className="flex flex-col max-md:text-lg ml-4 gap-3 ">
                    <li onClick={() => setSidebar(false)}>
                      <Link 
                        href={session ? `/roadmap` : "/"} 
                        className={`block py-2 px-3 rounded-lg transition-all duration-200 hover:bg-slate-100/80 ${
                          isActiveLink("/roadmap") || isActiveLink("/") 
                            ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500" 
                            : ""
                        }`}
                      >
                        Home
                      </Link>
                    </li>
                    <li onClick={() => setSidebar(false)}>
                      <Link 
                        href="/generate"
                        className={`block py-2 px-3 rounded-lg transition-all duration-200 hover:bg-slate-100/80 ${
                          isActiveLink("/generate") 
                            ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500" 
                            : ""
                        }`}
                      >
                        Generate
                      </Link>
                    </li>
                    <li onClick={() => setSidebar(false)}>
                      <Link 
                        href="/profile"
                        className={`block py-2 px-3 rounded-lg transition-all duration-200 hover:bg-slate-100/80 ${
                          isActiveLink("/profile") 
                            ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500" 
                            : ""
                        }`}
                      >
                        Profile
                      </Link>
                    </li>
                    <li onClick={() => setSidebar(false)}>
                      <Link 
                        href="/courses"
                        className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 hover:bg-slate-100/80 ${
                          pathname?.startsWith("/courses") 
                            ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500" 
                            : ""
                        }`}
                      >
                        <BookOpen className="h-4 w-4" />
                        Courses
                      </Link>
                    </li>
                    <li onClick={() => setSidebar(false)}>
                      <Link 
                        href="/studio"
                        className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 hover:bg-slate-100/80 ${
                          isActiveLink("/studio") 
                            ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500" 
                            : ""
                        }`}
                      >
                        <Palette className="h-4 w-4" />
                        Studio
                      </Link>
                    </li>
                    <li onClick={() => setSidebar(false)}>
                      <Link 
                        href="/gamification"
                        className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 hover:bg-slate-100/80 ${
                          isActiveLink("/gamification") 
                            ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500" 
                            : ""
                        }`}
                      >
                        <Trophy className="h-4 w-4" />
                        Gamification
                      </Link>
                    </li>
                    <li onClick={() => setSidebar(false)}>
                      <Link 
                        href="/research"
                        className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 hover:bg-slate-100/80 ${
                          isActiveLink("/research") 
                            ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500" 
                            : ""
                        }`}
                      >
                        <BarChart3 className="h-4 w-4" />
                        Research
                      </Link>
                    </li>
                    <li onClick={() => setSidebar(false)}>
                      <Link 
                        href="/content-ingestion"
                        className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 hover:bg-slate-100/80 ${
                          isActiveLink("/content-ingestion") 
                            ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500" 
                            : ""
                        }`}
                      >
                        <Upload className="h-4 w-4" />
                        Content Ingestion
                      </Link>
                    </li>
                    <li onClick={() => setSidebar(false)}>
                      <Link 
                        href="/code-editor"
                        className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 hover:bg-slate-100/80 ${
                          isActiveLink("/code-editor") 
                            ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500" 
                            : ""
                        }`}
                      >
                        <Code2 className="h-4 w-4" />
                        Code Editor
                      </Link>
                    </li>
                    <li onClick={() => setSidebar(false)}>
                      <Link 
                        href="/youtube-course"
                        className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 hover:bg-slate-100/80 ${
                          isActiveLink("/youtube-course") 
                            ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500" 
                            : ""
                        }`}
                      >
                        <Youtube className="h-4 w-4" />
                        YouTube Course
                      </Link>
                    </li>
                    <li onClick={() => setSidebar(false)}>
                      <Link 
                        href="/features"
                        className={`block py-2 px-3 rounded-lg transition-all duration-200 hover:bg-slate-100/80 ${
                          pathname?.startsWith("/features") 
                            ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500" 
                            : ""
                        }`}
                      >
                        Features
                      </Link>
                    </li>
                    <li onClick={() => setSidebar(false)}>
                      <Link 
                        href="/demo"
                        className={`block py-2 px-3 rounded-lg transition-all duration-200 hover:bg-slate-100/80 ${
                          isActiveLink("/demo") 
                            ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500" 
                            : ""
                        }`}
                      >
                        See demo
                      </Link>
                    </li>
                    <li onClick={() => setSidebar(false)}>
                      <Link 
                        href="/contact"
                        className={`block py-2 px-3 rounded-lg transition-all duration-200 hover:bg-slate-100/80 ${
                          isActiveLink("/contact") 
                            ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500" 
                            : ""
                        }`}
                      >
                        Contact
                      </Link>
                    </li>
                  </ul>

                  {/* Google Translate */}
                  <div className="mt-4 ml-4 pt-4 border-t border-slate-200/50">
                    <div className="py-2 px-3">
                      <p className="text-sm font-medium mb-2">Translate</p>
                      <GoogleTranslate />
                    </div>
                  </div>
                </nav>
              ) : (
                <nav>
                  <ul className="flex flex-col max-md:text-lg ml-4 gap-3 ">
                    <li
                      onClick={() => {
                        setSidebar(false);
                        document.getElementById("features")?.scrollIntoView({
                          behavior: "smooth",
                        });
                      }}
                    >
                      <Link href="#features" scroll={false}>
                        Features
                      </Link>
                    </li>
                    <li
                      onClick={() => {
                        setSidebar(false);
                        document
                          .getElementById("how-it-works")
                          ?.scrollIntoView({
                            behavior: "smooth",
                          });
                      }}
                    >
                      <Link href="#how-it-works" scroll={false}>
                        How to use
                      </Link>
                    </li>
                    <li
                      onClick={() => {
                        setSidebar(false);
                        document.getElementById("faq")?.scrollIntoView({
                          behavior: "smooth",
                        });
                      }}
                    >
                      <Link href="#faq" scroll={false}>
                        FAQs
                      </Link>
                    </li>

                    <li onClick={() => setSidebar(false)}>
                      <Link href="/contact">Contact</Link>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
            <div className="p-4 pt-3 border-t border-slate-200/20 bg-background/95">
              <div className="flex items-center">
                {session ? (
                  <div className="flex items-center">
                    <Link href={"/profile"} onClick={() => setSidebar(false)}>
                      <Avatar className={"w-7 mx-1 h-7"}>
                        <AvatarImage src={session?.user.image} alt={"logo"} />
                        <AvatarFallback>
                          {session?.user.name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <Button
                      onClick={toggleTheme}
                      variant={"ghost"}
                      className="border-0 ml-2 hover:bg-slate-100/80 transition-all duration-200"
                    >
                      {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </Button>
                    <Logout onConfirm={signOutUser}></Logout>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={toggleTheme}
                      variant={"ghost"}
                      className="border-0 ml-2 hover:bg-slate-100/80 transition-all duration-200"
                    >
                      {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </Button>
                    <Link href="/login" onClick={() => setSidebar(false)}>
                      <Button size="sm" >
                        <LogIn className="w-4 h-4 mr-1"></LogIn>Login
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
        <div className="sm:w-[120px] w-[50px]">
          <button
            className="cursor-pointer p-2 rounded-lg hover:bg-slate-100/80 transition-all duration-200 text-2xl"
            onClick={(e) => {
              setSidebar(true);
              e.stopPropagation();
            }}
          >
            <CgDetailsMore />
          </button>
        </div>

        <div className="flex items-center gap-1 ">
          <Link
            href={session ? `/roadmap` : "/"}
            className="flex gap-1 items-center hover:scale-105 transition-transform duration-200"
          >
            <Image
              src="/InnoVision_LOGO-removebg-preview.png"
              alt="logo"
              width={48}
              height={48}
            />

            <h2 className="text-xl md:text-3xl font-extrabold">InnoVision</h2>
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:w-auto w-22 justify-center">
          {session && (
            <>
              <div className="flex gap-2 items-center relative rounded-2xl border-2 px-4 py-2 border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
                <Sparkles className="h-4 w-4 text-green-500" />
                <span className="text-green-900 dark:text-green-400 font-bold">
                  {xp}
                  {show && (
                    <AnimatePresence>
                      <motion.div
                        initial={{
                          opacity: 0,
                          scale: 0.5,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          y: 0,
                        }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{
                          duration: 0.3,
                          ease: "easeOut",
                        }}
                        className="absolute text-green-600 right-0 w-7"
                      >
                        <p>+{changed}</p>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </span>
              </div>
              <div className="flex gap-2 items-center rounded-2xl border-2 px-4 py-2 border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-orange-600 dark:text-orange-400 font-bold">
                  {streak}
                </span>
              </div>
            </>
          )}
          <div className="max-sm:hidden flex items-center gap-2">
            <Button
              onClick={toggleTheme}
              variant={"ghost"}
              className="border-0 hover:bg-slate-100/80 transition-all duration-200 p-2"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            {session ? (
              <Link href={"/profile"} className="hover:scale-110 transition-transform duration-200">
                <Avatar className="w-8 h-8 ring-2 ring-blue-500/20 hover:ring-blue-500/40 transition-all duration-200">
                  <AvatarImage src={session?.user.image} alt={"logo"} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {session?.user.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
