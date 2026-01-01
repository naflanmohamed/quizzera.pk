import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Filter,
  BookOpen,
  FileQuestion,
  ScrollText,
  Calculator,
  BookMarked,
  Files,
  Crown,
} from "lucide-react";
import { api, PdfResource, Category } from "@/services/api";
import {Navbar} from "@/components/layout/Navbar";
import {Footer} from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const resourceTypeIcons: Record<string, React.ReactNode> = {
  notes: <BookOpen className="h-5 w-5" />,
  past_paper: <FileQuestion className="h-5 w-5" />,
  syllabus: <ScrollText className="h-5 w-5" />,
  formula_sheet: <Calculator className="h-5 w-5" />,
  guide: <BookMarked className="h-5 w-5" />,
  other: <Files className="h-5 w-5" />,
};

const resourceTypeLabels: Record<string, string> = {
  notes: "Notes",
  past_paper: "Past Papers",
  syllabus: "Syllabus",
  formula_sheet: "Formula Sheets",
  guide: "Study Guides",
  other: "Other",
};

const Resources = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load resources",
        variant: "destructive",
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
    } catch (error) {
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-light py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 mt-10">Study Resources</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Access high-quality study materials, past papers, notes, and more to ace your exams
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
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
                <SelectTrigger className="w-full md:w-48">
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

              <Button type="submit">
                <Filter className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resource Type Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {Object.entries(resourceTypeLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={selectedType === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(key)}
              className="gap-2"
            >
              {resourceTypeIcons[key]}
              {label}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Showing {filteredResources.length} resources
          </p>
        </div>

        {/* Resources Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Resources Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search query
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {resourceTypeIcons[resource.resourceType] || <FileText className="h-5 w-5" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg line-clamp-2">
                          {resource.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {resourceTypeLabels[resource.resourceType]}
                          </Badge>
                          {resource.isPremium && (
                            <Badge className="bg-amber-500 text-white text-xs">
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {resource.description || "No description available"}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {resource.viewCount} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {resource.downloadCount} downloads
                    </span>
                  </div>

                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {resource.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    onClick={() => handleDownload(resource)}
                    disabled={resource.isPremium}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {resource.isPremium ? "Premium Only" : "Download PDF"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Resources;
