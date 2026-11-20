export const site = {
  name: "KKEngravingsX",
  tagline: "Personalized Creations, Made to Remember",
  creator: "Kaundinya Kapila",

  biography: [
    "Meet Kaundinya Kapila, the young creative mind behind KKEngravingsX. At just 14 years old and currently in high school, Kaundinya is exploring his passion for creativity through personalized engravings and unique handcrafted designs. KKEngravingsX is a place where imagination meets craftsmanship, turning simple ideas into meaningful keepsakes.",
  ],

  // Leave these empty strings until real values are available.
  // Components render a "coming soon" placeholder for any empty value.
  contact: {
    email: "",
    whatsapp: "", // full international number, digits only, e.g. "15551234567"
  },

  social: {
    instagram: "", // handle only, no "@"
    facebook: "",  // handle or page slug
    etsy: "",      // shop slug
  },
};

export type SiteConfig = typeof site;
