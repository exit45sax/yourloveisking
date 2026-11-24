/*
  Your Love is King - a Tribute to Sade — site settings
  ------------------------------------------------------
  This is the one file to edit for everyday updates.
  Leave a value as "" (empty) and that item simply doesn't show.
*/
window.YLIK = {

  /* VIDEOS — paste the YouTube video ID (the part after "v=" or after "youtu.be/").
     The first one is the featured video, and also what "Watch with sound" plays. */
  videos: [
    { id: "", title: "Booking Reel", subtitle: "Live highlights · Nostalgia Fishtown" },
    { id: "", title: "Smooth Operator", subtitle: "Full song · Live" },
    { id: "", title: "Is It a Crime", subtitle: "Full song · Live" },
    { id: "", title: "No Ordinary Love", subtitle: "Live" }
  ],

  /* UPCOMING SHOWS — newest last is fine; the site sorts by date and hides past dates.
     Example: { date: "2027-02-13", venue: "Venue name", city: "Philadelphia, PA", tickets: "https://..." } */
  shows: [],

  /* PRESS KIT — link each file once it's uploaded (put PDFs in the /press folder).
     Empty = the card shows "Request" and opens an email instead. */
  presskit: {
    onesheet: "",
    stageplot: "",
    rider: "",
    photos: ""
  },

  /* BOOKING FORM — free Web3Forms access key (web3forms.com: enter the band email, the key is emailed to you).
     Empty = the form opens the visitor's email app with everything filled in. */
  web3formsKey: "",

  email: "YourLoveisKingSade@gmail.com",

  social: {
    instagram: "https://www.instagram.com/yourloveiskingsade/",
    facebook: "",
    tiktok: "",
    youtube: "",
    bandsintown: ""
  }
};
