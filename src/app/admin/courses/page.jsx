"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  BookOpen, 
  User, 
  Calendar,
  Loader2,
  AlertCircle,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const SUPER_ADMIN_EMAIL = "vickkie028@gmail.com";

export default function AdminCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.email !== SUPER_ADMIN_EMAIL) {
        router.push("/");
        toast.error("Access denied - Admin privileges required");
      } else {
        fetchPendingCourses();
      }
    }
  }, [user, authLoading, router]);

  const fetchPendingCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses/pending");
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      } else {
        toast.error("Failed to fetch pending courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch pending courses");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId) => {
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/courses/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, action: "approve" }),
      });

      if (res.ok) {
        toast.success("Course approved and published!");
        await fetchPendingCourses();
        setViewDialogOpen(false);
      } else {
        toast.error("Failed to approve course");
      }
    } catch (error) {
      console.error("Error approving course:", error);
      toast.error("Failed to approve course");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("/api/admin/courses/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          courseId: selectedCourse.id, 
          action: "reject",
          rejectionReason 
        }),
      });

      if (res.ok) {
        toast.success("Course rejected");
        await fetchPendingCourses();
        setRejectDialogOpen(false);
        setViewDialogOpen(false);
        setRejectionReason("");
      } else {
        toast.error("Failed to reject course");
      }
    } catch (error) {
      console.error("Error rejecting course:", error);
      toast.error("Failed to reject course");
    } finally {
      setProcessing(false);
    }
  };

  const openViewDialog = (course) => {
    setSelectedCourse(course);
    setViewDialogOpen(true);
  };

  const openRejectDialog = () => {
    setRejectDialogOpen(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Course Approval Dashboard</h1>
          <p className="text-muted-foreground">
            Review and approve courses submitted by instructors
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold">{courses.length}</p>
                </div>
                <Clock className="h-12 w-12 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Courses</CardTitle>
            <CardDescription>
              Courses awaiting your approval to be published
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">All caught up!</p>
                <p className="text-muted-foreground">
                  No courses pending approval at the moment
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <Card key={course.id} className="hover:border-blue-500 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{course.title}</h3>
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {course.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {course.createdBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {course.chapters?.length || 0} chapters
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(course.submittedAt || course.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openViewDialog(course)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Course Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Course</DialogTitle>
              <DialogDescription>
                Review course details before approving or rejecting
              </DialogDescription>
            </DialogHeader>

            {selectedCourse && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Course Title</h3>
                  <p>{selectedCourse.title}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{selectedCourse.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Instructor</h3>
                  <p className="text-sm">{selectedCourse.createdBy}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Chapters ({selectedCourse.chapters?.length || 0})</h3>
                  <div className="space-y-2">
                    {selectedCourse.chapters?.map((chapter, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <p className="font-medium text-sm">{chapter.title}</p>
                        {chapter.description && (
                          <p className="text-xs text-muted-foreground mt-1">{chapter.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handleApprove(selectedCourse.id)}
                    disabled={processing}
                    className="flex-1"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve & Publish
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={openRejectDialog}
                    disabled={processing}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Course</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this course
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">
                  The instructor will be notified of the rejection and the reason provided.
                </p>
              </div>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-destructive resize-none"
                required
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectionReason("");
                }}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  "Confirm Rejection"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
