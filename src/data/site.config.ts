export const site = {
  name: "KK Engravings",
  tagline: "Personalized Creations, Made to Remember",
  creator: "Kaundinya Kapila",

  biography: [
    "Hi, I’m Kaundinya Kapila, the creator behind KK Engravings. I’m 14, currently in high school, and exploring my passion for creativity through personalized engravings and handcrafted designs. KK Engravings is where I turn simple ideas into meaningful keepsakes, one piece at a time.",
  ],

  // Leave these empty strings until real values are available.
  // Components render a "coming soon" placeholder for any empty value.
  contact: {
    email: "kkengravings@gmail.com",
    whatsapp: "", // full international number, digits only, e.g. "15551234567"
  },

  social: {
    instagram: "", // handle only, no "@"
    facebook: "",  // handle or page slug
    etsy: "",      // shop slug
  },
};

export type SiteConfig = typeof site;
