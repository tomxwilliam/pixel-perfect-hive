import EnhancedLandingTemplate from "@/components/landing/EnhancedLandingTemplate";
import { Gamepad2, Star, TrendingUp, Zap, Users, Palette, Code, Play } from "lucide-react";

export default function GamesLanding() {
  return (
    <EnhancedLandingTemplate
      title="Mobile Game Development"
      subtitle="Create Games That Players Can't Put Down"
      intro="From addictive puzzle games to immersive adventures, we craft mobile games that captivate players and generate serious revenue. Beautiful art, engaging gameplay, and smart monetization strategies."
      icon={<Gamepad2 className="h-4 w-4" />}
      
      heroStats={[
        { label: "Games Published", value: "35+" },
        { label: "Total Downloads", value: "5M+" },
        { label: "Average Rating", value: "4.6★" },
        { label: "Revenue Generated", value: "$2M+" }
      ]}
      
      features={[
        "Addictive game mechanics & loops",
        "Stunning 2D/3D art & animations",
        "Balanced monetization strategies",
        "Social features & leaderboards",
        "Live events & content updates",
        "Advanced analytics & A/B testing",
        "Cross-platform development",
        "App Store optimization"
      ]}
      
      benefits={[
        "Create engaging player experiences",
        "Stand out with professional visuals",
        "Generate revenue from day one",
        "Build active gaming communities",
        "Keep players coming back",
        "Optimize for maximum retention",
        "Reach iOS and Android users",
        "Rank higher in app stores"
      ]}
      
      techStack={[
        "Unity", "Unreal Engine", "React Native", "C#", "JavaScript", 
        "Firebase", "PlayFab", "GameAnalytics", "AdMob", "App Store Connect"
      ]}
      
      useCases={[
        { 
          title: "Idle Clicker Game", 
          text: "Addictive progression mechanics with offline earnings, prestige systems, and regular events to maximize retention.", 
          image: "/lovable-uploads/40db8b65-10fc-4b8a-bdbe-0c197159ca3a.png",
          metrics: "85% day-7 retention rate"
        },
        { 
          title: "Match-3 Puzzle", 
          text: "Classic puzzle gameplay with modern twists, power-ups, and social features that keep players engaged for months.", 
          image: "/lovable-uploads/9bf1d85f-9e5f-4fb0-9ce8-f74db644a586.png",
          metrics: "1M+ downloads in 6 months"
        },
        { 
          title: "Arcade Adventure", 
          text: "Fast-paced action with stunning visuals, achievement systems, and multiplayer competitions.", 
          image: "/lovable-uploads/de1286a6-6683-4438-a78c-c5995a51478e.png",
          metrics: "$50K monthly revenue"
        },
      ]}
      
      testimonials={[
        {
          name: "Tommy Lee",
          company: "Indie Game Studio",
          content: "Our puzzle game hit #1 in the App Store! The team's expertise in game mechanics and monetization was game-changing.",
          rating: 5
        },
        {
          name: "Sarah Martinez",
          company: "PlayTime Games",
          content: "They delivered a beautiful idle game that's generated over $200K in revenue. The art and gameplay are absolutely stunning.",
          rating: 5
        },
        {
          name: "Kevin Wong",
          company: "Mobile Gaming Co",
          content: "The arcade game they built has maintained 4.8 stars with over 500K downloads. Players love the smooth gameplay and graphics.",
          rating: 5
        }
      ]}
      
      pricing={[
        {
          name: "Casual Game",
          price: "$24,999",
          period: "project",
          description: "Simple, addictive games perfect for broad audiences",
          features: [
            "Puzzle, idle, or arcade gameplay",
            "Professional 2D art & animations",
            "Basic monetization (ads + IAP)",
            "Social features & leaderboards",
            "iOS & Android deployment",
            "12 weeks delivery"
          ]
        },
        {
          name: "Premium Game",
          price: "$49,999",
          period: "project",
          description: "Full-featured games with advanced mechanics and content",
          features: [
            "Everything in Casual Game",
            "Advanced gameplay systems",
            "3D graphics & effects",
            "Live events & updates",
            "Advanced analytics",
            "16 weeks delivery"
          ],
          popular: true
        },
        {
          name: "AAA Mobile Game",
          price: "$99,999+",
          period: "project",
          description: "Console-quality games with cutting-edge features",
          features: [
            "Complex gameplay systems",
            "Stunning 3D graphics",
            "Multiplayer functionality",
            "Backend infrastructure",
            "Marketing asset creation",
            "Ongoing live ops support"
          ]
        }
      ]}
      
      process={[
        {
          title: "Concept",
          description: "Game design, mechanics planning, and market research to ensure commercial success.",
          icon: <Users className="h-8 w-8 text-primary" />
        },
        {
          title: "Art & Design",
          description: "Beautiful visual design, character creation, and UI/UX that enhances gameplay.",
          icon: <Palette className="h-8 w-8 text-primary" />
        },
        {
          title: "Development",
          description: "Programming core systems, implementing features, and rigorous testing.",
          icon: <Code className="h-8 w-8 text-primary" />
        },
        {
          title: "Launch & Optimize",
          description: "App Store optimization, soft launch testing, and ongoing content updates.",
          icon: <Play className="h-8 w-8 text-primary" />
        }
      ]}
      
      faq={[
        {
          question: "How much does mobile game development cost?",
          answer: "Game development costs vary widely based on complexity. Simple casual games start at $24,999, while premium games with advanced features cost $49,999+. We'll provide a detailed quote based on your vision."
        },
        {
          question: "How long does it take to develop a mobile game?",
          answer: "Development time depends on game complexity. Casual games take 12-16 weeks, premium games take 16-24 weeks, and AAA mobile games can take 6+ months."
        },
        {
          question: "Do you help with game monetization?",
          answer: "Absolutely! We implement proven monetization strategies including in-app purchases, rewarded ads, battle passes, and subscription models. We optimize for both user experience and revenue."
        },
        {
          question: "Will you handle App Store submission and marketing?",
          answer: "Yes! We manage the complete App Store and Google Play submission process, create marketing assets, and provide guidance on user acquisition and ASO (App Store Optimization)."
        }
      ]}
      
      ctaLabel="Start Your Game Project"
      secondaryCtaLabel="View Game Portfolio"
      secondaryCtaHref="/game-portfolio"
      
      seo={{
        title: "Professional Mobile Game Development | Unity & Unreal | 404 Code Lab",
        description: "Custom mobile game development for iOS and Android. Engaging gameplay, stunning graphics, monetization strategies. From concept to App Store success.",
      }}
    />
  );
}
