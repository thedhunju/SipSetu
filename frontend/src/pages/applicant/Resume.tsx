import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Edit3, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { ResumeUploader } from "@/components/ResumeUploader";
import axios from 'axios';
import { toast } from 'sonner';

export default function ApplicantResume() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResumes = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/resumes`, {
        params: { applicant_id: user.id }
      });
      setResumes(response.data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [user?.id]);

  const latestResume = resumes.length > 0 ? resumes[0] : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Resume</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage your document and extracted skills profile.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass-card gap-2">
            <Download className="h-4 w-4" /> Export Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: File Management */}
        <div className="space-y-8">
          <Card className="glass-card border-none shadow-xl">
            <CardHeader>
              <CardTitle>Current Document</CardTitle>
              <CardDescription>Your active resume used for matching.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : latestResume ? (
                <div className="p-5 border border-border rounded-2xl bg-background/50 flex items-start gap-5 group hover:border-primary/50 transition-all">
                  <div className="h-14 w-14 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="h-7 w-7 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground text-lg truncate">
                      {latestResume.file_path ? latestResume.file_path.split(/[\\/]/).pop().split('_').slice(1).join('_') : 'Extracted Text'}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Uploaded {new Date(latestResume.uploaded_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="flex-shrink-0 text-muted-foreground hover:text-foreground">
                    <Download className="h-6 w-6" />
                  </Button>
                </div>
              ) : (
                <div className="p-10 border-2 border-dashed border-border rounded-2xl bg-muted/20 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <p className="text-muted-foreground font-medium">No resume uploaded yet.</p>
                </div>
              )}

              <div className="pt-4">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">Update Resume</h4>
                <ResumeUploader applicantId={user?.id || ''} onUploadSuccess={fetchResumes} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-primary border-none text-white shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
              <Sparkles className="h-32 w-32" />
            </div>
            <CardContent className="p-8 flex items-start gap-6 relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 animate-float">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-2xl text-white">Build a resume with AI</h4>
                <p className="text-white/80 text-lg leading-relaxed">Don't have a solid resume yet? Use our AI builder to craft one tailored for tech roles.</p>
                <Button className="bg-white text-primary hover:bg-white/90 font-bold px-8 h-12 rounded-xl">
                  Start Building
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Extracted Profile */}
        <div className="space-y-8">
          <Card className="glass-card border-none shadow-xl h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
              <div>
                <CardTitle className="text-2xl font-bold">Extracted Profile</CardTitle>
                <CardDescription className="text-lg">What our AI found in your document.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-2 font-bold hover:bg-primary/10 hover:text-primary">
                <Edit3 className="h-4 w-4" /> Edit
              </Button>
            </CardHeader>
            <CardContent className="pt-8 flex-1">
              <div className="space-y-10">
                <div>
                  <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-5">Verified Skills</h4>
                  <div className="flex flex-wrap gap-3">
                    {latestResume?.skills?.length > 0 ? (
                      latestResume.skills.map((skill: string, i: number) => (
                        <Badge 
                          key={skill} 
                          className={`
                            px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 cursor-default
                            ${i < 4 
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                              : "bg-muted text-muted-foreground border border-border"
                            }
                          `}
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground italic text-lg opacity-50">No skills extracted yet. Upload a resume to see AI analysis.</p>
                    )}
                  </div>
                </div>

                <div className="pt-8 border-t border-border/50">
                  <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-5">Experience Summary</h4>
                  <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                    <p className="text-foreground/80 text-lg leading-relaxed italic">
                      {latestResume ? "Experience summary analysis based on your most recent upload. Our AI extracts key highlights to help you stand out to recruiters." : "Once you upload a resume, our AI will generate a summary of your experience here."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

