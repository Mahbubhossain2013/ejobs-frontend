"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import api from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Plane, MapPin, Calendar, ChevronRight } from "lucide-react";

interface DeploymentStage {
  id: number;
  stage_name: string;
  stage_label: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  deadline: string | null;
}

interface Deployment {
  id: number;
  job_title: string;
  company_name: string | null;
  destination_country: string;
  destination_city: string | null;
  status: string;
  expected_joining_date: string | null;
  stages: DeploymentStage[];
  created_at: string;
}

export default function DeploymentsClient() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      api.get("/deployments")
        .then((res) => setDeployments(res.data?.data?.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const getProgress = (stages: DeploymentStage[]): number => {
    if (!stages || stages.length === 0) return 0;
    const completed = stages.filter((s) => s.status === "completed").length;
    return Math.round((completed / stages.length) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-100 text-emerald-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "on_hold": return "bg-amber-100 text-amber-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStageStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500";
      case "in_progress": return "bg-blue-500 animate-pulse";
      case "failed": return "bg-red-500";
      default: return "bg-gray-300";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deployment Tracker</h1>
          <p className="text-muted-foreground">Track your overseas job deployment progress</p>
        </div>
      </div>

      {deployments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Plane className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Deployments Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              When an employer initiates your deployment, it will appear here with a step-by-step tracker.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deployments.map((deployment) => {
            const progress = getProgress(deployment.stages);
            return (
              <Card key={deployment.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{deployment.job_title}</CardTitle>
                      {deployment.company_name && (
                        <p className="text-sm text-muted-foreground">{deployment.company_name}</p>
                      )}
                    </div>
                    <Badge className={getStatusColor(deployment.status)}>
                      {deployment.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {deployment.destination_city ? `${deployment.destination_city}, ` : ""}{deployment.destination_country}
                    </span>
                    {deployment.expected_joining_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Joining: {new Date(deployment.expected_joining_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    {deployment.stages.map((stage) => (
                      <div
                        key={stage.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                      >
                        <div className={`w-3 h-3 rounded-full shrink-0 ${getStageStatusColor(stage.status)}`} />
                        <span className="flex-1 text-sm font-medium">{stage.stage_label}</span>
                        <Badge variant="outline" className="text-xs">
                          {stage.status.replace("_", " ")}
                        </Badge>
                        {stage.deadline && (
                          <span className="text-xs text-muted-foreground">
                            Due: {new Date(stage.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
