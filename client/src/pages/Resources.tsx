import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  BookOpen,
  FileQuestion,
  ScrollText,
  Calculator,
  BookMarked,
  Files,
  Crown,
  Sparkles,
  ArrowRight,
  X
} from "lucide-react";
import { api, PdfResource, Category } from "@/services/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";

const resourceTypeIcons: Record<string, React.ReactNode> = {
  notes: <BookOpen className="h-5 w-5" />,
  past_paper: <FileQuestion className="h-5 w-5" />,
  syllabus: <ScrollText className="h-5 w-5" />,
  formula_sheet: <Calculator className="h-5 w-5" />,
  book: <BookMarked className="h-5 w-5" />,
  other: <Files className="h-5 w-5" />,
};

const resourceTypeLabels: Record<string, string> = {
  notes: "Notes",
  past_paper: "Past Papers",
  syllabus: "Syllabus",
  formula_sheet: "Formula Sheets",
  book: "Books",
  other: "Other",
};

const Resources = () => {
  const [searchParams] = useSearchParams();
  const [resources, setResources] = useState<PdfResource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "all");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedType]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resourcesData, categoriesData] = await Promise.all([
        api.getPdfs({
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          resourceType: selectedType !== "all" ? selectedType : undefined,
          search: searchQuery || undefined,
        }),
        api.getCategories(),
      ]);
      setResources(resourcesData.pdfs);
      setCategories(categoriesData);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load resources",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleDownload = async (resource: PdfResource) => {
    try {
      const downloadUrl = await api.downloadPdf(resource._id);
      window.open(downloadUrl, "_blank");
      toast({
        title: "Download Started",
        description: `Downloading ${resource.title}`,
      });
    } catch {
      toast({
        title: "Download Failed",
        description: "Unable to download this resource",
        variant: "destructive",
      });
    }
  };

  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <BookOpen className="w-4 h-4" />
                <span>Extensive Learning Library</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
                 Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-accent">Potential</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Access high-quality study materials, past papers, notes, and more. 
                Everything you need to master your subjects in one place.
              </p>

              {/* Stats Preview */}
              <div className="flex justify-center gap-8 pt-4">
                <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-foreground">500+</span>
                    <span className="text-sm text-muted-foreground">Resources</span>
                </div>
                <div className="w-px h-12 bg-border/50" />
                <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-foreground">50k+</span>
                    <span className="text-sm text-muted-foreground">Downloads</span>
                </div>
                <div className="w-px h-12 bg-border/50" />
                 <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-foreground">Free</span>
                    <span className="text-sm text-muted-foreground">Forever</span>
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
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-transparent border-transparent focus-visible:ring-0 text-base placeholder:text-muted-foreground/70"
                />
              </div>
              <Button className="h-12 px-8 rounded-xl bg-primary hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/25" onClick={handleSearch}>
                  Search
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto items-center justify-between mt-6">
               <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                 <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[200px] h-11 bg-background/60 backdrop-blur-xl border-primary/20 hover:border-primary/50 transition-all focus:ring-primary/20">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full md:w-[200px] h-11 bg-background/60 backdrop-blur-xl border-primary/20 hover:border-primary/50 transition-all focus:ring-primary/20">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(resourceTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
               </div>

                {/* Clear Filters */}
                {(selectedCategory !== "all" || selectedType !== "all" || searchQuery) && (
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedType("all");
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
              <Sparkles className="w-6 h-6 text-primary" />
              Available Resources
            </h2>
            <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">
              Showing {filteredResources.length} results
            </Badge>
          </div>

          {/* Resources Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
               Array.from({ length: 8 }).map((_, i) => (
                   <Card key={i} className="h-[280px] animate-pulse bg-muted/20 border-0">
                      <CardContent className="p-6 h-full flex flex-col">
                        <Skeleton className="h-10 w-10 mb-4 rounded-lg" />
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-auto" />
                        <Skeleton className="h-10 w-full mt-4" />
                      </CardContent>
                   </Card>
               ))
            ) : filteredResources.length === 0 ? (
                <div className="col-span-full py-20 text-center glass rounded-3xl border border-dashed border-primary/20">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                     <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No resources found</h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find any resources matching your criteria.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSelectedType("all");
                    }}
                    className="hover:bg-primary/5 border-primary/20 hover:border-primary/50"
                  >
                    Clear filters
                  </Button>
                </div>
            ) : (
                filteredResources.map((resource) => (
                  <Card 
                    key={resource._id}
                    className="group h-full border border-border/50 bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-card hover:-translate-y-1 overflow-hidden relative flex flex-col"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <CardContent className="p-6 relative flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-6">
                         <div className={`
                           w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm
                           ${resource.isPremium ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'}
                         `}>
                           {resourceTypeIcons[resource.resourceType] || <FileText className="w-6 h-6" />}
                         </div>
                         <div className="flex gap-2">
                             {resource.isPremium && (
                                <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-0">
                                   <Crown className="w-3 h-3 mr-1" />
                                   Premium
                                </Badge>
                             )}
                             <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                                {resourceTypeLabels[resource.resourceType]}
                             </Badge>
                         </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {resource.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed flex-1">
                        {resource.description || "No description available"}
                      </p>
  
                      <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border/50 pt-4 mb-4">
                        <span className="flex items-center gap-1.5 ">
                          <Eye className="w-3.5 h-3.5" />
                          {resource.viewCount}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Download className="w-3.5 h-3.5" />
                          {resource.downloadCount}
                        </span>
                         {resource.fileSize > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded bg-muted">
                                {Math.round(resource.fileSize / 1024)} KB
                            </span>
                         )}
                      </div>

                       <Button 
                        className={`w-full ${resource.isPremium ? 'bg-amber-600 hover:bg-amber-700' : ''} shadow-lg`}
                        variant={resource.isPremium ? 'default' : 'outline'}
                        onClick={() => handleDownload(resource)}
                      >
                         {resource.isPremium ? "Unlock Resource" : (resource.fileSize === 0 ? "Open Link" : "Download PDF")}
                         <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Resources;
