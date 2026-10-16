"use client";

import * as React from "react";
import { UserPlus, Shield, MoreVertical, Trash2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { teamMembers as initialMembers } from "@/lib/mock-data";
import { TeamMember, Role } from "@/types/saas";
import { useAuth } from "@/components/providers/auth-provider";

export default function TeamPage() {
  const { requireAuth } = useAuth();
  const [members, setMembers] = React.useState<TeamMember[]>(initialMembers);
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteName, setInviteName] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<Role>("Member");
  const [errorMsg, setErrorMsg] = React.useState("");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      setErrorMsg("Please enter a valid work email.");
      return;
    }

    const newMember: TeamMember = {
      id: `tm_${Date.now()}`,
      name: inviteName.trim() || inviteEmail.split("@")[0],
      email: inviteEmail.trim(),
      avatar: "",
      role: inviteRole,
      status: "Invited",
      joinedDate: "Just now",
    };

    setMembers([...members, newMember]);
    setInviteEmail("");
    setInviteName("");
    setErrorMsg("");
    setInviteDialogOpen(false);
  };

  const handleRemoveMember = (id: string) => {
    requireAuth(() => {
      if (confirm("Revoke access for this team member?")) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
      }
    }, "To remove team members, please sign in.");
  };

  const handleChangeRole = (id: string, newRole: Role) => {
    requireAuth(() => {
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, role: newRole } : m))
      );
    }, "To change roles, please sign in.");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Team & Access Control
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage organization members, assign granular security roles, and invite collaborators.
          </p>
        </div>

        <Button
          onClick={() =>
            requireAuth(
              () => setInviteDialogOpen(true),
              "To invite team members, please sign in to your workspace account."
            )
          }
          size="sm"
        >
          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
          <span>Invite Member</span>
        </Button>
      </div>

      {/* Role Summary Banner */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-semibold text-foreground">Owners</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Full root authority, billing management, and organization deletion rights.
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-semibold text-foreground">Admins</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Can deploy projects, configure API keys, and invite or remove members.
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-semibold text-foreground">Members</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Read-only analytics access and scoped developer project permissions.
          </p>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Members ({members.length})</CardTitle>
          <CardDescription>
            All collaborators currently provisioned with workspace credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={member.avatar}
                        fallback={member.name.charAt(0)}
                        size="md"
                      />
                      <div>
                        <div className="text-xs font-semibold text-foreground">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.role === "Owner"
                          ? "default"
                          : member.role === "Admin"
                          ? "secondary"
                          : "outline"
                      }
                      className="font-mono text-[10px]"
                    >
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={member.status === "Active" ? "success" : "warning"}
                      className="text-[10px]"
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {member.joinedDate}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.role !== "Owner" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeRole(
                                member.id,
                                member.role === "Admin" ? "Member" : "Admin"
                              )
                            }
                          >
                            <span>
                              Make {member.role === "Admin" ? "Member" : "Admin"}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            <span>Remove member</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleInvite}>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation email to join this Veyrix workspace.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {errorMsg && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Full Name
                </label>
                <Input
                  placeholder="e.g. Elena Rostova"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Admin", "Member"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setInviteRole(r)}
                      className={`rounded-md border p-2 text-center text-xs font-medium transition-colors cursor-pointer ${
                        inviteRole === r
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Send Invitation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
