import PptxGenJS from "pptxgenjs";

let pres = new PptxGenJS();
pres.author = "Neural Library Team";
pres.company = "Smart AI Solutions";
pres.revision = "1";
pres.subject = "Neural Library Project Report";
pres.title = "Neural Library Presentation";

// Define standard slide layout and background
pres.layout = 'LAYOUT_16x9';

// Slide 1: Title
let slide1 = pres.addSlide();
slide1.background = { color: "030712" }; // Midnight Aurora base
slide1.addText("Neural Library", { x: 1, y: 2, w: '80%', fontSize: 48, bold: true, color: "22d3ee", align: 'center' });
slide1.addText("An AI-Powered Smart Library System", { x: 1, y: 3.2, w: '80%', fontSize: 24, color: "f9fafb", align: 'center' });
slide1.addText("Project Report & Overview", { x: 1, y: 4.5, w: '80%', fontSize: 18, color: "a78bfa", align: 'center' });

// Slide 2: Introduction
let slide2 = pres.addSlide();
slide2.background = { color: "0f172a" };
slide2.addText("Introduction", { x: 0.5, y: 0.5, w: '90%', fontSize: 36, bold: true, color: "22d3ee" });
slide2.addText([
  { text: "The Neural Library is a next-generation web application designed to revolutionize how readers discover, consume, and manage books.\n\n" },
  { text: "By leveraging large language models (LLMs), it acts as a personalized, hyper-intelligent librarian that understands context, tone, and abstract human desires rather than just relying on simple keyword matching." }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 20, color: "f9fafb", bullet: true });

// Slide 3: Problem Statement
let slide3 = pres.addSlide();
slide3.background = { color: "0f172a" };
slide3.addText("Problem Statement", { x: 0.5, y: 0.5, w: '90%', fontSize: 36, bold: true, color: "f472b6" });
slide3.addText([
  { text: "Information Overload: Millions of books exist, making it difficult for readers to find titles that truly resonate with them.\n\n" },
  { text: "Rigid Search Systems: Traditional libraries and bookstores rely on strict Title/Author or Tag searches. If you search for 'books about feeling lonely in space', traditional systems fail.\n\n" },
  { text: "Lack of Context: Current recommendation algorithms push popular books rather than highly personalized, deeply reasoned suggestions." }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 20, color: "f9fafb", bullet: { type: 'number' } });

// Slide 4: The Solution
let slide4 = pres.addSlide();
slide4.background = { color: "0f172a" };
slide4.addText("The Solution: Neural Library", { x: 0.5, y: 0.5, w: '90%', fontSize: 36, bold: true, color: "a78bfa" });
slide4.addText([
  { text: "We developed a dynamic system where the Google Gemini AI acts as the core reasoning engine.\n\n" },
  { text: "Semantic Search: Users can describe what they want naturally, and the AI computes the exact real-world books that match.\n\n" },
  { text: "Dynamic Discovery: The system automatically generates reading roadmaps, instant summaries, and key takeaways for any book in existence." }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 20, color: "f9fafb", bullet: true });

// Slide 5: Key Features
let slide5 = pres.addSlide();
slide5.background = { color: "0f172a" };
slide5.addText("Key Features", { x: 0.5, y: 0.5, w: '90%', fontSize: 36, bold: true, color: "22d3ee" });
slide5.addText([
  { text: "Interactive Chat Librarian: Chat with the AI about your reading history and ask questions.", options: { bullet: true } },
  { text: "AI Learning Roadmaps: Generate step-by-step (Beginner/Inter/Adv) curricula for any topic.", options: { bullet: true } },
  { text: "Gamification: Earn badges and track reading streaks in your User Profile.", options: { bullet: true } },
  { text: "Custom Personas: Change the AI's tone (e.g., Sarcastic, Academic, Geeky).", options: { bullet: true } },
  { text: "Voice Interface: Integrated Text-to-Speech (TTS) and Speech-to-Text (STT).", options: { bullet: true } },
  { text: "Global Trending: See what other platform users are reading in real-time.", options: { bullet: true } }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 20, color: "f9fafb" });

