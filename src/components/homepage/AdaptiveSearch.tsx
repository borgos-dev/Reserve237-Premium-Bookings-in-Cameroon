"use client";

import { useState } from "react";
import { useCategoryStore } from "@/stores";
import { useLanguage } from "@/contexts/LanguageContext";
import { RiMapPinLine, RiCalendarLine, RiTimeLine, RiTeamLine, RiBuildingLine } from "react-icons/ri";
import { motion, AnimatePresence } from "motion/react";

const optionStyle = { color: "#1F2A2A", backgroundColor: "#F8F1EA" };

export function AdaptiveSearch() {
  const { selectedCategory } = useCategoryStore();
  const { lang } = useLanguage();
  const fr = lang === "fr";

  const [formData, setFormData] = useState({
    location: "", date: "", time: "", guests: "",
  });

  const locationPlaceholder = fr ? "Ville ou quartier" : "Location";

  const renderFields = () => {
    switch (selectedCategory) {
      case "nightlife":
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <RiMapPinLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input type="text" placeholder={locationPlaceholder} className="input-field pl-10" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            </div>
            <div className="relative">
              <RiCalendarLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input type="date" className="input-field pl-10" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div className="relative">
              <RiTimeLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input type="time" className="input-field pl-10" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
            </div>
            <div className="relative">
              <RiTeamLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <select className="input-field pl-10 appearance-none" value={formData.guests} onChange={(e) => setFormData({ ...formData, guests: e.target.value })}>
                <option value="" style={optionStyle}>{fr ? "Nombre de personnes" : "Party Size"}</option>
                <option value="2" style={optionStyle}>{fr ? "2 personnes" : "2 people"}</option>
                <option value="4" style={optionStyle}>{fr ? "4 personnes" : "4 people"}</option>
                <option value="6" style={optionStyle}>{fr ? "6 personnes" : "6 people"}</option>
                <option value="8" style={optionStyle}>{fr ? "8+ personnes" : "8+ people"}</option>
              </select>
            </div>
          </div>
        );

      case "stays":
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <RiMapPinLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input type="text" placeholder={locationPlaceholder} className="input-field pl-10" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            </div>
            <div className="relative">
              <RiCalendarLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input type="date" className="input-field pl-10" placeholder={fr ? "Arrivée" : "Check-in"} />
            </div>
            <div className="relative">
              <RiCalendarLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input type="date" className="input-field pl-10" placeholder={fr ? "Départ" : "Check-out"} />
            </div>
            <div className="relative">
              <RiTeamLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <select className="input-field pl-10 appearance-none">
                <option value="" style={optionStyle}>{fr ? "Invités" : "Guests"}</option>
                <option value="1" style={optionStyle}>{fr ? "1 personne" : "1 guest"}</option>
                <option value="2" style={optionStyle}>{fr ? "2 personnes" : "2 guests"}</option>
                <option value="3" style={optionStyle}>{fr ? "3+ personnes" : "3+ guests"}</option>
              </select>
            </div>
          </div>
        );

      case "events":
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <RiMapPinLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input type="text" placeholder={locationPlaceholder} className="input-field pl-10" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            </div>
            <div className="relative">
              <RiCalendarLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input type="date" className="input-field pl-10" />
            </div>
            <div className="relative">
              <RiTeamLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <select className="input-field pl-10 appearance-none">
                <option value="" style={optionStyle}>{fr ? "Capacité" : "Capacity"}</option>
                <option value="50" style={optionStyle}>{fr ? "Jusqu'à 50" : "Up to 50"}</option>
                <option value="100" style={optionStyle}>50–100</option>
                <option value="200" style={optionStyle}>100–200</option>
                <option value="500" style={optionStyle}>200–500</option>
                <option value="unlimited" style={optionStyle}>500+</option>
              </select>
            </div>
            <div className="relative">
              <RiBuildingLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <select className="input-field pl-10 appearance-none">
                <option value="" style={optionStyle}>{fr ? "Type d'événement" : "Event Type"}</option>
                <option value="wedding" style={optionStyle}>{fr ? "Mariage" : "Wedding"}</option>
                <option value="corporate" style={optionStyle}>{fr ? "Entreprise" : "Corporate"}</option>
                <option value="party" style={optionStyle}>{fr ? "Fête" : "Party"}</option>
                <option value="conference" style={optionStyle}>{fr ? "Conférence" : "Conference"}</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="glass backdrop-blur-2xl rounded-3xl p-6 shadow-2xl max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedCategory}-${lang}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {renderFields()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
