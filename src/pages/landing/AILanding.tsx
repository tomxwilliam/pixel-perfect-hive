import EnhancedLandingTemplate from "@/components/landing/EnhancedLandingTemplate";
import { Brain, Zap, Users, TrendingUp, Code, Settings, BarChart, MessageSquare } from "lucide-react";

export default function AILanding() {
  return (
    <EnhancedLandingTemplate
      title="AI Integration"
      subtitle="Supercharge Your Business with AI"
      intro="Transform your operations with intelligent AI solutions. Serving Edinburgh, Glasgow, and businesses across Scotland's Central Belt, we integrate cutting-edge AI – from customer support chatbots to predictive analytics – that delivers measurable results and competitive advantages."
      icon={<Brain className="h-4 w-4" />}
      
      heroStats={[
        { label: "AI Projects", value: "45+" },
        { label: "Support Tickets Reduced", value: "70%" },
        { label: "Process Efficiency", value: "+300%" },
        { label: "ROI Average", value: "450%" }
      ]}
      
      features={[
        "Intelligent chatbots & virtual assistants",
        "Process automation & workflow optimisation",
        "Predictive analytics & data insights",
        "Personalized recommendation engines",
        "Natural language processing",
        "Computer vision & image recognition",
        "Machine learning model training",
        "AI-powered decision making"
      ]}
      
      benefits={[
        "Reduce support costs by 70%",
        "Automate repetitive tasks completely",
        "Predict trends before competitors",
        "Increase sales with personalization",
        "Understand customer intent better",
        "Automate visual quality control",
        "Make smarter business decisions",
        "Scale operations without hiring"
      ]}
      
      techStack={[
        "OpenAI GPT-4", "Claude", "TensorFlow", "PyTorch", "Langchain", 
        "Pinecone", "Hugging Face", "AWS SageMaker", "Google AI", "Azure AI"
      ]}
      
      useCases={[
        { 
          title: "AI Customer Support", 
          text: "Intelligent chatbots that resolve 80% of tickets instantly, with seamless handoff to humans when needed.", 
          image: "/lovable-uploads/4a5f1662-f838-4873-8197-031303c450d6.png",
          metrics: "70% reduction in support costs"
        },
        { 
          title: "Smart Recommendations", 
          text: "Machine learning algorithms that personalize content, products, and offers to increase engagement and sales.", 
          image: "/lovable-uploads/dd670ca4-826a-4160-ab5e-3087f16b0177.png",
          metrics: "35% increase in conversion rates"
        },
        { 
          title: "Process Automation", 
          text: "Intelligent workflows that automate complex business processes, data entry, and decision-making tasks.", 
          image: "/lovable-uploads/5deb9273-b749-4781-803a-ac052ba93374.png",
          metrics: "90% time savings on manual tasks"
        },
      ]}
      
      testimonials={[
        {
          name: "Robert Chen",
          company: "TechSupport Pro",
          content: "The AI chatbot reduced our support tickets by 75% while improving customer satisfaction. It's like having 20 support agents working 24/7.",
          rating: 5
        },
        {
          name: "Maria Gonzalez",
          company: "RetailMax",
          content: "AI recommendations increased our sales by 40%. Customers love the personalized shopping experience and we love the revenue boost.",
          rating: 5
        },
        {
          name: "Alex Johnson",
          company: "DataFlow Industries",
          content: "The process automation saved us 30 hours per week. What used to take days now happens automatically with 99.9% accuracy.",
          rating: 5
        }
      ]}
      
      pricing={[
        {
          name: "AI Chatbot",
          price: "$8,999",
          period: "project",
          description: "Intelligent customer support that works 24/7",
          features: [
            "Custom trained chatbot",
            "Knowledge base integration",
            "Multi-platform deployment",
            "Analytics dashboard",
            "Human handoff system",
            "4 weeks delivery"
          ]
        },
        {
          name: "AI Automation Suite",
          price: "$19,999",
          period: "project",
          description: "Complete workflow automation with predictive analytics",
          features: [
            "Everything in AI Chatbot",
            "Process automation workflows",
            "Predictive analytics",
            "Recommendation engine",
            "Custom AI models",
            "8 weeks delivery"
          ],
          popular: true
        },
        {
          name: "Enterprise AI",
          price: "$39,999+",
          period: "project",
          description: "Full-scale AI transformation for your organization",
          features: [
            "Custom AI solutions",
            "Machine learning pipelines",
            "Computer vision systems",
            "Advanced analytics",
            "Staff training included",
            "Ongoing optimisation"
          ]
        }
      ]}
      
      process={[
        {
          title: "AI Strategy",
          description: "Identify the best AI opportunities and create a roadmap for maximum ROI.",
          icon: <TrendingUp className="h-8 w-8 text-primary" />
        },
        {
          title: "Data Preparation",
          description: "Clean, organise, and prepare your data for optimal AI model performance.",
          icon: <BarChart className="h-8 w-8 text-primary" />
        },
        {
          title: "Model Development",
          description: "Build, train, and fine-tune AI models specifically for your use case.",
          icon: <Code className="h-8 w-8 text-primary" />
        },
        {
          title: "Integration",
          description: "Seamlessly integrate AI into your existing systems with monitoring and optimisation.",
          icon: <Settings className="h-8 w-8 text-primary" />
        }
      ]}
      
      faq={[
        {
          question: "How do I know if my business needs AI?",
          answer: "If you have repetitive tasks, large amounts of data, customer service challenges, or want to personalize user experiences, AI can help. We offer a free consultation to identify opportunities."
        },
        {
          question: "How long does AI integration take?",
          answer: "Simple chatbots can be deployed in 4 weeks, while complex automation suites take 8-12 weeks. Enterprise AI transformations may take 16+ weeks depending on scope."
        },
        {
          question: "Do you provide training for our team?",
          answer: "Yes! We include comprehensive training for your team on how to use, maintain, and optimise the AI systems we build. We also provide ongoing support and updates."
        },
        {
          question: "What kind of ROI can we expect from AI?",
          answer: "Our clients typically see 200-500% ROI within the first year through cost savings, efficiency gains, and revenue increases. We'll provide specific projections based on your use case."
        }
      ]}
      
      ctaLabel="Start Your AI Project"
      secondaryCtaLabel="AI Strategy Call"
      secondaryCtaHref="/contact"
      
      seo={{
        title: "AI Integration Edinburgh & Glasgow | Scotland | 404 Code Lab",
        description: "AI integration services across Scotland's Central Belt. Custom AI solutions for Edinburgh and Glasgow businesses. Chatbots, automation, predictive analytics, machine learning. Reduce costs and boost efficiency.",
      }}
    />
  );
}