// Slide 6: Technology Stack
let slide6 = pres.addSlide();
slide6.background = { color: "0f172a" };
slide6.addText("Technology Stack", { x: 0.5, y: 0.5, w: '90%', fontSize: 36, bold: true, color: "a78bfa" });
slide6.addText([
  { text: "Frontend Framework: React.js (Vite) for blazing fast UI.", options: { bullet: true } },
  { text: "Styling: Vanilla CSS with custom 'Midnight Aurora' glassmorphism.", options: { bullet: true } },
  { text: "Animations: Framer Motion for liquid-smooth transitions.", options: { bullet: true } },
  { text: "Backend/Database: Firebase Auth (Google Login) & Cloud Firestore (NoSQL).", options: { bullet: true } },
  { text: "AI Engine: Google Gemini API (gemini-2.5-flash) for reasoning and NLP.", options: { bullet: true } },
  { text: "Metadata API: Google Books API for live cover images and descriptions.", options: { bullet: true } }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 20, color: "f9fafb" });

// Slide 7: Total Cost
let slide7 = pres.addSlide();
slide7.background = { color: "0f172a" };
slide7.addText("Total Cost & Scalability", { x: 0.5, y: 0.5, w: '90%', fontSize: 36, bold: true, color: "f472b6" });
slide7.addText([
  { text: "Current Development Cost: $0", options: { bold: true } },
  { text: " - React/Vite/Node: Free & Open Source\n - Firebase (Spark Plan): Free up to 50k reads/day\n - Google Books API: Free limit of 1,000 requests/day\n - Gemini API: Free tier covers heavy development traffic\n\n" },
  { text: "Production Scalability:", options: { bold: true } },
  { text: " - Serverless architecture means the application scales infinitely.\n - Production costs will scale strictly with user volume (Pay-as-you-go Gemini API and Firebase usage)." }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 18, color: "f9fafb" });

// Slide 8: Future Development
let slide8 = pres.addSlide();
slide8.background = { color: "0f172a" };
slide8.addText("Future Development", { x: 0.5, y: 0.5, w: '90%', fontSize: 36, bold: true, color: "22d3ee" });
slide8.addText([
  { text: "Social Networking: Allow users to follow each other, share roadmaps, and compare reading stats.\n\n" },
  { text: "E-Commerce Integration: Add direct links to purchase physical books from Amazon or local stores.\n\n" },
  { text: "Offline Mobile App: Compile the React application into React Native for iOS and Android deployment.\n\n" },
  { text: "Audiobook Syncing: Integrate with Spotify or Audible to directly stream summaries." }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 20, color: "f9fafb", bullet: true });

// Slide 9: Commercial Use / Merchandise
let slide9 = pres.addSlide();
slide9.background = { color: "0f172a" };
slide9.addText("Commercializing & Merchandising", { x: 0.5, y: 0.5, w: '90%', fontSize: 36, bold: true, color: "a78bfa" });
slide9.addText([
  { text: "Affiliate Marketing: Every book recommended by the AI can include an Amazon Affiliate link. The platform earns 4-8% on every book purchased.\n\n" },
  { text: "Subscription Model: 'Neural Library Pro' for $4.99/mo to unlock unlimited AI queries, advanced gamification, and exclusive AI Personas.\n\n" },
  { text: "Physical Merchandise: Sell highly customized reading journals, 'AI Librarian' branded mugs, and tote bags for avid book readers directly through the app." }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 20, color: "f9fafb", bullet: true });

// Slide 10: Conclusion
let slide10 = pres.addSlide();
slide10.background = { color: "030712" };
slide10.addText("Thank You", { x: 1, y: 2.5, w: '80%', fontSize: 48, bold: true, color: "22d3ee", align: 'center' });
slide10.addText("Ready to revolutionize reading?", { x: 1, y: 3.5, w: '80%', fontSize: 24, color: "f9fafb", align: 'center' });

// Save the presentation
pres.writeFile({ fileName: "Neural_Library_Project_Report.pptx" }).then(fileName => {
    console.log(`created file: ${fileName}`);
});
