import LetterGlitch from "@/components/LetterGlitch";

const HeroBackground = () => {
  return (
    <div className="min-h-screen w-full">
      <LetterGlitch 
        glitchSpeed={50} 
        centerVignette={true} 
        outerVignette={false} 
        smooth={true} 
        glitchColors={['#8B5CF6', '#1DD3DD', '#A78BFA']} 
      />
    </div>
  );
};

export default HeroBackground;
