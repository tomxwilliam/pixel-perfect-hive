import LetterGlitch from "@/components/LetterGlitch";

const Background = () => {
  return (
    <div className="fixed inset-0 w-full h-full">
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

export default Background;
