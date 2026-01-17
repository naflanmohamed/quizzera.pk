import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Clock, 
  FileQuestion,
  ArrowRight,
  Sparkles,
  Trophy,
  Target,
  X
} from "lucide-react";
import { api, ExamModel } from "@/services/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Exams = () => {
    const [exams, setExams] = useState<ExamModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPrice, setSelectedPrice] = useState("all");
    
    useEffect(() => {
        const fetchExams = async () => {
             setIsLoading(true);
             try {
                 const data = await api.getExamsList({ status: 'published' });
                 setExams(data.exams);
             } catch (error) {
                 console.error("Failed to load exams", error);
                 toast.error("Failed to load exams");
             } finally {
                 setIsLoading(false);
             }
        };
        fetchExams();
    }, []);

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPrice = selectedPrice === "all" 
      ? true 
      : selectedPrice === "free" 
        ? exam.price === 0 
        : exam.price > 0;

    return matchesSearch && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />
      
      <main className="pb-24">
        {/* Premium Hero Section */}
        <section className="relative pt-32 pb-40 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-background">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] animate-float" />
          </div>
          
          <div className="container relative mx-auto px-4 z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-primary font-medium text-sm mb-4 bg-white/50 dark:bg-black/20">
                <Sparkles className="w-4 h-4" />
                <span>Premium Exam Library</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
                 Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-accent">Skills</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Access our curated collection of professional practice exams. 
                Elevate your preparation with AI-powered insights and real-time performance tracking.
              </p>

              {/* Stats Preview */}
              <div className="flex justify-center gap-8 pt-4">
                <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-foreground">{exams.length}+</span>
                    <span className="text-sm text-muted-foreground">Active Exams</span>
                </div>
                <div className="w-px h-12 bg-border/50" />
                <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-foreground">10k+</span>
                    <span className="text-sm text-muted-foreground">Students</span>
                </div>
                <div className="w-px h-12 bg-border/50" />
                 <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-foreground">95%</span>
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Content Section */}
        <div className="container mx-auto px-4 -mt-20 relative z-20">
          {/* Glass Search Bar */}
          <div className="max-w-4xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="p-2 rounded-2xl glass border border-white/20 shadow-glow flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for exam topics, titles, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-transparent border-transparent focus-visible:ring-0 text-base placeholder:text-muted-foreground/70"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto items-center justify-between mt-6">
               <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                 {/* Price Filter */}
                 <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                    <SelectTrigger className="w-full md:w-[200px] h-11 bg-background/60 backdrop-blur-xl border-primary/20 hover:border-primary/50 transition-all focus:ring-primary/20">
                      <SelectValue placeholder="Price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                 </Select>
               </div>

               {/* Clear Filters */}
               {(selectedPrice !== "all" || searchQuery) && (
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setSelectedPrice("all");
                      setSearchQuery("");
                    }}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Clear Filters
                    <X className="w-4 h-4 ml-2" />
                  </Button>
               )}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Available Exams
            </h2>
            <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">
              Showing {filteredExams.length} results
            </Badge>
          </div>

          {/* Exams Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
                 Array.from({ length: 8 }).map((_, i) => (
                     <Card key={i} className="h-[320px] animate-pulse bg-muted/20 border-0" />
                 ))
            ) : filteredExams.length === 0 ? (
                <div className="col-span-full py-20 text-center glass rounded-3xl border border-dashed border-primary/20">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                     <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No exams found</h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find any exams matching "{searchQuery}"
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedPrice("all");
                    }}
                    className="hover:bg-primary/5 border-primary/20 hover:border-primary/50"
                  >
                    Clear filters
                  </Button>
                </div>
            ) : (
                filteredExams.map((exam) => (
                  <Link 
                    key={exam._id} 
                    to={`/exams/${exam._id}`}
                    className="block group"
                  >
                    <Card className="h-full border border-border/50 bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-card hover:-translate-y-1 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <CardContent className="p-6 relative">
                        <div className="flex items-start justify-between mb-6">
                           <div className={`
                             w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm
                             ${exam.price === 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-primary/10 text-primary'}
                           `}>
                             {exam.price === 0 ? <Sparkles className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
                           </div>
                           <Badge 
                            className={`
                              px-3 py-1 text-sm font-medium border-0
                              ${exam.price === 0 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors'}
                            `}
                           >
                              {exam.price === 0 ? "Free" : `$${exam.price}`}
                           </Badge>
                        </div>
                        
                        <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                          {exam.title}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                          {exam.description}
                        </p>
    
                        <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border/50 pt-4">
                          <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                            <FileQuestion className="w-3.5 h-3.5" />
                            {exam.quizzes?.length || 0} Qs
                          </span>
                          <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                            <Clock className="w-3.5 h-3.5" />
                            {exam.duration}m
                          </span>
                        </div>
                        
                         <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                             <ArrowRight className="w-5 h-5 text-primary" />
                         </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Exams;
