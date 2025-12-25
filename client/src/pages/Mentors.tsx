import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle, Calendar, Star, GraduationCap, Briefcase } from "lucide-react";
import { useState } from "react";

const mentors = [
  {
    id: 1,
    name: "Dr. Sarah Ahmed",
    expertise: "MDCAT & Entry Tests",
    subjects: ["Biology", "Chemistry", "Physics"],
    experience: "12 years",
    rating: 4.9,
    students: 2500,
    avatar: "SA",
    bio: "Former PMDC examiner with expertise in medical entry test preparation.",
    available: true,
  },
  {
    id: 2,
    name: "Prof. Ali Hassan",
    expertise: "ECAT & Engineering",
    subjects: ["Mathematics", "Physics", "Computer Science"],
    experience: "15 years",
    rating: 4.8,
    students: 3200,
    avatar: "AH",
    bio: "Ph.D. in Applied Mathematics, specializing in engineering entrance exams.",
    available: true,
  },
  {
    id: 3,
    name: "Ms. Fatima Khan",
    expertise: "CSS & Government Exams",
    subjects: ["General Knowledge", "Current Affairs", "English"],
    experience: "8 years",
    rating: 4.9,
    students: 1800,
    avatar: "FK",
    bio: "CSS qualified officer helping aspirants clear competitive exams.",
    available: false,
  },
  {
    id: 4,
    name: "Mr. Usman Malik",
    expertise: "IELTS & English Proficiency",
    subjects: ["Speaking", "Writing", "Reading", "Listening"],
    experience: "10 years",
    rating: 4.7,
    students: 4100,
    avatar: "UM",
    bio: "British Council certified IELTS trainer with band 9 expertise.",
    available: true,
  },
  {
    id: 5,
    name: "Dr. Ayesha Siddiqui",
    expertise: "GAT & NTS Exams",
    subjects: ["Quantitative", "Verbal", "Analytical"],
    experience: "9 years",
    rating: 4.8,
    students: 2100,
    avatar: "AS",
    bio: "Expert in standardized testing and aptitude exam preparation.",
    available: true,
  },
  {
    id: 6,
    name: "Prof. Zain ul Abideen",
    expertise: "Academic Exams",
    subjects: ["Intermediate", "Matriculation", "O/A Levels"],
    experience: "20 years",
    rating: 4.9,
    students: 5500,
    avatar: "ZA",
    bio: "Veteran educator with decades of experience in board exam preparation.",
    available: true,
  },
];

const categories = [
  "All Mentors",
  "Entry Tests",
  "Government Exams",
  "Certifications",
  "Academic",
];

const Mentors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Mentors");

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.subjects.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="gradient" className="mb-4">
              <GraduationCap className="w-3 h-3 mr-1" />
              Expert Guidance
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
              Connect with <span className="text-primary">Expert Mentors</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get personalized guidance from experienced educators. Ask questions,
              request study plans, and book free consultation sessions.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search mentors by name, expertise, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Mentors Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card
                key={mentor.id}
                className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30"
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground shadow-md">
                      {mentor.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground">
                          {mentor.name}
                        </h3>
                        {mentor.available && (
                          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-primary font-medium">
                        {mentor.expertise}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-4 h-4 text-warning fill-warning" />
                        <span className="text-sm font-medium">{mentor.rating}</span>
                        <span className="text-xs text-muted-foreground">
                          • {mentor.students.toLocaleString()} students
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground mb-4">
                    {mentor.bio}
                  </p>

                  {/* Subjects */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>

                  {/* Experience */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Briefcase className="w-4 h-4" />
                    <span>{mentor.experience} experience</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Ask Question
                    </Button>
                    <Button
                      variant={mentor.available ? "default" : "secondary"}
                      className="flex-1"
                      size="sm"
                      disabled={!mentor.available}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {mentor.available ? "Book Session" : "Unavailable"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredMentors.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No mentors found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-16 text-center">
            <Card className="gradient-card border-border/50 p-8">
              <h3 className="text-2xl font-bold mb-4">
                Need Help Choosing a Mentor?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Not sure which mentor is right for you? Tell us about your goals
                and we'll recommend the perfect match.
              </p>
              <Button variant="gradient" size="lg">
                Get Personalized Recommendation
              </Button>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Mentors;
