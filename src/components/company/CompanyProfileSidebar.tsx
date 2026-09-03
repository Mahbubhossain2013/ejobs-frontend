"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Building2, MapPin, Globe, ExternalLink, Download, CheckCircle2 } from "lucide-react";

interface Brochure {
  id: number;
  title: string;
  file_url: string;
}

interface SocialLink {
  icon: any;
  href: string;
  label: string;
}

interface Props {
  company: any;
  whyJoinUs?: string[];
  brochures?: Brochure[];
  topSkills?: string[];
  socialLinks?: SocialLink[];
  highlights?: string[];
  location?: string;
}

export default function CompanyProfileSidebar({
  company,
  whyJoinUs = [],
  brochures = [],
  topSkills = [],
  socialLinks = [],
  highlights = [],
  location = "",
}: Props) {
  const displayLocation = location || company.location || "";

  return (
    <div className="space-y-4">
      {/* Snapshot */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Company Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {company.founded_year && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Founded</p>
                <p className="font-medium">{company.founded_year}</p>
              </div>
            </div>
          )}
          {(company.size || company.employees) && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Company Size</p>
                <p className="font-medium">{company.size || company.employees}</p>
              </div>
            </div>
          )}
          {company.industry && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Industry</p>
                <p className="font-medium">{company.industry}</p>
              </div>
            </div>
          )}
          {displayLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">{displayLocation}</p>
              </div>
            </div>
          )}
          {company.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Website</p>
                <a
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline flex items-center gap-1"
                >
                  {company.website}<ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
          {socialLinks.length > 0 && (
            <div className="flex gap-2 pt-1">
              {socialLinks.map((sl, i) => (
                <a
                  key={i}
                  href={sl.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-7 w-7 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-primary"
                  title={sl.label}
                >
                  <sl.icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Why Join Us */}
      {whyJoinUs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Why Join Us?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {whyJoinUs.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {highlights.map((item) => (
                <Badge key={item} variant="secondary" className="text-[10px]">{item}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Brochures */}
      {brochures.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Company Brochure</CardTitle>
          </CardHeader>
          <CardContent>
            {brochures.map((b) => (
              <div key={b.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 mb-2 last:mb-0">
                <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{b.title}</p>
                  <p className="text-[10px] text-muted-foreground">PDF</p>
                </div>
                <a href={b.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Top Skills */}
      {topSkills.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {topSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-[10px]">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}